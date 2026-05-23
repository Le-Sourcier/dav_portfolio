import type { ProjectSeed } from "../types.js";

export const prospectPro: ProjectSeed = {
  slug: "prospect-pro-ai",
  title: "Prospect-Pro AI",
  title_en: "Prospect-Pro AI",
  name: "Prospect-Pro AI",
  category: "Fullstack",
  image:
    "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1600&q=80",
  headline:
    "Prospection B2B augmentée par IA : sourcing multi-canal, scoring de leads et personnalisation des messages.",
  description: `Plateforme SaaS de prospection B2B qui automatise le sourcing, le scoring et la prise de contact. Le produit ingère des contacts d'entreprises depuis plusieurs sources (Pages Jaunes, Pappers, GoAfrica, Google Maps), enrichit les données via OpenAI puis génère des messages personnalisés directement injectables dans les CRM clients.

Conçu pour les agences et équipes commerciales B2B qui veulent passer d'un sourcing manuel à une chaîne automatisée — sans perdre la qualité du ciblage ni la conformité légale du scraping.`,
  description_en: `B2B prospecting SaaS that automates sourcing, scoring and outreach. The product ingests company contacts from multiple sources (Pages Jaunes, Pappers, GoAfrica, Google Maps), enriches the data through OpenAI and generates personalized messages that drop directly into client CRMs.

Built for agencies and B2B sales teams who want to move from manual sourcing to an automated chain — without losing targeting quality or the legal compliance of the scraping pipeline.`,
  problem: `La prospection B2B manuelle dans le contexte ouest-africain souffre de bases de contacts éclatées, d'enrichissement lent et de messages génériques qui finissent à la corbeille. Les équipes commerciales passaient plus de temps à constituer des fichiers Excel qu'à parler à des prospects qualifiés.`,
  problem_en: `Manual B2B prospecting in the West African context suffers from scattered contact bases, slow enrichment and generic messages that end up in the trash. Sales teams spent more time building Excel files than talking to qualified leads.`,
  solution: `Pipeline d'ingestion modulaire : chaque source (Pages Jaunes, Pappers, GoAfrica, Google Maps) est encapsulée dans un connecteur typé, avec rate-limiting et respect des robots.txt. Les contacts sont normalisés en un schéma unique stocké en PostgreSQL.

Couche d'enrichissement : OpenAI scoring les leads selon les critères du client (taille, secteur, signaux d'achat) et personnalise les messages d'approche. Intégration native avec les CRM via API REST + webhooks idempotents.

Côté UI : un dashboard Next.js avec filtres dynamiques, vue Kanban du pipeline de prospection et export multi-formats (CSV, Excel, JSON).`,
  solution_en: `Modular ingestion pipeline: each source (Pages Jaunes, Pappers, GoAfrica, Google Maps) is wrapped in a typed connector with rate-limiting and robots.txt compliance. Contacts are normalized into a single schema stored in PostgreSQL.

Enrichment layer: OpenAI scores leads against client criteria (size, sector, buying signals) and personalizes outreach messages. Native CRM integration via REST API and idempotent webhooks.

UI side: a Next.js dashboard with dynamic filters, a Kanban view of the prospecting pipeline and multi-format export (CSV, Excel, JSON).`,
  headline_en: "AI-powered B2B prospecting: multi-channel sourcing, lead scoring and message personalization.",
  result_en: "60 % conversion rate increase observed and ~15 h/week saved on sales teams.",
  metric_en: "60 % more conversions, ~15 h saved per week",
  role_en: "Software Architect & Fullstack Engineer",
  results_en: [
    "Automated sourcing on 4 public channels (Pages Jaunes, Pappers, GoAfrica, Google Maps)",
    "AI lead scoring based on client business criteria",
    "Automatic contact message personalization (templates + OpenAI)",
    "Direct CRM integration via REST API and webhooks",
    "Multi-format export and complete pipeline history",
  ],
  result:
    "Augmentation de 60 % du taux de conversion observée et gain de ~15 h/semaine sur les équipes commerciales.",
  metric: "60 % de conversion en plus, ~15 h économisées par semaine",
  role: "Architecte logiciel & Fullstack Engineer",
  tech: [
    "Next.js",
    "Node.js",
    "TypeScript",
    "Python",
    "PostgreSQL",
    "OpenAI",
    "Puppeteer",
    "Redis",
  ],
  links: [
    { label: "Démo publique", href: "https://prospect-pro-sgrq.vercel.app" },
  ],
  featured: true,
  results: [
    "Sourcing automatisé sur 4 sources publiques (Pages Jaunes, Pappers, GoAfrica, Google Maps)",
    "Scoring IA des leads basé sur les critères métiers du client",
    "Personnalisation automatique des messages de contact (templates + OpenAI)",
    "Intégration directe dans les CRM clients via API REST + webhooks",
    "Export multi-formats et historisation complète du pipeline",
  ],
  metrics: [
    { name: "Précision IA", value: 92, previousValue: 50, unit: "%" },
    { name: "Leads qualifiés / mois", value: 850, previousValue: 200, unit: "" },
    { name: "ROI commercial", value: 3.5, previousValue: 1.2, unit: "x" },
  ],
  chartData: [
    { name: "S1", value: 120 },
    { name: "S2", value: 340 },
    { name: "S3", value: 580 },
    { name: "S4", value: 720 },
    { name: "S5", value: 850 },
  ],
  url: "https://prospect-pro-sgrq.vercel.app",
  solutionDiagram: {
    nodes: [
      { id: "ui", label: "Dashboard Next.js", type: "client" },
      { id: "api", label: "API Node.js", type: "gateway" },
      { id: "scrape", label: "Pipeline scraping", type: "service" },
      { id: "enrich", label: "Service enrichissement", type: "service" },
      { id: "messaging", label: "Service messages", type: "service" },
      { id: "db", label: "PostgreSQL", type: "database" },
      { id: "cache", label: "Redis (queues)", type: "database" },
      { id: "openai", label: "OpenAI", type: "ai" },
      { id: "sources", label: "Sources publiques", type: "external" },
      { id: "crm", label: "CRM clients", type: "external" },
    ],
    connections: [
      { from: "ui", to: "api", label: "REST" },
      { from: "api", to: "scrape", label: "Jobs" },
      { from: "scrape", to: "sources", label: "HTTP rate-limited" },
      { from: "scrape", to: "db", label: "Normalisation" },
      { from: "api", to: "enrich", label: "Pipeline" },
      { from: "enrich", to: "openai", label: "Scoring" },
      { from: "enrich", to: "db", label: "Update" },
      { from: "api", to: "messaging", label: "Compose" },
      { from: "messaging", to: "crm", label: "Webhooks" },
      { from: "api", to: "cache", label: "Queues" },
    ],
  },
  impactGraph: [
    { label: "Précision scoring", value: 92 },
    { label: "Vitesse pipeline", value: 88 },
    { label: "Couverture sources", value: 85 },
    { label: "Personnalisation", value: 90 },
    { label: "Adoption client", value: 82 },
  ],
};
