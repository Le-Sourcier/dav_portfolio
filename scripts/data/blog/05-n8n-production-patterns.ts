import type { BlogPostSeed } from "../types.js";

const content = `> N8N est un outil formidable pour prototyper. En production, sans discipline, il devient un Stack Overflow géant qui pousse régulièrement des bugs en clientèle. Voici les patterns qui m'ont permis de tenir.

## 1. Le contexte

Sur deux ans, j'ai déployé une dizaine de workflows N8N en production : campagnes marketing automatisées (MailWizz), pipelines d'enrichissement de données, scraping légal, appels téléphoniques automatisés (Vapi + SIP), réconciliation entre CRM clients. J'ai aussi publié trois packages NPM autour de N8N (n8n-nodes-mailwizz, n8n-nodes-mailwizz-ls, n8n-nodes-gpt-oss).

Ce que j'ai appris : N8N est formidable pour prototyper, mais dangereux en production sans rigueur. Cet article condense les patterns qui m'ont permis de tenir.

## 2. Pourquoi N8N est trompeur

N8N donne une fausse impression de simplicité. On glisse trois nœuds, on connecte, ça marche. On déploie. Ça marche encore. Trois mois plus tard, le workflow a 47 nœuds, plus personne ne comprend ce qu'il fait, le moindre changement casse trois branches, et les logs sont illisibles.

Les vraies questions à se poser dès le premier workflow :

1. **Idempotence** — si je rejoue ce workflow, est-ce que ça duplique des données ?
2. **Observabilité** — si ça casse à 3 h du matin, comment je le sais et comment je débogue ?
3. **Versioning** — comment je promeus une version testée vers prod sans copier-coller ?
4. **Tests** — comment je valide qu'une modification n'a rien cassé en aval ?

Sans réponse claire à ces quatre questions, votre workflow est une dette qui s'accumule.

## 3. Pattern 1 — un workflow = une responsabilité

La tentation est de tout faire dans un seul workflow géant. Mauvais. Un workflow ne doit faire qu'une chose. Si une étape change de logique métier, on extrait un sous-workflow appelé par "Execute Workflow".

\`\`\`
[Workflow principal : "Daily lead enrichment"]
  ├─ Trigger: Cron 02:00
  ├─ Execute Workflow: "Fetch new leads"
  ├─ Execute Workflow: "Enrich with OpenAI"
  ├─ Execute Workflow: "Push to CRM"
  └─ Execute Workflow: "Notify on Slack"
\`\`\`

Chaque sous-workflow est testable indépendamment, versionnable, réutilisable. Quand "Push to CRM" change parce qu'on passe de HubSpot à Pipedrive, le workflow principal ne bouge pas.

## 4. Pattern 2 — idempotence sur les triggers

La plupart des bugs en production viennent de triggers qui rejouent. Webhook qui retente, cron qui empile, manual run pendant qu'un cron est en cours.

La règle : **chaque opération externe doit être idempotente**. Pas par convention — par implémentation.

### Pour les API HTTP

Toujours utiliser \`Idempotency-Key\` en header. La plupart des API modernes le supportent (Stripe, PayPal, etc.). Pour celles qui ne supportent pas, hasher le payload + une fenêtre temporelle :

\`\`\`javascript
// Function node — calcul d'idempotency key
const crypto = require('crypto');
const payloadHash = crypto.createHash('sha256')
  .update(JSON.stringify($input.item.json))
  .digest('hex');
const windowKey = Math.floor(Date.now() / (5 * 60 * 1000)); // fenêtre 5 min
return { json: { idempotencyKey: \`\${windowKey}-\${payloadHash}\` } };
\`\`\`

### Pour les bases de données

Toujours \`UPSERT\` (\`ON CONFLICT DO UPDATE\` en Postgres) avec une clé unique métier, jamais \`INSERT\` aveugle.

\`\`\`sql
INSERT INTO leads (email, name, source, scored_at)
VALUES ($1, $2, $3, NOW())
ON CONFLICT (email)
DO UPDATE SET name = EXCLUDED.name, source = EXCLUDED.source, scored_at = NOW();
\`\`\`

## 5. Pattern 3 — error handling explicite

Le mode "On Error: Continue" de N8N est tentant mais traître. Il avale les erreurs sans les remonter. Préférer "On Error: Stop and Show" ou "Continue (Error Output)" qui sépare visuellement la branche d'erreur.

\`\`\`
[HTTP Request: "Fetch enrichment"]
  ├─ Success → [Set: parsed data] → [Postgres: upsert]
  └─ Error  → [Set: error context] → [Slack: alert team] → [Continue or stop]
\`\`\`

Chaque branche d'erreur doit :
1. Capturer le contexte (input qui a échoué, code d'erreur)
2. Notifier un canal humain (Slack, email)
3. Décider : reprendre, mettre en quarantaine, ou stopper

\`\`\`javascript
// Function node — formatage d'erreur structurée
return {
  json: {
    error: {
      code: $json.error?.code ?? 'unknown',
      message: $json.error?.message,
      input: $('Previous Node').item.json,
      workflowId: $workflow.id,
      executionId: $execution.id,
      at: new Date().toISOString(),
    }
  }
};
\`\`\`

## 6. Pattern 4 — observabilité — logs et metrics structurés

Les logs N8N par défaut sont illisibles en production. Trois améliorations :

### 6.1 Persister les exécutions échouées

N8N permet via la config \`EXECUTIONS_DATA_SAVE_ON_ERROR=all\` de garder les exécutions échouées indéfiniment. Le défaut est trop court.

### 6.2 Logger en JSON vers un sink externe

Ajouter un nœud HTTP Request à la fin (succès et erreur) qui pousse vers Loki / Elasticsearch / Datadog :

\`\`\`json
{
  "level": "info",
  "workflow": "{{$workflow.name}}",
  "execution": "{{$execution.id}}",
  "duration_ms": "{{$now - $('Trigger').context.startTime}}",
  "items_processed": "{{$itemsCount}}",
  "status": "success"
}
\`\`\`

### 6.3 Metrics business

Pour chaque workflow critique, écrire des metrics dans une table Postgres dédiée :

\`\`\`sql
CREATE TABLE workflow_metrics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow    VARCHAR(100) NOT NULL,
  status      VARCHAR(20) NOT NULL,
  items       INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL,
  at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX ON workflow_metrics (workflow, at);
\`\`\`

Un dashboard Grafana branché là-dessus donne en 5 minutes la santé de tout votre N8N.

## 7. Pattern 5 — versioning et déploiement

Modifier un workflow en production directement, c'est l'erreur classique. Pattern correct :

1. **Export JSON** régulier dans Git (le format de N8N est un JSON propre)
2. **Branches** par environnement (dev, staging, prod)
3. **CI** qui valide la cohérence (variables, credentials existent)
4. **Import** automatique via l'API N8N sur les bons env

\`\`\`bash
# Script de promotion staging → prod
curl -X POST https://n8n.prod.example.com/api/v1/workflows/import \\
  -H "X-N8N-API-KEY: \${N8N_PROD_KEY}" \\
  -H "Content-Type: application/json" \\
  -d @workflows/daily-enrichment.json
\`\`\`

Cette approche évite les "qui a touché ce workflow le 3 mars ?" — l'historique git tranche.

## 8. Pattern 6 — credentials par environnement

Jamais de credentials de prod dans un workflow de dev. Utiliser les "Credentials" de N8N (chiffrées au repos), nommés explicitement par environnement :

- \`postgres-prod-readonly\`
- \`postgres-prod-write\`
- \`stripe-staging\`
- \`mailwizz-prod\`

Le workflow référence le credential par nom logique. À l'import dans un autre environnement, N8N demande de remapper, ce qui évite les fuites accidentelles.

## 9. Pattern 7 — sub-workflows comme "fonctions"

Un sous-workflow bien fait est une "fonction" appelable. Convention :

- **Input** : un objet structuré explicite (pas de dépendance implicite)
- **Output** : un objet \`{ success: bool, data, error }\`
- **Pas d'effet de bord** dans le sous-workflow sauf ce qu'il déclare faire
- **Idempotent** par défaut

\`\`\`javascript
// Entrée d'un sous-workflow "Enrich with OpenAI"
{
  "lead": { "email": "x@y.com", "company": "Acme" },
  "criteria": ["industry", "size", "buying_signals"]
}

// Sortie
{
  "success": true,
  "data": {
    "score": 87,
    "rationale": "...",
    "tags": ["fintech", "growth"]
  }
}
\`\`\`

Ça transforme N8N en bibliothèque de fonctions plutôt qu'en plat de spaghetti.

## 10. Pattern 8 — un workflow de monitoring du monitoring

Le pire scénario : N8N est down, donc aucune notification de panne ne sort. Solution : un cron externe (UptimeRobot, BetterStack, ou un simple GitHub Actions) qui ping \`https://n8n.example.com/healthz\` toutes les 5 minutes. Si pas de réponse, alerte sur un canal qui ne passe pas par N8N.

C'est trivial, oublié 90 % du temps, et ça sauve des soirées.

## 11. Pièges à éviter

| Piège | Symptôme | Correction |
|-------|----------|------------|
| "On Error: Continue" partout | Erreurs avalées, dette silencieuse | Branches d'erreur explicites |
| Workflow géant > 30 nœuds | Personne ne comprend, modifs cassent tout | Découper en sous-workflows |
| Credentials en clair dans Function | Fuite si export JSON | Toujours via "Credentials" N8N |
| Pas d'idempotence sur webhooks | Doublons à chaque retry | \`Idempotency-Key\` ou hash payload |
| Pas de logs structurés | Debug impossible | Sink JSON externe (Loki/ELK) |
| Modifs directes en prod | Pas d'historique, rollback impossible | Git + import via API |
| Pas de monitor externe | Panne N8N invisible | Healthcheck externe (UptimeRobot) |

## 12. Conclusion

N8N est un outil professionnel quand on lui applique les patterns d'un outil professionnel : idempotence, observabilité, versioning, isolation par environnement, monitoring externe. Sans ça, c'est un piège qui s'auto-empoisonne.

Le coût d'application de ces patterns est négligeable au démarrage. Le coût de leur absence se paie plusieurs heures par mois en débogage et plusieurs incidents par an en clientèle.

Si vous démarrez aujourd'hui, prenez ces huit patterns comme socle. Le reste viendra avec l'expérience.`;

