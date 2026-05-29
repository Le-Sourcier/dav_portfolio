import { Router } from 'express';
import {
  getAllProjects,
  getAllAdminProjects,
  getAdminProjectById,
  getProjectById,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createProjectValidator,
  updateProjectValidator,
  projectIdValidator,
  projectSlugValidator,
} from '../validators/project.validator.js';

const router = Router();

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of projects
 */
router.get('/', getAllProjects);

router.get('/admin/projects', authMiddleware, adminMiddleware, getAllAdminProjects);
router.get('/admin/projects/:id', authMiddleware, adminMiddleware, validate(projectIdValidator), getAdminProjectById);

/**
 * @swagger
 * /api/projects/slug/{slug}:
 *   get:
 *     summary: Get project by slug
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$"
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 */
router.get('/slug/:slug', validate(projectSlugValidator), getProjectBySlug);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 */
router.get('/:id', validate(projectIdValidator), getProjectById);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Project created
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, adminMiddleware, validate(createProjectValidator), createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project updated
 *       404:
 *         description: Project not found
 */
router.put('/:id', authMiddleware, adminMiddleware, validate(updateProjectValidator), updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Project deleted
 *       404:
 *         description: Project not found
 */
router.delete('/:id', authMiddleware, adminMiddleware, validate(projectIdValidator), deleteProject);

export default router;
