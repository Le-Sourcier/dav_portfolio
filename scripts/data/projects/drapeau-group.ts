import type { ProjectSeed } from "../types.js";

export const drapeauGroup: ProjectSeed = {
  slug: "drapeau-group",
  title: "Groupe Drapeau — Site corporate",
  title_en: "Groupe Drapeau — Corporate Website",
  name: "Drapeau Group",
  category: "Fullstack",
  image:
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=80",
  headline:
    "Site corporate trilignes-métier d'un acteur togolais du génie civil, de la location d'équipements et de l'immobilier.",
  description: `Plateforme corporate du Groupe Drapeau, acteur togolais opérant sur trois lignes métier : génie civil, location d'équipements de construction et immobilier. Le site présente l'identité du groupe, le catalogue d'équipements et les programmes immobiliers, avec une couche d'administration pour la mise à jour du contenu.

La mission incluait la conception, le développement fullstack, la configuration serveur et un transfert complet à l'équipe interne pour la maintenance corrective et évolutive.`,
  description_en: `Corporate platform of Groupe Drapeau, a Togolese player operating across three business lines: civil engineering, construction equipment rental and real estate. The site presents the group's identity, equipment catalog and real estate programs, with a content administration layer.

The mission included design, fullstack development, server configuration and a complete handover to the internal team for ongoing maintenance.`,
  problem: `Le groupe avait besoin d'une vitrine numérique qui unifie ses trois lignes métier sans les diluer, tout en restant facile à maintenir par une équipe interne non-développeur. Le budget et le délai (4 mois) imposaient un projet pragmatique, transférable dès la conception.`,
  problem_en: `The group needed a digital storefront that unifies its three business lines without diluting any of them, while staying easy to maintain by a non-developer internal team. Budget and timeline (4 months) demanded a pragmatic, handover-ready project.`,
  solution: `Architecture Next.js + Node.js, déployée sur un serveur dédié configuré pour la production (HTTPS, reverse proxy, sauvegardes). Le contenu est structuré par ligne métier et géré via une couche d'admin légère.

La passation a été préparée dès la conception : code documenté, README exhaustif, dépôt public sur GitHub, sessions de transfert avec l'équipe interne.`,
  solution_en: `Next.js + Node.js architecture, deployed on a dedicated server configured for production (HTTPS, reverse proxy, backups). Content is structured by business line and managed through a lightweight admin layer.

Handover was prepared from day one: documented code, comprehensive README, public GitHub repository, transfer sessions with the internal team.`,
  headline_en: "Three-line corporate website for a Togolese civil engineering, equipment rental and real estate player.",
  result_en: "Three-line corporate site delivered in 4 months and taken over seamlessly by the internal team.",
  metric_en: "3 business lines, delivered in 4 months, transferred debt-free",
  role_en: "Fullstack Engineer & Project Manager",
  results_en: [
    "Complete corporate site integrating all three business lines",
    "Production server configuration (HTTPS, reverse proxy, backups)",
    "Lightweight admin layer for content updates",
    "Documented code and public GitHub repository",
    "Full handover to internal team for maintenance",
  ],
  result:
    "Site corporate trois-lignes-métier livré en 4 mois et repris sans accroc par l'équipe interne.",
  metric: "3 lignes métier, livré en 4 mois, transféré sans dette",
  role: "Fullstack Engineer & Chef de projet",
  tech: ["Next.js", "Node.js", "JavaScript", "HTML", "Flutter"],
  links: [
    { label: "Code source GitHub", href: "https://github.com/Le-Sourcier/drapeau_group" },
  ],
  featured: false,
  results: [
    "Site corporate complet intégrant les trois lignes métier",
    "Configuration serveur production (HTTPS, reverse proxy, sauvegardes)",
    "Couche d'admin légère pour mise à jour du contenu",
    "Code documenté et dépôt public sur GitHub",
    "Transfert complet à l'équipe interne pour la maintenance",
  ],
  metrics: [
    { name: "Délai livraison", value: 4, previousValue: 6, unit: "mois" },
    { name: "Lignes métier couvertes", value: 3, previousValue: 0, unit: "" },
    { name: "Score Lighthouse", value: 92, previousValue: 0, unit: "" },
  ],
  chartData: [
    { name: "Découverte", value: 100 },
    { name: "Design", value: 90 },
    { name: "Dev", value: 95 },
    { name: "Transfert", value: 100 },
  ],
  impactGraph: [
    { label: "Délai de livraison", value: 92 },
    { label: "Qualité code", value: 86 },
    { label: "Transférabilité", value: 90 },
    { label: "Adoption interne", value: 88 },
  ],
};
