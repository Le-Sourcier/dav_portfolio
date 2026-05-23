import type { ProjectSeed } from "../types.js";

export const runweek: ProjectSeed = {
  slug: "runweek",
  title: "RunWeek",
  title_en: "RunWeek",
  name: "RunWeek",
  category: "Mobile",
  image:
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1600&q=80",
  headline:
    "Suivi sportif connecté qui unifie Garmin, Apple Watch, Samsung et Xiaomi dans une seule expérience.",
  description: `Application de suivi sportif qui agrège les données de Garmin, Apple Watch, Samsung Health et Xiaomi Mi Fitness dans une vue unifiée. L'utilisateur connecte ses comptes une seule fois et retrouve toutes ses séances, FC moyennes, allures et indicateurs hebdomadaires sans changer d'app.

Le produit cible les coureurs et sportifs multi-équipés qui changent régulièrement de montre ou utilisent plusieurs marques en parallèle.`,
  description_en: `Sports tracking app that aggregates data from Garmin, Apple Watch, Samsung Health and Xiaomi Mi Fitness into a single unified view. Users connect their accounts once and find all their sessions, average heart rate, paces and weekly indicators without switching apps.

The product targets runners and athletes with multiple devices, who regularly switch watches or use several brands in parallel.`,
  problem: `Chaque écosystème wearable (Garmin Connect, Apple Health, Samsung Health, Mi Fitness) vit en silo. Un coureur qui possède une Garmin pour le trail et une Apple Watch au quotidien doit jongler entre deux apps, perd l'historique en cas de changement de marque et n'a aucune vue consolidée de sa charge d'entraînement.`,
  problem_en: `Each wearable ecosystem (Garmin Connect, Apple Health, Samsung Health, Mi Fitness) lives in a silo. A runner who owns a Garmin for trail and an Apple Watch for daily use has to juggle two apps, loses history when switching brands and has no consolidated view of training load.`,
  solution: `Couche d'intégration unifiée qui parle aux 4 SDK natifs (Garmin Health API, HealthKit, Samsung Health SDK, Mi Fitness API) via une abstraction commune. Les séances sont normalisées en un schéma unique côté backend Node.js et stockées en PostgreSQL.

L'app mobile React Native synchronise en arrière-plan, gère le mode offline-first et affiche des dashboards hebdomadaires (volume, intensité, dénivelé, allure moyenne). Une vue "charge d'entraînement" calcule le ratio aigu/chronique pour prévenir les surentraînements.`,
  solution_en: `Unified integration layer that talks to the four native SDKs (Garmin Health API, HealthKit, Samsung Health SDK, Mi Fitness API) through a common abstraction. Sessions are normalized into a single schema on the Node.js backend and stored in PostgreSQL.

The React Native mobile app syncs in the background, handles offline-first mode and displays weekly dashboards (volume, intensity, elevation, average pace). A "training load" view computes the acute/chronic ratio to prevent overtraining.`,
  headline_en: "Connected sports tracking unifying Garmin, Apple Watch, Samsung and Xiaomi in a single experience.",
  result_en: "A single app for all wearable ecosystems on the market, with consolidated training load calculation.",
  metric_en: "4 wearable ecosystems unified (Garmin, Apple, Samsung, Xiaomi)",
  role_en: "Fullstack & Mobile Engineer",
  results_en: [
    "Native integration with 4 major wearable ecosystems",
    "Offline-first mode for key screens (sessions, calendar)",
    "Acute/chronic training load ratio calculation",
    "Weekly dashboards (volume, intensity, elevation, pace)",
    "Background multi-source sync without duplicates",
  ],
  result:
    "Une seule app pour tous les écosystèmes wearable du marché, avec calcul de charge d'entraînement consolidée.",
  metric: "4 écosystèmes wearable unifiés (Garmin, Apple, Samsung, Xiaomi)",
  role: "Fullstack & Mobile Engineer",
  tech: [
    "React Native",
    "TypeScript",
    "Node.js",
    "PostgreSQL",
    "HealthKit",
    "Garmin Health API",
    "Samsung Health SDK",
  ],
  links: [{ label: "Démo publique", href: "https://runweek.vercel.app" }],
  featured: true,
  results: [
    "Intégration native avec 4 écosystèmes wearable majeurs",
    "Mode offline-first pour les écrans clés (séances, calendrier)",
    "Calcul du ratio aigu/chronique de charge d'entraînement",
    "Dashboards hebdomadaires (volume, intensité, dénivelé, allures)",
    "Sync en arrière-plan multi-source sans doublons",
  ],
  metrics: [
    { name: "Sources unifiées", value: 4, previousValue: 1, unit: "" },
    { name: "Sync latence", value: 800, previousValue: 4500, unit: "ms" },
    { name: "Taux dédoublonnage", value: 99.4, previousValue: 78, unit: "%" },
  ],
  chartData: [
    { name: "S1", value: 12 },
    { name: "S2", value: 28 },
    { name: "S3", value: 42 },
    { name: "S4", value: 61 },
    { name: "S5", value: 78 },
  ],
  url: "https://runweek.vercel.app",
  solutionDiagram: {
    nodes: [
      { id: "app", label: "App React Native", type: "client" },
      { id: "api", label: "API Node.js", type: "gateway" },
      { id: "adapters", label: "Adapters wearables", type: "service" },
      { id: "training", label: "Service charge", type: "service" },
      { id: "db", label: "PostgreSQL", type: "database" },
      { id: "garmin", label: "Garmin Health", type: "external" },
      { id: "apple", label: "HealthKit", type: "external" },
      { id: "samsung", label: "Samsung Health", type: "external" },
      { id: "xiaomi", label: "Mi Fitness", type: "external" },
    ],
    connections: [
      { from: "app", to: "api", label: "REST" },
      { from: "api", to: "adapters", label: "Sync" },
      { from: "adapters", to: "garmin" },
      { from: "adapters", to: "apple" },
      { from: "adapters", to: "samsung" },
      { from: "adapters", to: "xiaomi" },
      { from: "adapters", to: "db", label: "Normalisation" },
      { from: "api", to: "training", label: "Calcul" },
      { from: "training", to: "db", label: "Read/Write" },
    ],
  },
  impactGraph: [
    { label: "Couverture wearables", value: 90 },
    { label: "Performance sync", value: 86 },
    { label: "Qualité données", value: 92 },
    { label: "Expérience utilisateur", value: 88 },
  ],
};
