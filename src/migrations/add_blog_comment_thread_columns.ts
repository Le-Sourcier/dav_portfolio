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

async function indexExists(
  queryInterface: QueryInterface,
  table: string,
  indexName: string,
): Promise<boolean> {
  const indexes = (await queryInterface.showIndex(table)) as Array<{
    name?: string;
  }>;
  return indexes.some((index) => index.name === indexName);
}

export async function up(queryInterface: QueryInterface): Promise<void> {
  if (!(await columnExists(queryInterface, "comments", "parent_id"))) {
    await queryInterface.addColumn("comments", "parent_id", {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "comments",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  }

  if (!(await columnExists(queryInterface, "comments", "mentions"))) {
    await queryInterface.addColumn("comments", "mentions", {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    });
  }

  if (!(await indexExists(queryInterface, "comments", "comments_parent_id"))) {
    await queryInterface.addIndex("comments", ["parent_id"], {
      name: "comments_parent_id",
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  if (await indexExists(queryInterface, "comments", "comments_parent_id")) {
    await queryInterface.removeIndex("comments", "comments_parent_id");
  }

  if (await columnExists(queryInterface, "comments", "mentions")) {
    await queryInterface.removeColumn("comments", "mentions");
  }

  if (await columnExists(queryInterface, "comments", "parent_id")) {
    await queryInterface.removeColumn("comments", "parent_id");
  }
}

if (process.argv[1]?.endsWith("add_blog_comment_thread_columns.ts")) {
  const queryInterface = sequelize.getQueryInterface();
  up(queryInterface)
    .then(async () => {
      console.log("Blog comment thread columns migration completed.");
      await sequelize.close();
    })
    .catch(async (error) => {
      console.error(error);
      await sequelize.close();
      process.exit(1);
    });
}
