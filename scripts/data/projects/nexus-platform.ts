import type { ProjectSeed } from "../types.js";

export const nexusPlatform: ProjectSeed = {
  slug: "nexus-platform",
  title: "Nexus Platform",
  title_en: "Nexus Platform",
  name: "Nexus Platform",
  category: "Fullstack",
  image:
    "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80",
  headline:
    "Plateforme d'investissement financier multi-canal — web, mobile, admin et blog technique.",
  description: `Plateforme d'investissement financier construite de bout en bout pour Nexus Corporation. Le produit couvre une application web (Next.js 14), une application mobile cross-platform (React Native, en review Google Play), un dashboard admin et un blog technique — tous reliés à une API Node.js et à une infrastructure PostgreSQL + Redis.

L'enjeu central : gérer des transactions financières en temps réel sur un même socle backend, avec une expérience utilisateur fluide sur les trois surfaces (web public, mobile et admin) et une couche de chiffrement bout en bout pour les flux de paiement.

Mon rôle a couvert l'architecture microservices, le système de paiement multi-passerelles, le dashboard analytique temps réel via WebSocket et l'authentification RBAC granulaire.`,
  description_en: `End-to-end financial investment platform built for Nexus Corporation. The product spans a web application (Next.js 14), a cross-platform mobile app (React Native, currently under Google Play review), an admin dashboard and a technical blog — all wired to a Node.js API on top of PostgreSQL and Redis.

The core challenge: handling real-time financial transactions on a single backend, with a smooth user experience across web, mobile and admin, plus end-to-end encryption for payment flows.

My scope covered the microservices architecture, the multi-gateway payment system, the real-time analytics dashboard over WebSocket, and granular RBAC authentication.`,
  problem: `Le marché togolais de l'investissement digital manquait d'une plateforme native combinant un parcours public moderne, une expérience mobile fiable sur des Android entrée de gamme et un dashboard admin capable de superviser les flux financiers en temps réel. Les solutions concurrentes empilaient des produits hétérogènes (web, mobile, back-office) sans backend unifié, ce qui rendait toute évolution lente et coûteuse.`,
  problem_en: `The Togolese digital investment market lacked a native platform combining a modern public funnel, a reliable mobile experience on entry-level Android devices, and an admin dashboard able to supervise financial flows in real time. Competing solutions stacked heterogeneous products (web, mobile, back-office) without a unified backend, making any evolution slow and expensive.`,
  solution: `Architecture microservices Node.js orchestrée derrière une API gateway, avec services dédiés (auth/RBAC, investissement, paiement) communiquant via REST et WebSocket. PostgreSQL pour le stockage relationnel et Redis pour le cache + les sessions volatiles.

Le frontend web est construit en Next.js 14 (App Router, RSC, streaming). L'app mobile React Native partage les mêmes contrats d'API et embarque un mode offline-first pour les écrans critiques. Le dashboard admin consomme les flux temps réel via WebSocket et affiche les visualisations Chart.js.

Côté paiement : intégration multi-passerelles avec chiffrement bout en bout, idempotence sur les webhooks, queue de réconciliation automatique et pistes d'audit complètes.`,
  solution_en: `Node.js microservices architecture behind an API gateway, with dedicated services (auth/RBAC, investment, payment) communicating over REST and WebSocket. PostgreSQL for relational storage and Redis for cache plus volatile sessions.

The web frontend runs on Next.js 14 (App Router, RSC, streaming). The React Native mobile app shares the same API contracts and embeds an offline-first mode for critical screens. The admin dashboard consumes real-time streams over WebSocket and renders Chart.js visualizations.

On the payment side: multi-gateway integration with end-to-end encryption, idempotent webhooks, automated reconciliation queue and full audit trails.`,
  headline_en: "Multi-channel financial investment platform — web, mobile, admin and technical blog.",
  result_en: "Platform deployed in production, mobile app under Google Play review, E2E-encrypted transactions with automatic reconciliation.",
  metric_en: "4 surfaces (web, mobile, admin, blog) on a unified backend",
  role_en: "Software Architect & Lead Fullstack",
  results_en: [
    "Next.js 14 web platform deployed in production at nexuscorporat.com",
    "Cross-platform React Native mobile app submitted to Google Play Store",
    "Multi-gateway payment integration with end-to-end encryption",
    "Admin dashboard with WebSocket real-time flows and Chart.js visualizations",
    "JWT authentication pipeline with granular RBAC per module",
  ],
  result:
    "Plateforme déployée en production, app mobile en review Google Play, transactions chiffrées E2E avec réconciliation automatique.",
  metric: "4 surfaces (web, mobile, admin, blog) sur un backend unifié",
  role: "Architecte logiciel & Lead Fullstack",
  tech: [
    "Next.js 14",
    "React Native",
    "Node.js",
    "TypeScript",
    "PostgreSQL",
    "Redis",
    "WebSocket",
    "Chart.js",
    "Docker",
  ],
  links: [
    { label: "Site principal", href: "https://nexuscorporat.com" },
    { label: "Téléchargement mobile", href: "https://nexuscorporat.com/download" },
    { label: "Dashboard admin", href: "https://admin.nexuscorporat.com" },
    { label: "Blog technique", href: "https://blog.nexuscorporat.com" },
  ],
  featured: true,
  results: [
    "Plateforme web Next.js 14 déployée en production sur nexuscorporat.com",
    "App mobile React Native cross-platform soumise au Google Play Store",
    "Intégration multi-passerelles de paiement avec chiffrement E2E",
    "Dashboard admin avec flux temps réel WebSocket et visualisations Chart.js",
    "Pipeline d'authentification JWT + RBAC granulaire par module",
  ],
  metrics: [
    { name: "Disponibilité", value: 99.9, previousValue: 98, unit: "%" },
    { name: "Latence p95 API", value: 180, previousValue: 480, unit: "ms" },
    { name: "Couverture produit", value: 4, previousValue: 1, unit: "surfaces" },
  ],
  chartData: [
    { name: "M1", value: 320 },
    { name: "M2", value: 740 },
    { name: "M3", value: 1450 },
    { name: "M4", value: 2380 },
    { name: "M5", value: 3120 },
    { name: "M6", value: 4180 },
  ],
  url: "https://nexuscorporat.com",
  solutionDiagram: {
    nodes: [
      { id: "mobile", label: "App mobile RN", type: "client" },
      { id: "web", label: "Plateforme web", type: "client" },
      { id: "admin", label: "Admin dashboard", type: "client" },
      { id: "api", label: "API Node.js", type: "gateway" },
      { id: "auth", label: "Auth & RBAC", type: "service" },
      { id: "core", label: "Service investissement", type: "service" },
      { id: "pay", label: "Service paiement", type: "service" },
      { id: "db", label: "PostgreSQL", type: "database" },
      { id: "cache", label: "Redis", type: "database" },
      { id: "gw", label: "Passerelles paiement", type: "external" },
    ],
    connections: [
      { from: "mobile", to: "api", label: "HTTPS / JWT" },
      { from: "web", to: "api", label: "HTTPS / JWT" },
      { from: "admin", to: "api", label: "RBAC" },
      { from: "api", to: "auth", label: "Sessions" },
      { from: "api", to: "core", label: "REST" },
      { from: "api", to: "pay", label: "REST" },
      { from: "core", to: "db", label: "SQL" },
      { from: "core", to: "cache", label: "Cache" },
      { from: "pay", to: "gw", label: "Webhook" },
    ],
  },
  impactGraph: [
    { label: "Performance", value: 88 },
    { label: "Disponibilité", value: 95 },
    { label: "Sécurité paiement", value: 92 },
    { label: "Couverture produit", value: 90 },
    { label: "DX équipe", value: 82 },
  ],
};
