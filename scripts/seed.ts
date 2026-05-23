import { connectDatabase } from "../src/config/database.js";
import { config } from "../src/config/index.js";
import {
  Project,
  Experience,
  BlogPost,
  Comment,
  BlogView,
  Testimonial,
  Admin,
} from "../src/models/index.js";
import { logger } from "../src/utils/logger.js";
import { experiencesSeed } from "./data/experiences.seed.js";
import { projectsSeed } from "./data/projects.seed.js";
import { blogPostsSeed } from "./data/blog.seed.js";

const seedProjects = async () => {
  // Reset propre — la table projects est entièrement gérée par ce script.
  await Project.sync({ force: false });
  await Project.destroy({ where: {} });

  for (const project of projectsSeed) {
    await Project.create(project as any);
  }
  logger.info(`Seeded ${projectsSeed.length} projects`);
};

const seedExperiences = async () => {
  // Reset propre — la table experiences est entièrement gérée par ce script.
  await Experience.destroy({ where: {}, truncate: true, cascade: true });

  for (const exp of experiencesSeed) {
    await Experience.create(exp as any);
  }
  logger.info(`Seeded ${experiencesSeed.length} experiences`);
};

const seedBlogPosts = async () => {
  // Reset dans l'ordre : views et comments d'abord (FK), posts ensuite.
  await BlogPost.sync({ force: false });
  await Comment.sync({ force: false });
  await BlogView.sync({ force: false });
  await BlogView.destroy({ where: {} });
  await Comment.destroy({ where: {} });
  await BlogPost.destroy({ where: {} });

  for (const post of blogPostsSeed) {
    await BlogPost.create(post as any);
  }
  logger.info(`Seeded ${blogPostsSeed.length} blog posts`);
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
    // Update password from env to ensure it stays in sync
    await existingAdmin.update({ password: config.admin.password });
    logger.info("Admin user already exists — password synced from env");
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
