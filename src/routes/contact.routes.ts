import { Router } from 'express';
import {
  getAllContacts,
  getContactById,
  createContact,
  markAsRead,
  replyToContact,
  deleteContact,
  getUnreadCount,
} from '../controllers/contact.controller.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { createContactValidator, contactIdValidator, replyContactValidator } from '../validators/contact.validator.js';
import { contactLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Send a contact message
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post('/', contactLimiter, validate(createContactValidator), createContact);

/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: Get all contact messages (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of messages
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, adminMiddleware, getAllContacts);

/**
 * @swagger
 * /api/contact/unread:
 *   get:
 *     summary: Get unread message count (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get('/unread', authMiddleware, adminMiddleware, getUnreadCount);

/**
 * @swagger
 * /api/contact/{id}:
 *   get:
 *     summary: Get contact message by ID (admin only)
 *     tags: [Contact]
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
 *         description: Message details
 *       404:
 *         description: Message not found
 */
router.get('/:id', authMiddleware, adminMiddleware, validate(contactIdValidator), getContactById);

/**
 * @swagger
 * /api/contact/{id}/read:
 *   patch:
 *     summary: Mark message as read (admin only)
 *     tags: [Contact]
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
 *         description: Message marked as read
 */
router.patch('/:id/read', authMiddleware, adminMiddleware, validate(contactIdValidator), markAsRead);

/**
 * @swagger
 * /api/contact/{id}/reply:
 *   post:
 *     summary: Reply to a contact message (admin only)
 *     tags: [Contact]
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
 *             type: object
 *             required:
 *               - reply
 *             properties:
 *               reply:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply sent
 *       404:
 *         description: Message not found
 */
router.post('/:id/reply', authMiddleware, adminMiddleware, validate(replyContactValidator), replyToContact);

/**
 * @swagger
 * /api/contact/{id}:
 *   delete:
 *     summary: Delete a message (admin only)
 *     tags: [Contact]
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
 *         description: Message deleted
 */
router.delete('/:id', authMiddleware, adminMiddleware, validate(contactIdValidator), deleteContact);

export default router;
