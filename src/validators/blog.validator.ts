import { body, param } from 'express-validator';

export const createBlogPostValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  body('excerpt')
    .trim()
    .notEmpty()
    .withMessage('Excerpt is required'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 100 })
    .withMessage('Category must be less than 100 characters'),
  body('imageUrl')
    .optional({ values: 'falsy' })
    .trim()
    .isURL()
    .withMessage('Invalid image URL'),
  body('author')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Author must be less than 100 characters'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Each tag must be less than 60 characters'),
];

export const updateBlogPostValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid blog post ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must be less than 100 characters'),
  body('imageUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid image URL'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Each tag must be less than 60 characters'),
];

export const blogPostIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid blog post ID'),
];

export const blogSlugValidator = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .isLength({ max: 300 })
    .withMessage('Slug too long')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid slug format'),
];

export const createCommentValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid blog post ID'),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author name is required')
    .isLength({ max: 100 })
    .withMessage('Author must be less than 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required'),
  body('parentId')
    .optional({ values: 'falsy' })
    .isUUID()
    .withMessage('Invalid parent comment ID'),
];
