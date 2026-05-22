import { body, query } from 'express-validator';

export const trackPageViewValidator = [
  body('path')
    .trim()
    .notEmpty()
    .withMessage('Path is required')
    .isLength({ max: 700 })
    .withMessage('Path is too long'),
  body('title').optional().trim().isLength({ max: 255 }).withMessage('Title is too long'),
  body('referrer').optional().trim().isLength({ max: 1000 }).withMessage('Referrer is too long'),
  body('locale').optional().trim().isLength({ max: 12 }).withMessage('Locale is too long'),
  body('visitorId').optional().trim().isLength({ max: 128 }).withMessage('Visitor ID is too long'),
];

export const analyticsPeriodValidator = [
  query('period')
    .optional()
    .isIn(['7d', '30d', '12m'])
    .withMessage('Invalid analytics period'),
];
