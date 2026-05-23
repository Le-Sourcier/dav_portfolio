import type { BlogPostSeed } from "../types.js";

const content = `> Sur une plateforme financière, "ça marche en dev" ne suffit pas. Voici comment j'instrumente logs, métriques et traces pour qu'un incident à 3 h du matin trouve sa cause en 5 minutes.

## 1. Le contexte

Nexus est une plateforme d'investissement financier. Quand un utilisateur fait un dépôt, une dizaine d'opérations s'enchaînent : auth, scoring KYC, vérification solde, appel à la passerelle de paiement, webhook de confirmation, mise à jour du compte, notification. Si l'une casse, l'utilisateur voit "transaction échouée" — mais sans observabilité, **on ne sait pas où ça a cassé**.

L'observabilité n'est pas un luxe sur ce genre de plateforme. C'est ce qui permet à un incident de 3 h du matin d'être diagnostiqué en 5 minutes au lieu de 5 heures. Cet article condense ce que j'ai mis en place.

## 2. Les trois piliers — logs, métriques, traces

### Logs

Ce qui s'est passé. Texte structuré, lisible par humain et machine. Granularité : une ligne par événement notable.

### Métriques

Combien, à quelle fréquence. Séries temporelles agrégées. Granularité : un point par minute typiquement.

### Traces distribuées

Le chemin d'une requête à travers plusieurs services. Une trace = un ID unique propagé. Granularité : un span par étape.

Les trois sont complémentaires. Une métrique alerte ("le taux d'erreur explose"), un log montre la cause ("Stripe a renvoyé 503"), une trace montre où dans la chaîne ("entre auth-service et payment-service, latence 8s").

## 3. Pattern 1 — Logs structurés en JSON

Un log non-structuré est inutilisable pour la corrélation. Tous les logs Nexus sont en JSON, avec une structure stable.

\`\`\`typescript
// src/utils/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "nexus-api", env: process.env.NODE_ENV },
  transports: [new winston.transports.Console()],
});
\`\`\`

Une ligne typique :

\`\`\`json
{
  "timestamp": "2026-03-12T14:32:08.412Z",
  "level": "info",
  "service": "nexus-api",
  "env": "production",
  "trace_id": "abc123",
  "user_id": "u_8jhq...",
  "operation": "deposit.initiate",
  "amount_xof": 50000,
  "gateway": "mtn_momo",
  "msg": "Deposit initiated"
}
\`\`\`

Le \`trace_id\` est la clé. Tous les logs d'une même requête le partagent. Loki ou Elasticsearch indexent ce champ, et une recherche \`trace_id="abc123"\` reconstruit toute l'histoire.

## 4. Pattern 2 — Niveaux de log avec discipline

Quatre niveaux, et c'est tout. Un cinquième tue la lisibilité.

| Niveau | Quand | Exemple |
|--------|-------|---------|
| ERROR | Quelque chose a vraiment cassé et un humain doit savoir | Webhook signature invalide |
| WARN | Anomalie qui ne casse pas mais qui doit être surveillée | Retry après 3 échecs |
| INFO | Événement notable du business | Paiement confirmé, KYC validé |
| DEBUG | Détails techniques utiles en investigation | Payload reçu, query SQL |

**Règle de discipline** : DEBUG est désactivé en prod par défaut. Activable temporairement via une variable d'env sans redéploiement. Si vos logs prod sont à 80 % DEBUG, vous n'avez pas de logs — vous avez du bruit.

## 5. Pattern 3 — Propagation du trace ID

Sans trace ID propagé, vous ne pouvez pas suivre une requête entre services. Sur Nexus, le gateway génère un trace ID à chaque requête entrante et le propage en header HTTP \`x-trace-id\`.

\`\`\`typescript
// src/middlewares/traceContext.ts
import { randomUUID } from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";

const storage = new AsyncLocalStorage<{ traceId: string }>();

export function traceContext(req, res, next) {
  const traceId = req.header("x-trace-id") ?? randomUUID();
  res.setHeader("x-trace-id", traceId);
  storage.run({ traceId }, () => next());
}

export function currentTraceId(): string | undefined {
  return storage.getStore()?.traceId;
}
\`\`\`

Le logger inclut automatiquement \`trace_id\` dans chaque log :

\`\`\`typescript
const log = (level, msg, meta = {}) =>
  logger.log({ level, message: msg, trace_id: currentTraceId(), ...meta });
\`\`\`

Chaque appel HTTP downstream propage le header. La trace devient ininterrompue.

## 6. Pattern 4 — Métriques business + métriques techniques

Deux familles distinctes, deux dashboards distincts.

### Métriques techniques (red signals)

- Taux d'erreur HTTP par route (4xx, 5xx)
- Latence p50, p95, p99 par route
- Saturation : CPU, mémoire, connexions DB, queue depth
- Disponibilité par service (probe régulière)

### Métriques business (golden signals)

- Volume de dépôts / retraits par minute
- Taux de complétion KYC
- Time-to-money (du clic dépôt à la confirmation utilisateur)
- Solde global de la plateforme

\`\`\`typescript
// src/observability/metrics.ts
import prom from "prom-client";

export const depositCounter = new prom.Counter({
  name: "nexus_deposit_total",
  help: "Total deposits initiated",
  labelNames: ["gateway", "currency", "status"],
});

export const depositLatency = new prom.Histogram({
  name: "nexus_deposit_seconds",
  help: "Deposit completion time",
  labelNames: ["gateway"],
  buckets: [0.5, 1, 2, 5, 10, 30],
});
\`\`\`

Une alerte business ("volume de dépôts divisé par 3 dans la dernière heure") signale plus tôt qu'une alerte technique ("le service paiement répond plus lentement"). Les deux comptent.

## 7. Pattern 5 — Traces distribuées avec OpenTelemetry

Pour les requêtes qui traversent plusieurs services, OpenTelemetry trace chaque span.

\`\`\`typescript
// src/observability/tracing.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: process.env.OTLP_ENDPOINT }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
\`\`\`

Avec auto-instrumentation, chaque appel HTTP, requête SQL, query Redis devient un span automatiquement. Pour les opérations métier, on ajoute des spans manuels :

\`\`\`typescript
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("nexus-api");

async function processDeposit(input: DepositInput) {
  return tracer.startActiveSpan("deposit.process", async (span) => {
    span.setAttribute("amount", input.amount);
    span.setAttribute("gateway", input.gateway);
    try {
      const result = await doProcess(input);
      span.setStatus({ code: 1 }); // OK
      return result;
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  });
}
\`\`\`

Visualisation dans Tempo ou Jaeger : on voit la cascade complète, où chaque étape a passé combien de ms, et où ça a cassé.

## 8. Pattern 6 — Sampling intelligent

Tracer 100 % des requêtes en production coûte cher en stockage et en bande passante. Sampling :

- **100 % des erreurs** — toujours tracées
- **100 % des opérations financières** — non négociable
- **10 % des requêtes de lecture** — échantillonnage
- **1 % des healthchecks** — quasi-rien

\`\`\`typescript
const sampler = new ParentBasedSampler({
  root: new TraceIdRatioBasedSampler(0.1),
  remoteParentSampled: new AlwaysOnSampler(),
});
\`\`\`

Coût stockage divisé par 10 sans perdre les signaux qui comptent.

## 9. Pattern 7 — Alertes qui réveillent vs alertes qui informent

Trois canaux d'alerte, trois urgences distinctes :

- **P1 (réveille à 3 h)** : plateforme down, paiement impossible, solde corrompu
- **P2 (Slack heures ouvrées)** : latence dégradée, taux d'erreur > 1 %, queue qui grossit
- **P3 (digest hebdo)** : warnings récurrents, métriques business en baisse

\`\`\`yaml
# prometheus/alerts.yml
groups:
  - name: nexus.p1
    rules:
      - alert: PaymentServiceDown
        expr: up{service="payment-service"} == 0
        for: 1m
        labels: { severity: p1 }
        annotations:
          summary: "Payment service is down"
          runbook: "https://wiki.nexus/runbooks/payment-down"
\`\`\`

Chaque alerte P1 a un **runbook** : 5 étapes à suivre dans l'ordre. Pas de "réfléchir à 3 h du matin" — exécuter le runbook, vérifier, escalader si pas résolu en 15 min.

## 10. Pattern 8 — Dashboard "santé en 5 secondes"

Un seul dashboard ouvert sur un grand écran à l'open space. Trois blocs :

1. **État des services** : 6 cases vertes / rouges
2. **Métriques business clés** : dépôts/h, retraits/h, KYC validés/h
3. **Erreurs des 15 dernières minutes** : top 5 par fréquence

Si tout est vert, on n'y regarde pas. Si quelque chose passe au rouge, **tout le monde voit en même temps**. Pas besoin d'attendre l'alerte Slack.

## 11. Pattern 9 — Audit log séparé

Les logs applicatifs ne suffisent pas pour l'audit fintech. Un log séparé, append-only, conservé 7 ans minimum :

\`\`\`sql
CREATE TABLE audit_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type   VARCHAR(20) NOT NULL,
  actor_id     UUID NULL,
  action       VARCHAR(80) NOT NULL,
  resource     VARCHAR(80) NOT NULL,
  resource_id  UUID NULL,
  before       JSONB NULL,
  after        JSONB NULL,
  trace_id     VARCHAR(64) NOT NULL,
  at           TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Refus de UPDATE/DELETE via trigger
CREATE FUNCTION audit_immutable() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'audit_log is append-only'; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER no_update BEFORE UPDATE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_immutable();
CREATE TRIGGER no_delete BEFORE DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_immutable();
\`\`\`

Cet audit est ce qu'un régulateur ou un auditeur va lire. Il doit être propre, complet, immuable.

## 12. Pièges à éviter

| Piège | Symptôme | Correction |
|-------|----------|------------|
| Logs en texte plat | Recherche impossible | JSON structuré, indexé |
| Pas de trace ID propagé | Requête introuvable inter-service | UUID propagé en header partout |
| Trop de niveaux de log | Bruit ingérable | 4 niveaux max, DEBUG off en prod |
| Alertes sans runbook | Panique nocturne | Chaque P1 a son runbook |
| Sampling 100 % | Coût stockage exorbitant | Sampling intelligent par criticité |
| Pas d'audit séparé | Risque conformité | Table audit_log append-only, 7 ans |
| Dashboards trop détaillés | Personne ne regarde | Un dashboard santé, 5 secondes |
| Métriques uniquement techniques | Drift business invisible | Métriques business + techniques distinctes |

## 13. Conclusion

L'observabilité n'est pas un sujet d'infra. C'est un sujet de **résilience opérationnelle**. Une plateforme fintech sans observabilité claire est une bombe à retardement : le premier incident sérieux durera 6 heures, perdra des transactions, et entamera la confiance des utilisateurs.

Quatre fondamentaux pour démarrer : logs JSON structurés avec trace ID propagé, métriques business + techniques distinctes, traces distribuées sur les opérations critiques, audit log append-only séparé.

Le coût est réel (~2 semaines de setup initial, ~20 % d'overhead de code). Le bénéfice est inestimable la première fois qu'un incident à 3 h du matin se diagnostique en 5 minutes.`;

