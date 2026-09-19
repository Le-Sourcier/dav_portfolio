import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { connectDatabase, sequelize } from '../src/config/database.js';
import Settings from '../src/models/Settings.js';

const settingsSeedSchema = z.object({
  skills: z.object({
    frontend: z.array(z.string()),
    backend: z.array(z.string()),
    tools: z.array(z.string()),
  }),
  education: z.object({
    items: z.array(z.object({
      id: z.string(),
      degree: z.string(),
      field: z.string(),
      description: z.string(),
      degree_en: z.string().optional(),
      field_en: z.string().optional(),
      description_en: z.string().optional(),
    })),
  }),
});

async function seedAdminSettings(): Promise<void> {
  const inputPath = process.argv[2];
  if (!inputPath) throw new Error('Provide the exported admin settings JSON path');
  const seed = settingsSeedSchema.parse(JSON.parse(await readFile(inputPath, 'utf8')));
  await connectDatabase();
  for (const [key, value] of Object.entries(seed)) {
    const [, created] = await Settings.findOrCreate({ where: { key }, defaults: { key, value } });
    console.log(`${key}: ${created ? 'created' : 'preserved'}`);
  }
}

seedAdminSettings()
  .catch((error: Error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
