import type { BlogPostSeed } from "../types.js";

const content = `> Scraper Pages Jaunes, Pappers, GoAfrica et Google Maps en respectant la loi et les serveurs, à raison de milliers de requêtes par jour. Retour d'expérience sur Prospect-Pro AI.

## 1. Le contexte

Prospect-Pro AI, plateforme de prospection B2B, doit constituer en continu une base de contacts qualifiés depuis quatre sources publiques : Pages Jaunes (annuaire pro français), Pappers (open data société française), GoAfrica (annuaire business panafricain), Google Maps (fiches d'établissements). L'enjeu : alimenter le pipeline IA avec des données fraîches sans tomber dans l'illégal ni saturer les sources.

Cet article n'est pas un tutoriel "comment contourner un anti-bot". C'est un retour d'expérience sur **comment scraper proprement** : conformité légale, respect technique, robustesse en production.

## 2. La règle de base — ce qui est légal

Premier réflexe : connaître le terrain juridique. Trois critères clarifient 95 % des cas :

1. **Donnée publique** — accessible sans authentification, non protégée par un paywall ou des CGU explicites de non-scraping
2. **Donnée non-personnelle** ou pseudonymisée — la donnée d'entreprise (raison sociale, SIREN, téléphone professionnel) n'est pas couverte par le RGPD si elle reste dans la sphère B2B
3. **Respect des CGU** — si le site interdit explicitement le scraping dans ses conditions, on s'abstient

Cas concrets :
- Pages Jaunes : données publiques pro, scraping toléré pour usage B2B raisonnable
- Pappers : API publique fournie par l'État (open data SIREN), scraping inutile si on utilise leur API
- GoAfrica : annuaire panafricain, données publiques pro
- Google Maps : fiches publiques, mais Google a une API officielle (Places API) — préférable

**Toujours préférer l'API officielle quand elle existe**. Le scraping est un dernier recours, pas un raccourci.

## 3. Architecture du pipeline de scraping

Sur Prospect-Pro, chaque source est encapsulée dans un connecteur typé. Le squelette :

\`\`\`typescript
// src/scraping/Connector.ts
export interface ScrapingConnector {
  readonly source: SourceName;
  readonly rateLimit: { rpm: number; concurrent: number };
  readonly robotsTxtPolicy: "respect" | "ignore"; // toujours "respect" en prod
  search(query: SearchQuery): AsyncIterable<RawRecord>;
  hydrate(record: RawRecord): Promise<EnrichedRecord>;
}
\`\`\`

Chaque connecteur déclare :
- Sa source d'origine
- Son rate-limit propre (négocié avec la source si possible)
- Sa politique vis-à-vis du \`robots.txt\`
- Une méthode de recherche qui yield des records bruts (async iterable pour streaming)
- Une méthode d'hydratation pour enrichir un record (détails, adresse, etc.)

## 4. Rate-limiting respectueux

Saturer un serveur est un comportement de pirate, pas de pro. Trois techniques combinées :

### 4.1 Token bucket par source

Chaque source a son propre bucket, dimensionné conservativement (typiquement 60 requêtes / minute).

\`\`\`typescript
// src/scraping/RateLimiter.ts
export class TokenBucket {
  private tokens: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens / sec
  private lastRefill: number;

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    const waitMs = ((1 - this.tokens) / this.refillRate) * 1000;
    await sleep(waitMs);
    return this.acquire();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}
\`\`\`

Chaque connecteur appelle \`await bucket.acquire()\` avant chaque requête HTTP.

### 4.2 Concurrence bornée

Pas plus de N requêtes simultanées par source. Le plus simple : utiliser une queue avec \`p-limit\` :

\`\`\`typescript
import pLimit from "p-limit";

const limit = pLimit(3); // max 3 concurrent sur cette source

const results = await Promise.all(
  queries.map((q) => limit(() => connector.search(q)))
);
\`\`\`

### 4.3 Backoff exponentiel sur erreur

429 Too Many Requests ou 503 Service Unavailable : on attend, on retente avec un délai croissant.

\`\`\`typescript
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 5): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = Math.min(30_000, 1000 * 2 ** attempt) + Math.random() * 1000;
      await sleep(delay);
    }
  }
  throw lastError;
}
\`\`\`

Le \`+ Math.random()\` (jitter) évite que tous les workers retentent en même temps après une panne.

## 5. Identification claire — user-agent honnête

Cacher son identité derrière un user-agent de Chrome standard est dangereux : juridiquement, ça suggère une intention de tromper. La bonne pratique :

\`\`\`
User-Agent: ProspectProBot/1.0 (+https://prospect-pro.example.com/bot)
\`\`\`

L'URL dans le user-agent pointe vers une page expliquant le projet, à qui s'adresser pour des questions, comment se faire désindexer. Les sources sérieuses respectent cette transparence. Les sources qui blockent un bot identifié signalent qu'elles refusent le scraping — et on s'abstient.

## 6. Le respect du robots.txt

Avant chaque session, on charge le \`robots.txt\` de la source et on respecte ses \`Disallow\`.

\`\`\`typescript
import robotsParser from "robots-parser";

async function loadRobots(host: string): Promise<robotsParser.Robot> {
  const text = await fetch(\`https://\${host}/robots.txt\`).then((r) => r.text());
  return robotsParser(\`https://\${host}/robots.txt\`, text);
}

async function shouldFetch(url: string, robots: robotsParser.Robot): Promise<boolean> {
  return robots.isAllowed(url, "ProspectProBot");
}
\`\`\`

Si \`robots.txt\` interdit, on n'y va pas. Point. Même si techniquement on pourrait.

## 7. Déduplication et qualité des données

Une source peut retourner le même contact deux fois sous des libellés légèrement différents. Sans dédoublonnage, votre base se pollue rapidement.

Stratégie : **clé de dédoublonnage métier** combinant les champs stables.

\`\`\`typescript
function leadKey(lead: RawLead): string {
  // Combinaison : SIREN si présent, sinon hash(nom_normalisé + ville)
  if (lead.siren) return \`siren:\${lead.siren}\`;
  const normalized = lead.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return \`hash:\${sha256(\`\${normalized}|\${lead.city}\`)}\`;
}
\`\`\`

En base, contrainte unique sur cette clé. \`INSERT ... ON CONFLICT DO UPDATE\` met à jour les champs récents sans dupliquer.

## 8. Stockage et historisation

Les données scrapées vieillissent. Une entreprise déménage, change de numéro, ferme. Stocker une snapshot horodatée plutôt qu'un seul état :

\`\`\`sql
CREATE TABLE leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         VARCHAR(120) NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  siren       VARCHAR(20) NULL,
  city        TEXT NULL,
  -- ...
  first_seen  TIMESTAMP NOT NULL DEFAULT NOW(),
  last_seen   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE lead_snapshots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id       UUID NOT NULL REFERENCES leads(id),
  source        VARCHAR(40) NOT NULL,
  payload       JSONB NOT NULL,
  scraped_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
\`\`\`

\`leads\` contient l'état courant, \`lead_snapshots\` l'historique brut. Ça permet de retracer un contact, de comprendre une évolution, et de purger les snapshots anciens sans perdre les leads.

## 9. Conformité RGPD pour les données dans le périmètre

Si vous scrapez du B2C ou des données qui touchent à du B2B mais avec PII (nom + prénom d'un dirigeant par exemple), le RGPD s'applique. Trois exigences minimales :

1. **Information** : page publique expliquant la collecte, la durée, les droits
2. **Droit à l'oubli** : un endpoint qui permet à une personne de demander la suppression
3. **Minimisation** : ne stocker que ce qui est nécessaire — pas de scraping aveugle "au cas où"

\`\`\`typescript
// src/controllers/rightToErasure.ts
export async function requestErasure(req: Request, res: Response) {
  const email = req.body.email; // identifiant fourni par la personne
  const found = await Lead.findOne({ where: { contactEmail: email } });
  if (!found) return res.status(404).json({ ok: false });

  await found.update({
    redactedAt: new Date(),
    name: "[REDACTED]",
    contactEmail: null,
    contactPhone: null,
  });
  await LeadSnapshot.destroy({ where: { leadId: found.id } });

  return res.status(200).json({ ok: true, redactedAt: found.redactedAt });
}
\`\`\`

## 10. Observabilité

Les scrapers en prod doivent émettre des métriques sur :

- Requêtes par seconde (par source)
- Taux d'erreurs HTTP (par code)
- Latence moyenne et p95
- Volume de leads nouveaux vs mis à jour
- Taux de dédoublonnage

Un dashboard Grafana sur ces signaux détecte tôt :
- Une source qui change son HTML (drop brutal de leads scrapés)
- Un anti-bot qui se déclenche (montée des 403)
- Un goulot d'étranglement (latence p95 qui explose)

## 11. Pièges à éviter

| Piège | Symptôme | Correction |
|-------|----------|------------|
| User-agent menteur | Risque juridique, ban éthique | UA identifié + URL projet |
| Pas de rate-limit | Saturation source, ban IP | Token bucket par source |
| Concurrence illimitée | Trop de connexions, OOM | \`p-limit\` ou pool borné |
| Ignorer robots.txt | Illégal selon CGU + éthique | Parser et respecter |
| Pas de dédoublonnage | Base polluée | Clé métier + UPSERT |
| Snapshot unique | Pas d'historique | Table snapshots horodatée |
| Pas de droit à l'oubli | Risque RGPD | Endpoint d'effacement |
| Pas de monitor | Source change → silence | Dashboard sur taux et codes |

## 12. Conclusion

Scraper à grande échelle, c'est jouer un rôle d'utilisateur intensif sans pénaliser la source. Trois mots-clés : **identification, modération, respect**.

L'identification (user-agent honnête, page projet) protège juridiquement. La modération (rate-limit, concurrence, backoff) protège techniquement la source. Le respect (robots.txt, RGPD, droit à l'oubli) protège votre marque et vos utilisateurs.

Sur Prospect-Pro, ce framework a permis de scraper en continu pendant 14 mois sans incident juridique, sans ban, et avec une qualité de données stable. Pas de magie noire, juste de la discipline.`;

