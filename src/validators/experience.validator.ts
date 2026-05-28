import { body, param } from 'express-validator';

export const createExperienceValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company is required')
    .isLength({ max: 255 })
    .withMessage('Company must be less than 255 characters'),
  body('dates')
    .trim()
    .notEmpty()
    .withMessage('Dates is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location must be less than 255 characters'),
  body('stack')
    .optional()
    .isArray()
    .withMessage('Stack must be an array'),
  body('challenges')
    .optional()
    .isArray()
    .withMessage('Challenges must be an array'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean'),
  body('publishedAt')
    .optional({ nullable: true, values: 'falsy' })
    .isISO8601()
    .withMessage('Published date must be a valid date')
    .toDate(),
];

export const updateExperienceValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid experience ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Company must be less than 255 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location must be less than 255 characters'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean'),
  body('publishedAt')
    .optional({ nullable: true, values: 'falsy' })
    .isISO8601()
    .withMessage('Published date must be a valid date')
    .toDate(),
];

export const experienceIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid experience ID'),
];
