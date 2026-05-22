/**
 * Mini-runner pour seeder UNIQUEMENT les expériences professionnelles.
 *
 * Pourquoi : `scripts/seed.ts` orchestre tous les seeds (projects, blog, etc.)
 * et un échec dans l'un d'eux bloque les autres. Ce script permet de remettre
 * à jour la table experiences sans toucher au reste.
 *
 * Exécution: `npx tsx scripts/seed-experiences-only.ts`
 */
import { connectDatabase } from '../src/config/database.js';
import { Experience } from '../src/models/index.js';
import { logger } from '../src/utils/logger.js';
import { experiencesSeed } from './data/experiences.seed.js';

async function run() {
  try {
    logger.info('Seeding experiences only...');
    await connectDatabase();

    // Crée la table si elle n'existe pas (la table a été drop manuellement).
    // `force: false` = ne touche pas si elle existe déjà.
    await Experience.sync({ force: false });

    await Experience.destroy({ where: {} });
    for (const exp of experiencesSeed) {
      await Experience.create(exp as any);
    }

    logger.info(`Seeded ${experiencesSeed.length} experiences`);
    process.exit(0);
  } catch (error) {
    console.error('Experience seed failed:', error);
    if (error && typeof error === 'object' && 'parent' in error) {
      console.error('Parent error:', (error as { parent: unknown }).parent);
    }
    process.exit(1);
  }
}

run();
