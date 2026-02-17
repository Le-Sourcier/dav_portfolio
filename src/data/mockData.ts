import { SolutionDiagramData, ImpactData } from './cvData';

export interface ProjectMetric {
  name: string;
  value: number;
  previousValue: number;
  unit: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface Project {
  id: string;
  title: string;
  category: 'UI/UX' | 'Branding' | 'Web' | 'Art' | 'Photo' | 'Fullstack' | 'Software';
  image: string;
  description: string;
  problem: string;
  solution: string;
  results: string[];
  metrics: ProjectMetric[];
  chartData: ChartData[];
  url?: string;
  solutionDiagram?: SolutionDiagramData;
  impactGraph?: ImpactData[];
}


export const PROJECTS: Project[] = [
  {
    id: "nexus-corp",
    title: "Nexus Platform",
    category: "Fullstack",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/564508a5-e18e-4304-b909-f59e34b774ee/project-webdev-97b00c0c-1770728430056.webp",
    description: "Une plateforme d'investissement financier robuste avec architecture microservices.",
    problem: "N\u00e9cessit\u00e9 d'une infrastructure hautement scalable capable de g\u00e9rer des transactions financi\u00e8res s\u00e9curis\u00e9es en temps r\u00e9el.",
    solution: "Architecture Microservices avec Next.js 14, Node.js et PostgreSQL, int\u00e9grant Redis pour le caching et des WebSockets pour le temps r\u00e9el.",
    results: [
      "Syst\u00e8me de paiement s\u00e9curis\u00e9 multi-passerelles",
      "Dashboard analytique temps r\u00e9el",
      "Architecture modulaire et \u00e9volutive"
    ],
    metrics: [
      { name: "Scalabilit\u00e9", value: 95, previousValue: 40, unit: "%" },
      { name: "Uptime", value: 99.9, previousValue: 98, unit: "%" },
      { name: "Vitesse", value: 0.8, previousValue: 2.5, unit: "s" }
    ],
    chartData: [
      { name: "T1", value: 400 },
      { name: "T2", value: 1200 },
      { name: "T3", value: 2800 },
      { name: "T4", value: 4500 }
    ],
    url: "https://nexuscorporat.com",
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
    id: "prospect-pro",
    title: "Prospect-Pro AI",
    category: "Software",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/564508a5-e18e-4304-b909-f59e34b774ee/project-uiux-fa90eb77-1770728430779.webp",
    description: "Plateforme de prospection B2B augment\u00e9e par l'Intelligence Artificielle.",
    problem: "Les processus de prospection manuels \u00e9taient lents et peu pr\u00e9cis pour les entreprises B2B.",
    solution: "Automatisation via IA (Python/TypeScript) pour le scoring de leads et la personnalisation des messages de contact.",
    results: [
      "Augmentation de 60% du taux de conversion",
      "Gain de temps de 15h/semaine pour les \u00e9quipes sales",
      "Int\u00e9gration transparente avec les CRM majeurs"
    ],
    metrics: [
      { name: "Pr\u00e9cision IA", value: 92, previousValue: 50, unit: "%" },
      { name: "Leads/mois", value: 850, previousValue: 200, unit: "n" },
      { name: "ROI", value: 3.5, previousValue: 1.2, unit: "x" }
    ],
    chartData: [
      { name: "Jan", value: 200 },
      { name: "F\u00e9v", value: 450 },
      { name: "Mar", value: 800 },
      { name: "Avr", value: 1500 }
    ],
    url: "https://prospect-pro-sgrq.vercel.app",
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
    title: "Drapeau Immo",
    category: "Web",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/564508a5-e18e-4304-b909-f59e34b774ee/project-branding-3717b1d4-1770728434911.webp",
    description: "Plateforme web compl\u00e8te pour le g\u00e9nie civil et l'immobilier.",
    problem: "Le Groupe Drapeau manquait d'une pr\u00e9sence digitale centralis\u00e9e pour ses multiples activit\u00e9s (construction, location, immobilier).",
    solution: "D\u00e9veloppement d'un portail multiservices avec Node.js et Flutter pour une exp\u00e9rience web et mobile unifi\u00e9e.",
    results: [
      "Centralisation de 100% du catalogue immobilier",
      "Syst\u00e8me de r\u00e9servation en ligne int\u00e9gr\u00e9",
      "Am\u00e9lioration de la visibilit\u00e9 de marque de 200%"
    ],
    metrics: [
      { name: "Visites", value: 15, previousValue: 2, unit: "k" },
      { name: "R\u00e9sas", value: 45, previousValue: 5, unit: "%" },
      { name: "Support", value: -40, previousValue: 0, unit: "%" }
    ],
    chartData: [
      { name: "Sem 1", value: 100 },
      { name: "Sem 2", value: 350 },
      { name: "Sem 3", value: 700 },
      { name: "Sem 4", value: 1200 }
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
];

