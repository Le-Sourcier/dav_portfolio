/**
 * Mini-runner pour seeder UNIQUEMENT les articles de blog.
 *
 * Reset propre :
 *   - Comments et BlogViews sont liés par FK et seront supprimés en cascade
 *     (cf. modèle Comment qui appartient à BlogPost).
 *
 * Exécution : `npx tsx scripts/seed-blog-only.ts`
 *           ou `npm run db:seed:blog`
 */
import { connectDatabase } from "../src/config/database.js";
import { BlogPost, Comment, BlogView } from "../src/models/index.js";
import { logger } from "../src/utils/logger.js";
import { blogPostsSeed } from "./data/blog.seed.js";

async function run() {
  try {
    logger.info("Seeding blog posts only...");
    await connectDatabase();

    // Crée les tables si elles n'existent pas (en cas de drop manuel).
    await BlogPost.sync({ force: false });
    await Comment.sync({ force: false });
    await BlogView.sync({ force: false });

    // Reset dans l'ordre : views et comments d'abord (FK), posts ensuite.
    await BlogView.destroy({ where: {} });
    await Comment.destroy({ where: {} });
    await BlogPost.destroy({ where: {} });

    for (const post of blogPostsSeed) {
      await BlogPost.create(post as never);
    }

    logger.info(`Seeded ${blogPostsSeed.length} blog posts`);
    process.exit(0);
  } catch (error) {
    console.error("Blog seed failed:", error);
    if (error && typeof error === "object" && "parent" in error) {
      console.error("Parent error:", (error as { parent: unknown }).parent);
    }
    process.exit(1);
  }
}

run();
