import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // blog_posts
  await queryInterface.addColumn('blog_posts', 'title_en', { type: DataTypes.STRING(255), allowNull: true });
  await queryInterface.addColumn('blog_posts', 'excerpt_en', { type: DataTypes.TEXT, allowNull: true });
  await queryInterface.addColumn('blog_posts', 'content_en', { type: DataTypes.TEXT, allowNull: true });

  // projects
  await queryInterface.addColumn('projects', 'title_en', { type: DataTypes.STRING(255), allowNull: true });
  await queryInterface.addColumn('projects', 'description_en', { type: DataTypes.TEXT, allowNull: true });
  await queryInterface.addColumn('projects', 'problem_en', { type: DataTypes.TEXT, allowNull: true });
  await queryInterface.addColumn('projects', 'solution_en', { type: DataTypes.TEXT, allowNull: true });

  // experiences
  await queryInterface.addColumn('experiences', 'title_en', { type: DataTypes.STRING(255), allowNull: true });
  await queryInterface.addColumn('experiences', 'description_en', { type: DataTypes.TEXT, allowNull: true });

  // testimonials
  await queryInterface.addColumn('testimonials', 'content_en', { type: DataTypes.TEXT, allowNull: true });
  await queryInterface.addColumn('testimonials', 'role_en', { type: DataTypes.STRING(100), allowNull: true });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('blog_posts', 'title_en');
  await queryInterface.removeColumn('blog_posts', 'excerpt_en');
  await queryInterface.removeColumn('blog_posts', 'content_en');
  await queryInterface.removeColumn('projects', 'title_en');
  await queryInterface.removeColumn('projects', 'description_en');
  await queryInterface.removeColumn('projects', 'problem_en');
  await queryInterface.removeColumn('projects', 'solution_en');
  await queryInterface.removeColumn('experiences', 'title_en');
  await queryInterface.removeColumn('experiences', 'description_en');
  await queryInterface.removeColumn('testimonials', 'content_en');
  await queryInterface.removeColumn('testimonials', 'role_en');
}
