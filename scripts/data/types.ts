/**
 * Types partagés pour les seeds — re-exposent les attributs de création
 * des modèles en omettant les champs auto-gérés par Sequelize.
 *
 * Ces types servent UNIQUEMENT aux scripts de seed et ne doivent pas
 * être consommés par le code applicatif (utiliser les types des modèles
 * dans src/types/entities.types.ts à la place).
 */
import type {
  IBlogPost,
  IProject,
} from "../../src/types/entities.types.js";

/**
 * Forme d'un projet prêt à être passé à `Project.create()`.
 * On omet :
 *   - `id` (UUID auto)
 *   - `createdAt` / `updatedAt` (timestamps Sequelize)
 */
export type ProjectSeed = Omit<IProject, "id" | "createdAt" | "updatedAt">;

/**
 * Forme d'un article de blog prêt à être passé à `BlogPost.create()`.
 * On omet les compteurs et timestamps auto-gérés.
 */
export type BlogPostSeed = Omit<
  IBlogPost,
  "id" | "viewCount" | "shareCount" | "createdAt" | "updatedAt" | "comments"
>;