const contentEn = `> Scraping Pages Jaunes, Pappers, GoAfrica and Google Maps lawfully and respectfully, at thousands of requests per day. Field report from Prospect-Pro AI.

## 1. The context

Prospect-Pro AI, a B2B prospecting platform, must continuously build a qualified contact base from four public sources: Pages Jaunes (French professional directory), Pappers (French company open data), GoAfrica (pan-African business directory), Google Maps (establishment listings). The challenge: feed the AI pipeline with fresh data without crossing into illegality nor saturating sources.

This article isn't a "how to bypass an anti-bot" tutorial. It's a field report on **how to scrape properly**: legal compliance, technical respect, production robustness.

## 2. The basic rule — what's legal

First reflex: know the legal terrain. Three criteria clarify 95% of cases:

1. **Public data** — accessible without authentication, not behind a paywall or explicit no-scraping ToS
2. **Non-personal** or pseudonymized data — corporate data (company name, registration number, business phone) isn't covered by GDPR if it stays in the B2B sphere
3. **Respect ToS** — if a site explicitly forbids scraping in its terms, we abstain

Concrete cases:
- Pages Jaunes: public pro data, scraping tolerated for reasonable B2B use
- Pappers: public API provided by the State (SIRENE open data), scraping pointless if you use their API
- GoAfrica: pan-African directory, public pro data
- Google Maps: public listings, but Google has an official API (Places API) — preferred

**Always prefer the official API when it exists**. Scraping is a last resort, not a shortcut.

## 3. Pipeline architecture

On Prospect-Pro, each source is wrapped in a typed connector. Skeleton:

\`\`\`typescript
// src/scraping/Connector.ts
export interface ScrapingConnector {
  readonly source: SourceName;
  readonly rateLimit: { rpm: number; concurrent: number };
  readonly robotsTxtPolicy: "respect" | "ignore"; // always "respect" in prod
  search(query: SearchQuery): AsyncIterable<RawRecord>;
  hydrate(record: RawRecord): Promise<EnrichedRecord>;
}
\`\`\`

Each connector declares:
- Its source
- Its own rate-limit (negotiated with the source if possible)
- Its \`robots.txt\` policy
- A search method that yields raw records (async iterable for streaming)
- A hydrate method to enrich a record (details, address, etc.)

## 4. Respectful rate-limiting

Saturating a server is pirate behavior, not pro behavior. Three combined techniques:

### 4.1 Per-source token bucket

Each source has its own bucket, sized conservatively (typically 60 req/min).

\`\`\`typescript
// src/scraping/RateLimiter.ts
export class TokenBucket {
  private tokens: number;
  private readonly capacity: number;
  private readonly refillRate: number;
  private lastRefill: number;

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    const waitMs = ((1 - this.tokens) / this.refillRate) * 1000;
    await sleep(waitMs);
    return this.acquire();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}
\`\`\`

Each connector calls \`await bucket.acquire()\` before each HTTP request.

### 4.2 Bounded concurrency

No more than N concurrent requests per source. Simplest: a queue with \`p-limit\`:

\`\`\`typescript
import pLimit from "p-limit";

const limit = pLimit(3);
const results = await Promise.all(
  queries.map((q) => limit(() => connector.search(q)))
);
\`\`\`

### 4.3 Exponential backoff on error

429 Too Many Requests or 503 Service Unavailable: wait, retry with growing delay.

\`\`\`typescript
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 5): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = Math.min(30_000, 1000 * 2 ** attempt) + Math.random() * 1000;
      await sleep(delay);
    }
  }
  throw lastError;
}
\`\`\`

The \`+ Math.random()\` (jitter) prevents all workers from retrying at the same time after an outage.

## 5. Honest identification — truthful user-agent

Hiding behind a standard Chrome user-agent is dangerous: legally, it suggests intent to deceive. Best practice:

\`\`\`
User-Agent: ProspectProBot/1.0 (+https://prospect-pro.example.com/bot)
\`\`\`

The URL points to a page explaining the project, contact for questions, how to opt out. Serious sources respect this transparency. Sources that block an identified bot signal they refuse scraping — and we abstain.

## 6. Respecting robots.txt

Before each session, load the source's \`robots.txt\` and respect its \`Disallow\`.

\`\`\`typescript
import robotsParser from "robots-parser";

async function loadRobots(host: string): Promise<robotsParser.Robot> {
  const text = await fetch(\`https://\${host}/robots.txt\`).then((r) => r.text());
  return robotsParser(\`https://\${host}/robots.txt\`, text);
}

async function shouldFetch(url: string, robots: robotsParser.Robot): Promise<boolean> {
  return robots.isAllowed(url, "ProspectProBot");
}
\`\`\`

If \`robots.txt\` forbids it, we don't go. Period. Even if technically we could.

## 7. Deduplication and data quality

A source may return the same contact twice under slightly different labels. Without dedup, your base pollutes fast.

Strategy: **business dedup key** combining stable fields.

\`\`\`typescript
function leadKey(lead: RawLead): string {
  if (lead.registrationNumber) return \`reg:\${lead.registrationNumber}\`;
  const normalized = lead.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return \`hash:\${sha256(\`\${normalized}|\${lead.city}\`)}\`;
}
\`\`\`

In DB, unique constraint on this key. \`INSERT ... ON CONFLICT DO UPDATE\` updates recent fields without duplication.

## 8. Storage and history

Scraped data ages. A company moves, changes phone, closes. Store timestamped snapshots rather than a single state:

\`\`\`sql
CREATE TABLE leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         VARCHAR(120) NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  registration_number VARCHAR(20) NULL,
  city        TEXT NULL,
  first_seen  TIMESTAMP NOT NULL DEFAULT NOW(),
  last_seen   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE lead_snapshots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id       UUID NOT NULL REFERENCES leads(id),
  source        VARCHAR(40) NOT NULL,
  payload       JSONB NOT NULL,
  scraped_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
\`\`\`

\`leads\` holds the current state, \`lead_snapshots\` the raw history. Lets you trace a contact, understand evolution, and purge old snapshots without losing leads.

## 9. GDPR for in-scope data

If you scrape B2C or B2B data touching PII (a director's first + last name for example), GDPR applies. Three minimum requirements:

1. **Information**: public page explaining collection, duration, rights
2. **Right to erasure**: an endpoint letting a person request deletion
3. **Minimization**: store only what's necessary — no blind "just in case" scraping

\`\`\`typescript
// src/controllers/rightToErasure.ts
export async function requestErasure(req: Request, res: Response) {
  const email = req.body.email;
  const found = await Lead.findOne({ where: { contactEmail: email } });
  if (!found) return res.status(404).json({ ok: false });

  await found.update({
    redactedAt: new Date(),
    name: "[REDACTED]",
    contactEmail: null,
    contactPhone: null,
  });
  await LeadSnapshot.destroy({ where: { leadId: found.id } });

  return res.status(200).json({ ok: true, redactedAt: found.redactedAt });
}
\`\`\`

## 10. Observability

Production scrapers must emit metrics on:

- Requests per second (per source)
- HTTP error rate (per code)
- Average and p95 latency
- New vs updated lead volume
- Dedup rate

A Grafana dashboard on these signals catches early:
- A source changing HTML (sudden drop in scraped leads)
- An anti-bot kicking in (rise of 403s)
- A bottleneck (p95 latency exploding)

## 11. Pitfalls to avoid

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Lying user-agent | Legal risk, ethical ban | Identified UA + project URL |
| No rate-limit | Source saturation, IP ban | Per-source token bucket |
| Unlimited concurrency | Too many connections, OOM | \`p-limit\` or bounded pool |
| Ignoring robots.txt | Illegal per ToS + unethical | Parse and respect |
| No dedup | Polluted base | Business key + UPSERT |
| Single snapshot | No history | Timestamped snapshots table |
| No right to erasure | GDPR risk | Erasure endpoint |
| No monitor | Source changes → silence | Dashboard on rates and codes |

## 12. Closing

Scraping at scale means playing the role of an intensive user without penalizing the source. Three keywords: **identification, moderation, respect**.

Identification (honest user-agent, project page) protects legally. Moderation (rate-limit, concurrency, backoff) protects the source technically. Respect (robots.txt, GDPR, right to erasure) protects your brand and your users.

On Prospect-Pro, this framework allowed continuous scraping for 14 months with no legal incident, no ban, and stable data quality. No black magic, just discipline.`;

export const scrapingLegalScale: BlogPostSeed = {
  title:
    "Scraping légal à grande échelle — REX Prospect-Pro AI",
  title_en:
    "Lawful scraping at scale — Prospect-Pro AI field notes",
  slug: "scraping-legal-grande-echelle-prospect-pro",
  excerpt:
    "Token bucket par source, user-agent identifié, respect du robots.txt, dédoublonnage métier, snapshots horodatés et droit à l'oubli : 14 mois de scraping continu sans incident.",
  excerpt_en:
    "Per-source token bucket, identified user-agent, robots.txt respect, business dedup keys, timestamped snapshots and right to erasure: 14 months of continuous scraping without incident.",
  content,
  content_en: contentEn,
  category: "Retour d'experience",
  imageUrl:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
  readTime: "16 min de lecture",
  author: "Yao David Logan",
  published: true,
  tags: ["scraping", "legal", "data", "automation", "rgpd", "rate-limit"],
};
