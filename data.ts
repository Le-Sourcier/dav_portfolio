
import { PortfolioData } from './types';

export const portfolioData: PortfolioData = {
  name: "Yao David Logan",
  role: "Développeur Fullstack & Software Engineer",
  bio: "Développeur fullstack passionné par la création de solutions logicielles robustes et évolutives. Spécialiste TypeScript, Node.js et React, je conçois des expériences numériques haute performance.",
  cvUrl: "/cv.pdf",
  contact: {
    email: "yaodavidlogan02@gmail.com",
    phone: "(+228) 91680967 / 96690680",
    github: "Le-Sourcier",
    linkedin: "yao-logan",
    address: "Lomé - TOGO"
  },
  skills: [
    {
      title: "Frontend & Mobile",
      skills: ["Next.js 14", "React 19", "Vue.js 3", "Flutter", "React Native", "TypeScript", "Tailwind CSS", "Shadcn/UI", "Framer Motion"]
    },
    {
      title: "Backend & API",
      skills: ["Node.js", "Bun", "Deno", "NestJS", ".NET Core", "Go", "gRPC", "GraphQL", "WebSockets"]
    },
    {
      title: "Data & Infra",
      skills: ["PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "Prisma", "Docker", "Kubernetes", "AWS"]
    }
  ],
  experiences: [
    {
      company: "Nexus Corporation",
      role: "Développeur Fullstack & Architecte Logiciel",
      period: "Août 2025 - Présent",
      location: "Lomé, Togo",
      description: "Conception d'une plateforme d'investissement financier modulaire.",
      tasks: [
        "Architecture Microservices avec Next.js 14, Node.js, PostgreSQL, Redis",
        "Développement Mobile Cross-platform avec React Native",
        "Système de Paiement Sécurisé avec chiffrement de bout en bout"
      ]
    },
    {
      company: "Ubuntu Consulting SARL",
      role: "Software Engineer & Expert en Automatisation",
      period: "Février 2025 – Octobre 2025",
      location: "Lomé, Togo",
      description: "Développement de solutions SaaS B2B et plateformes d'automatisation.",
      tasks: [
        "Plateforme Prospect-Pro : Prospection B2B par IA",
        "Automatisation de workflows complexes avec N8N et Make"
      ]
    }
  ],
  projects: [
    {
      title: "Prospect-Pro",
      description: "Plateforme de prospection B2B dopée à l'intelligence artificielle.",
      stack: ["Next.js", "TypeScript", "Python", "PostgreSQL", "OpenAI API"],
      category: "Professional",
      demoUrl: "https://prospect-pro-sgrq.vercel.app",
      featured: true
    },
    {
      title: "ServCraft",
      description: "Framework Backend Node.js Professionnel avec support natif RBAC et logs d'audit.",
      stack: ["TypeScript", "Fastify", "Prisma", "PostgreSQL"],
      category: "Open Source",
      githubUrl: "https://github.com/Le-Sourcier/servcraft",
      featured: true
    }
  ],
  npmPackages: [
    { name: "@le-sourcier/n8n-nodes-mailwizz", version: "1.0.1", downloads: "25K+" },
    { name: "n8n-nodes-gpt-oss", version: "0.1.0" }
  ],
  blogs: [
    {
      id: "3",
      title: "Implémenter un système d'authentification robuste",
      excerpt: "Un guide complet sur l'implémentation de JWT et Refresh Tokens dans un environnement Node.js moderne.",
      content: "L'authentification est le pilier de toute application web sérieuse. Voici comment nous structurons nos services.\n\nDans cet article, nous allons voir comment créer un middleware de validation de token et un service de gestion d'utilisateurs.\n\n### Middleware d'Auth\n\n```typescript\nimport { Request, Response, NextFunction } from 'express';\nimport jwt from 'jsonwebtoken';\n\nexport const authMiddleware = (req: Request, res: Response, next: NextFunction) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  \n  if (!token) return res.status(401).json({ message: 'Unauthorized' });\n\n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET!);\n    req.user = decoded;\n    next();\n  } catch (err) {\n    res.status(403).json({ message: 'Forbidden' });\n  }\n};\n```\n\n### Schéma Prisma\n\n```prisma\nmodel User {\n  id        String   @id @default(cuid())\n  email     String   @unique\n  password  String\n  role      Role     @default(USER)\n  createdAt DateTime @default(now())\n}\n```",
      date: "20 Mai 2025",
      category: "Code",
      tags: ["Auth", "Node.js", "Security", "Prisma"],
      readTime: "12 min",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80"
    },
    {
      id: "1",
      title: "Maîtriser TypeScript en 2025",
      excerpt: "Découvrez les fonctionnalités avancées de TypeScript qui feront de vous un développeur senior incontournable.",
      content: "TypeScript a radicalement changé la façon dont nous écrivons du code JavaScript. En 2025, maîtriser les types génériques et les utilitaires de types est essentiel.\n\n### Exemple de code générique\n\n```typescript\ninterface ApiResponse<T> {\n  status: number;\n  data: T;\n  message: string;\n}\n\nfunction fetchUser<T>(id: string): Promise<ApiResponse<T>> {\n  return fetch(`/api/users/${id}`).then(res => res.json());\n}\n\n// Utilisation\nconst user = await fetchUser<{ name: string }>( '123' );\nconsole.log(user.data.name);\n```\n\nL'inférence de type puissante permet de réduire les erreurs de runtime de près de 40% selon les dernières études en ingénierie logicielle.",
      date: "14 Mai 2025",
      category: "Engineering",
      tags: ["TypeScript", "Frontend", "Clean Code", "WebDev"],
      readTime: "5 min",
      image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80"
    },
    {
      id: "2",
      title: "L'essor de Bun et l'avenir de Node.js",
      excerpt: "Pourquoi Bun devient le runtime préféré des développeurs pour les nouveaux projets ?",
      content: "Bun n'est pas juste un autre runtime, c'est une révolution de performance.\n\n```javascript\n// Serveur HTTP ultra-rapide avec Bun\nBun.serve({\n  fetch(req) {\n    return new Response(\"Bun est incroyable!\");\n  },\n  port: 3000,\n});\n```\n\nLa rapidité d'exécution et le gestionnaire de paquets intégré font de Bun un choix de premier ordre pour les microservices modernes.",
      date: "2 Avril 2025",
      category: "Backend",
      tags: ["Bun", "Node.js", "Performance", "Backend"],
      readTime: "8 min",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80"
    }
  ]
};
