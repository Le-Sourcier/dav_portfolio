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
  body('publishedAt')
    .optional({ nullable: true, values: 'falsy' })
    .isISO8601()
    .withMessage('Published date must be a valid date')
    .toDate(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Each tag must be less than 60 characters'),
  body('tagIds')
    .optional()
    .isArray()
    .withMessage('Tag IDs must be an array'),
  body('tagIds.*')
    .optional()
    .isUUID()
    .withMessage('Invalid tag ID'),
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
    .optional({ values: 'falsy' })
    .trim()
    .isURL()
    .withMessage('Invalid image URL'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean'),
  body('publishedAt')
    .optional({ nullable: true, values: 'falsy' })
    .isISO8601()
    .withMessage('Published date must be a valid date')
    .toDate(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Each tag must be less than 60 characters'),
  body('tagIds')
    .optional()
    .isArray()
    .withMessage('Tag IDs must be an array'),
  body('tagIds.*')
    .optional()
    .isUUID()
    .withMessage('Invalid tag ID'),
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

export const commentIdValidator = [
  param('commentId')
    .isUUID()
    .withMessage('Invalid comment ID'),
];

export const adminReplyValidator = [
  param('commentId')
    .isUUID()
    .withMessage('Invalid comment ID'),
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
    .withMessage('Reply content is required'),
  body('mentions')
    .optional()
    .isArray()
    .withMessage('Mentions must be an array'),
  body('mentions.*')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Each mention must be less than 100 characters'),
];

export const blogTagIdValidator = [
  param('tagId')
    .isUUID()
    .withMessage('Invalid tag ID'),
];

export const createBlogTagValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tag name is required')
    .isLength({ max: 80 })
    .withMessage('Tag name must be less than 80 characters'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid tag slug'),
  body('description')
    .optional({ nullable: true })
    .trim(),
  body('color')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 32 })
    .withMessage('Color must be less than 32 characters'),
  body('isVisible')
    .optional()
    .isBoolean()
    .withMessage('Visibility must be a boolean'),
];

export const updateBlogTagValidator = [
  ...blogTagIdValidator,
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tag name cannot be empty')
    .isLength({ max: 80 })
    .withMessage('Tag name must be less than 80 characters'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid tag slug'),
  body('description')
    .optional({ nullable: true })
    .trim(),
  body('color')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 32 })
    .withMessage('Color must be less than 32 characters'),
  body('isVisible')
    .optional()
    .isBoolean()
    .withMessage('Visibility must be a boolean'),
];
