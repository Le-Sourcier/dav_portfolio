export const site = {
  name: "Yao David Logan",
  initials: "YDL",
  title: "Software Engineer fullstack",
  location: "Lome, Togo",
  email: "yaodavidlogan02@gmail.com",
  phone: "+228 91680967",
  github: "https://github.com/Le-Sourcier",
  linkedin: "https://linkedin.com/in/yao-logan",
  url: "https://yaodavidlogan.com",
  availability: "Disponible pour CDI, freelance et missions longues",
  promise:
    "Je conçois des plateformes SaaS rapides, sécurisées et prêtes à scaler pour des équipes qui veulent livrer sans dette technique.",
};

export const proofStats = [
  {
    value: "10K+",
    label: "utilisateurs simultanés",
    detail: "Architecture backend modulaire, cache Redis et APIs critiques.",
  },
  {
    value: "-65%",
    label: "temps de chargement",
    detail: "Optimisation frontend, requêtes et parcours produit.",
  },
  {
    value: "25K+",
    label: "téléchargements NPM",
    detail: "Outils open source utilisés par des développeurs.",
  },
  {
    value: "4",
    label: "packages publiés",
    detail: "Node.js, n8n, automatisation et frameworks backend.",
  },
];

export const services = [
  {
    eyebrow: "Produit",
    title: "Architecture SaaS",
    headline: "Structurer une plateforme claire avant qu'elle ne devienne difficile à maintenir.",
    description:
      "Backends Node.js/TypeScript, RBAC, paiements, files d'attente, dashboards et APIs maintenables.",
    points: ["Découpage métier", "Contrats API", "Parcours critiques"],
  },
  {
    eyebrow: "Interface",
    title: "Produit web & mobile",
    headline: "Construire des interfaces rapides, lisibles et pensées pour l'usage réel.",
    description:
      "Interfaces React, Next.js et React Native avec hiérarchie claire, performance et finition produit.",
    points: ["Next.js", "React Native", "Design systems"],
  },
  {
    eyebrow: "Ops",
    title: "Automatisation métier",
    headline: "Réduire les tâches répétitives sans créer de dépendance fragile.",
    description:
      "Workflows n8n/Make, enrichissement de données, batchs et outils internes pour réduire les opérations manuelles.",
    points: ["n8n", "Batchs", "Data enrichment"],
  },
  {
    eyebrow: "Qualité",
    title: "Performance & sécurité",
    headline: "Stabiliser les temps de réponse et protéger les flux sensibles.",
    description:
      "Optimisation API, cache, permissions, validation des entrées, monitoring et durcissement des parcours critiques.",
    points: ["Redis", "RBAC", "Monitoring"],
  },
];

export const projects = [
  {
    slug: "servcraft",
    name: "ServCraft",
    category: "Open Source",
    headline: "Framework backend pour lancer des APIs SaaS structurées plus vite.",
    description:
      "ServCraft standardise la création d'APIs Node.js avec Fastify, Prisma, PostgreSQL, RBAC et conventions prêtes production.",
    result: "Un socle backend réutilisable pour réduire le temps de setup et garder une architecture propre.",
    metric: "NPM publié · v0.4.9",
    role: "Conception, architecture, DX, packaging NPM",
    tech: ["TypeScript", "Fastify", "Prisma", "PostgreSQL", "RBAC"],
    links: [{ label: "Voir sur NPM", href: "https://www.npmjs.com/package/servcraft" }],
    featured: true,
  },
  {
    slug: "data-enrichment",
    name: "Automated Data Enrichment Platform",
    category: "SaaS B2B",
    headline: "Pipeline d'enrichissement de données pour bases commerciales.",
    description:
      "Plateforme de traitement batch, automatisation FTP et enrichissement de fichiers pour améliorer la qualité des bases clients.",
    result: "Des milliers d'enregistrements traités par lot avec moins de manipulations manuelles.",
    metric: "Batchs de milliers de lignes",
    role: "Architecture fullstack, automatisation, files de traitement",
    tech: ["Next.js", "Node.js", "FTP Automation", "File Queues"],
    links: [
      { label: "Démo", href: "https://partners-manager.vercel.app" },
      {
        label: "GitHub",
        href: "https://github.com/Le-Sourcier/automated-data-enrichment-platform",
      },
    ],
    featured: true,
  },
  {
    slug: "home-energy",
    name: "Home Energy",
    category: "SaaS Énergie",
    headline: "Dashboard temps réel pour optimiser la consommation domestique.",
    description:
      "SaaS de calcul énergétique permettant de suivre la consommation, les économies et l'impact CO2 dans une interface claire.",
    result: "Pilotage plus lisible de la dépense énergétique et recommandations orientées économies.",
    metric: "-70% chauffage estimé",
    role: "Produit, frontend, backend temps réel",
    tech: ["React", "Node.js", "Real-time"],
    links: [{ label: "Démo", href: "https://home-energy-six.vercel.app/" }],
    featured: true,
  },
  {
    slug: "runweek",
    name: "RunWeek",
    category: "Health Tech",
    headline: "Suivi sportif connecté avec IA et intégrations wearables.",
    description:
      "Plateforme de suivi sportif avec Garmin, Apple Watch, Samsung, Xiaomi, analyse IA et programmes personnalisés.",
    result: "Un espace de progression connecté entre données réelles, analyse et recommandations.",
    metric: "IA + wearables",
    role: "Intégrations API, backend, interface produit",
    tech: ["React", "Node.js", "API Integration", "IA"],
    links: [{ label: "Démo", href: "https://runweek.vercel.app" }],
    featured: false,
  },
];

