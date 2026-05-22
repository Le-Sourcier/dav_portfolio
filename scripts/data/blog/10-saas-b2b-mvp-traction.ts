import type { BlogPostSeed } from "../types.js";

const content = `> Lancer un SaaS B2B en agence, c'est moins une question de tech que de discipline produit. Cinq produits livrés en huit mois — voici ce qui sépare ceux qui décollent de ceux qui dorment.

## 1. Le contexte

Chez Ubuntu Consulting, j'ai livré cinq SaaS B2B sur huit mois : Prospect-Pro AI, RunWeek, HomeEnergy, MailCraft et une plateforme d'enrichissement de données. Trois ont trouvé une traction commerciale rapide. Deux n'ont jamais décollé malgré une tech impeccable.

La différence n'est pas venue du code. Elle est venue de **comment on a abordé le passage du MVP à la traction**. Cet article condense les patterns que j'ai vu marcher.

## 2. La promesse vs le produit

Un MVP qui marche techniquement n'a aucune valeur si la promesse n'est pas claire. La promesse, c'est ce qu'on dit en une phrase au prospect.

**Bonne promesse** : "On automatise la prospection B2B avec scoring IA — 60 % de conversion en plus, 15 h économisées par semaine."

**Mauvaise promesse** : "On a une plateforme moderne de gestion de leads avec intelligence artificielle."

La première promet un résultat quantifié. La seconde décrit une catégorie. Sur les cinq produits, ceux qui n'ont pas trouvé de promesse claire sont restés des PoC techniques.

## 3. Pattern 1 — Vendre avant de coder

Le premier produit qui a marché (Prospect-Pro) a démarré par 12 entretiens utilisateurs avant qu'une seule ligne de code soit écrite. Format : 30 min, deux questions :

1. "Décris-moi ta prospection actuelle, étape par étape"
2. "Quel est le truc le plus pénible dans tout ça ?"

Aucune mention du produit envisagé. Juste écouter. Sur 12 entretiens, **8 ont décrit le même problème** — fichiers Excel manuels, contacts vieux de 6 mois, messages génériques qui ne marchent pas.

C'est devenu le brief produit. La tech a suivi.

À l'inverse, les deux produits qui n'ont pas décollé ont démarré par "on a vu une opportunité techno" sans interviews préalables. Résultat : six mois de dev sur des fonctionnalités que personne n'avait demandées.

## 4. Pattern 2 — Vendre avant que ça marche

Avant le MVP fonctionnel, on a vendu trois licences sur démo "magicienne d'Oz" : interface réelle, backend trafiqué à la main. Les clients ne le savaient pas — pour eux, l'app marchait. Pour nous, ça validait que **les gens étaient prêts à payer pour ce résultat précis**, indépendamment de l'implémentation.

Ce pattern (Wizard of Oz MVP) demande du courage mais évite des mois de dev inutile. Si personne ne sort sa carte bleue sur la démo, le produit n'a pas de marché — quelle que soit la qualité de la tech qu'on aurait écrite.

## 5. Pattern 3 — Time-to-value sous 5 minutes

Sur RunWeek, le premier essai sortait l'utilisateur après 14 minutes de setup (connexion Garmin, autorisation HealthKit, sélection de paramètres, import historique). On perdait 70 % des utilisateurs à l'étape 3.

Refonte du parcours :
- Pas de création de compte au démarrage — l'utilisateur teste avec des données démo
- Auth optionnelle au moment où il veut sauvegarder
- Import minimal au premier login (7 derniers jours, pas 5 ans)
- Tout le reste en background, transparent

Après refonte : time-to-value à 3 minutes 20. Taux d'activation x4.

La règle : **chaque seconde de friction entre install et premier "wow" coûte de la rétention**. Mesurer ce temps. Le baisser comme un sprint produit à part entière.

## 6. Pattern 4 — Pricing avant feature

Erreur classique : empiler des fonctionnalités, puis chercher comment les vendre. Mieux : **définir le pricing en premier**, et n'ajouter que les features qui justifient le palier.

Sur HomeEnergy, trois paliers :
- Gratuit : 1 simulation, résultat sans plan d'action
- Pro (29 €/mois) : simulations illimitées + plan d'action + export PDF
- Conseiller (89 €/mois) : multi-clients + branding cabinet + API

Chaque feature développée se demandait : "ça justifie un palier ou ça enrichit un palier existant ?" Si c'était ni l'un ni l'autre, on coupait.

Résultat : roadmap compacte, pricing lisible, taux de conversion gratuit → pro à 8 % (vs 1-3 % typique).

## 7. Pattern 5 — Observabilité produit dès le jour 1

Sans données, on bricole à l'aveugle. Trois choses à instrumenter dès le MVP :

### 7.1 Funnel d'activation

Chaque étape clé entre signup et premier "wow" est tracée. Sur Prospect-Pro :

\`\`\`
[Signup] → [Onboarding step 1] → [First search] → [First export] → [First contact sent]
   100%         78%                    52%             38%              22%
\`\`\`

Le drop le plus fort (étape 2 → 3) signalait un onboarding confus. Refonte → drop divisé par deux.

### 7.2 Cohort retention

Pour chaque cohorte (signups d'une semaine donnée), tracker la % qui revient les semaines suivantes. Sans ça, on confond croissance et churn.

\`\`\`
              S+1   S+2   S+4   S+8
Cohort W12    65%   48%   35%   28%
Cohort W14    72%   58%   45%   38%   ← amélioration palpable
\`\`\`

### 7.3 NPS conversationnel

Pas le NPS automatisé après 30 jours qui n'enseigne rien. Le NPS conversationnel : on appelle les 10 premiers clients payants, on demande "qu'est-ce qui te ferait nous quitter ?" et "qu'est-ce qui te ferait t'engager plus ?". Les réponses guident la roadmap mieux que n'importe quel formulaire.

## 8. Pattern 6 — La tech qui ne tue pas

Côté technique, trois principes pour ne pas se tirer une balle dans le pied :

### 8.1 Stack par défaut, exotisme uniquement si justifié

Next.js + PostgreSQL + Tailwind couvre 90 % des SaaS B2B. Inutile d'aller chercher un framework expérimental pour faire la même chose en plus lent et plus risqué. Plus la stack est commune, plus on recrute et collabore facilement.

### 8.2 Multi-tenant dès le départ

Un SaaS B2B sert plusieurs clients. Isoler la donnée par \`tenant_id\` partout, dès la première ligne. Coût : 5 % d'effort en plus. Bénéfice : pas de refonte douloureuse à la 50e société cliente.

\`\`\`sql
CREATE TABLE leads (
  id          UUID PRIMARY KEY,
  tenant_id   UUID NOT NULL,
  name        TEXT NOT NULL,
  -- ...
);
CREATE INDEX ON leads (tenant_id, created_at);
CREATE POLICY tenant_isolation ON leads
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
\`\`\`

### 8.3 Feature flags pour tout ce qui est risqué

Toute nouvelle fonctionnalité non triviale arrive derrière un flag, activable par tenant. On peut tester sur 3 % des clients sans risquer les 97 % autres. Sur MailCraft, ce pattern a évité trois rollbacks en production.

## 9. Pattern 7 — Vendre à l'agence, pas au CTO

Réalité commerciale du SaaS B2B en Afrique de l'Ouest francophone et en France :

- Le décideur n'est pas le développeur
- Le décideur veut une présentation, un chiffre, un témoignage
- Le décideur signe sur du tangible, pas sur de l'élégance

D'où : pages produit avec **un cas client raconté en histoire**, plus efficace qu'un tableau de fonctionnalités. Logos visibles. Pricing affiché (pas "contactez-nous"). Démo cliquable en 2 clics.

Les sites SaaS B2B qui font "vendeur premium mystique" sans pricing affiché filtrent 80 % des prospects qualifiés qui partent voir un concurrent transparent.

## 10. Pattern 8 — Pré-paiement annuel

Sur les paliers payants, proposer le mensuel + l'annuel avec ~20 % de réduction. Effets multiples :

- Engagement client renforcé (moins de churn)
- Trésorerie boostée (paiement upfront)
- Filtrage utile (les gens qui paient annuel sont les plus engagés)

Sur Prospect-Pro, le passage à un pricing annuel/mensuel proposé sur la même page a fait monter le CAC payback de 11 à 5 mois.

## 11. Pièges à éviter

| Piège | Symptôme | Correction |
|-------|----------|------------|
| Coder avant d'écouter | Features que personne ne veut | 10+ entretiens utilisateurs avant code |
| Time-to-value > 10 min | Drop massif à l'onboarding | Mesurer et réduire chaque étape |
| Pas de pricing visible | Drop avant contact | Pricing affiché transparent |
| Feature avant business model | Empilement sans cohérence | Pricing en premier |
| Pas d'observabilité produit | Décisions à l'aveugle | Funnel + cohort + NPS conversationnel |
| Multi-tenant ajouté tard | Refonte douloureuse | \`tenant_id\` dès le schéma initial |
| Vendre à l'engineering | Personne ne signe | Vendre au décideur business |
| Pas de pré-paiement annuel | Cash flow tendu | Annuel proposé visible |

## 12. Le bilan des 5 produits

Sur les cinq produits Ubuntu :

| Produit | Traction | Pattern manqué |
|---------|----------|----------------|
| Prospect-Pro AI | Forte | — |
| RunWeek | Moyenne | Onboarding initial trop long |
| HomeEnergy | Forte | — |
| MailCraft | Forte | — |
| Plateforme enrichissement | Faible | Pas d'interviews utilisateurs avant code |

Les trois qui ont décollé ont en commun : interviews préalables, time-to-value court, pricing visible, multi-tenant natif. Les deux qui ont stagné ont sauté l'une de ces étapes.

## 13. Conclusion

Le SaaS B2B n'est pas un problème technique. La tech est le moyen. Le problème est de **trouver une promesse claire, la valider en pré-vente, livrer un time-to-value court et instrumenter la rétention**.

Si vous démarrez aujourd'hui : six semaines de découverte avant le premier sprint code. Trois paliers de pricing visibles. Multi-tenant dès le jour 1. Funnel d'activation tracé.

Le reste suit. Sinon, votre SaaS rejoint le cimetière des MVP techniquement impeccables que personne n'a achetés.`;

