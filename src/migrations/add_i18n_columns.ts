import 'dotenv/config';
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

async function addColumnIfMissing(table: string, column: string, definition: string): Promise<void> {
  const tableInfo: { column_name: string }[] = await sequelize.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${column}'`,
    { type: 'SELECT' },
  );
  if (tableInfo.length > 0) {
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

  // projects
  await addColumnIfMissing('projects', 'title_en', 'VARCHAR(255)');
  await addColumnIfMissing('projects', 'description_en', 'TEXT');
  await addColumnIfMissing('projects', 'problem_en', 'TEXT');
  await addColumnIfMissing('projects', 'solution_en', 'TEXT');
  await addColumnIfMissing('projects', 'headline_en', 'TEXT');
  await addColumnIfMissing('projects', 'result_en', 'TEXT');
  await addColumnIfMissing('projects', 'metric_en', 'VARCHAR(255)');
  await addColumnIfMissing('projects', 'role_en', 'VARCHAR(255)');
  await addColumnIfMissing('projects', 'results_en', 'JSONB');

  // experiences
  await addColumnIfMissing('experiences', 'title_en', 'VARCHAR(255)');
  await addColumnIfMissing('experiences', 'description_en', 'TEXT');

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
