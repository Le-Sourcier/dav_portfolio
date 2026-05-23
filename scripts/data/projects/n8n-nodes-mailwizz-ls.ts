import type { ProjectSeed } from "../types.js";

export const n8nNodesMailwizzLs: ProjectSeed = {
  slug: "n8n-nodes-mailwizz-ls",
  title: "n8n-nodes-mailwizz-ls",
  title_en: "n8n-nodes-mailwizz-ls",
  name: "n8n-nodes-mailwizz-ls",
  category: "Backend",
  image:
    "https://images.unsplash.com/photo-1568952433726-3896e3881c65?auto=format&fit=crop&w=1600&q=80",
  headline:
    "Fork enrichi du nœud N8N MailWizz : opérations avancées sur listes, segments et tags.",
  description: `Fork enrichi du nœud N8N MailWizz qui ajoute les opérations avancées manquantes dans le package principal : gestion fine des segments, tags, custom fields et webhooks de désinscription. Pensé pour les cas d'usage agence qui orchestrent plusieurs comptes MailWizz en parallèle.

La version 2.1.13 stabilise la couverture API et formalise les types pour faciliter l'intégration dans des workflows N8N de production.`,
  description_en: `Enriched fork of the N8N MailWizz node that adds advanced operations missing from the main package: fine-grained segment management, tags, custom fields and unsubscribe webhooks. Designed for agency use cases orchestrating multiple MailWizz accounts in parallel.

Version 2.1.13 stabilizes API coverage and formalizes types to ease integration into production-grade N8N workflows.`,
  problem: `Le nœud N8N MailWizz officiel ne couvrait pas les opérations agency : segments dynamiques, tags multiples, custom fields, désinscriptions remontées par webhook. Les utilisateurs avancés devaient maintenir leurs propres patchs locaux.`,
  problem_en: `The official N8N MailWizz node did not cover agency operations: dynamic segments, multiple tags, custom fields, webhook-driven unsubscribes. Advanced users had to maintain their own local patches.`,
  solution: `Fork TypeScript publié séparément avec les opérations manquantes, en gardant la compatibilité de surface avec le nœud officiel. Tests d'intégration sur un MailWizz mock pour stabiliser les contrats.

Le package est utilisé en production sur les chaînes d'automatisation des clients agence et publié sur NPM en version 2.1.13.`,
  solution_en: `Typed fork published separately with the missing operations, while keeping surface compatibility with the official node. Integration tests against a MailWizz mock to stabilize contracts.

The package is used in production on agency client automation chains and published on NPM as version 2.1.13.`,
  headline_en: "Enhanced fork of the N8N MailWizz node: advanced list, segment and tag operations.",
  result_en: "Agency operations covered (segments, tags, custom fields, unsubscribes), version 2.1.13 in production.",
  metric_en: "Agency operations covered in version 2.1.13",
  role_en: "Open-source author & maintainer",
  results_en: [
    "Fine-grained dynamic segment management",
    "Multi-tag and custom field support",
    "Unsubscribe webhooks relayed to N8N",
    "Surface compatibility with the official node",
  ],
  result:
    "Opérations agency couvertes (segments, tags, custom fields, désinscriptions), version 2.1.13 en production.",
  metric: "Opérations agency couvertes en version 2.1.13",
  role: "Auteur & mainteneur open-source",
  tech: ["TypeScript", "N8N", "MailWizz API", "Node.js"],
  links: [
    {
      label: "Page NPM",
      href: "https://www.npmjs.com/package/n8n-nodes-mailwizz-ls",
    },
  ],
  featured: false,
  results: [
    "Gestion fine des segments dynamiques",
    "Support multi-tags et custom fields",
    "Webhooks de désinscription remontés en N8N",
    "Compatibilité de surface avec le nœud officiel",
  ],
  metrics: [
    { name: "Opérations en plus", value: 8, previousValue: 0, unit: "" },
    { name: "Version publiée", value: 2.13, previousValue: 0, unit: "" },
    { name: "Comptes MailWizz orchestrés", value: 12, previousValue: 1, unit: "" },
  ],
  chartData: [
    { name: "v1", value: 2 },
    { name: "v1.5", value: 5 },
    { name: "v2", value: 7 },
    { name: "v2.1", value: 8 },
  ],
  url: "https://www.npmjs.com/package/n8n-nodes-mailwizz-ls",
  impactGraph: [
    { label: "Couverture API agency", value: 92 },
    { label: "Stabilité prod", value: 88 },
    { label: "Compatibilité", value: 90 },
    { label: "Documentation", value: 82 },
  ],
};
