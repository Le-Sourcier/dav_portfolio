import { DataTypes } from 'sequelize';
import { randomUUID } from 'crypto';
import { sequelize } from '../config/database.js';
import { generateSlug } from '../utils/helpers.js';

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const [rows] = await sequelize.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = :tableName AND column_name = :columnName`,
    { replacements: { tableName, columnName } },
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function tableExists(tableName: string): Promise<boolean> {
  const [rows] = await sequelize.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = :tableName`,
    { replacements: { tableName } },
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function run() {
  const queryInterface = sequelize.getQueryInterface();

  if (!(await tableExists('blog_tags'))) {
    await queryInterface.createTable('blog_tags', {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: { type: DataTypes.STRING(80), allowNull: false, unique: true },
      slug: { type: DataTypes.STRING(120), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      color: { type: DataTypes.STRING(32), allowNull: true },
      isVisible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    });
  }

  if (!(await tableExists('blog_post_tags'))) {
    await queryInterface.createTable('blog_post_tags', {
      postId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'blog_posts', key: 'id' },
        onDelete: 'CASCADE',
      },
      tagId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'blog_tags', key: 'id' },
        onDelete: 'CASCADE',
      },
    });
  }

  if (!(await columnExists('blog_posts', 'tags'))) {
    await queryInterface.addColumn('blog_posts', 'tags', {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    });
  }

  const [posts] = await sequelize.query(
    `SELECT id, tags FROM blog_posts WHERE tags IS NOT NULL AND jsonb_array_length(tags) > 0`,
  );

  for (const post of posts as Array<{ id: string; tags: string[] }>) {
    for (const rawName of post.tags || []) {
      const name = String(rawName).trim();
      if (!name) continue;
      const slug = generateSlug(name);
      const [tagRows] = await sequelize.query(
        `INSERT INTO blog_tags ("id", "name", "slug", "isVisible", "createdAt", "updatedAt")
         VALUES (:id, :name, :slug, true, NOW(), NOW())
         ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name"
         RETURNING "id"`,
        { replacements: { id: randomUUID(), name, slug } },
      );
      const tagId = (tagRows as Array<{ id: string }>)[0]?.id;
      if (!tagId) continue;
      await sequelize.query(
        `INSERT INTO blog_post_tags ("postId", "tagId")
         VALUES (:postId, :tagId)
         ON CONFLICT DO NOTHING`,
        { replacements: { postId: post.id, tagId } },
      );
    }
  }

  console.log('Blog tags taxonomy migration completed.');
}

run()
  .then(() => sequelize.close())
  .catch(async (error) => {
    console.error(error);
    await sequelize.close();
    process.exit(1);
  });
