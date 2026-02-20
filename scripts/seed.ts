import { connectDatabase } from "../src/config/database.js";
import { config } from "../src/config/index.js";
import {
  Project,
  Experience,
  BlogPost,
  Testimonial,
  Admin,
} from "../src/models/index.js";
import { logger } from "../src/utils/logger.js";

const seedProjects = async () => {
  const projects = [
    {
      title: "Nexus Platform",
      category: "Fullstack",
      image:
        "https://storage.googleapis.com/dala-prod-public-storage/generated-images/564508a5-e18e-4304-b909-f59e34b774ee/project-webdev-97b00c0c-1770728430056.webp",
      description:
        "Une plateforme d'investissement financier robuste avec architecture microservices.",
      problem:
        "Necessite d'une infrastructure hautement scalable capable de gerer des transactions financieres securisees en temps reel.",
      solution:
        "Architecture Microservices avec Next.js 14, Node.js et PostgreSQL, integrant Redis pour le caching et des WebSockets pour le temps reel.",
      results: [
        "Systeme de paiement securise multi-passerelles",
        "Dashboard analytique temps reel",
        "Architecture modulaire et evolutive",
      ],
      metrics: [
        { name: "Scalabilite", value: 95, previousValue: 40, unit: "%" },
        { name: "Uptime", value: 99.9, previousValue: 98, unit: "%" },
        { name: "Vitesse", value: 0.8, previousValue: 2.5, unit: "s" },
      ],
      chartData: [
        { name: "T1", value: 400 },
        { name: "T2", value: 1200 },
        { name: "T3", value: 2800 },
        { name: "T4", value: 4500 },
      ],
      url: "https://nexuscorporat.com",
    },
    {
      title: "Prospect-Pro AI",
      category: "Software",
      image:
        "https://storage.googleapis.com/dala-prod-public-storage/generated-images/564508a5-e18e-4304-b909-f59e34b774ee/project-uiux-fa90eb77-1770728430779.webp",
      description:
        "Plateforme de prospection B2B augmentee par l'Intelligence Artificielle.",
      problem:
        "Les processus de prospection manuels etaient lents et peu precis pour les entreprises B2B.",
      solution:
        "Automatisation via IA (Python/TypeScript) pour le scoring de leads et la personnalisation des messages de contact.",
      results: [
        "Augmentation de 60% du taux de conversion",
        "Gain de temps de 15h/semaine",
        "Integration transparente avec les CRM majeurs",
      ],
      metrics: [
        { name: "Precision IA", value: 92, previousValue: 50, unit: "%" },
        { name: "Leads/mois", value: 850, previousValue: 200, unit: "n" },
        { name: "ROI", value: 3.5, previousValue: 1.2, unit: "x" },
      ],
      chartData: [
        { name: "Jan", value: 200 },
        { name: "Fev", value: 450 },
        { name: "Mar", value: 800 },
        { name: "Avr", value: 1500 },
      ],
      url: "https://prospect-pro-sgrq.vercel.app",
    },
  ];

  for (const project of projects) {
    await Project.create(project as any);
  }
  logger.info(`Seeded ${projects.length} projects`);
};

const seedExperiences = async () => {
  const experiences = [
    {
      title: "Developpeur Fullstack & Architecte Logiciel",
      company: "Nexus Corporation",
      location: "Lome, Togo",
      dates: "Aout 2025 - Present",
      description:
        "Plateforme d'investissement financier et application mobile",
      stack: [
        "Next.js 14",
        "Node.js",
        "PostgreSQL",
        "Redis",
        "React Native",
        "TypeScript",
      ],
      challenges: [
        "Gestion de la haute disponibilite pour une plateforme financiere critique",
        "Optimisation des performances de l'application mobile",
        "Mise en place d'une architecture microservices evolutive",
      ],
    },
    {
      title: "Developpeur Fullstack",
      company: "YAO.",
      location: "Remote",
      dates: "Janvier 2024 - Juillet 2025",
      description:
        "Plateforme de formation en ligne et marketplace de talents tech",
      stack: ["React", "Node.js", "MongoDB", "AWS"],
      challenges: [
        "Integration de systemes de paiement africains",
        "Optimisation pour connexions bas debit",
      ],
    },
  ];

  for (const exp of experiences) {
    await Experience.create(exp as any);
  }
  logger.info(`Seeded ${experiences.length} experiences`);
};

const seedBlogPosts = async () => {
  const posts = [
    {
      title: "L'avenir du design minimaliste dans le web moderne",
      slug: "avenir-design-minimaliste-web-moderne",
      excerpt:
        "Decouvrez comment le minimalisme continue de faconner nos experiences numeriques en 2025.",
      content:
        "<p>Le minimalisme n'est pas seulement une absence de decoration, c'est une quete de l'essentiel...</p>",
      category: "Design",
      imageUrl:
        "https://storage.googleapis.com/dala-prod-public-storage/generated-images/564508a5-e18e-4304-b909-f59e34b774ee/future-of-design-9fa925ad-1770729236550.webp",
      readTime: "5 min de lecture",
      author: "Yao David Logan",
      published: true,
    },
    {
      title: "L'impact de l'IA sur le developpement frontend",
      slug: "impact-ia-developpement-frontend",
      excerpt:
        "Comment les nouveaux outils d'IA transforment la maniere dont nous concevons les interfaces.",
      content: "<p>L'IA ne remplace pas le developpeur, elle l'augmente...</p>",
      category: "Technologie",
      imageUrl:
        "https://storage.googleapis.com/dala-prod-public-storage/generated-images/564508a5-e18e-4304-b909-f59e34b774ee/the-power-of-connection-5bc9afc2-1770729236444.webp",
      readTime: "6 min de lecture",
      author: "Yao David Logan",
      published: true,
    },
  ];

  for (const post of posts) {
    await BlogPost.create(post as any);
  }
  logger.info(`Seeded ${posts.length} blog posts`);
};

const seedTestimonials = async () => {
  const testimonials = [
    {
      name: "Sophie Martin",
      role: "CEO",
      company: "TechStart",
      content:
        "David a transforme notre vision en une realite fonctionnelle. Son expertise technique et sa comprehension des besoins business sont remarquables.",
      rating: 5,
      visible: true,
    },
    {
      name: "Jean Kouadio",
      role: "Product Manager",
      company: "AfricaTech",
      content:
        "Un developpeur exceptionnel qui livre toujours au-dela des attentes. Sa maitrise de l'architecture logicielle a ete determinante pour notre projet.",
      rating: 5,
      visible: true,
    },
  ];

  for (const testimonial of testimonials) {
    await Testimonial.create(testimonial as any);
  }
  logger.info(`Seeded ${testimonials.length} testimonials`);
};

const seedAdmin = async () => {
  const existingAdmin = await Admin.findOne({
    where: { email: config.admin.email },
  });
  if (!existingAdmin) {
    // Password will be hashed by the Admin model's beforeCreate hook
    await Admin.create({
      email: config.admin.email,
      password: config.admin.password,
      name: "Yao Logan",
      role: "super_admin",
    });
    logger.info("Created admin user");
  } else {
    logger.info("Admin user already exists");
  }
};

const seed = async () => {
  try {
    logger.info("Starting database seed...");
    await connectDatabase();

    await seedAdmin();
    await seedProjects();
    await seedExperiences();
    await seedBlogPosts();
    await seedTestimonials();

    logger.info("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    logger.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
