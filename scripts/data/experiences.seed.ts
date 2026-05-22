export const experiencesSeed = [
    // =================================================================
    // 1 — Nexus Corporation (mission en cours, plateforme d'investissement)
    // =================================================================
    {
      title: "Développeur Fullstack & Architecte Logiciel",
      title_en: "Fullstack Developer & Software Architect",
      company: "Nexus Corporation",
      location: "Lomé, Togo",
      dates: "Août 2025 — Présent",
      coverImage:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
      description: `Conception et développement de bout en bout d'une plateforme d'investissement financier accompagnée de son application mobile cross-platform. La mission couvre l'architecture, le backend, l'application web admin, l'app mobile et l'écosystème de contenu (blog, site marketing).

L'enjeu : livrer une infrastructure capable de gérer des transactions financières en temps réel, avec une expérience d'investissement fluide sur web et mobile, et une couche admin complète pour piloter le produit.

Je suis en charge de l'architecture microservices (Next.js 14, Node.js, PostgreSQL, Redis), du système de paiement multi-passerelles avec chiffrement bout en bout, et du dashboard analytique temps réel. L'application mobile React Native est actuellement en review sur le Google Play Store.`,
      description_en: `End-to-end design and development of a financial investment platform paired with its cross-platform mobile app. The mission spans architecture, backend, admin web app, mobile app and the content ecosystem (blog, marketing site).

The goal: deliver an infrastructure capable of handling real-time financial transactions, with a smooth investment experience on web and mobile, and a complete admin layer to drive the product.

I own the microservices architecture (Next.js 14, Node.js, PostgreSQL, Redis), the multi-gateway payment system with end-to-end encryption, and the real-time analytics dashboard. The React Native mobile app is currently under review on the Google Play Store.`,
      stack: [
        "Next.js 14",
        "React Native",
        "Node.js",
        "TypeScript",
        "PostgreSQL",
        "Redis",
        "WebSocket",
      ],
      details: [
        "Architecture microservices modulaire et évolutive",
        "App mobile React Native cross-platform (Android + iOS)",
        "Intégration de passerelles de paiement multiples avec chiffrement E2E",
        "Dashboard admin avec visualisation de données temps réel (Chart.js)",
        "Blog technique et site marketing alignés sur le produit",
        "Pipeline d'authentification JWT + RBAC granulaire",
      ],
      challenges: [
        "Garantir la haute disponibilité d'une plateforme financière critique",
        "Optimiser les performances de l'application mobile sur Android entrée de gamme",
        "Mettre en place une architecture microservices évolutive sans complexité inutile",
      ],
      achievements: [
        {
          title: "Site principal en production",
          description:
            "Plateforme web Next.js 14 déployée en production sur nexuscorporat.com, avec dashboard admin et blog technique séparés sur sous-domaines.",
        },
        {
          title: "App mobile en review Google Play",
          description:
            "Application React Native cross-platform finalisée, soumise au Google Play Store, également distribuée via Uptodown en attendant validation.",
        },
        {
          title: "Système de paiement multi-passerelles",
          description:
            "Intégration de plusieurs passerelles de paiement avec chiffrement bout en bout, idempotence sur les webhooks et réconciliation automatique.",
        },
        {
          title: "Dashboard analytique temps réel",
          description:
            "Interface admin complète avec WebSocket pour les flux de données live, visualisations Chart.js et exports planifiés.",
        },
      ],
      links: [
        { label: "Site principal", url: "https://nexuscorporat.com" },
        { label: "Téléchargement mobile", url: "https://nexuscorporat.com/download" },
        { label: "Dashboard admin", url: "https://admin.nexuscorporat.com" },
        { label: "Blog technique", url: "https://blog.nexuscorporat.com" },
      ],
      illustrativeImages: [
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1280&q=80",
      ],
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
    },

    // =================================================================
    // 2 — Ubuntu Consulting SARL (Software Engineer + Automatisation)
    // =================================================================
    {
      title: "Software Engineer & Expert en Automatisation",
      title_en: "Software Engineer & Automation Expert",
      company: "Ubuntu Consulting SARL",
      location: "Remote",
      dates: "Février 2025 — Octobre 2025",
      coverImage:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
      description: `Développement de solutions SaaS B2B et de plateformes d'automatisation pour les clients de l'agence. La mission a couvert cinq produits livrés en production, des systèmes de scraping intelligents et des intégrations d'IA générative.

J'ai construit Prospect-Pro (plateforme de prospection B2B augmentée par IA), RunWeek (suivi sportif connecté multi-marques), HomeEnergy (calculs énergétiques SaaS), MailCraft (création de newsletters avec génération PDF) et une plateforme d'enrichissement de données automatisée.

En parallèle, j'ai conçu des chaînes d'automatisation avancée : scraping intelligent (Pages Jaunes, Pappers, GoAfrica, Google Maps), campagnes automatisées N8N + MailWizz, et un système d'appels téléphoniques automatisés via Vapi + SIP. La période a aussi produit trois packages NPM publiés autour de N8N.`,
      description_en: `Building B2B SaaS solutions and automation platforms for agency clients. The mission covered five products shipped to production, intelligent scraping systems and generative AI integrations.

I built Prospect-Pro (AI-augmented B2B prospecting platform), RunWeek (connected sports tracking across multiple brands), HomeEnergy (energy calculations SaaS), MailCraft (newsletter creation with PDF generation) and an automated data enrichment platform.

In parallel, I designed advanced automation pipelines: intelligent scraping (Pages Jaunes, Pappers, GoAfrica, Google Maps), N8N + MailWizz automated campaigns, and an automated phone call system via Vapi + SIP. The period also produced three published NPM packages around N8N.`,
      stack: [
        "Next.js",
        "Node.js",
        "TypeScript",
        "Python",
        "PostgreSQL",
        "N8N",
        "OpenAI",
        "Vapi",
      ],
      details: [
        "Prospect-Pro — Plateforme de prospection B2B avec scoring IA",
        "RunWeek — Suivi sportif connecté (Garmin, Apple Watch, Samsung, Xiaomi)",
        "HomeEnergy — Calculs énergétiques temps réel (économies, CO₂)",
        "MailCraft — Éditeur WYSIWYG newsletter + génération PDF",
        "Plateforme d'enrichissement de données automatisée (FTP, queues)",
        "Scraping intelligent multi-sources (Pages Jaunes, Pappers, GoAfrica)",
        "Campagnes automatisées N8N + MailWizz",
        "Système d'appels automatisés Vapi + SIP (IllyVoIP, Vonage)",
      ],
      challenges: [
        "Industrialiser plusieurs produits SaaS en parallèle sans dérive de qualité",
        "Construire des nœuds N8N réutilisables et publiables sur le registry public",
        "Gérer le scraping légal à grande échelle sans pénaliser les sources",
      ],
      achievements: [
        {
          title: "5 produits SaaS livrés en production",
          description:
            "Prospect-Pro, RunWeek, HomeEnergy, MailCraft et la plateforme d'enrichissement — tous en démo publique et utilisés par les clients de l'agence.",
        },
        {
          title: "3 packages NPM publiés autour de N8N",
          description:
            "@le-sourcier/n8n-nodes-mailwizz (25K+ téléchargements), n8n-nodes-mailwizz-ls (2.1.13), n8n-nodes-gpt-oss (0.1.0).",
        },
        {
          title: "Économies mesurables côté client",
          description:
            "HomeEnergy a permis jusqu'à 70 % d'économies de chauffage et 75 % de réduction CO₂ chez les utilisateurs finaux.",
        },
        {
          title: "Pipeline IA pour la prospection B2B",
          description:
            "Scoring de leads par IA + personnalisation des messages de contact, intégrable nativement dans les CRM majeurs.",
        },
      ],
      links: [
        { label: "Prospect-Pro (démo)", url: "https://prospect-pro-sgrq.vercel.app" },
        { label: "RunWeek (démo)", url: "https://runweek.vercel.app" },
        { label: "HomeEnergy (démo)", url: "https://home-energy-six.vercel.app" },
        { label: "MailCraft (démo)", url: "https://mailcraft.vercel.app" },
        { label: "Volvo EX30 (démo)", url: "https://vol-vo-ex-30.vercel.app" },
      ],
      illustrativeImages: [
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1280&q=80",
      ],
      solutionDiagram: {
        nodes: [
          { id: "crm", label: "CRM client", type: "client" },
          { id: "dashboards", label: "Dashboards produits", type: "client" },
          { id: "api", label: "API agence", type: "gateway" },
          { id: "scrape", label: "Pipeline scraping", type: "service" },
          { id: "enrich", label: "Enrichissement données", type: "service" },
          { id: "n8n", label: "Workflows N8N", type: "service" },
          { id: "db", label: "PostgreSQL", type: "database" },
          { id: "mailwizz", label: "MailWizz", type: "external" },
          { id: "vapi", label: "Vapi + SIP", type: "external" },
          { id: "openai", label: "OpenAI GPT", type: "ai" },
        ],
        connections: [
          { from: "crm", to: "api", label: "REST" },
          { from: "dashboards", to: "api", label: "REST" },
          { from: "api", to: "scrape", label: "Jobs" },
          { from: "api", to: "enrich", label: "Pipelines" },
          { from: "api", to: "n8n", label: "Webhooks" },
          { from: "enrich", to: "db", label: "Stockage" },
          { from: "n8n", to: "mailwizz", label: "Campagnes" },
          { from: "n8n", to: "vapi", label: "Appels" },
          { from: "enrich", to: "openai", label: "Scoring" },
        ],
      },
      impactGraph: [
        { label: "Productivité agence", value: 90 },
        { label: "Diversité produits", value: 88 },
        { label: "Réutilisation code", value: 82 },
        { label: "Adoption N8N nodes", value: 86 },
      ],
    },

    // =================================================================
    // 3 — IAFP La Pyramide (formateur, profil pédagogique)
    // =================================================================
    {
      title: "Formateur en Développement Fullstack",
      title_en: "Fullstack Development Trainer",
      company: "IAFP La Pyramide",
      location: "Lomé, Togo",
      dates: "Juillet 2024 — Mars 2025",
      coverImage:
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80",
      description: `Mission de formation au sein de l'IAFP La Pyramide, un institut de formation modulaire accrédité par l'État togolais. Mon rôle : enseigner les fondamentaux de la programmation et accompagner les apprenants jusqu'à la livraison d'applications fullstack autonomes.

Le programme couvrait les principes algorithmiques, JavaScript, TypeScript, Dart, le développement web moderne avec Next.js, et le mobile avec Flutter et React Native. J'ai mis l'accent sur le code propre, le contrôle de version et le développement collaboratif.

Les apprenants ont mené des projets pratiques de bout en bout, avec relectures de code régulières et évaluation par projet. Résultat : un taux de certification de 85 % sur la promotion.`,
      description_en: `Training mission at IAFP La Pyramide, a state-accredited modular training institute in Togo. My role: teach programming fundamentals and walk learners through to delivering autonomous fullstack applications.

The program covered algorithmic principles, JavaScript, TypeScript, Dart, modern web development with Next.js, and mobile with Flutter and React Native. I emphasized clean code, version control and collaborative development.

Learners shipped end-to-end practical projects with regular code reviews and project-based evaluation. Result: an 85% certification rate across the cohort.`,
      stack: [
        "JavaScript",
        "TypeScript",
        "Next.js",
        "React",
        "React Native",
        "Flutter",
        "Dart",
        "Git",
      ],
      details: [
        "Enseignement des principes algorithmiques et bases JavaScript",
        "Développement web moderne avec TypeScript et Next.js",
        "Mobile cross-platform avec Flutter et React Native",
        "Encadrement de projets fullstack de bout en bout",
        "Relectures de code et pair-programming systématiques",
        "Évaluation par projet plutôt que par examen théorique",
      ],
      challenges: [
        "Adapter le rythme à des profils d'apprenants très hétérogènes",
        "Faire passer la culture du code propre et du contrôle de version",
        "Maintenir un taux de complétion élevé sur des programmes longs",
      ],
      achievements: [
        {
          title: "85 % de taux de certification",
          description:
            "Atteint grâce à des cours structurés, des relectures de code régulières et une évaluation par projet.",
        },
        {
          title: "Apprenants autonomes en livraison",
          description:
            "Les étudiants ont fini capables de développer, déboguer et déployer leurs applications fullstack sans assistance.",
        },
        {
          title: "Programme aligné employabilité",
          description:
            "Concentration sur les compétences professionnalisantes : algorithmes, JavaScript / TypeScript, Next.js, Flutter, React Native, Git.",
        },
      ],
      illustrativeImages: [
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1280&q=80",
      ],
      impactGraph: [
        { label: "Taux de certification", value: 85 },
        { label: "Autonomie livraison", value: 88 },
        { label: "Satisfaction promo", value: 92 },
      ],
    },

    // =================================================================
    // 4 — Groupe Drapeau (mission ponctuelle, chef de projet)
    // =================================================================
    {
      title: "Développeur Fullstack & Chef de Projet",
      title_en: "Fullstack Developer & Project Lead",
      company: "Groupe Drapeau",
      location: "Lomé, Togo",
      dates: "Avril 2024 — Juillet 2024",
      description: `Conception et développement de la plateforme web du Groupe Drapeau, acteur du génie civil, de la location d'équipements de construction et de l'immobilier au Togo.

J'ai pris en charge l'intégralité du projet : architecture, développement fullstack, configuration serveur, optimisation des performances, et la sécurité des bonnes pratiques côté production. Le rôle incluait également la coordination produit avec la direction.

Le code source est public sur mon GitHub. La mission s'est conclue par un transfert complet à l'équipe interne du Groupe Drapeau pour la maintenance corrective et évolutive.`,
      description_en: `Design and development of the Groupe Drapeau web platform — a Togolese player in civil engineering, construction equipment rental and real estate.

I owned the full project: architecture, fullstack development, server configuration, performance tuning, and production-grade security best practices. The role also included product coordination with leadership.

The source code is public on my GitHub. The mission concluded with a complete handover to Groupe Drapeau's internal team for ongoing corrective and evolutive maintenance.`,
      stack: ["Next.js", "Node.js", "JavaScript", "HTML", "Flutter"],
      details: [
        "Conception et développement du site web corporate",
        "Configuration du serveur et de la base de données",
        "Optimisation des performances côté production",
        "Maintenance corrective et évolutive sur la période de mission",
        "Application des bonnes pratiques de sécurité web",
      ],
      challenges: [
        "Livrer un site corporate complet dans une fenêtre de mission courte (4 mois)",
        "Préparer le transfert complet vers l'équipe interne dès la conception",
      ],
      achievements: [
        {
          title: "Site corporate livré en production",
          description:
            "Plateforme web Next.js / Node.js complète, intégrant les trois lignes métier du groupe (génie civil, location d'équipements, immobilier).",
        },
        {
          title: "Transfert d'équipe sans dette",
          description:
            "Code source documenté, ouvert sur GitHub, repris sans accroc par l'équipe interne pour la maintenance.",
        },
      ],
      links: [
        { label: "Code source GitHub", url: "https://github.com/Le-Sourcier/drapeau_group" },
      ],
      impactGraph: [
        { label: "Délai de livraison", value: 92 },
        { label: "Qualité code", value: 86 },
        { label: "Transférabilité", value: 90 },
      ],
    },
];
