import { body, param } from 'express-validator';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const linkSchema = (path: string) => [
  body(`${path}.*.label`).isString().trim().notEmpty().withMessage('Link label is required'),
  body(`${path}.*.href`).isString().trim().notEmpty().withMessage('Link href is required'),
];

export const createProjectValidator = [
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(slugPattern)
    .withMessage('Slug must be kebab-case (lowercase, digits, dashes)'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 }),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 120 }),
  body('image').trim().notEmpty().withMessage('Image URL is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('headline').optional().isString(),
  body('problem').trim().notEmpty().withMessage('Problem is required'),
  body('solution').trim().notEmpty().withMessage('Solution is required'),
  body('result').optional().isString(),
  body('metric').optional().isString().isLength({ max: 255 }),
  body('role').optional().isString().isLength({ max: 255 }),
  body('tech').optional().isArray().withMessage('Tech must be an array'),
  body('tech.*').optional().isString(),
  body('links').optional().isArray().withMessage('Links must be an array'),
  ...linkSchema('links'),
  body('featured').optional().isBoolean(),
  body('results').optional().isArray().withMessage('Results must be an array'),
  body('metrics').optional().isArray().withMessage('Metrics must be an array'),
  body('url').optional().trim().isURL().withMessage('Invalid project URL'),
];

export const updateProjectValidator = [
  param('id').isUUID().withMessage('Invalid project ID'),
  body('slug')
    .optional()
    .trim()
    .matches(slugPattern)
    .withMessage('Slug must be kebab-case (lowercase, digits, dashes)'),
  body('title').optional().trim().isLength({ max: 255 }),
  body('name').optional().trim().isLength({ max: 255 }),
  body('category').optional().trim().isLength({ max: 120 }),
  body('image').optional().trim(),
  body('headline').optional().isString(),
  body('result').optional().isString(),
  body('metric').optional().isString().isLength({ max: 255 }),
  body('role').optional().isString().isLength({ max: 255 }),
  body('tech').optional().isArray(),
  body('tech.*').optional().isString(),
  body('links').optional().isArray(),
  ...linkSchema('links'),
  body('featured').optional().isBoolean(),
  body('url').optional().trim().isURL().withMessage('Invalid project URL'),
];

export const projectIdValidator = [
  param('id').isUUID().withMessage('Invalid project ID'),
];

export const projectSlugValidator = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(slugPattern)
    .withMessage('Invalid slug format'),
];
