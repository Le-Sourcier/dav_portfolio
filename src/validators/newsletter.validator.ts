import { body, query } from 'express-validator';

export const subscribeValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
];

export const unsubscribeValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
];

export const sendArticleValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Article title is required')
    .isLength({ max: 255 })
    .withMessage('Title too long'),
  body('excerpt')
    .trim()
    .notEmpty()
    .withMessage('Article excerpt is required'),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Article slug is required'),
];
