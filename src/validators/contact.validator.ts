import { body, param } from 'express-validator';

export const createContactValidator = [
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
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Subject must be less than 255 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters'),
];

export const contactIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid contact ID'),
];

export const replyContactValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid contact ID'),
  body('reply')
    .trim()
    .notEmpty()
    .withMessage('Reply is required')
    .isLength({ min: 10 })
    .withMessage('Reply must be at least 10 characters'),
];
