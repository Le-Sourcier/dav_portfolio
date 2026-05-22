import type { BlogPostSeed } from "../types.js";

const content = `> Construire une plateforme fintech multi-canal en microservices Node.js, sans tomber dans le piège du "microservice pour le microservice". Retour d'expérience sur Nexus, sept mois de production.

## 1. Le contexte

Nexus Corporation voulait une plateforme d'investissement financier servant simultanément un site web public, une application mobile cross-platform, un dashboard admin et un blog technique — le tout sur un backend unifié. Le piège classique aurait été d'empiler des microservices par mimétisme. La promesse marketing "microservices" cache souvent un monolithe distribué : pénible à débugger, lent à déployer, fragile sous charge.

J'ai pris le pari inverse : commencer par un **monolithe modulaire bien découpé**, puis extraire en microservices uniquement les domaines qui le justifient — paiement, scoring, sessions. Trois critères m'ont guidé : besoin de scaler indépendamment, contrainte de sécurité différente, vitesse de déploiement spécifique.

Le résultat : trois services (auth/RBAC, investissement, paiement) derrière une API gateway Node.js, partageant PostgreSQL pour le relationnel et Redis pour le cache et les sessions volatiles. Les surfaces (web Next.js 14, app mobile React Native, admin) consomment la même API.

## 2. Symptômes qui m'auraient fait reculer

Avant de découper, j'ai listé les signaux qu'on observait sur des architectures concurrentes :

- Déploiements monolithiques de 12+ minutes qui bloquent les hotfixes
- Pics de charge sur les routes paiement qui font tomber l'authentification
- Webhooks de passerelle paiement qui retentent en boucle parce que le service est indisponible
- Migration de schéma qui locke la table pendant 4 minutes en production
- Logs noyés dans le bruit, impossible d'isoler une transaction

Aucun de ces symptômes n'était lié au monolithe en lui-même. Tous étaient liés à un **mauvais découpage de domaines**. Mais le découpage en services force la discipline.

## 3. L'approche

### 3.1 Le service gateway

Le gateway est délibérément mince. Il fait trois choses : router, authentifier, journaliser. Pas de logique métier. Pas d'accès direct à la base. Sa seule autonomie : refuser une requête mal formée, rate-limiter, et émettre un trace ID propagé à tous les services downstream.

\`\`\`typescript
// src/middlewares/traceContext.ts
import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export function traceContext(req: Request, res: Response, next: NextFunction) {
  const traceId = req.header("x-trace-id") ?? randomUUID();
  res.setHeader("x-trace-id", traceId);
  // Disponible dans tous les services downstream via le client interne
  req.app.locals.traceId = traceId;
  next();
}
\`\`\`

### 3.2 Le service auth & RBAC

Séparé pour deux raisons : sa surface de sécurité diffère du reste (rotation de secrets, audit obligatoire), et il doit scaler indépendamment quand les sessions explosent (typiquement à l'ouverture du marché).

Le contrat est étroit : un endpoint \`POST /sessions\` qui retourne un JWT court (15 min) + un refresh token long (7 jours, stocké hashé en DB). Les rôles sont matérialisés dans le claim JWT, vérifiés à chaque requête downstream sans rappel.

### 3.3 Le service paiement

C'est le plus instructif. Il intègre plusieurs passerelles (carte, mobile money, virement), chacune avec son propre format de webhook et sa propre logique d'idempotence. Le service expose une API unifiée : \`createPayment\`, \`confirmPayment\`, \`refundPayment\`. À l'intérieur, un *adapter pattern* isole chaque passerelle dans son propre module.

\`\`\`typescript
// src/services/payment/PaymentGateway.ts
export interface PaymentGateway {
  readonly name: string;
  initiate(input: PaymentInitiateInput): Promise<PaymentSession>;
  confirm(sessionId: string, evidence: WebhookPayload): Promise<PaymentResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}
\`\`\`

Chaque passerelle implémente l'interface. Le service paiement choisit la bonne via un router basé sur le moyen demandé par le client. Les webhooks sont reçus sur des routes dédiées par passerelle (\`/webhooks/cb\`, \`/webhooks/mtn\`, \`/webhooks/orange\`) puis dispatchés via un job idempotent.

## 4. Cas concret : un webhook qui retentait 200 fois

Premier mois en production, un webhook d'une passerelle locale a tenté 200 fois la même notification. Le bug venait d'une accusation de réception 200 OK trop tardive : nous traitions le webhook en synchrone (vérification base + mise à jour + notification utilisateur), et certaines transactions prenaient 8 secondes. La passerelle considérait l'envoi comme échoué et rejouait.

La correction : **accuser réception immédiatement** et déléguer le traitement à un job en arrière-plan, idempotent par \`event_id\`.

\`\`\`typescript
// src/controllers/payment/webhookHandler.ts
export async function handleGatewayWebhook(req: Request, res: Response) {
  const payload = req.body as WebhookPayload;

  // 1. Idempotence — refuse les rejeux silencieusement
  const exists = await WebhookEvent.findOne({
    where: { gatewayId: payload.gateway, eventId: payload.id },
  });
  if (exists) return res.status(200).json({ ok: true, deduped: true });

  // 2. Persiste l'event AVANT tout traitement
  await WebhookEvent.create({
    gatewayId: payload.gateway,
    eventId: payload.id,
    rawBody: payload,
    status: "received",
  });

  // 3. Accuse réception immédiatement
  res.status(200).json({ ok: true });

  // 4. Traitement asynchrone via la queue
  await paymentQueue.add("process-webhook", { eventId: payload.id });
}
\`\`\`

Trois lignes essentielles : **persister avant de traiter, accuser réception tôt, traiter en queue idempotente**. Les retries de la passerelle deviennent inoffensifs.

## 5. PostgreSQL + Redis — qui fait quoi

PostgreSQL stocke ce qui doit survivre : transactions, comptes, soldes, journaux d'audit. Toutes les opérations financières sont en transactions ACID avec niveau d'isolation \`SERIALIZABLE\` sur les comptes.

Redis stocke ce qui peut disparaître : sessions JWT révoquées (TTL 15 min), rate-limit par IP, cache de prix temps réel (TTL 2 secondes), et un publish/subscribe pour pousser les flux WebSocket à l'admin.

Règle de pouce : **si la donnée doit survivre à un redémarrage, elle est dans Postgres**. Si elle peut être recalculée en moins de 5 secondes, Redis suffit.

## 6. Le WebSocket de l'admin

Le dashboard admin doit afficher les transactions en temps réel. La solution naïve — polling toutes les 2 secondes — saturerait la base. À la place : Redis Pub/Sub côté serveur, Socket.IO côté client. Chaque service publie ses événements (\`payment.confirmed\`, \`user.kyc.validated\`, \`investment.created\`) sur un canal Redis. Le gateway s'abonne et pousse aux clients admins authentifiés.

\`\`\`typescript
// src/services/realtime/eventBus.ts
import { redis } from "../../config/redis.js";

type RealtimeEvent = "payment.confirmed" | "user.kyc.validated" | "investment.created";

export async function publishEvent<T>(event: RealtimeEvent, payload: T) {
  await redis.publish(\`events:\${event}\`, JSON.stringify({ event, payload, at: Date.now() }));
}
\`\`\`

Côté admin : un seul socket multiplexé par utilisateur, filtrage des événements selon le rôle, déduplication par hash sur les 30 dernières secondes.

## 7. Migrations sans downtime

Les migrations de schéma sur une plateforme financière en production sont à haut risque. Trois règles non négociables :

1. **Backward compatible d'abord** — toute migration doit pouvoir tourner sans casser la version précédente du code. Ajouter une colonne nullable, jamais renommer.
2. **Pas de \`ALTER TABLE\` qui locke** — sur Postgres, \`ADD COLUMN ... DEFAULT\` rewrite la table entière (sauf en 11+). Toujours préférer \`ADD COLUMN\` nullable puis \`UPDATE\` par lot.
3. **Un seul changement par migration** — sinon le rollback partiel est ingérable.

\`\`\`sql
-- ✅ Bon : ajoute la colonne nullable, sera remplie progressivement
ALTER TABLE transactions ADD COLUMN risk_score INTEGER NULL;

-- ❌ Mauvais : locke la table pour rewrite
ALTER TABLE transactions ADD COLUMN risk_score INTEGER NOT NULL DEFAULT 0;
\`\`\`

## 8. Pièges à éviter

| Piège | Symptôme | Correction |
|-------|----------|------------|
| Microservice prématuré | Latence inter-service > latence DB | Reculer vers un monolithe modulaire |
| Pas d'idempotence sur webhooks | Doublons de transactions | Table \`webhook_events\` + queue idempotente |
| Auth dans chaque service | Logique dupliquée, drift de règles | Service auth centralisé, JWT avec claims |
| Logs sans trace ID | Impossible d'isoler une requête | Trace ID propagé en header inter-service |
| Schemas partagés via DB | Couplage caché, déploiements groupés | Schemas privés par service, contracts JSON |
| Pas de circuit breaker | Une passerelle lente fait tomber tout | Timeout + circuit breaker par adapter |

## 9. Le bilan

Sept mois plus tard, la plateforme tourne avec un uptime mesuré à 99,9 %, une latence p95 sur les routes critiques sous 200 ms, et zéro incident de déploiement bloquant en production. Le découpage en trois services s'est révélé suffisant — je n'ai pas eu besoin d'aller plus loin.

Le vrai gain n'est pas technique. C'est la **clarté d'intention** : chaque service a un propriétaire métier, une responsabilité étroite, un cycle de release indépendant. L'équipe peut livrer du paiement sans craindre de casser l'authentification.

## 10. Conclusion

Les microservices ne sont pas un objectif. Ce sont un outil pour résoudre des problèmes spécifiques : scalabilité différenciée, contraintes de sécurité distinctes, cadence de release indépendante. Si vous n'avez aucun de ces trois problèmes, restez sur un monolithe modulaire — il est dix fois plus rapide à livrer et cinq fois plus facile à débugger.

Le bon découpage de domaines compte plus que le nombre de services. Une plateforme bien structurée en trois services bat n'importe quelle architecture distribuée bricolée en quinze.`;

