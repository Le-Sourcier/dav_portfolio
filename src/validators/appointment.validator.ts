import { body, param, query } from 'express-validator';

export const createAppointmentValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 255 })
    .withMessage('Subject must be less than 255 characters'),
  body('urgency')
    .optional()
    .trim()
    .isIn(['non-urgent', 'urgent'])
    .withMessage('Urgency must be non-urgent or urgent'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isDate()
    .withMessage('Invalid date format'),
  body('time')
    .trim()
    .notEmpty()
    .withMessage('Time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Invalid time format (HH:MM)'),
];

export const availableSlotsValidator = [
  query('date')
    .optional()
    .isDate()
    .withMessage('Invalid date format (YYYY-MM-DD)'),
];

export const appointmentIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid appointment ID'),
];

export const updateAppointmentStatusValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid appointment ID'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Invalid status'),
];
