import { Router } from 'express';
import { getAllSettings, updateSettings } from '../controllers/settings.controller.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { updateSettingsValidator } from '../validators/settings.validator.js';

const router = Router();

// GET /api/settings - Public (portfolio pages need this)
router.get('/', getAllSettings);

// PUT /api/settings - Admin only (validated)
router.put('/', authMiddleware, adminMiddleware, validate(updateSettingsValidator), updateSettings);

export default router;
