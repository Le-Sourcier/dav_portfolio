import type { ProjectSeed } from "../types.js";

export const homeEnergy: ProjectSeed = {
  slug: "home-energy",
  title: "HomeEnergy",
  title_en: "HomeEnergy",
  name: "HomeEnergy",
  category: "Fullstack",
  image:
    "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1600&q=80",
  headline:
    "Simulateur SaaS de consommation énergétique : économies, CO₂ et plan d'action en temps réel.",
  description: `Simulateur SaaS qui calcule en temps réel la consommation énergétique d'un foyer ou d'un bâtiment et propose un plan d'action chiffré (économies de chauffage, réduction CO₂, retour sur investissement). L'outil cible les particuliers comme les conseillers énergie qui ont besoin d'un diagnostic clair pour décider des travaux.

La modélisation est paramétrable par typologie de logement, isolation, mode de chauffage et zone climatique. Les résultats sont expliqués en langage clair, pas en jargon thermique.`,
  description_en: `SaaS simulator that computes household or building energy consumption in real time and proposes a quantified action plan (heating savings, CO₂ reduction, payback period). The tool targets homeowners and energy consultants who need a clear diagnostic to decide on renovations.

Modeling is parameterizable by housing type, insulation level, heating mode and climate zone. Results are explained in plain language, not thermal jargon.`,
  problem: `Les simulateurs énergétiques grand public donnent des chiffres opaques ou exigent des formulaires interminables. Les conseillers professionnels, eux, jonglent entre tableurs et logiciels métier coûteux. Aucune solution intermédiaire n'offrait à la fois rapidité d'usage, transparence des calculs et restitution lisible pour un client final.`,
  problem_en: `Consumer-grade energy simulators give opaque figures or demand endless forms. Professional advisors juggle spreadsheets and expensive specialized software. No middle-ground solution offered both ease of use, transparent calculations and clear, client-ready output.`,
  solution: `Moteur de calcul Node.js basé sur les formules de la RT/RE en vigueur, paramétré par zone climatique et typologie de logement. Les coefficients sont externalisés en JSON pour permettre des mises à jour sans déploiement.

L'interface Next.js conduit l'utilisateur par étapes courtes (surface, isolation, chauffage, fenêtres) et affiche les résultats en direct : kWh/m²/an, coût annuel, économies potentielles, équivalent CO₂. Un "plan d'action" priorise les travaux selon le ROI.`,
  solution_en: `A Node.js calculation engine based on current thermal regulations, parameterized by climate zone and housing type. Coefficients are externalized in JSON to allow updates without redeployment.

The Next.js interface guides the user through short steps (area, insulation, heating, windows) and shows results live: kWh/m²/year, annual cost, potential savings, CO₂ equivalent. An "action plan" prioritizes renovations by ROI.`,
  result:
    "Jusqu'à 70 % d'économies de chauffage et 75 % de réduction CO₂ mesurées sur les cas-pilotes.",
  metric: "Économies jusqu'à 70 % sur le chauffage, -75 % CO₂",
  role: "Fullstack Engineer",
  tech: ["Next.js", "Node.js", "TypeScript", "PostgreSQL", "Recharts"],
  links: [
    { label: "Démo publique", href: "https://home-energy-six.vercel.app" },
  ],
  featured: false,
  results: [
    "Moteur de calcul paramétrable par zone climatique et typologie",
    "Restitution lisible : kWh, coût, CO₂, ROI travaux",
    "Plan d'action priorisé par retour sur investissement",
    "Mises à jour des coefficients sans déploiement (config JSON)",
  ],
  metrics: [
    { name: "Économies chauffage", value: 70, previousValue: 0, unit: "%" },
    { name: "Réduction CO₂", value: 75, previousValue: 0, unit: "%" },
    { name: "Durée simulation", value: 90, previousValue: 600, unit: "s" },
  ],
  chartData: [
    { name: "Avant", value: 100 },
    { name: "+Isolation", value: 72 },
    { name: "+PAC", value: 48 },
    { name: "+Solaire", value: 30 },
  ],
  url: "https://home-energy-six.vercel.app",
  solutionDiagram: {
    nodes: [
      { id: "ui", label: "UI Next.js", type: "client" },
      { id: "api", label: "API Node.js", type: "gateway" },
      { id: "engine", label: "Moteur de calcul", type: "service" },
      { id: "report", label: "Service rapport", type: "service" },
      { id: "db", label: "PostgreSQL", type: "database" },
      { id: "config", label: "Coefficients JSON", type: "external" },
    ],
    connections: [
      { from: "ui", to: "api", label: "REST" },
      { from: "api", to: "engine", label: "Calcul" },
      { from: "engine", to: "config", label: "Lecture" },
      { from: "api", to: "report", label: "Génération" },
      { from: "report", to: "db", label: "Persistance" },
    ],
  },
  impactGraph: [
    { label: "Précision calcul", value: 90 },
    { label: "Vitesse simulation", value: 92 },
    { label: "Clarté restitution", value: 88 },
    { label: "Économies mesurées", value: 86 },
  ],
};