export const experience = [
  {
    company: "Nexus Corporation",
    role: "Développeur Fullstack & Software Engineer",
    period: "Août 2025 - Présent",
    focus: "Architecture SaaS",
    summary:
      "Plateforme d'investissement web et mobile, backend modulaire, authentification, paiements, RBAC et dashboards analytiques.",
    points: ["Backend modulaire", "Paiements & RBAC", "Dashboards analytiques"],
  },
  {
    company: "Ubuntu Consulting SARL",
    role: "Software Engineer - Automatisation & SaaS",
    period: "Février 2025 - Octobre 2025",
    focus: "Automatisation métier",
    summary:
      "Solutions SaaS B2B, prospection, enrichissement de données, IA et optimisation de traitements batch.",
    points: ["Workflows IA", "Enrichissement data", "Traitements batch"],
  },
  {
    company: "Groupe Drapeau",
    role: "Développeur Fullstack & Chef de projet",
    period: "Avril 2024 - Juillet 2024",
    focus: "Plateforme métier",
    summary:
      "Plateforme web pour génie civil, location d'équipements et immobilier, avec déploiement et coordination d'équipe.",
    points: ["Interface métier", "Déploiement", "Coordination produit"],
  },
];

export const stack = [
  { name: "Next.js", role: "Framework web", category: "Frontend", icon: "/stack/nextjs.svg" },
  { name: "React", role: "Interfaces produit", category: "Frontend", icon: "/stack/react.svg" },
  { name: "TypeScript", role: "Code robuste", category: "Langage", icon: "/stack/typescript.svg" },
  { name: "Node.js", role: "Runtime backend", category: "Backend", icon: "/stack/nodejs.svg" },
  { name: "Fastify", role: "APIs rapides", category: "Backend", icon: "/stack/fastify.svg" },
  { name: "PostgreSQL", role: "Données critiques", category: "Data", icon: "/stack/postgresql.svg" },
  { name: "Redis", role: "Cache & queues", category: "Data", icon: "/stack/redis.svg" },
  { name: "Prisma", role: "ORM typé", category: "Data", icon: "/stack/prisma.svg" },
  { name: "Docker", role: "Déploiement", category: "Infra", icon: "/stack/docker.svg" },
  { name: "n8n", role: "Automatisation", category: "Ops", icon: "/stack/n8n.svg" },
  { name: "IA", role: "Workflows augmentés", category: "AI", icon: "/stack/ai.svg" },
];

export const testimonials = [
  {
    quote:
      "David sait transformer un besoin flou en architecture claire. Il avance vite, documente les décisions et garde toujours l'objectif business en tête.",
    name: "Responsable produit",
    role: "Plateforme SaaS B2B",
  },
  {
    quote:
      "Son approche backend nous a aidés à stabiliser les parcours critiques: authentification, permissions et paiements. La communication est directe et fiable.",
    name: "Fondateur",
    role: "Produit fintech",
  },
  {
    quote:
      "Très bon équilibre entre exécution et recul technique. Il propose des solutions pragmatiques, sans complexifier inutilement le produit.",
    name: "Lead opérationnel",
    role: "Automatisation métier",
  },
];