const contentEn = `> On a financial platform, "works in dev" isn't enough. Here's how I instrument logs, metrics and traces so a 3 AM incident finds its root cause in 5 minutes.

## 1. The context

Nexus is a financial investment platform. When a user makes a deposit, a dozen operations chain together: auth, KYC scoring, balance check, payment gateway call, confirmation webhook, account update, notification. If one breaks, the user sees "transaction failed" — but without observability, **we don't know where it broke**.

Observability isn't a luxury on this kind of platform. It's what turns a 3 AM incident from a 5-hour scramble into a 5-minute diagnosis. This article condenses what I put in place.

## 2. The three pillars — logs, metrics, traces

### Logs

What happened. Structured text, readable by humans and machines. Granularity: one line per notable event.

### Metrics

How many, how often. Aggregated time series. Granularity: one point per minute typically.

### Distributed traces

The path of a request across services. One trace = one propagated ID. Granularity: one span per step.

The three are complementary. A metric alerts ("error rate spikes"), a log shows the cause ("Stripe returned 503"), a trace shows where in the chain ("between auth-service and payment-service, 8s latency").

## 3. Pattern 1 — JSON-structured logs

Unstructured logs are useless for correlation. All Nexus logs are JSON with stable structure.

\`\`\`typescript
// src/utils/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "nexus-api", env: process.env.NODE_ENV },
  transports: [new winston.transports.Console()],
});
\`\`\`

A typical line:

\`\`\`json
{
  "timestamp": "2026-03-12T14:32:08.412Z",
  "level": "info",
  "service": "nexus-api",
  "env": "production",
  "trace_id": "abc123",
  "user_id": "u_8jhq...",
  "operation": "deposit.initiate",
  "amount_xof": 50000,
  "gateway": "mtn_momo",
  "msg": "Deposit initiated"
}
\`\`\`

The \`trace_id\` is key. All logs of one request share it. Loki or Elasticsearch index that field, and a \`trace_id="abc123"\` search reconstructs the whole story.

## 4. Pattern 2 — Disciplined log levels

Four levels, period. A fifth kills readability.

| Level | When | Example |
|-------|------|---------|
| ERROR | Something really broke and a human must know | Invalid webhook signature |
| WARN | Anomaly that doesn't break but must be watched | Retry after 3 failures |
| INFO | Notable business event | Payment confirmed, KYC validated |
| DEBUG | Technical details useful for investigation | Received payload, SQL query |

**Discipline rule**: DEBUG is off in prod by default. Toggleable temporarily via env without redeployment. If your prod logs are 80% DEBUG, you don't have logs — you have noise.

## 5. Pattern 3 — Trace ID propagation

Without propagated trace ID, you can't follow a request across services. On Nexus, the gateway generates a trace ID at each incoming request and propagates it as HTTP header \`x-trace-id\`.

\`\`\`typescript
// src/middlewares/traceContext.ts
import { randomUUID } from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";

const storage = new AsyncLocalStorage<{ traceId: string }>();

export function traceContext(req, res, next) {
  const traceId = req.header("x-trace-id") ?? randomUUID();
  res.setHeader("x-trace-id", traceId);
  storage.run({ traceId }, () => next());
}

export function currentTraceId(): string | undefined {
  return storage.getStore()?.traceId;
}
\`\`\`

The logger automatically includes \`trace_id\` in each log:

\`\`\`typescript
const log = (level, msg, meta = {}) =>
  logger.log({ level, message: msg, trace_id: currentTraceId(), ...meta });
\`\`\`

Each downstream HTTP call propagates the header. The trace becomes unbroken.

## 6. Pattern 4 — Business metrics + technical metrics

Two distinct families, two distinct dashboards.

### Technical (red signals)

- HTTP error rate per route (4xx, 5xx)
- p50, p95, p99 latency per route
- Saturation: CPU, memory, DB connections, queue depth
- Per-service availability (regular probe)

### Business (golden signals)

- Deposit / withdrawal volume per minute
- KYC completion rate
- Time-to-money (from deposit click to user confirmation)
- Platform-wide balance

\`\`\`typescript
import prom from "prom-client";

export const depositCounter = new prom.Counter({
  name: "nexus_deposit_total",
  help: "Total deposits initiated",
  labelNames: ["gateway", "currency", "status"],
});

export const depositLatency = new prom.Histogram({
  name: "nexus_deposit_seconds",
  help: "Deposit completion time",
  labelNames: ["gateway"],
  buckets: [0.5, 1, 2, 5, 10, 30],
});
\`\`\`

A business alert ("deposit volume divided by 3 in the last hour") signals earlier than a technical alert ("payment service responds slower"). Both matter.

## 7. Pattern 5 — Distributed tracing with OpenTelemetry

For requests crossing several services, OpenTelemetry traces each span.

\`\`\`typescript
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: process.env.OTLP_ENDPOINT }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
\`\`\`

With auto-instrumentation, each HTTP call, SQL query, Redis query becomes a span automatically. For business operations, add manual spans:

\`\`\`typescript
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("nexus-api");

async function processDeposit(input: DepositInput) {
  return tracer.startActiveSpan("deposit.process", async (span) => {
    span.setAttribute("amount", input.amount);
    span.setAttribute("gateway", input.gateway);
    try {
      const result = await doProcess(input);
      span.setStatus({ code: 1 });
      return result;
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  });
}
\`\`\`

Visualization in Tempo or Jaeger: you see the full cascade, where each step took how many ms, where it broke.

## 8. Pattern 6 — Smart sampling

Tracing 100% of requests in production costs heavily in storage and bandwidth. Sampling:

- **100% of errors** — always traced
- **100% of financial operations** — non-negotiable
- **10% of read requests** — sampled
- **1% of healthchecks** — near zero

\`\`\`typescript
const sampler = new ParentBasedSampler({
  root: new TraceIdRatioBasedSampler(0.1),
  remoteParentSampled: new AlwaysOnSampler(),
});
\`\`\`

Storage cost ÷10 without losing signals that matter.

## 9. Pattern 7 — Alerts that wake you vs alerts that inform

Three alert channels, three distinct urgencies:

- **P1 (wakes at 3 AM)**: platform down, payment impossible, corrupted balance
- **P2 (Slack business hours)**: degraded latency, error rate > 1%, growing queue
- **P3 (weekly digest)**: recurring warnings, declining business metrics

\`\`\`yaml
# prometheus/alerts.yml
groups:
  - name: nexus.p1
    rules:
      - alert: PaymentServiceDown
        expr: up{service="payment-service"} == 0
        for: 1m
        labels: { severity: p1 }
        annotations:
          summary: "Payment service is down"
          runbook: "https://wiki.nexus/runbooks/payment-down"
\`\`\`

Each P1 alert has a **runbook**: 5 ordered steps. No "thinking at 3 AM" — execute runbook, verify, escalate if unresolved in 15 min.

## 10. Pattern 8 — "Health in 5 seconds" dashboard

A single dashboard open on a big screen in the workspace. Three blocks:

1. **Service status**: 6 green/red boxes
2. **Key business metrics**: deposits/h, withdrawals/h, KYC validated/h
3. **Errors of last 15 min**: top 5 by frequency

If all green, nobody looks. If something turns red, **everyone sees at once**. No need to wait for a Slack alert.

## 11. Pattern 9 — Separate audit log

Application logs aren't enough for fintech audit. A separate log, append-only, kept 7 years minimum:

\`\`\`sql
CREATE TABLE audit_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type   VARCHAR(20) NOT NULL,
  actor_id     UUID NULL,
  action       VARCHAR(80) NOT NULL,
  resource     VARCHAR(80) NOT NULL,
  resource_id  UUID NULL,
  before       JSONB NULL,
  after        JSONB NULL,
  trace_id     VARCHAR(64) NOT NULL,
  at           TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE FUNCTION audit_immutable() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'audit_log is append-only'; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER no_update BEFORE UPDATE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_immutable();
CREATE TRIGGER no_delete BEFORE DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_immutable();
\`\`\`

This audit is what a regulator or auditor will read. It must be clean, complete, immutable.

## 12. Pitfalls to avoid

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Plain text logs | Search impossible | JSON structured, indexed |
| No propagated trace ID | Inter-service request lost | UUID propagated as header everywhere |
| Too many log levels | Unmanageable noise | 4 levels max, DEBUG off in prod |
| Alerts without runbook | Nightly panic | Every P1 has its runbook |
| 100% sampling | Exorbitant storage | Smart sampling by criticality |
| No separate audit | Compliance risk | Append-only audit_log table, 7 years |
| Over-detailed dashboards | Nobody looks | One health dashboard, 5 seconds |
| Technical-only metrics | Invisible business drift | Business + technical separate |

## 13. Closing

Observability isn't an infra topic. It's an **operational resilience** topic. A fintech platform without clear observability is a time bomb: the first serious incident lasts 6 hours, loses transactions, and damages user trust.

Four fundamentals to start: structured JSON logs with propagated trace ID, business + technical metrics separate, distributed traces on critical operations, separate append-only audit log.

Cost is real (~2 weeks initial setup, ~20% code overhead). Benefit is priceless the first time a 3 AM incident diagnoses in 5 minutes.`;

export const observabiliteFintech: BlogPostSeed = {
  title:
    "Observabilité d'une plateforme fintech — logs, métriques, traces et audit",
  title_en:
    "Observability for a fintech platform — logs, metrics, traces and audit",
  slug: "observabilite-fintech-logs-metriques-traces",
  excerpt:
    "Logs JSON structurés, trace ID propagé, OpenTelemetry, alertes P1/P2/P3 avec runbooks, audit log append-only : la boîte à outils pour diagnostiquer un incident fintech en 5 minutes.",
  excerpt_en:
    "Structured JSON logs, propagated trace ID, OpenTelemetry, P1/P2/P3 alerts with runbooks, append-only audit log: the toolkit to diagnose a fintech incident in 5 minutes.",
  content,
  content_en: contentEn,
  category: "Tech",
  imageUrl:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
  readTime: "17 min de lecture",
  author: "Yao David Logan",
  published: true,
  tags: [
    "observability",
    "monitoring",
    "fintech",
    "logs",
    "opentelemetry",
    "prometheus",
  ],
};
