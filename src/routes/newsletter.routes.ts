import { Router } from 'express';
import {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  getActiveSubscribers,
  getStats,
  sendArticle,
} from '../controllers/newsletter.controller.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { subscribeValidator, unsubscribeValidator, sendArticleValidator } from '../validators/newsletter.validator.js';
import { newsletterLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/newsletter/subscribe:
 *   post:
 *     summary: Subscribe to newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Subscribed successfully
 *       409:
 *         description: Already subscribed
 */
router.post('/subscribe', newsletterLimiter, validate(subscribeValidator), subscribe);

/**
 * @swagger
 * /api/newsletter/unsubscribe:
 *   post:
 *     summary: Unsubscribe from newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 *       404:
 *         description: Email not found
 */
router.post('/unsubscribe', newsletterLimiter, validate(unsubscribeValidator), unsubscribe);

/**
 * @swagger
 * /api/newsletter/subscribers:
 *   get:
 *     summary: Get all subscribers (admin only)
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subscribers
 */
router.get('/subscribers', authMiddleware, adminMiddleware, getAllSubscribers);

/**
 * @swagger
 * /api/newsletter/subscribers/active:
 *   get:
 *     summary: Get active subscribers (admin only)
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active subscribers
 */
router.get('/subscribers/active', authMiddleware, adminMiddleware, getActiveSubscribers);

/**
 * @swagger
 * /api/newsletter/stats:
 *   get:
 *     summary: Get newsletter statistics (admin only)
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Newsletter stats
 */
router.get('/stats', authMiddleware, adminMiddleware, getStats);

/**
 * @swagger
 * /api/newsletter/send-article:
 *   post:
 *     summary: Send article to all active subscribers (admin only)
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, excerpt, slug, category, readTime]
 *             properties:
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               slug:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               category:
 *                 type: string
 *               readTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Newsletter sent
 */
router.post('/send-article', authMiddleware, adminMiddleware, validate(sendArticleValidator), sendArticle);

export default router;
