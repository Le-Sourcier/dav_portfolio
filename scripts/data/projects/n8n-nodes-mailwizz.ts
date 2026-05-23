import type { ProjectSeed } from "../types.js";

export const n8nNodesMailwizz: ProjectSeed = {
  slug: "n8n-nodes-mailwizz",
  title: "@le-sourcier/n8n-nodes-mailwizz",
  title_en: "@le-sourcier/n8n-nodes-mailwizz",
  name: "n8n-nodes-mailwizz",
  category: "Backend",
  image:
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1600&q=80",
  headline:
    "Nœud N8N officieux pour MailWizz — abonnés, listes, campagnes et transactionnels en un seul connecteur.",
  description: `Package NPM open-source publiant un nœud N8N pour MailWizz, l'une des plateformes self-hosted d'emailing les plus utilisées. Le nœud expose les opérations clés (gestion d'abonnés, listes, campagnes, envois transactionnels) avec une interface uniforme et des paramètres typés.

Maintenu en production, le package dépasse les 25 000 téléchargements sur le registre NPM et alimente plusieurs chaînes d'automatisation N8N.`,
  description_en: `Open-source NPM package shipping an N8N node for MailWizz, one of the most-used self-hosted email platforms. The node exposes the key operations (subscriber management, lists, campaigns, transactional sends) through a uniform interface with typed parameters.

Maintained in production, the package crosses 25,000 NPM downloads and powers several N8N automation chains.`,
  problem: `N8N n'expose nativement aucun connecteur MailWizz. Les utilisateurs auto-hébergés devaient câbler à la main les endpoints HTTP, gérer l'auth API et reproduire dans chaque workflow la logique de pagination et de retry.`,
  problem_en: `N8N ships no native MailWizz connector. Self-hosted users had to hand-wire HTTP endpoints, manage API authentication and reproduce pagination and retry logic in every workflow.`,
  solution: `Nœud N8N typé en TypeScript couvrant les opérations principales : create/update/delete subscriber, list management, campaign send, transactional send. Auth API encapsulée, retry avec backoff exponentiel, pagination automatique.

Publié sur le registry public N8N et NPM, avec documentation, exemples de workflows et tests d'intégration.`,
  solution_en: `Type-safe N8N node in TypeScript covering the main operations: create/update/delete subscriber, list management, campaign send, transactional send. Encapsulated API auth, exponential backoff retry, automatic pagination.

Published on the public N8N registry and NPM, with documentation, workflow examples and integration tests.`,
  headline_en: "Unofficial N8N node for MailWizz — subscribers, lists, campaigns and transactional sends in one connector.",
  result_en: "25,000+ NPM downloads, integrated in production marketing automation chains.",
  metric_en: "25,000+ NPM downloads",
  role_en: "Open-source author & maintainer",
  results_en: [
    "Coverage of key MailWizz operations (subscribers, lists, campaigns, transactional)",
    "Encapsulated API auth with exponential backoff retry",
    "Documentation, workflow examples and integration tests",
    "Published on N8N public registry and NPM",
  ],
  result:
    "25 000+ téléchargements NPM, intégré dans des chaînes d'automatisation marketing en production.",
  metric: "25 000+ téléchargements NPM",
  role: "Auteur & mainteneur open-source",
  tech: ["TypeScript", "N8N", "MailWizz API", "Node.js"],
  links: [
    {
      label: "Page NPM",
      href: "https://www.npmjs.com/package/@le-sourcier/n8n-nodes-mailwizz",
    },
  ],
  featured: false,
  results: [
    "Couverture des opérations clés MailWizz (subscribers, lists, campaigns, transactional)",
    "Auth API encapsulée + retry avec backoff exponentiel",
    "Documentation, exemples de workflows et tests d'intégration",
    "Publié sur le registry public N8N et NPM",
  ],
  metrics: [
    { name: "Téléchargements NPM", value: 25000, previousValue: 0, unit: "" },
    { name: "Opérations couvertes", value: 12, previousValue: 0, unit: "" },
    { name: "Tests d'intégration", value: 24, previousValue: 0, unit: "" },
  ],
  chartData: [
    { name: "M1", value: 800 },
    { name: "M3", value: 4200 },
    { name: "M6", value: 11500 },
    { name: "M9", value: 18800 },
    { name: "M12", value: 25000 },
  ],
  url: "https://www.npmjs.com/package/@le-sourcier/n8n-nodes-mailwizz",
  impactGraph: [
    { label: "Adoption communauté", value: 90 },
    { label: "Couverture API", value: 88 },
    { label: "Qualité code", value: 86 },
    { label: "Documentation", value: 84 },
  ],
};
