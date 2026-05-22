/**
 * Mini-runner pour seeder UNIQUEMENT les projets.
 *
 * Pourquoi : `scripts/seed.ts` orchestre tous les seeds et un échec dans
 * l'un d'eux bloque les autres. Ce script permet de remettre à jour la
 * table projects sans toucher au reste.
 *
 * Exécution : `npx tsx scripts/seed-projects-only.ts`
 *           ou `npm run db:seed:projects`
 */
import { connectDatabase } from "../src/config/database.js";
import { Project } from "../src/models/index.js";
import { logger } from "../src/utils/logger.js";
import { projectsSeed } from "./data/projects.seed.js";

async function run() {
  try {
    logger.info("Seeding projects only...");
    await connectDatabase();

    // Crée la table si elle n'existe pas (en cas de drop manuel).
    await Project.sync({ force: false });

    await Project.destroy({ where: {} });
    for (const project of projectsSeed) {
      await Project.create(project as never);
    }

    logger.info(`Seeded ${projectsSeed.length} projects`);
    process.exit(0);
  } catch (error) {
    console.error("Project seed failed:", error);
    if (error && typeof error === "object" && "parent" in error) {
      console.error("Parent error:", (error as { parent: unknown }).parent);
    }
    process.exit(1);
  }
}

run();
