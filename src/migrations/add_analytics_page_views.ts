import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('analytics_page_views', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    referrer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    locale: {
      type: DataTypes.STRING(12),
      allowNull: true,
    },
    visitor_hash: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    consent: {
      type: DataTypes.ENUM('analytics'),
      allowNull: false,
      defaultValue: 'analytics',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.addIndex('analytics_page_views', ['created_at']);
  await queryInterface.addIndex('analytics_page_views', ['path']);
  await queryInterface.addIndex('analytics_page_views', ['visitor_hash']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('analytics_page_views');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_analytics_page_views_consent";');
}
