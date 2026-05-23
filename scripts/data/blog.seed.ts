/**
 * Agrégateur des seeds blog — re-exporte les 12 articles long-form
 * consommés par `seed.ts` et `seed-blog-only.ts`.
 *
 * Les articles sont ordonnés thématiquement (architecture, paiement,
 * mobile, automatisation, frontend, business, ops, tooling).
 */
import type { BlogPostSeed } from "./types.js";
import { microservicesNodejs } from "./blog/01-microservices-nodejs.js";
import { paymentMultiGateway } from "./blog/02-payment-multi-gateway.js";
import { reactNativeAndroidPerfs } from "./blog/03-react-native-android-perfs.js";
import { flutterVsReactNative } from "./blog/04-flutter-vs-react-native.js";
import { n8nProductionPatterns } from "./blog/05-n8n-production-patterns.js";
import { scrapingLegalScale } from "./blog/06-scraping-legal-scale.js";
import { nextjs14AppRouterRex } from "./blog/07-nextjs-14-app-router-rex.js";
import { agentsLlmVapiSip } from "./blog/08-agents-llm-vapi-sip.js";
import { cleanCodeFormationRex } from "./blog/09-clean-code-formation-rex.js";
import { saasB2bMvpTraction } from "./blog/10-saas-b2b-mvp-traction.js";
import { observabiliteFintech } from "./blog/11-observabilite-fintech.js";
import { dx2026NodeTsStack } from "./blog/12-dx-2026-node-ts-stack.js";

export const blogPostsSeed: BlogPostSeed[] = [
  microservicesNodejs,
  paymentMultiGateway,
  reactNativeAndroidPerfs,
  flutterVsReactNative,
  n8nProductionPatterns,
  scrapingLegalScale,
  nextjs14AppRouterRex,
  agentsLlmVapiSip,
  cleanCodeFormationRex,
  saasB2bMvpTraction,
  observabiliteFintech,
  dx2026NodeTsStack,
];