const contentEn = `> N8N is a brilliant tool for prototyping. In production, without discipline, it becomes a giant Stack Overflow that regularly ships bugs to clients. Here are the patterns that kept me sane.

## 1. The context

Over two years, I deployed about ten N8N workflows to production: automated marketing campaigns (MailWizz), data enrichment pipelines, legal scraping, automated phone calls (Vapi + SIP), reconciliation between client CRMs. I also published three NPM packages around N8N (n8n-nodes-mailwizz, n8n-nodes-mailwizz-ls, n8n-nodes-gpt-oss).

What I learned: N8N is brilliant for prototyping but dangerous in production without rigor. This article condenses the patterns that kept things stable.

## 2. Why N8N is misleading

N8N gives a false impression of simplicity. Drag three nodes, connect, it works. Deploy. Still works. Three months later, the workflow has 47 nodes, nobody understands what it does, the smallest change breaks three branches, and logs are unreadable.

The real questions to ask from the first workflow:

1. **Idempotency** — if I replay this workflow, does it duplicate data?
2. **Observability** — if it breaks at 3 AM, how do I know and debug?
3. **Versioning** — how do I promote a tested version to prod without copy-paste?
4. **Tests** — how do I validate that a change didn't break anything downstream?

Without a clear answer to those four questions, your workflow is debt accumulating.

## 3. Pattern 1 — one workflow = one responsibility

The temptation: do everything in one giant workflow. Bad. A workflow must do one thing. If a step changes its business logic, extract it as a sub-workflow called via "Execute Workflow".

\`\`\`
[Main workflow: "Daily lead enrichment"]
  ├─ Trigger: Cron 02:00
  ├─ Execute Workflow: "Fetch new leads"
  ├─ Execute Workflow: "Enrich with OpenAI"
  ├─ Execute Workflow: "Push to CRM"
  └─ Execute Workflow: "Notify on Slack"
\`\`\`

Each sub-workflow is independently testable, versionable, reusable. When "Push to CRM" changes because we switch from HubSpot to Pipedrive, the main workflow doesn't move.

## 4. Pattern 2 — idempotency on triggers

Most production bugs come from triggers that replay. Webhook retries, stacked crons, manual run during a cron.

Rule: **every external operation must be idempotent**. Not by convention — by implementation.

### For HTTP APIs

Always use \`Idempotency-Key\` as header. Most modern APIs support it (Stripe, PayPal, etc.). For those that don't, hash the payload plus a time window:

\`\`\`javascript
// Function node — idempotency key computation
const crypto = require('crypto');
const payloadHash = crypto.createHash('sha256')
  .update(JSON.stringify($input.item.json))
  .digest('hex');
const windowKey = Math.floor(Date.now() / (5 * 60 * 1000));
return { json: { idempotencyKey: \`\${windowKey}-\${payloadHash}\` } };
\`\`\`

### For databases

Always \`UPSERT\` (\`ON CONFLICT DO UPDATE\` in Postgres) with a unique business key, never blind \`INSERT\`.

\`\`\`sql
INSERT INTO leads (email, name, source, scored_at)
VALUES ($1, $2, $3, NOW())
ON CONFLICT (email)
DO UPDATE SET name = EXCLUDED.name, source = EXCLUDED.source, scored_at = NOW();
\`\`\`

## 5. Pattern 3 — explicit error handling

N8N's "On Error: Continue" is tempting but treacherous. It swallows errors without surfacing them. Prefer "On Error: Stop and Show" or "Continue (Error Output)" which visually separates the error branch.

\`\`\`
[HTTP Request: "Fetch enrichment"]
  ├─ Success → [Set: parsed data] → [Postgres: upsert]
  └─ Error  → [Set: error context] → [Slack: alert team] → [Continue or stop]
\`\`\`

Each error branch must:
1. Capture context (failing input, error code)
2. Notify a human channel (Slack, email)
3. Decide: resume, quarantine, or stop

\`\`\`javascript
// Function node — structured error formatting
return {
  json: {
    error: {
      code: $json.error?.code ?? 'unknown',
      message: $json.error?.message,
      input: $('Previous Node').item.json,
      workflowId: $workflow.id,
      executionId: $execution.id,
      at: new Date().toISOString(),
    }
  }
};
\`\`\`

## 6. Pattern 4 — observability — structured logs and metrics

Default N8N logs are unreadable in production. Three upgrades:

### 6.1 Persist failed executions

N8N config \`EXECUTIONS_DATA_SAVE_ON_ERROR=all\` keeps failed executions indefinitely. Default is too short.

### 6.2 Log JSON to an external sink

Add a final HTTP Request node (success and error) that pushes to Loki / Elasticsearch / Datadog:

\`\`\`json
{
  "level": "info",
  "workflow": "{{$workflow.name}}",
  "execution": "{{$execution.id}}",
  "duration_ms": "{{$now - $('Trigger').context.startTime}}",
  "items_processed": "{{$itemsCount}}",
  "status": "success"
}
\`\`\`

### 6.3 Business metrics

For each critical workflow, write metrics into a dedicated Postgres table:

\`\`\`sql
CREATE TABLE workflow_metrics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow    VARCHAR(100) NOT NULL,
  status      VARCHAR(20) NOT NULL,
  items       INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL,
  at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX ON workflow_metrics (workflow, at);
\`\`\`

A Grafana dashboard wired to it gives full N8N health in 5 minutes.

## 7. Pattern 5 — versioning and deployment

Editing a production workflow directly is the classic mistake. Correct pattern:

1. **Regular JSON export** to Git (N8N's format is clean JSON)
2. **Branches** per environment (dev, staging, prod)
3. **CI** validating coherence (variables, credentials exist)
4. **Automatic import** via N8N API to the right env

\`\`\`bash
# Promotion script staging → prod
curl -X POST https://n8n.prod.example.com/api/v1/workflows/import \\
  -H "X-N8N-API-KEY: \${N8N_PROD_KEY}" \\
  -H "Content-Type: application/json" \\
  -d @workflows/daily-enrichment.json
\`\`\`

This approach kills "who touched this workflow on March 3rd?" — git history decides.

## 8. Pattern 6 — credentials per environment

Never prod credentials in a dev workflow. Use N8N's "Credentials" (encrypted at rest), explicitly named per environment:

- \`postgres-prod-readonly\`
- \`postgres-prod-write\`
- \`stripe-staging\`
- \`mailwizz-prod\`

The workflow references the credential by logical name. On import to another environment, N8N asks to remap, preventing accidental leaks.

## 9. Pattern 7 — sub-workflows as "functions"

A well-crafted sub-workflow is a callable "function". Convention:

- **Input**: a structured explicit object (no hidden dependencies)
- **Output**: an object \`{ success: bool, data, error }\`
- **No side effects** beyond what's declared
- **Idempotent** by default

\`\`\`javascript
// Input of "Enrich with OpenAI" sub-workflow
{
  "lead": { "email": "x@y.com", "company": "Acme" },
  "criteria": ["industry", "size", "buying_signals"]
}

// Output
{
  "success": true,
  "data": {
    "score": 87,
    "rationale": "...",
    "tags": ["fintech", "growth"]
  }
}
\`\`\`

Turns N8N into a function library rather than a spaghetti plate.

## 10. Pattern 8 — a workflow monitoring the monitoring

Worst case: N8N is down, so no failure notification comes out. Fix: an external cron (UptimeRobot, BetterStack, or a simple GitHub Actions) pinging \`https://n8n.example.com/healthz\` every 5 minutes. No response → alert on a channel that doesn't go through N8N.

Trivial, forgotten 90% of the time, saves evenings.

## 11. Pitfalls to avoid

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| "On Error: Continue" everywhere | Swallowed errors, silent debt | Explicit error branches |
| Giant workflow > 30 nodes | Nobody understands, changes break all | Split into sub-workflows |
| Plain credentials in Function | Leak on JSON export | Always N8N "Credentials" |
| No webhook idempotency | Duplicates on each retry | \`Idempotency-Key\` or payload hash |
| No structured logs | Debug impossible | External JSON sink (Loki/ELK) |
| Direct prod edits | No history, no rollback | Git + import via API |
| No external monitor | N8N outage invisible | External healthcheck (UptimeRobot) |

## 12. Closing

N8N is a professional tool when you apply professional patterns: idempotency, observability, versioning, environment isolation, external monitoring. Without those, it's a self-poisoning trap.

Cost of applying these patterns is negligible at start. Cost of their absence is paid in hours of debugging per month and incidents per year in clients' production.

If you're starting today, take these eight patterns as foundation. The rest comes with experience.`;

export const n8nProductionPatterns: BlogPostSeed = {
  title:
    "N8N en production — 8 patterns pour ne pas s'auto-empoisonner",
  title_en:
    "N8N in production — 8 patterns to avoid self-poisoning",
  slug: "n8n-production-patterns-avances",
  excerpt:
    "Idempotence, sous-workflows, error branches explicites, logs structurés, versioning Git et monitoring externe : les patterns qui transforment N8N en outil de production professionnel.",
  excerpt_en:
    "Idempotency, sub-workflows, explicit error branches, structured logs, Git versioning and external monitoring: the patterns that turn N8N into a professional production tool.",
  content,
  content_en: contentEn,
  category: "Tutoriel",
  imageUrl:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
  readTime: "16 min de lecture",
  author: "Yao David Logan",
  published: true,
  tags: ["n8n", "automation", "workflows", "devops", "production"],
};