export const blogPosts = [
  {
    slug: "architecture-saas-scalable",
    title: "Construire une architecture SaaS scalable sans sur-ingénierie",
    excerpt:
      "Les décisions techniques qui donnent de la marge à un produit SaaS sans créer une plateforme impossible à maintenir.",
    category: "Architecture",
    date: "2026-05-12",
    readTime: "7 min",
    featured: true,
    intro:
      "La scalabilité n'est pas une course aux outils. C'est surtout une capacité à garder un système compréhensible pendant que les utilisateurs, les flux métier et les contraintes changent.",
    sections: [
      {
        title: "Commencer par les vrais points de pression",
        body:
          "Avant de parler microservices, queues ou Kubernetes, il faut identifier ce qui casse réellement: la base de données, les requêtes lentes, les traitements longs, la synchronisation d'état ou les permissions. Un SaaS jeune a souvent besoin de frontières claires et de bons contrats internes avant d'avoir besoin d'une architecture distribuée.",
      },
      {
        title: "Découper par responsabilité métier",
        body:
          "Un backend maintenable sépare les responsabilités: identité, facturation, permissions, notifications, analytics, fichiers et domaine produit. Même dans un monolithe, cette séparation réduit les régressions et rend l'extraction future plus simple.",
      },
      {
        title: "Mesurer avant d'optimiser",
        body:
          "Les métriques changent la qualité des décisions. Temps de réponse, taux d'erreur, files en attente, temps batch et parcours utilisateurs doivent être observables. Sans mesure, l'optimisation devient une préférence personnelle.",
      },
    ],
  },
  {
    slug: "automatisation-metier-roi",
    title: "Automatisation métier: choisir les workflows qui créent un vrai ROI",
    excerpt:
      "Comment prioriser les automatisations utiles et éviter les workflows qui impressionnent mais ne changent rien au business.",
    category: "Automatisation",
    date: "2026-05-08",
    readTime: "6 min",
    featured: true,
    intro:
      "Une bonne automatisation ne remplace pas seulement une tâche. Elle réduit une friction répétée, fiabilise une opération et libère du temps sur un point qui compte vraiment.",
    sections: [
      {
        title: "Partir du coût opérationnel",
        body:
          "Le meilleur candidat à l'automatisation est une tâche fréquente, fragile, mesurable et liée à une conséquence business: retard, erreur, perte de lead, mauvaise donnée ou support inutile.",
      },
      {
        title: "Garder une sortie humaine claire",
        body:
          "Un workflow robuste prévoit les cas d'échec. Il doit permettre de comprendre ce qui s'est passé, reprendre manuellement si nécessaire et éviter qu'une erreur silencieuse se transforme en dette opérationnelle.",
      },
      {
        title: "Documenter le processus, pas seulement le scénario",
        body:
          "La vraie valeur vient quand l'équipe comprend le flux. Une automatisation premium inclut des logs, des alertes, des règles compréhensibles et une documentation courte.",
      },
    ],
  },
  {
    slug: "nextjs-portfolio-premium",
    title: "Ce qui rend un portfolio développeur réellement premium",
    excerpt:
      "Un portfolio qui vend ne montre pas seulement une stack: il met en scène des preuves, des résultats et une manière de travailler.",
    category: "Produit",
    date: "2026-05-01",
    readTime: "5 min",
    featured: false,
    intro:
      "Un portfolio premium donne confiance avant même le premier message. Il clarifie le positionnement, réduit les doutes et montre que le développeur comprend les enjeux produit.",
    sections: [
      {
        title: "La preuve avant la promesse",
        body:
          "Les chiffres, les cas concrets, les captures et les responsabilités exactes parlent plus fort qu'une longue liste de technologies. Le visiteur doit comprendre ce qui a été livré et pourquoi c'était utile.",
      },
      {
        title: "Une hiérarchie pensée pour décider",
        body:
          "Le premier écran doit répondre vite: qui êtes-vous, quel problème résolvez-vous, pourquoi vous faire confiance, et comment vous contacter. Le reste doit approfondir, pas répéter.",
      },
      {
        title: "Un contact sans friction",
        body:
          "Le meilleur formulaire est celui qui aide à écrire un bon brief. Les canaux directs doivent rester accessibles, surtout pour les clients pressés ou les recruteurs.",
      },
    ],
  },
];
