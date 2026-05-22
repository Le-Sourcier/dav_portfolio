import { Router } from 'express';
import { trackPageView, getTraffic, getWeeklyActivity } from '../controllers/analytics.controller.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { analyticsPeriodValidator, trackPageViewValidator } from '../validators/analytics.validator.js';

const router = Router();

router.post('/page-view', validate(trackPageViewValidator), trackPageView);
router.get('/traffic', authMiddleware, adminMiddleware, validate(analyticsPeriodValidator), getTraffic);
router.get('/activity', authMiddleware, adminMiddleware, getWeeklyActivity);

export default router;
