import { Router } from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import experienceRoutes from './experience.routes.js';
import blogRoutes from './blog.routes.js';
import contactRoutes from './contact.routes.js';
import appointmentRoutes from './appointment.routes.js';
import newsletterRoutes from './newsletter.routes.js';
import testimonialRoutes from './testimonial.routes.js';
import chatbotRoutes from './chatbot.routes.js';
import settingsRoutes from './settings.routes.js';
import visitorRoutes from './visitor.routes.js';
import analyticsRoutes from './analytics.routes.js';
import assetRoutes from './asset.routes.js';
import translationRoutes from './translation.routes.js';

const router = Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/visitor', visitorRoutes);
router.use('/projects', projectRoutes);
router.use('/experiences', experienceRoutes);
router.use('/blog', blogRoutes);
router.use('/contact', contactRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/settings', settingsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/assets', assetRoutes);
router.use('/admin/translate', translationRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
