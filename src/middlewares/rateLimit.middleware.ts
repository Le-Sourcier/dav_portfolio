import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { ErrorCode, HttpStatus } from '../types/response.types.js';

const rateLimitMessage = (details: string) => ({
  success: false,
  message: 'Too many requests, please try again later',
  error: {
    code: ErrorCode.RATE_LIMIT_EXCEEDED,
    details,
  },
});

export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: rateLimitMessage(`Rate limit exceeded. Try again in ${config.rateLimit.windowMs / 60000} minutes.`),
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: rateLimitMessage('Too many login attempts. Try again in 15 minutes.'),
  statusCode: HttpStatus.TOO_MANY_REQUESTS,
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: rateLimitMessage('You can only send 5 messages per hour.'),
});

export const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: rateLimitMessage('Too many subscription attempts. Try again in 1 hour.'),
});

export const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: rateLimitMessage('Too many chatbot messages. Slow down.'),
});

export const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: rateLimitMessage('Too many comments. Try again in 15 minutes.'),
});

export const trackingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: rateLimitMessage('Too many tracking requests.'),
});

export const appointmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: rateLimitMessage('Too many booking attempts. Try again in 1 hour.'),
});
