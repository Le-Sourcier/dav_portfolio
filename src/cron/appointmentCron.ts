import cron from 'node-cron';
import { appointmentService } from '../services/appointment.service.js';
import { blogService } from '../services/blog.service.js';
import { visitorService } from '../services/visitor.service.js';
import { logger } from '../utils/logger.js';

/**
 * Scheduled jobs (every hour):
 * - Auto-expire old appointments (pending >48h → expired, confirmed >24h → completed)
 * - Cleanup expired/used OTP codes
 * - Send newsletters for blog posts that became publicly visible
 */
export function startCronJobs(): void {
  cron.schedule('*/10 * * * *', async () => {
    try {
      await appointmentService.expireOldAppointments();
      await visitorService.cleanupExpiredOtps();
      const result = await blogService.sendDuePublicationNewsletters();
      if (result.posts > 0) {
        logger.info(`Scheduled blog newsletters processed: ${result.posts} posts, ${result.sent} sent, ${result.failed} failed`);
      }
    } catch (error) {
      logger.error('Cron job error:', error);
    }
  });

  // Run once at startup
  Promise.all([
    appointmentService.expireOldAppointments(),
    visitorService.cleanupExpiredOtps(),
    blogService.sendDuePublicationNewsletters(),
  ]).catch((error) => {
    logger.error('Cron initial run error:', error);
  });

  logger.info('Cron jobs started (every 10 minutes)');
}
