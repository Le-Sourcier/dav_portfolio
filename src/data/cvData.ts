export interface DiagramNode {
  id: string;
  label: string;
  type: 'client' | 'gateway' | 'service' | 'database' | 'external' | 'ai';
}

export interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
}

export interface SolutionDiagramData {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
}

export interface ImpactData {
  label: string;
  value: number;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  dates: string;
  description: string;
  details?: string[];
  links?: { label: string; url: string }[];
  project?: {
    name: string;
    stack: string;
    demo: string;
  };
  coverImage?: string;
  illustrativeImages?: string[];
  stack?: string[];
  challenges?: string[];
  achievements?: {
    title: string;
    description: string;
    icon?: string;
  }[];
  solutionDiagram?: SolutionDiagramData;
  impactGraph?: ImpactData[];
}

export const cvData = {
  personalInformation: {
    name: "Yao David Logan",
    title: "D\u00e9veloppeur Fullstack & Software Engineer",
    location: "Lom\u00e9 - TOGO",
    phone: "+228 91680967 / 96690680",
    email: "yaodavidlogan02@gmail.com",
    github: "https://github.com/Le-Sourcier",
    linkedin: "https://linkedin.com/in/yao-logan"
  },
  profile: {
    summary: "D\u00e9veloppeur fullstack passionn\u00e9 par la cr\u00e9ation de solutions logicielles robustes et \u00e9volutives. Fort d'un parcours autodidacte et de plusieurs exp\u00e9riences en d\u00e9veloppement web, mobile et desktop, je mets en \u0153uvre des technologies modernes pour concevoir des applications performantes et centr\u00e9es sur l'utilisateur. Je recherche un environnement stimulant o\u00f9 je pourrai contribuer \u00e0 des projets innovants tout en continuant \u00e0 d\u00e9velopper mon expertise technique."
  },
  experience: [
    {
      id: "nexus-corporation",
      title: "D\u00e9veloppeur Fullstack & Architecte Logiciel",
      company: "Nexus Corporation",
      location: "Lom\u00e9, Togo",
      dates: "Ao\u00fbt 2025 - Pr\u00e9sent",
      description: "Plateforme d'investissement financier et application mobile",
      coverImage: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/564508a5-e18e-4304-b909-f59e34b774ee/nexus-corporation-cover-c8caa42c-1770889909092.webp",
      stack: ["Next.js 14", "Node.js", "PostgreSQL", "Redis", "React Native", "TypeScript"],
      challenges: [
        "Gestion de la haute disponibilit\u00e9 pour une plateforme financi\u00e8re critique",
        "Optimisation des performances de l'application mobile pour les connexions bas d\u00e9bit",
        "Mise en place d'une architecture microservices \u00e9volutive"
      ],
      achievements: [
        {
          title: "Architecture Microservices",
          description: "Conception d'une plateforme modulaire avec Next.js 14 et Node.js"
        },
        {
          title: "Application Mobile",
          description: "D\u00e9veloppement React Native en phase finale de publication Google Play"
        },
        {
          title: "S\u00e9curit\u00e9 de Paiement",
          description: "Int\u00e9gration de passerelles multiples avec chiffrement de bout en bout"
        }
      ],
      details: [
        "Architecture Microservices: Conception d'une plateforme modulaire avec Next.js 14, Node.js, PostgreSQL, Redis",
        "Application Mobile Cross-platform: D\u00e9veloppement avec React Native (actuellement en review Google Play)",
        "Syst\u00e8me de Paiement S\u00e9curis\u00e9: Int\u00e9gration de passerelles multiples avec chiffrement de bout en bout",
        "Dashboard Analytique: Interface admin compl\u00e8te avec visualisation de donn\u00e9es en temps r\u00e9el"
      ],
      links: [
        { label: "Site principal", url: "https://nexuscorporat.com" },
        { label: "Blog technique", url: "https://blog.nexuscorporat.com" }
      ],
      solutionDiagram: {
        nodes: [
          { id: 'client', label: 'App Mobile/Web', type: 'client' },
          { id: 'gateway', label: 'API Gateway', type: 'gateway' },
          { id: 'auth', label: 'Auth Service', type: 'service' },
          { id: 'payment', label: 'Payment Engine', type: 'service' },
          { id: 'db', label: 'PostgreSQL', type: 'database' },
          { id: 'cache', label: 'Redis Cache', type: 'database' }
        ],
        connections: [
          { from: 'client', to: 'gateway' },
          { from: 'gateway', to: 'auth' },
          { from: 'gateway', to: 'payment' },
          { from: 'payment', to: 'db' },
          { from: 'payment', to: 'cache' }
        ]
      },
      impactGraph: [
        { label: 'Performance', value: 92 },
        { label: 'S\u00e9curit\u00e9', value: 98 },
        { label: 'Scalabilit\u00e9', value: 95 },
        { label: 'Disponibilit\u00e9', value: 99 },
        { label: 'UX', value: 88 }
      ]
    },
    {
      id: "ubuntu-consulting",
      title: "Software Engineer & Expert en Automatisation",
      company: "Ubuntu Consulting SARL",
      dates: "F\u00e9vrier 2025 \u2013 Octobre 2025",
      description: "D\u00e9veloppement de solutions SaaS B2B et plateformes d'automatisation",
      coverImage: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/564508a5-e18e-4304-b909-f59e34b774ee/ubuntu-consulting-cover-d2dfbdbd-1770889909597.webp",
      stack: ["Next.js", "TypeScript", "Python", "PostgreSQL", "OpenAI API", "Docker"],
      challenges: [
        "Int\u00e9gration d'algorithmes d'IA pour l'analyse pr\u00e9dictive de prospection",
        "Automatisation de workflows complexes multi-plateformes",
        "Scalabilit\u00e9 du backend Python pour traiter des volumes de donn\u00e9es importants"
      ],
      achievements: [
        {
          title: "Prospect-Pro Launch",
          description: "Lancement r\u00e9ussi d'une plateforme SaaS d'IA pour la prospection B2B"
        },
        {
          title: "Automatisation 80%",
          description: "R\u00e9duction drastique du temps de prospection manuelle pour les clients"
        }
      ],
      project: {
        name: "Prospect-Pro - Plateforme de prospection B2B IA",
        stack: "Next.js, TypeScript, Python, PostgreSQL, IA avanc\u00e9e",
        demo: "https://prospect-pro-sgrq.vercel.app"
      },
      solutionDiagram: {
        nodes: [
          { id: 'user', label: 'Interface Admin', type: 'client' },
          { id: 'backend', label: 'FastAPI Backend', type: 'service' },
          { id: 'ai', label: 'OpenAI / LLM', type: 'ai' },
          { id: 'worker', label: 'Background Workers', type: 'service' },
          { id: 'db', label: 'PostgreSQL', type: 'database' }
        ],
        connections: [
          { from: 'user', to: 'backend' },
          { from: 'backend', to: 'ai' },
          { from: 'backend', to: 'worker' },
          { from: 'worker', to: 'db' }
        ]
      },
      impactGraph: [
        { label: 'Pr\u00e9cision', value: 85 },
        { label: 'Rapidit\u00e9', value: 90 },
        { label: 'Automatisation', value: 95 },
        { label: 'Conversion', value: 80 },
        { label: 'R\u00e9duction Co\u00fbts', value: 88 }
      ]
    },
    {
      id: "groupe-drapeau",
      title: "D\u00e9veloppeur Fullstack et Chef de projet",
      company: "Groupe Drapeau",
      dates: "Avril 2024 - Juillet 2024",
      description: "Plateforme web pour le g\u00e9nie civil, la location d'\u00e9quipements de construction et l'immobilier",
      coverImage: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/564508a5-e18e-4304-b909-f59e34b774ee/groupe-drapeau-cover-8d3d23cc-1770889910973.webp",
      stack: ["Node.js", "Next.js", "JavaScript", "HTML", "Flutter", "Tailwind CSS"],
      challenges: [
        "Digitalisation compl\u00e8te d'un processus de location d'\u00e9quipements physiques",
        "Gestion d'une \u00e9quipe technique en tant que chef de projet",
        "Optimisation SEO pour un march\u00e9 local comp\u00e9titif"
      ],
      achievements: [
        {
          title: "Digitalisation Immobili\u00e8re",
          description: "Cr\u00e9ation d'une plateforme intuitive pour la gestion de biens et locations"
        },
        {
          title: "Gestion de Projet",
          description: "Livraison r\u00e9ussie de la plateforme dans les d\u00e9lais impartis"
        }
      ],
      details: [
        "D\u00e9veloppement Fullstack : Conception et d\u00e9veloppement du site web de l'entreprise en utilisant Node.js, Next.js, JavaScript, HTML et Flutter.",
        "D\u00e9ploiement & Configuration : Gestion de la configuration du serveur."
      ],
      solutionDiagram: {
        nodes: [
          { id: 'web', label: 'Site Web (Next.js)', type: 'client' },
          { id: 'mobile', label: 'App Mobile (Flutter)', type: 'client' },
          { id: 'api', label: 'Node.js API', type: 'service' },
          { id: 'db', label: 'Database', type: 'database' }
        ],
        connections: [
          { from: 'web', to: 'api' },
          { from: 'mobile', to: 'api' },
          { from: 'api', to: 'db' }
        ]
      },
      impactGraph: [
        { label: 'Visibilit\u00e9', value: 90 },
        { label: 'Exp\u00e9rience Client', value: 85 },
        { label: 'Gestion Stock', value: 95 },
        { label: 'Digitalisation', value: 100 }
      ]
    }
  ],
  education: [
    {
      degree: "Autodidacte & Formations Spécialisées",
      degree_en: "Self-taught & Specialized Training",
      field: "Génie Logiciel & Fullstack Development",
      field_en: "Software Engineering & Fullstack Development",
      description: "Apprentissage intensif des technologies web modernes, de l'architecture logicielle et des principes de développement agile.",
      description_en: "Intensive learning of modern web technologies, software architecture, and agile development principles."
    }
  ],
  skills: {
    frontend: ["React.js", "Next.js", "React Native", "TypeScript", "Tailwind CSS", "Flutter"],
    backend: ["Node.js", "Express", "Python", "PostgreSQL", "Redis", "Microservices"],
    tools: ["Docker", "Git", "GitHub Actions", "CI/CD", "Vercel", "AWS"]
  }
};