import type { BlogPostSeed } from "../types.js";

const content = `> Intégrer plusieurs passerelles de paiement dans une plateforme fintech, c'est facile. Le faire sans incident en production, c'est une autre histoire. Voici le pattern que j'utilise.

## 1. Le contexte

Sur Nexus, la plateforme accepte plusieurs moyens de paiement : carte bancaire, mobile money (MTN, Orange, Moov), virement bancaire, parfois crypto. Chaque passerelle vit dans son écosystème : son SDK, son format de webhook, sa logique d'idempotence, son régime de pannes. Sans organisation claire, l'intégration finit en spaghetti de \`if\` imbriqués qu'aucun nouveau développeur ne comprend.

L'objectif de cet article : présenter le pattern qui m'a permis d'intégrer six passerelles distinctes sans dupliquer une seule ligne de logique métier, avec chiffrement bout en bout et idempotence native.

## 2. Pourquoi le naïf casse

Première tentation : un gros service \`PaymentService\` avec un \`switch\` sur le moyen demandé. À 2 passerelles ça marche, à 6 c'est ingérable. Symptômes :

- Bug sur Orange MoMo qui se propage à MTN parce que les méthodes partagent un cache
- Webhook Stripe qui plante parce qu'on a oublié d'updater le \`switch\` quand on a ajouté Mobile Money
- Tests d'intégration qui montent une mégafixture pour tester un seul moyen
- Migration de version d'API de l'une force un redéploiement de toutes

La règle : **un moyen de paiement = un module isolé, branché par contrat**.

## 3. Le pattern Gateway Adapter

Le service paiement ne connaît qu'une interface : \`PaymentGateway\`. Chaque passerelle fournit son implémentation. Le routing est centralisé, le reste est polymorphe.

\`\`\`typescript
// src/services/payment/types.ts
export type PaymentMethod =
  | "card"
  | "mobile_money_mtn"
  | "mobile_money_orange"
  | "mobile_money_moov"
  | "bank_transfer"
  | "crypto_usdc";

export interface PaymentInitiateInput {
  amount: number;
  currency: "XOF" | "USD" | "EUR";
  customerId: string;
  method: PaymentMethod;
  reference: string; // référence métier (no PII)
  metadata?: Record<string, string>;
}

export interface PaymentSession {
  sessionId: string;
  redirectUrl?: string;
  expiresAt: Date;
}

export interface PaymentGateway {
  readonly name: string;
  readonly supports: ReadonlyArray<PaymentMethod>;
  initiate(input: PaymentInitiateInput): Promise<PaymentSession>;
  confirm(sessionId: string, evidence: WebhookPayload): Promise<PaymentResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}
\`\`\`

Chaque adapter expose ses méthodes supportées via \`supports\`. Le router central choisit le bon en fonction de la méthode demandée :

\`\`\`typescript
// src/services/payment/PaymentRouter.ts
import { PaymentGateway, PaymentMethod } from "./types.js";

export class PaymentRouter {
  private readonly gateways = new Map<PaymentMethod, PaymentGateway>();

  register(gateway: PaymentGateway) {
    for (const method of gateway.supports) {
      if (this.gateways.has(method)) {
        throw new Error(\`Method \${method} already registered by \${this.gateways.get(method)!.name}\`);
      }
      this.gateways.set(method, gateway);
    }
  }

  resolve(method: PaymentMethod): PaymentGateway {
    const gateway = this.gateways.get(method);
    if (!gateway) throw new Error(\`No gateway registered for method \${method}\`);
    return gateway;
  }
}
\`\`\`

Pour ajouter une 7ème passerelle : on écrit l'adapter, on l'enregistre au démarrage, le reste du code n'a pas à savoir qu'elle existe.

## 4. Le chiffrement bout en bout — pour de vrai

"Chiffrement E2E" est un mot abusé. Sur une plateforme de paiement, ça veut dire concrètement : **les données sensibles (PAN, CVV, IBAN, numéro mobile) ne touchent jamais notre serveur en clair**. Elles sont chiffrées côté client avec une clé publique de la passerelle, transmises chiffrées à travers notre backend, et déchiffrées seulement par la passerelle finale.

Côté frontend :

\`\`\`typescript
// frontend/src/lib/payment/encryptPan.ts
export async function encryptPan(pan: string, gatewayPublicKeyPem: string): Promise<string> {
  const key = await importPublicKey(gatewayPublicKeyPem);
  const buffer = new TextEncoder().encode(pan);
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    key,
    buffer,
  );
  return arrayBufferToBase64(encrypted);
}
\`\`\`

Côté backend, le PAN chiffré transite tel quel jusqu'à l'API de la passerelle. Aucun log, aucune persistance, aucun hash. Le seul élément qui reste de notre côté est un \`token\` opaque retourné par la passerelle, valide pour les remboursements futurs.

Cette approche élimine 80 % des risques PCI-DSS. Le serveur ne stocke pas de données carte, ne peut pas en émettre une copie, et ne peut pas être compromise pour fuiter des PAN.

## 5. Idempotence native — la fondation

Toute opération de paiement doit être idempotente. Le client doit pouvoir rejouer la même requête 200 fois sans créer 200 paiements. La discipline :

\`\`\`typescript
// src/controllers/payment/initiatePayment.ts
export async function initiatePayment(req: Request, res: Response) {
  const idempotencyKey = req.header("idempotency-key");
  if (!idempotencyKey) {
    return res.status(400).json({ error: "idempotency-key header required" });
  }

  // 1. Existe-t-il déjà une session pour cette clé ?
  const cached = await IdempotencyCache.findOne({ where: { key: idempotencyKey } });
  if (cached) {
    return res.status(cached.statusCode).json(cached.response);
  }

  // 2. Sinon, on traite la requête
  const session = await paymentRouter
    .resolve(req.body.method)
    .initiate(req.body);

  const response = { sessionId: session.sessionId, redirectUrl: session.redirectUrl };

  // 3. On cache la réponse pour 24 h
  await IdempotencyCache.create({
    key: idempotencyKey,
    statusCode: 201,
    response,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  res.status(201).json(response);
}
\`\`\`

Le client génère un UUID v7 (ordonnable temporellement) par tentative. S'il rejoue à cause d'une déconnexion, il renvoie la même clé. Le serveur retourne la même réponse. Pas de double paiement.

## 6. Les webhooks — où tout dérape

Chaque passerelle envoie ses webhooks à son rythme et avec son format. Le piège classique : tenter de tout normaliser dans un seul endpoint. Mauvaise idée. Préférer **un endpoint par passerelle** avec son propre validateur de signature.

\`\`\`typescript
// src/routes/webhooks.ts
router.post("/webhooks/mtn", verifyMtnSignature, mtnWebhookHandler);
router.post("/webhooks/orange", verifyOrangeSignature, orangeWebhookHandler);
router.post("/webhooks/stripe", verifyStripeSignature, stripeWebhookHandler);
\`\`\`

Chaque handler convertit son format propriétaire en \`PaymentEvent\` normalisé, persiste l'event, accuse réception immédiatement (\`200 OK\` dans les 200 ms), et dispatch un job en queue pour le traitement réel.

\`\`\`typescript
// src/middlewares/verifyStripeSignature.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export function verifyStripeSignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.header("stripe-signature");
  if (!signature) return res.status(400).json({ error: "missing signature" });
  try {
    const event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
    req.body = event; // event vérifié
    next();
  } catch (error) {
    return res.status(400).json({ error: "invalid signature" });
  }
}
\`\`\`

Important : utiliser \`req.rawBody\` (avant parsing JSON) pour la vérification de signature — sinon ça casse à cause des espaces ajoutés/retirés par le parser.

## 7. La réconciliation — votre filet de sécurité

Aucun webhook n'est garanti. Une passerelle peut tomber, votre serveur peut être hors ligne, le réseau peut perdre des paquets. La réconciliation périodique est obligatoire : un job qui interroge chaque passerelle toutes les 15 minutes pour récupérer les transactions des 24 dernières heures et croiser avec votre base.

\`\`\`typescript
// src/jobs/reconcilePayments.ts
export async function reconcilePayments(gateway: PaymentGateway) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const remoteTxs = await gateway.listTransactions({ since });

  for (const remote of remoteTxs) {
    const local = await Transaction.findOne({
      where: { gateway: gateway.name, externalId: remote.id },
    });

    if (!local) {
      logger.warn("Missing local transaction", { remote });
      await createTransactionFromRemote(gateway, remote);
    } else if (local.status !== remote.status) {
      logger.warn("Status mismatch", { local: local.status, remote: remote.status });
      await local.update({ status: remote.status, reconciledAt: new Date() });
    }
  }
}
\`\`\`

La réconciliation a sauvé Nexus deux fois lors de coupures du fournisseur mobile money : les paiements confirmés mais non notifiés ont été récupérés sans intervention manuelle.

## 8. Audit trail — ce que l'auditeur va demander

Toute opération financière doit être tracée. Pas pour le marketing, pour la conformité. À chaque mutation d'un solde ou d'une transaction, on écrit dans une table \`payment_audit\` :

\`\`\`sql
CREATE TABLE payment_audit (
  id              UUID PRIMARY KEY,
  transaction_id  UUID NOT NULL,
  actor_type      VARCHAR(20) NOT NULL, -- 'user' | 'system' | 'admin'
  actor_id        UUID NULL,
  action          VARCHAR(40) NOT NULL, -- 'initiated' | 'confirmed' | 'refunded' | ...
  before_state    JSONB NULL,
  after_state     JSONB NOT NULL,
  trace_id        VARCHAR(64) NOT NULL,
  at              TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX ON payment_audit (transaction_id, at);
\`\`\`

Cette table est **append-only**. Aucun \`UPDATE\`, aucun \`DELETE\`. Toute tentative est refusée par un trigger Postgres. C'est la base sur laquelle un auditeur reconstruit l'historique d'une transaction.

## 9. Pièges à éviter

| Piège | Symptôme | Correction |
|-------|----------|------------|
| Stocker le PAN même chiffré | Risque PCI-DSS, audit lourd | Chiffrement côté client, jamais touché côté serveur |
| Endpoint webhook unique | Couplage entre passerelles | Un endpoint par passerelle, signature spécifique |
| Pas de \`idempotency-key\` | Doubles paiements en cas de retry | Header obligatoire, cache 24 h |
| Réconciliation manuelle | Transactions perdues lors de coupures | Job périodique de réconciliation |
| Audit dans la même table | Pollution + lock | Table \`payment_audit\` dédiée, append-only |
| Logs avec PAN | Fuite massive en cas de breach | Filtrage des champs sensibles avant log |

## 10. Conclusion

Le paiement multi-passerelles n'est pas un problème technique difficile. C'est un problème de discipline : isoler chaque passerelle, normaliser les events, idempotence partout, audit trail intangible, chiffrement bout en bout pour de vrai.

Si vous démarrez aujourd'hui, prenez ce squelette : \`PaymentGateway\` interface, \`PaymentRouter\` central, endpoints webhooks séparés, idempotency-key obligatoire, table d'audit append-only, job de réconciliation. Tout le reste est de la plomberie spécifique à chaque passerelle.`;

