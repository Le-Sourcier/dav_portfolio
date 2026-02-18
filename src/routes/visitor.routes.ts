import { Router } from 'express';
import { requestOtp, verifyOtp } from '../controllers/visitor.controller.js';
import { body } from 'express-validator';
import { validate } from '../middlewares/validation.middleware.js';
import rateLimit from 'express-rate-limit';
import { ErrorCode } from '../types/response.types.js';

const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Trop de demandes de code. Reessayez dans 1 heure.',
    error: { code: ErrorCode.RATE_LIMIT_EXCEEDED },
  },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Trop de tentatives. Reessayez dans 1 heure.',
    error: { code: ErrorCode.RATE_LIMIT_EXCEEDED },
  },
});

const requestOtpValidator = [
  body('email').trim().notEmpty().isEmail().withMessage('Email invalide'),
  body('name').trim().notEmpty().isLength({ max: 100 }).withMessage('Nom requis'),
];

const verifyOtpValidator = [
  body('email').trim().notEmpty().isEmail().withMessage('Email invalide'),
  body('code').trim().notEmpty().isLength({ min: 6, max: 6 }).withMessage('Code a 6 chiffres requis'),
  body('name').trim().notEmpty().withMessage('Nom requis'),
  body('remember').optional().isBoolean(),
];

const router = Router();

// POST /api/visitor/request-otp
router.post('/request-otp', otpRequestLimiter, validate(requestOtpValidator), requestOtp);

// POST /api/visitor/verify-otp
router.post('/verify-otp', otpVerifyLimiter, validate(verifyOtpValidator), verifyOtp);

export default router;