const contentEn = `> Building a multi-surface fintech platform with Node.js microservices, without falling into the "microservice for the sake of it" trap. Field report from Nexus, seven months in production.

## 1. The context

Nexus Corporation needed a financial investment platform serving a public web site, a cross-platform mobile app, an admin dashboard and a technical blog — all on a unified backend. The usual trap would have been to stack microservices by mimicry. The "microservices" marketing pitch often hides a distributed monolith: painful to debug, slow to deploy, fragile under load.

I took the opposite bet: start with a **well-structured modular monolith**, then extract microservices only for domains that justified it — payment, scoring, sessions. Three criteria guided me: need to scale independently, different security constraints, specific deployment cadence.

Result: three services (auth/RBAC, investment, payment) behind a Node.js API gateway, sharing PostgreSQL for relational storage and Redis for cache plus volatile sessions. The surfaces (Next.js 14 web, React Native mobile, admin) consume the same API.

## 2. Symptoms that would have made me retreat

Before splitting, I listed the signals we saw on competing architectures:

- 12+ minute monolithic deployments blocking hotfixes
- Load spikes on payment routes taking down authentication
- Payment gateway webhooks retrying in loops because the service was down
- Schema migrations locking tables for 4 minutes in production
- Logs drowned in noise, impossible to isolate a transaction

None of these symptoms were caused by the monolith itself. All were caused by **bad domain boundaries**. But splitting into services forces discipline.

## 3. The approach

### 3.1 The gateway service

The gateway is deliberately thin. It does three things: route, authenticate, log. No business logic. No direct database access. Its only autonomy: refuse a malformed request, rate-limit, and emit a trace ID propagated to all downstream services.

\`\`\`typescript
// src/middlewares/traceContext.ts
import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export function traceContext(req: Request, res: Response, next: NextFunction) {
  const traceId = req.header("x-trace-id") ?? randomUUID();
  res.setHeader("x-trace-id", traceId);
  req.app.locals.traceId = traceId;
  next();
}
\`\`\`

### 3.2 The auth & RBAC service

Split out for two reasons: its security surface differs from the rest (secret rotation, mandatory audit), and it must scale independently when sessions spike (typically at market open).

The contract is narrow: one \`POST /sessions\` endpoint returning a short JWT (15 min) plus a long refresh token (7 days, hashed at rest). Roles are materialized in the JWT claim, verified at every downstream request without callbacks.

### 3.3 The payment service

The most instructive one. It integrates several gateways (card, mobile money, bank transfer), each with its own webhook format and idempotency logic. The service exposes a unified API: \`createPayment\`, \`confirmPayment\`, \`refundPayment\`. Internally, an *adapter pattern* isolates each gateway in its own module.

\`\`\`typescript
// src/services/payment/PaymentGateway.ts
export interface PaymentGateway {
  readonly name: string;
  initiate(input: PaymentInitiateInput): Promise<PaymentSession>;
  confirm(sessionId: string, evidence: WebhookPayload): Promise<PaymentResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}
\`\`\`

Each gateway implements the interface. The payment service picks the right one through a router based on the client's chosen method. Webhooks land on gateway-dedicated routes (\`/webhooks/cb\`, \`/webhooks/mtn\`, \`/webhooks/orange\`) then dispatch through an idempotent job.

## 4. Field story: a webhook that retried 200 times

First month in production, a local gateway webhook tried the same notification 200 times. The bug came from a late 200 OK acknowledgement: we were processing the webhook synchronously (DB check + update + user notification), and some transactions took 8 seconds. The gateway considered the call failed and replayed.

Fix: **acknowledge receipt immediately** and offload processing to a background job, idempotent by \`event_id\`.

\`\`\`typescript
// src/controllers/payment/webhookHandler.ts
export async function handleGatewayWebhook(req: Request, res: Response) {
  const payload = req.body as WebhookPayload;

  // 1. Idempotency — silently refuse replays
  const exists = await WebhookEvent.findOne({
    where: { gatewayId: payload.gateway, eventId: payload.id },
  });
  if (exists) return res.status(200).json({ ok: true, deduped: true });

  // 2. Persist the event BEFORE any processing
  await WebhookEvent.create({
    gatewayId: payload.gateway,
    eventId: payload.id,
    rawBody: payload,
    status: "received",
  });

  // 3. Acknowledge immediately
  res.status(200).json({ ok: true });

  // 4. Process asynchronously via queue
  await paymentQueue.add("process-webhook", { eventId: payload.id });
}
\`\`\`

Three essential lines: **persist before processing, acknowledge early, process via an idempotent queue**. Gateway retries become harmless.

## 5. PostgreSQL + Redis — who does what

PostgreSQL stores what must survive: transactions, accounts, balances, audit logs. Every financial operation runs in ACID transactions with \`SERIALIZABLE\` isolation on accounts.

Redis stores what can disappear: revoked JWT sessions (TTL 15 min), per-IP rate-limit, real-time price cache (TTL 2 seconds), and a publish/subscribe to push WebSocket streams to the admin.

Rule of thumb: **if the data must survive a restart, it lives in Postgres**. If it can be recomputed in under 5 seconds, Redis is enough.

## 6. The admin WebSocket

The admin dashboard must display transactions in real time. The naive solution — polling every 2 seconds — would saturate the database. Instead: Redis Pub/Sub server-side, Socket.IO client-side. Each service publishes its events (\`payment.confirmed\`, \`user.kyc.validated\`, \`investment.created\`) on a Redis channel. The gateway subscribes and pushes to authenticated admin clients.

\`\`\`typescript
// src/services/realtime/eventBus.ts
import { redis } from "../../config/redis.js";

type RealtimeEvent = "payment.confirmed" | "user.kyc.validated" | "investment.created";

export async function publishEvent<T>(event: RealtimeEvent, payload: T) {
  await redis.publish(\`events:\${event}\`, JSON.stringify({ event, payload, at: Date.now() }));
}
\`\`\`

Admin side: a single multiplexed socket per user, event filtering by role, deduplication by hash on the last 30 seconds.

## 7. Schema migrations without downtime

Schema migrations on a production fintech platform carry high risk. Three non-negotiable rules:

1. **Backward compatible first** — every migration must run without breaking the previous code version. Add a nullable column, never rename.
2. **No locking \`ALTER TABLE\`** — on Postgres, \`ADD COLUMN ... DEFAULT\` rewrites the whole table (except on 11+). Always prefer nullable \`ADD COLUMN\` then batched \`UPDATE\`.
3. **One change per migration** — otherwise partial rollback is unmanageable.

\`\`\`sql
-- ✅ Good: nullable add, filled progressively
ALTER TABLE transactions ADD COLUMN risk_score INTEGER NULL;

-- ❌ Bad: locks the table for rewrite
ALTER TABLE transactions ADD COLUMN risk_score INTEGER NOT NULL DEFAULT 0;
\`\`\`

## 8. Pitfalls to avoid

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Premature microservice | Inter-service latency > DB latency | Step back to a modular monolith |
| No webhook idempotency | Duplicated transactions | \`webhook_events\` table + idempotent queue |
| Auth in every service | Duplicated logic, rule drift | Central auth service, JWT with claims |
| Logs without trace ID | Impossible to isolate a request | Trace ID propagated as inter-service header |
| Shared schemas via DB | Hidden coupling, grouped deployments | Private schemas per service, JSON contracts |
| No circuit breaker | A slow gateway brings everything down | Timeout + circuit breaker per adapter |

## 9. The verdict

Seven months later, the platform runs at a measured 99.9% uptime, p95 latency on critical routes under 200 ms, and zero deployment-blocking incident in production. Three services proved enough — I never needed to go further.

The real win isn't technical. It's **intent clarity**: each service has a business owner, a narrow responsibility, an independent release cycle. The team can ship payment without fearing it will break authentication.

## 10. Closing

Microservices aren't a goal. They're a tool to solve specific problems: differentiated scaling, distinct security constraints, independent release cadence. If you have none of those three problems, stay on a modular monolith — it ships ten times faster and debugs five times more easily.

Good domain boundaries matter more than the service count. A platform well structured around three services beats any distributed architecture cobbled together with fifteen.`;

export const microservicesNodejs: BlogPostSeed = {
  title:
    "Microservices Node.js sans dette — REX d'une plateforme fintech multi-canal",
  title_en:
    "Microservices in Node.js without debt — field notes from a multi-surface fintech platform",
  slug: "microservices-nodejs-rex-nexus",
  excerpt:
    "Retour d'expérience sur l'architecture microservices Node.js d'une plateforme d'investissement financier en production : trois services, PostgreSQL + Redis, webhooks idempotents, zéro downtime.",
  excerpt_en:
    "Field report on the Node.js microservices architecture of a production financial investment platform: three services, PostgreSQL + Redis, idempotent webhooks, zero downtime.",
  content,
  content_en: contentEn,
  category: "Tech",
  imageUrl:
    "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80",
  readTime: "16 min de lecture",
  author: "Yao David Logan",
  published: true,
  tags: [
    "architecture",
    "nodejs",
    "microservices",
    "scalability",
    "postgresql",
    "fintech",
  ],
};
