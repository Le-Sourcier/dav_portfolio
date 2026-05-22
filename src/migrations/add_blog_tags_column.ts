import { DataTypes, QueryInterface } from "sequelize";
import { sequelize } from "../config/database.js";

async function columnExists(
  queryInterface: QueryInterface,
  table: string,
  column: string,
): Promise<boolean> {
  const description = await queryInterface.describeTable(table);
  return Object.prototype.hasOwnProperty.call(description, column);
}

export async function up(queryInterface: QueryInterface): Promise<void> {
  if (!(await columnExists(queryInterface, "blog_posts", "tags"))) {
    await queryInterface.addColumn("blog_posts", "tags", {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  if (await columnExists(queryInterface, "blog_posts", "tags")) {
    await queryInterface.removeColumn("blog_posts", "tags");
  }
}

if (process.argv[1]?.endsWith("add_blog_tags_column.ts")) {
  const queryInterface = sequelize.getQueryInterface();
  up(queryInterface)
    .then(async () => {
      console.log("Blog tags column migration completed.");
      await sequelize.close();
    })
    .catch(async (error) => {
      console.error(error);
      await sequelize.close();
      process.exit(1);
    });
}