const contentEn = `> Shipping a B2B SaaS as an agency is less a tech question than a product discipline question. Five products in eight months — here's what separates those that take off from those that sleep.

## 1. The context

At Ubuntu Consulting, I shipped five B2B SaaS products in eight months: Prospect-Pro AI, RunWeek, HomeEnergy, MailCraft and a data enrichment platform. Three found rapid commercial traction. Two never took off despite impeccable tech.

The difference didn't come from code. It came from **how we approached the MVP-to-traction transition**. This article condenses the patterns I saw work.

## 2. Promise vs product

A technically working MVP has zero value if the promise isn't clear. The promise is what you say in one sentence to a prospect.

**Good promise**: "We automate B2B prospecting with AI scoring — 60% more conversion, 15 hours saved per week."

**Bad promise**: "We have a modern lead management platform with artificial intelligence."

The first promises a quantified result. The second describes a category. Of the five products, those without a clear promise stayed technical PoCs.

## 3. Pattern 1 — Sell before you code

The first product that worked (Prospect-Pro) started with 12 user interviews before a single line of code. Format: 30 min, two questions:

1. "Describe your current prospecting, step by step"
2. "What's the most painful thing in all that?"

No mention of the planned product. Just listening. Out of 12 interviews, **8 described the same problem** — manual Excel files, 6-month-old contacts, generic messages that don't work.

That became the product brief. Tech followed.

Conversely, the two products that didn't take off started with "we saw a tech opportunity" without preliminary interviews. Result: six months of dev on features nobody requested.

## 4. Pattern 2 — Sell before it works

Before the functional MVP, we sold three licenses on a "Wizard of Oz" demo: real interface, hand-cranked backend. Customers didn't know — for them, the app worked. For us, it validated that **people were ready to pay for that precise outcome**, regardless of implementation.

This pattern (Wizard of Oz MVP) takes guts but avoids months of wasted dev. If nobody pulls out their card on the demo, the product has no market — regardless of the tech you'd have written.

## 5. Pattern 3 — Time-to-value under 5 minutes

On RunWeek, the first try sent users through 14 minutes of setup (Garmin connection, HealthKit authorization, parameter selection, history import). We lost 70% at step 3.

Funnel redesign:
- No account at start — user tests with demo data
- Optional auth at the moment of saving
- Minimal import at first login (last 7 days, not 5 years)
- Everything else in background, transparent

After redesign: time-to-value at 3 min 20 sec. Activation rate ×4.

Rule: **every second of friction between install and first "wow" costs retention**. Measure that time. Lower it like a product sprint of its own.

## 6. Pattern 4 — Pricing before features

Classic mistake: stack features, then figure out how to sell them. Better: **define pricing first**, only add features that justify a tier.

On HomeEnergy, three tiers:
- Free: 1 simulation, result without action plan
- Pro (€29/month): unlimited simulations + action plan + PDF export
- Advisor (€89/month): multi-client + agency branding + API

Each feature developed asked itself: "does it justify a tier or enrich an existing one?" If neither, we cut.

Result: compact roadmap, readable pricing, free-to-pro conversion at 8% (vs typical 1-3%).

## 7. Pattern 5 — Product observability from day 1

Without data, you're improvising blind. Three things to instrument from the MVP:

### 7.1 Activation funnel

Each key step between signup and first "wow" is tracked. On Prospect-Pro:

\`\`\`
[Signup] → [Onboarding step 1] → [First search] → [First export] → [First contact sent]
   100%         78%                    52%             38%              22%
\`\`\`

The biggest drop (step 2 → 3) signaled a confused onboarding. Redesign → drop halved.

### 7.2 Cohort retention

For each cohort (signups from a given week), track % returning the following weeks. Without this, you confuse growth with churn.

\`\`\`
              W+1   W+2   W+4   W+8
Cohort W12    65%   48%   35%   28%
Cohort W14    72%   58%   45%   38%   ← palpable improvement
\`\`\`

### 7.3 Conversational NPS

Not the automated 30-day NPS that teaches nothing. Conversational NPS: call the first 10 paying customers, ask "what would make you leave us?" and "what would make you commit more?". Answers guide the roadmap better than any form.

## 8. Pattern 6 — Tech that doesn't kill you

On the tech side, three principles to avoid shooting yourself in the foot:

### 8.1 Default stack, exoticism only if justified

Next.js + PostgreSQL + Tailwind covers 90% of B2B SaaS. Pointless to chase an experimental framework to do the same slower and riskier. The more common the stack, the easier to hire and collaborate.

### 8.2 Multi-tenant from start

A B2B SaaS serves multiple clients. Isolate data by \`tenant_id\` everywhere, from line one. Cost: 5% more effort. Benefit: no painful migration at the 50th client.

\`\`\`sql
CREATE TABLE leads (
  id          UUID PRIMARY KEY,
  tenant_id   UUID NOT NULL,
  name        TEXT NOT NULL,
);
CREATE INDEX ON leads (tenant_id, created_at);
CREATE POLICY tenant_isolation ON leads
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
\`\`\`

### 8.3 Feature flags for everything risky

Every non-trivial new feature ships behind a flag, activatable per tenant. You can test on 3% of clients without risking the other 97%. On MailCraft, this pattern avoided three production rollbacks.

## 9. Pattern 7 — Sell to the agency, not the CTO

Commercial reality of B2B SaaS in West African and French markets:

- The decider isn't the developer
- The decider wants a pitch, a number, a testimonial
- The decider signs on tangible, not on elegance

So: product pages with **a client story told as narrative**, more effective than a feature table. Visible logos. Pricing displayed (not "contact us"). 2-click clickable demo.

B2B SaaS sites doing "mystical premium" without visible pricing filter out 80% of qualified prospects who go see a transparent competitor.

## 10. Pattern 8 — Annual prepayment

On paying tiers, offer monthly + annual with ~20% discount. Multiple effects:

- Stronger client commitment (less churn)
- Boosted cash flow (upfront payment)
- Useful filtering (annual payers are the most engaged)

On Prospect-Pro, adding annual/monthly side-by-side raised CAC payback from 11 to 5 months.

## 11. Pitfalls to avoid

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Code before listening | Features nobody wants | 10+ user interviews before code |
| Time-to-value > 10 min | Massive onboarding drop | Measure and reduce each step |
| Hidden pricing | Pre-contact drop | Display transparent pricing |
| Feature before business model | Incoherent pile-up | Pricing first |
| No product observability | Blind decisions | Funnel + cohort + conversational NPS |
| Late multi-tenant | Painful migration | \`tenant_id\` from initial schema |
| Selling to engineering | Nobody signs | Sell to business decider |
| No annual prepay | Tight cash flow | Visible annual option |

## 12. The 5-product verdict

Across the five Ubuntu products:

| Product | Traction | Missed pattern |
|---------|----------|----------------|
| Prospect-Pro AI | Strong | — |
| RunWeek | Medium | Initial onboarding too long |
| HomeEnergy | Strong | — |
| MailCraft | Strong | — |
| Enrichment platform | Weak | No user interviews before code |

The three that took off share: preliminary interviews, short time-to-value, visible pricing, native multi-tenant. The two that stagnated skipped one of those steps.

## 13. Closing

B2B SaaS isn't a tech problem. Tech is the means. The problem is **finding a clear promise, validating it pre-sale, shipping short time-to-value and instrumenting retention**.

If starting today: six weeks of discovery before the first code sprint. Three visible pricing tiers. Multi-tenant from day 1. Tracked activation funnel.

The rest follows. Otherwise, your SaaS joins the graveyard of technically impeccable MVPs that nobody bought.`;

export const saasB2bMvpTraction: BlogPostSeed = {
  title:
    "Du MVP à la traction — 8 patterns pour ne pas livrer un SaaS B2B qui dort",
  title_en:
    "From MVP to traction — 8 patterns to avoid shipping a sleeping B2B SaaS",
  slug: "saas-b2b-mvp-traction-patterns",
  excerpt:
    "Vendre avant de coder, time-to-value sous 5 min, pricing avant feature, observabilité produit, multi-tenant natif : ce qui sépare les SaaS qui décollent de ceux qui dorment.",
  excerpt_en:
    "Sell before coding, time-to-value under 5 min, pricing before features, product observability, native multi-tenant: what separates SaaS that take off from those that sleep.",
  content,
  content_en: contentEn,
  category: "Business",
  imageUrl:
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80",
  readTime: "16 min de lecture",
  author: "Yao David Logan",
  published: true,
  tags: ["saas", "b2b", "product", "startup", "growth", "pricing"],
};
