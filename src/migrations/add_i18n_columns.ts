import 'dotenv/config';
import { DataTypes, QueryTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

async function addColumnIfMissing(table: string, column: string, definition: string): Promise<void> {
  const rows = await sequelize.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name = :table AND column_name = :column LIMIT 1`,
    { type: QueryTypes.SELECT, replacements: { table, column } },
  );
  if (rows.length > 0) {
    console.log(`[migration] column "${table}"."${column}" already present, skipping`);
    return;
  }
  await sequelize.query(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition}`);
  console.log(`[migration] added column "${table}"."${column}"`);
}

async function run(): Promise<void> {
  await sequelize.authenticate();
  console.log('[migration] connected to database');

  // blog_posts
  await addColumnIfMissing('blog_posts', 'title_en', 'VARCHAR(255)');
  await addColumnIfMissing('blog_posts', 'excerpt_en', 'TEXT');
  await addColumnIfMissing('blog_posts', 'content_en', 'TEXT');
  await addColumnIfMissing('blog_posts', 'published_at', 'TIMESTAMP WITH TIME ZONE');
  await addColumnIfMissing('blog_posts', 'newsletter_sent_at', 'TIMESTAMP WITH TIME ZONE');

  // projects
  await addColumnIfMissing('projects', 'title_en', 'VARCHAR(255)');
  await addColumnIfMissing('projects', 'category_en', 'VARCHAR(120)');
  await addColumnIfMissing('projects', 'description_en', 'TEXT');
  await addColumnIfMissing('projects', 'problem_en', 'TEXT');
  await addColumnIfMissing('projects', 'solution_en', 'TEXT');
  await addColumnIfMissing('projects', 'headline_en', 'TEXT');
  await addColumnIfMissing('projects', 'result_en', 'TEXT');
  await addColumnIfMissing('projects', 'metric_en', 'VARCHAR(255)');
  await addColumnIfMissing('projects', 'role_en', 'VARCHAR(255)');
  await addColumnIfMissing('projects', 'results_en', 'JSONB');
  await addColumnIfMissing('projects', 'published', 'BOOLEAN NOT NULL DEFAULT TRUE');
  await addColumnIfMissing('projects', 'published_at', 'TIMESTAMP WITH TIME ZONE');

  // experiences
  await addColumnIfMissing('experiences', 'title_en', 'VARCHAR(255)');
  await addColumnIfMissing('experiences', 'description_en', 'TEXT');
  await addColumnIfMissing('experiences', 'published', 'BOOLEAN NOT NULL DEFAULT TRUE');
  await addColumnIfMissing('experiences', 'published_at', 'TIMESTAMP WITH TIME ZONE');

  // newsletter
  await addColumnIfMissing('newsletter_subscribers', 'locale', "VARCHAR(5) NOT NULL DEFAULT 'fr'");

  // testimonials
  await addColumnIfMissing('testimonials', 'content_en', 'TEXT');
  await addColumnIfMissing('testimonials', 'role_en', 'VARCHAR(100)');

  console.log('[migration] done');
  await sequelize.close();
}

run().catch((error) => {
  console.error('[migration] failed', error);
  process.exit(1);
});
