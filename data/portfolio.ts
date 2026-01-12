
import { PortfolioData } from '../types/index';

export const portfolioData: PortfolioData = {
  name: "Yao David Logan",
  role: "Développeur Fullstack & Software Engineer",
  bio: "Développeur passionné par la création de solutions logicielles robustes et évolutives. Expert en architecture microservices, automatisation avancée et intégration d'IA, je conçois des systèmes performants centrés sur l'utilisateur.",
  cvUrl: "/cv.pdf",
  contact: {
    email: "yaodavidlogan02@gmail.com",
    phone: "(+228) 91680967 / 96690680",
    github: "Le-Sourcier",
    linkedin: "yao-logan",
    address: "Lomé, Togo"
  },
  skills: [
    { 
      title: "Frontend & Mobile", 
      skills: ["Next.js 14", "React 18", "Vue.js 3", "Flutter", "React Native", "TypeScript", "Tailwind CSS", "Shadcn/UI", "Framer Motion", "Chart.js"] 
    },
    { 
      title: "Backend & API", 
      skills: ["Node.js", "Bun", "Deno", "NestJS", "Express", "Fastify", ".NET Core", "Go", "Python", "C#", "PHP", "gRPC", "GraphQL", "WebSockets"] 
    },
    { 
      title: "Data & Infrastructure", 
      skills: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Prisma", "AWS (EC2, S3, Lambda, RDS)", "Docker", "Kubernetes", "CI/CD (GitHub Actions, Jenkins)"] 
    },
    { 
      title: "Spécialités", 
      skills: ["IA/ML (GPT, NLP)", "Automatisation (N8N, Make)", "Paiements (Stripe, PayPal, Mobile Money)", "Sécurité (OWASP, RBAC)"] 
    }
  ],
  experiences: [
    {
      company: "Nexus Corporation",
      role: "Développeur Fullstack & Architecte Logiciel",
      period: "Août 2025 - Présent",
      location: "Lomé, Togo",
      description: "Conception et déploiement d'une plateforme d'investissement financier modulaire et d'une application mobile.",
      tasks: [
        "Architecture Microservices (Next.js 14, Node.js, PostgreSQL, Redis)",
        "Développement Mobile Cross-platform avec React Native",
        "Système de Paiement Sécurisé avec chiffrement de bout en bout",
        "Dashboard Analytique avec visualisation de données en temps réel"
      ]
    },
    {
      company: "Ubuntu Consulting SARL",
      role: "Software Engineer & Expert en Automatisation",
      period: "Février 2025 - Octobre 2025",
      location: "Lomé, Togo",
      description: "Développement de solutions SaaS B2B et plateformes d'automatisation intelligente.",
      tasks: [
        "Prospect-Pro : Plateforme de prospection B2B dopée à l'IA",
        "Scraping intelligent (Python/JS) pour Pages Jaunes, Pappers, GoAfrica",
        "Campagnes automatisées via N8N + MailWizz",
        "Intégration téléphonie Vapi + SIP (IllyVoIP, Vonage)"
      ]
    },
    {
      company: "IAFP La Pyramide",
      role: "Formateur en Développement",
      period: "Juillet 2024 - Mars 2025",
      location: "Lomé, Togo",
      description: "Enseignement des concepts fondamentaux et encadrement de projets fullstack.",
      tasks: [
        "Cours sur TypeScript, Next.js, Flutter et React Native",
        "Direction de projets pratiques et relectures de code",
        "Atteinte d'un taux de certification de 85%"
      ]
    }
  ],
  projects: [
    {
      title: "Prospect-Pro AI",
      description: "Plateforme de prospection B2B IA avec stack Next.js, Python et IA avancée.",
      stack: ["Next.js", "TypeScript", "Python", "PostgreSQL", "OpenAI"],
      category: "Professional",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      demoUrl: "https://prospect-pro-sgrq.vercel.app",
      featured: true
    },
    {
      title: "ServCraft",
      description: "Framework Backend Node.js Professionnel avec support natif RBAC et logs d'audit.",
      stack: ["TypeScript", "Fastify", "Prisma", "PostgreSQL"],
      category: "Open Source",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?w=800&q=80",
      githubUrl: "https://github.com/Le-Sourcier/servcraft",
      featured: true
    },
    {
      title: "RunWeek",
      description: "Plateforme de suivi sportif connecté avec intégration Garmin, Apple Watch, Samsung et Xiaomi.",
      stack: ["React", "Node.js", "IoT API"],
      category: "Personal",
      image: "https://images.unsplash.com/photo-1502904585520-fb451a0f2be3?w=800&q=80",
      demoUrl: "https://runweek.vercel.app"
    }
  ],
  npmPackages: [
    { name: "@le-sourcier/n8n-nodes-mailwizz", version: "1.0.1", downloads: "25K+" },
    { name: "n8n-nodes-mailwizz-ls", version: "2.1.13" },
    { name: "n8n-nodes-gpt-oss", version: "0.1.0" }
  ],
  blogs: [
    {
      id: "blog-security",
      title: "Sécurité : OWASP Top 10 et audits de code",
      excerpt: "Comment j'applique les principes de sécurité dès la conception pour protéger les données utilisateurs.",
      content: "La sécurité ne doit jamais être une réflexion après coup. Dans mes projets récents, j'intègre le chiffrement de bout en bout et des audits de code rigoureux.\n\n### Pourquoi l'OWASP Top 10 ?\nL'OWASP est la référence mondiale pour la sécurité des applications web. En tant qu'ingénieur, ignorer ces principes, c'est laisser la porte ouverte aux injections SQL, aux failles XSS et aux ruptures de contrôle d'accès.\n\n### Implémentation du RBAC (Role Based Access Control)\nDans mon framework **ServCraft**, j'ai implémenté un middleware natif pour la gestion des rôles :\n\n```typescript\nimport { FastifyRequest, FastifyReply } from 'fastify';\n\nexport const checkRole = (roles: string[]) => {\n  return async (req: FastifyRequest, reply: FastifyReply) => {\n    const user = req.user as { role: string };\n    if (!roles.includes(user.role)) {\n      return reply.status(403).send({\n        error: 'Forbidden',\n        message: 'Vous n\\'avez pas les permissions nécessaires.'\n      });\n    }\n  };\n};\n```\n\n### Chiffrement et Protection des Données\nNous utilisons AES-256-GCM pour les données sensibles au repos. Cela garantit non seulement la confidentialité mais aussi l'intégrité des données financières dans nos applications de paiement.",
      date: "10 Juillet 2025",
      category: "Security",
      tags: ["Security", "Architecture", "Best Practices"],
      readTime: "10 min",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80"
    },
    {
      id: "blog-nextjs-rsc",
      title: "L'ère des React Server Components avec Next.js 14",
      excerpt: "Exploration approfondie des composants serveur et de l'optimisation des performances frontend.",
      content: "Next.js 14 a consolidé le paradigme des Server Components (RSC). C'est un changement de mentalité majeur pour les développeurs React habitués au tout-client.\n\n### Les avantages immédiats\nLe principal gain est la réduction drastique du bundle JavaScript envoyé au client. Vos composants s'exécutent sur le serveur, accèdent directement à la base de données, et envoient du HTML pur.\n\n### Exemple de Fetching Direct\nFini les `useEffect` et les `useState` pour charger vos données initiales :\n\n```typescript\nimport { prisma } from '@/lib/prisma';\n\nexport default async function ProjectList() {\n  // Accès direct à la DB depuis le composant serveur !\n  const projects = await prisma.project.findMany({\n    where: { featured: true }\n  });\n\n  return (\n    <div className=\"grid gap-4\">\n      {projects.map(project => (\n        <ProjectCard key={project.id} data={project} />\n      ))}\n    </div>\n  );\n}\n```\n\n### Hydratation Sélective\nAvec les RSC, React hydrate uniquement les composants interactifs (marqués avec `'use client'`), ce qui améliore considérablement le Time to Interactive (TTI).",
      date: "15 Août 2025",
      category: "Frontend",
      tags: ["Next.js", "React", "Performance"],
      readTime: "8 min",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80"
    },
    {
      id: "blog-bun-grpc",
      title: "Microservices : Bun, gRPC et Haute Performance",
      excerpt: "Pourquoi j'ai choisi de migrer certains services critiques de Node.js vers Bun avec des communications gRPC.",
      content: "Dans un environnement de microservices, la latence réseau et le temps de démarrage des runtimes sont critiques. Bun et gRPC forment un duo redoutable.\n\n### Bun : Plus qu'un runtime\nBun n'est pas seulement rapide pour l'exécution, il l'est aussi pour le package management. Son démarrage quasi instantané est parfait pour les environnements Serverless et Kubernetes.\n\n### gRPC vs REST\ngRPC utilise HTTP/2 et Protocol Buffers (protobuf) pour sérialiser les données. C'est beaucoup plus léger et rapide que le JSON traditionnel.\n\n### Définition Protobuf\n\n```protobuf\nsyntax = \"proto3\";\n\nservice PaymentService {\n  rpc ProcessPayment (PaymentRequest) returns (PaymentResponse) {}\n}\n\nmessage PaymentRequest {\n  string user_id = 1;\n  double amount = 2;\n  string currency = 3;\n}\n\nmessage PaymentResponse {\n  string transaction_id = 1;\n  string status = 2;\n}\n```\n\n### Performance Comparison\nDans nos tests chez **Nexus Corporation**, la communication gRPC a réduit la latence inter-services de 60% par rapport à nos anciennes API REST en JSON.",
      date: "02 Septembre 2025",
      category: "Backend",
      tags: ["Bun", "gRPC", "Microservices", "Architecture"],
      readTime: "12 min",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?w=800&q=80"
    },
    {
      id: "blog-ai-agents",
      title: "Développer des Agents IA Autonomes",
      excerpt: "Comment intégrer des modèles LLM pour créer des assistants qui ne font pas que répondre, mais agissent.",
      content: "L'IA ne se limite plus à la génération de texte. Aujourd'hui, nous développons des agents capables d'utiliser des outils, de naviguer sur le web et d'automatiser des workflows complexes.\n\n### Le concept de Function Calling\nC'est la clé de l'autonomie. On définit des outils que l'IA peut appeler lorsqu'elle en a besoin.\n\n```typescript\nconst controlLightFunction = {\n  name: 'controlLight',\n  description: 'Allume ou éteint les lumières d\\'une pièce.',\n  parameters: {\n    type: 'object',\n    properties: {\n      room: { type: 'string' },\n      state: { type: 'boolean' }\n    }\n  }\n};\n\n// L'IA décide d'appeler cette fonction si l'utilisateur dit \n// \"Éteins la lumière du salon\"\n```\n\n### RAG (Retrieval Augmented Generation)\nPour que l'IA soit pertinente dans un contexte métier (comme mon assistant **Logan AI**), nous utilisons le RAG pour lui donner accès à une base de connaissances privée et mise à jour en temps réel.\n\n### L'avenir est aux multi-agents\nImaginez un agent qui planifie, un autre qui code, et un troisième qui teste. C'est l'architecture que nous explorons pour nos futures plateformes d'automatisation chez **Ubuntu Consulting**.",
      date: "20 Septembre 2025",
      category: "AI",
      tags: ["AI", "LLM", "Automation", "Innovation"],
      readTime: "15 min",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80"
    }
  ]
};
