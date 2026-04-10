import { Router } from 'express';
import { sendMessage, getQuickActions, getInitialMessage } from '../controllers/chatbot.controller.js';
import { body } from 'express-validator';
import { validate } from '../middlewares/validation.middleware.js';
import { chatbotLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

const messageValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 1000 })
    .withMessage('Message must be less than 1000 characters'),
  body('history')
    .optional()
    .isArray({ max: 20 })
    .withMessage('History must be an array of max 20 messages'),
  body('history.*.role')
    .optional()
    .isIn(['user', 'assistant'])
    .withMessage('Role must be user or assistant'),
  body('history.*.content')
    .optional()
    .isString()
    .isLength({ max: 2000 }),
  body('sessionId')
    .optional()
    .isString()
    .isLength({ max: 100 }),
];

/**
 * @swagger
 * /api/chatbot/message:
 *   post:
 *     summary: Send a message to the chatbot
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bot response
 */
router.post('/message', chatbotLimiter, validate(messageValidator), sendMessage);

/**
 * @swagger
 * /api/chatbot/quick-actions:
 *   get:
 *     summary: Get quick action suggestions
 *     tags: [Chatbot]
 *     responses:
 *       200:
 *         description: List of quick actions
 */
router.get('/quick-actions', getQuickActions);

/**
 * @swagger
 * /api/chatbot/initial:
 *   get:
 *     summary: Get initial greeting message
 *     tags: [Chatbot]
 *     responses:
 *       200:
 *         description: Initial message
 */
router.get('/initial', getInitialMessage);

export default router;
