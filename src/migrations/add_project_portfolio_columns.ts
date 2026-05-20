/**
 * Ajoute les colonnes du modèle Project nécessaires au portfolio Next.js:
 *  slug (unique), name, headline, result, metric, role, tech (jsonb),
 *  links (jsonb), featured (bool), category passée en STRING libre.
 *
 * Exécution: `tsx src/migrations/add_project_portfolio_columns.ts`
 *
 * Idempotent: chaque étape vérifie l'existence de la colonne avant ajout.
 * Backfill du slug fait sur place pour respecter la contrainte NOT NULL/UNIQUE.
 */
import 'dotenv/config';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { logger } from '../utils/logger.js';

const TABLE = 'projects';

function slugify(input: string): string {
  return (
    input
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'project'
  );
}

async function columnExists(column: string): Promise<boolean> {
  const rows = await sequelize.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_name = :table AND column_name = :column LIMIT 1`,
    { type: QueryTypes.SELECT, replacements: { table: TABLE, column } }
  );
  return rows.length > 0;
}

async function addColumnIfMissing(column: string, ddl: string): Promise<void> {
  if (await columnExists(column)) {
    logger.info(`[migration] column "${column}" already present, skipping`);
    return;
  }
  await sequelize.query(`ALTER TABLE ${TABLE} ADD COLUMN ${ddl}`);
  logger.info(`[migration] added column "${column}"`);
}

async function backfillSlug(): Promise<void> {
  const rows = await sequelize.query<{ id: string; title: string }>(
    `SELECT id, title FROM ${TABLE} WHERE slug IS NULL OR slug = ''`,
    { type: QueryTypes.SELECT }
  );

  if (rows.length === 0) {
    logger.info('[migration] no slug backfill needed');
    return;
  }

  const existing = await sequelize.query<{ slug: string }>(
    `SELECT slug FROM ${TABLE} WHERE slug IS NOT NULL AND slug <> ''`,
    { type: QueryTypes.SELECT }
  );
  const taken = new Set(existing.map((r) => r.slug));

  for (const row of rows) {
    const base = slugify(row.title || row.id);
    let candidate = base;
    let suffix = 2;
    while (taken.has(candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
    taken.add(candidate);

    await sequelize.query(
      `UPDATE ${TABLE} SET slug = :slug WHERE id = :id`,
      { replacements: { slug: candidate, id: row.id } }
    );
    logger.info(`[migration] project ${row.id} -> slug "${candidate}"`);
  }
}

async function backfillName(): Promise<void> {
  const updated = await sequelize.query(
    `UPDATE ${TABLE} SET name = title WHERE name IS NULL OR name = ''`
  );
  logger.info(`[migration] backfilled name from title (${JSON.stringify(updated[1])})`);
}

async function enforceConstraints(): Promise<void> {
  await sequelize.query(`ALTER TABLE ${TABLE} ALTER COLUMN slug SET NOT NULL`);
  await sequelize.query(`ALTER TABLE ${TABLE} ALTER COLUMN name SET NOT NULL`);

  const constraintRows = await sequelize.query<{ conname: string }>(
    `SELECT conname FROM pg_constraint WHERE conname = 'projects_slug_key'`,
    { type: QueryTypes.SELECT }
  );
  if (constraintRows.length === 0) {
    await sequelize.query(
      `ALTER TABLE ${TABLE} ADD CONSTRAINT projects_slug_key UNIQUE (slug)`
    );
    logger.info('[migration] added unique constraint projects_slug_key');
  }

  await sequelize.query(
    `CREATE INDEX IF NOT EXISTS projects_slug_idx ON ${TABLE}(slug)`
  );
}

async function relaxCategoryEnum(): Promise<void> {
  const rows = await sequelize.query<{ data_type: string }>(
    `SELECT data_type FROM information_schema.columns
     WHERE table_name = :table AND column_name = 'category'`,
    { type: QueryTypes.SELECT, replacements: { table: TABLE } }
  );
  const isEnum = rows[0]?.data_type === 'USER-DEFINED';
  if (!isEnum) {
    logger.info('[migration] category column is already free-form');
    return;
  }
  await sequelize.query(
    `ALTER TABLE ${TABLE} ALTER COLUMN category TYPE VARCHAR(120) USING category::text`
  );
  logger.info('[migration] category column relaxed to VARCHAR(120)');
}

async function run(): Promise<void> {
  await sequelize.authenticate();
  logger.info('[migration] connected to database');

  await addColumnIfMissing('slug', 'slug VARCHAR(255)');
  await addColumnIfMissing('name', 'name VARCHAR(255)');
  await addColumnIfMissing('headline', 'headline TEXT');
  await addColumnIfMissing('result', 'result TEXT');
  await addColumnIfMissing('metric', 'metric VARCHAR(255)');
  await addColumnIfMissing('role', 'role VARCHAR(255)');
  await addColumnIfMissing(
    'tech',
    "tech JSONB NOT NULL DEFAULT '[]'::jsonb"
  );
  await addColumnIfMissing(
    'links',
    "links JSONB NOT NULL DEFAULT '[]'::jsonb"
  );
  await addColumnIfMissing(
    'featured',
    'featured BOOLEAN NOT NULL DEFAULT false'
  );

  await backfillSlug();
  await backfillName();
  await enforceConstraints();
  await relaxCategoryEnum();

  logger.info('[migration] done');
  await sequelize.close();
}

run().catch((error) => {
  logger.error('[migration] failed', error);
  process.exit(1);
});