const contentEn = `> Integrating multiple payment gateways into a fintech platform is easy. Doing it in production without incidents is another story. Here's the pattern I use.

## 1. The context

On Nexus, the platform accepts several payment methods: bank card, mobile money (MTN, Orange, Moov), bank transfer, sometimes crypto. Each gateway lives in its own ecosystem: its SDK, its webhook format, its idempotency logic, its failure regime. Without clear organization, the integration ends up as a spaghetti of nested \`if\` statements no new developer can decipher.

The goal of this article: present the pattern that let me integrate six distinct gateways without duplicating a single line of business logic, with native end-to-end encryption and idempotency.

## 2. Why the naive approach breaks

First temptation: a big \`PaymentService\` with a \`switch\` on the requested method. Works at 2 gateways, unmanageable at 6. Symptoms:

- A bug in Orange MoMo propagates to MTN because methods share a cache
- The Stripe webhook crashes because we forgot to update the \`switch\` when adding Mobile Money
- Integration tests spin up a megafixture to test a single method
- One gateway's API version migration forces redeploying everything

Rule: **one payment method = one isolated module wired by contract**.

## 3. The Gateway Adapter pattern

The payment service knows only one interface: \`PaymentGateway\`. Each gateway provides its implementation. Routing is centralized, the rest is polymorphic.

\`\`\`typescript
// src/services/payment/types.ts
export type PaymentMethod =
  | "card"
  | "mobile_money_mtn"
  | "mobile_money_orange"
  | "mobile_money_moov"
  | "bank_transfer"
  | "crypto_usdc";

export interface PaymentInitiateInput {
  amount: number;
  currency: "XOF" | "USD" | "EUR";
  customerId: string;
  method: PaymentMethod;
  reference: string; // business reference (no PII)
  metadata?: Record<string, string>;
}

export interface PaymentSession {
  sessionId: string;
  redirectUrl?: string;
  expiresAt: Date;
}

export interface PaymentGateway {
  readonly name: string;
  readonly supports: ReadonlyArray<PaymentMethod>;
  initiate(input: PaymentInitiateInput): Promise<PaymentSession>;
  confirm(sessionId: string, evidence: WebhookPayload): Promise<PaymentResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}
\`\`\`

Each adapter exposes the methods it supports via \`supports\`. The central router picks the right one based on the requested method:

\`\`\`typescript
// src/services/payment/PaymentRouter.ts
import { PaymentGateway, PaymentMethod } from "./types.js";

export class PaymentRouter {
  private readonly gateways = new Map<PaymentMethod, PaymentGateway>();

  register(gateway: PaymentGateway) {
    for (const method of gateway.supports) {
      if (this.gateways.has(method)) {
        throw new Error(\`Method \${method} already registered by \${this.gateways.get(method)!.name}\`);
      }
      this.gateways.set(method, gateway);
    }
  }

  resolve(method: PaymentMethod): PaymentGateway {
    const gateway = this.gateways.get(method);
    if (!gateway) throw new Error(\`No gateway registered for method \${method}\`);
    return gateway;
  }
}
\`\`\`

To add a 7th gateway: write the adapter, register it on boot, the rest of the code never has to know it exists.

## 4. End-to-end encryption — for real

"E2E encryption" is an abused phrase. On a payment platform it means concretely: **sensitive data (PAN, CVV, IBAN, mobile number) never touches our server in clear**. It's encrypted client-side with the gateway's public key, transmitted encrypted through our backend, and decrypted only by the final gateway.

Frontend:

\`\`\`typescript
// frontend/src/lib/payment/encryptPan.ts
export async function encryptPan(pan: string, gatewayPublicKeyPem: string): Promise<string> {
  const key = await importPublicKey(gatewayPublicKeyPem);
  const buffer = new TextEncoder().encode(pan);
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    key,
    buffer,
  );
  return arrayBufferToBase64(encrypted);
}
\`\`\`

Backend: the encrypted PAN transits as-is to the gateway API. No log, no persistence, no hash. The only element left on our side is an opaque \`token\` returned by the gateway, valid for future refunds.

This approach eliminates 80% of PCI-DSS risks. The server doesn't store card data, can't emit a copy, and can't be compromised to leak PANs.

## 5. Native idempotency — the foundation

Every payment operation must be idempotent. The client must be able to replay the same request 200 times without creating 200 payments. The discipline:

\`\`\`typescript
// src/controllers/payment/initiatePayment.ts
export async function initiatePayment(req: Request, res: Response) {
  const idempotencyKey = req.header("idempotency-key");
  if (!idempotencyKey) {
    return res.status(400).json({ error: "idempotency-key header required" });
  }

  // 1. Does a session already exist for this key?
  const cached = await IdempotencyCache.findOne({ where: { key: idempotencyKey } });
  if (cached) {
    return res.status(cached.statusCode).json(cached.response);
  }

  // 2. Otherwise process the request
  const session = await paymentRouter
    .resolve(req.body.method)
    .initiate(req.body);

  const response = { sessionId: session.sessionId, redirectUrl: session.redirectUrl };

  // 3. Cache the response for 24 h
  await IdempotencyCache.create({
    key: idempotencyKey,
    statusCode: 201,
    response,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  res.status(201).json(response);
}
\`\`\`

The client generates a UUID v7 (temporally orderable) per attempt. On disconnect, it sends the same key. The server returns the same response. No double payment.

## 6. Webhooks — where everything derails

Each gateway sends webhooks at its own pace and format. The classic trap: try to normalize everything in a single endpoint. Bad idea. Prefer **one endpoint per gateway** with its own signature validator.

\`\`\`typescript
// src/routes/webhooks.ts
router.post("/webhooks/mtn", verifyMtnSignature, mtnWebhookHandler);
router.post("/webhooks/orange", verifyOrangeSignature, orangeWebhookHandler);
router.post("/webhooks/stripe", verifyStripeSignature, stripeWebhookHandler);
\`\`\`

Each handler converts its proprietary format into a normalized \`PaymentEvent\`, persists the event, acknowledges receipt immediately (\`200 OK\` within 200 ms), and dispatches a queue job for real processing.

\`\`\`typescript
// src/middlewares/verifyStripeSignature.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export function verifyStripeSignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.header("stripe-signature");
  if (!signature) return res.status(400).json({ error: "missing signature" });
  try {
    const event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
    req.body = event;
    next();
  } catch (error) {
    return res.status(400).json({ error: "invalid signature" });
  }
}
\`\`\`

Important: use \`req.rawBody\` (before JSON parsing) for signature check — otherwise it breaks due to spaces added/removed by the parser.

## 7. Reconciliation — your safety net

No webhook is guaranteed. A gateway can go down, your server can be offline, the network can drop packets. Periodic reconciliation is mandatory: a job that queries each gateway every 15 minutes to fetch the last 24 hours of transactions and cross-check with your database.

\`\`\`typescript
// src/jobs/reconcilePayments.ts
export async function reconcilePayments(gateway: PaymentGateway) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const remoteTxs = await gateway.listTransactions({ since });

  for (const remote of remoteTxs) {
    const local = await Transaction.findOne({
      where: { gateway: gateway.name, externalId: remote.id },
    });

    if (!local) {
      logger.warn("Missing local transaction", { remote });
      await createTransactionFromRemote(gateway, remote);
    } else if (local.status !== remote.status) {
      logger.warn("Status mismatch", { local: local.status, remote: remote.status });
      await local.update({ status: remote.status, reconciledAt: new Date() });
    }
  }
}
\`\`\`

Reconciliation saved Nexus twice during mobile money provider outages: confirmed-but-not-notified payments were recovered without manual intervention.

## 8. Audit trail — what the auditor will ask for

Every financial operation must be traced. Not for marketing, for compliance. At every balance or transaction mutation, we write to a \`payment_audit\` table:

\`\`\`sql
CREATE TABLE payment_audit (
  id              UUID PRIMARY KEY,
  transaction_id  UUID NOT NULL,
  actor_type      VARCHAR(20) NOT NULL, -- 'user' | 'system' | 'admin'
  actor_id        UUID NULL,
  action          VARCHAR(40) NOT NULL, -- 'initiated' | 'confirmed' | 'refunded' | ...
  before_state    JSONB NULL,
  after_state     JSONB NOT NULL,
  trace_id        VARCHAR(64) NOT NULL,
  at              TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX ON payment_audit (transaction_id, at);
\`\`\`

This table is **append-only**. No \`UPDATE\`, no \`DELETE\`. Any attempt is refused by a Postgres trigger. It's the basis on which an auditor reconstructs a transaction's history.

## 9. Pitfalls to avoid

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Storing the PAN even encrypted | PCI-DSS risk, heavy audit | Client-side encryption, never touch it server-side |
| Single webhook endpoint | Coupling between gateways | One endpoint per gateway, gateway-specific signature |
| No \`idempotency-key\` | Double payments on retry | Mandatory header, 24 h cache |
| Manual reconciliation | Transactions lost during outages | Periodic reconciliation job |
| Audit in the same table | Pollution + lock | Dedicated \`payment_audit\` table, append-only |
| Logs with PAN | Mass leak in case of breach | Filter sensitive fields before logging |

## 10. Closing

Multi-gateway payment isn't a hard technical problem. It's a discipline problem: isolate each gateway, normalize events, idempotency everywhere, untouchable audit trail, end-to-end encryption for real.

If you're starting today, take this skeleton: \`PaymentGateway\` interface, central \`PaymentRouter\`, separate webhook endpoints, mandatory idempotency-key, append-only audit table, reconciliation job. Everything else is gateway-specific plumbing.`;

export const paymentMultiGateway: BlogPostSeed = {
  title:
    "Paiement multi-passerelles et chiffrement E2E — le pattern qui ne casse pas",
  title_en:
    "Multi-gateway payment and E2E encryption — the pattern that doesn't break",
  slug: "paiement-multi-passerelles-chiffrement-e2e",
  excerpt:
    "Adapter pattern, idempotence native, chiffrement bout en bout côté client, webhooks séparés et table d'audit append-only : le squelette pour intégrer six passerelles de paiement sans dette.",
  excerpt_en:
    "Adapter pattern, native idempotency, client-side end-to-end encryption, separate webhooks and an append-only audit table: the skeleton for integrating six payment gateways without debt.",
  content,
  content_en: contentEn,
  category: "Tech",
  imageUrl:
    "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1600&q=80",
  readTime: "18 min de lecture",
  author: "Yao David Logan",
  published: true,
  tags: ["payment", "security", "e2ee", "fintech", "webhooks", "pci-dss"],
};
