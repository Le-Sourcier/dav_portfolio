import { Router } from 'express';
import {
  getAllAppointments,
  getUpcomingAppointments,
  getAppointmentById,
  createAppointment,
  updateStatus,
  deleteAppointment,
  getAvailableSlots,
} from '../controllers/appointment.controller.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { appointmentLimiter } from '../middlewares/rateLimit.middleware.js';
import {
  createAppointmentValidator,
  appointmentIdValidator,
  updateAppointmentStatusValidator,
} from '../validators/appointment.validator.js';

const router = Router();

/**
 * @swagger
 * /api/appointments/available:
 *   get:
 *     summary: Get available time slots
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check availability
 *     responses:
 *       200:
 *         description: Available slots
 */
router.get('/available', getAvailableSlots);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Book an appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - date
 *               - time
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               urgency:
 *                 type: string
 *                 enum: [non-urgent, urgent]
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment booked
 *       409:
 *         description: Time slot already booked
 */
router.post('/', appointmentLimiter, validate(createAppointmentValidator), createAppointment);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments (admin only)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get('/', authMiddleware, adminMiddleware, getAllAppointments);

/**
 * @swagger
 * /api/appointments/upcoming:
 *   get:
 *     summary: Get upcoming appointments (admin only)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upcoming appointments
 */
router.get('/upcoming', authMiddleware, adminMiddleware, getUpcomingAppointments);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID (admin only)
 *     tags: [Appointments]
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
 *         description: Appointment details
 */
router.get('/:id', authMiddleware, adminMiddleware, validate(appointmentIdValidator), getAppointmentById);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status (admin only)
 *     tags: [Appointments]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', authMiddleware, adminMiddleware, validate(updateAppointmentStatusValidator), updateStatus);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Delete appointment (admin only)
 *     tags: [Appointments]
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
 *         description: Appointment deleted
 */
router.delete('/:id', authMiddleware, adminMiddleware, validate(appointmentIdValidator), deleteAppointment);

export default router;
