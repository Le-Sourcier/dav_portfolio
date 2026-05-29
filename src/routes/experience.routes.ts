import { Router } from 'express';
import {
  getAllExperiences,
  getAllAdminExperiences,
  getExperienceById,
  getAdminExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
} from '../controllers/experience.controller.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createExperienceValidator,
  updateExperienceValidator,
  experienceIdValidator,
} from '../validators/experience.validator.js';

const router = Router();

/**
 * @swagger
 * /api/experiences:
 *   get:
 *     summary: Get all experiences
 *     tags: [Experiences]
 *     responses:
 *       200:
 *         description: List of experiences
 */
router.get('/', getAllExperiences);

router.get('/admin/experiences', authMiddleware, adminMiddleware, getAllAdminExperiences);
router.get('/admin/experiences/:id', authMiddleware, adminMiddleware, validate(experienceIdValidator), getAdminExperienceById);

/**
 * @swagger
 * /api/experiences/{id}:
 *   get:
 *     summary: Get experience by ID
 *     tags: [Experiences]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Experience details
 *       404:
 *         description: Experience not found
 */
router.get('/:id', validate(experienceIdValidator), getExperienceById);

/**
 * @swagger
 * /api/experiences:
 *   post:
 *     summary: Create a new experience
 *     tags: [Experiences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Experience'
 *     responses:
 *       201:
 *         description: Experience created
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, adminMiddleware, validate(createExperienceValidator), createExperience);

/**
 * @swagger
 * /api/experiences/{id}:
 *   put:
 *     summary: Update an experience
 *     tags: [Experiences]
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
 *         description: Experience updated
 *       404:
 *         description: Experience not found
 */
router.put('/:id', authMiddleware, adminMiddleware, validate(updateExperienceValidator), updateExperience);

/**
 * @swagger
 * /api/experiences/{id}:
 *   delete:
 *     summary: Delete an experience
 *     tags: [Experiences]
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
 *         description: Experience deleted
 *       404:
 *         description: Experience not found
 */
router.delete('/:id', authMiddleware, adminMiddleware, validate(experienceIdValidator), deleteExperience);

export default router;
