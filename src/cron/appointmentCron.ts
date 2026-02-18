import cron from 'node-cron';
import { appointmentService } from '../services/appointment.service.js';
import { visitorService } from '../services/visitor.service.js';
import { logger } from '../utils/logger.js';

/**
 * Scheduled jobs (every hour):
 * - Auto-expire old appointments (pending >48h → expired, confirmed >24h → completed)
 * - Cleanup expired/used OTP codes
 */
export function startCronJobs(): void {
  cron.schedule('0 * * * *', async () => {
    try {
      await appointmentService.expireOldAppointments();
      await visitorService.cleanupExpiredOtps();
    } catch (error) {
      logger.error('Cron job error:', error);
    }
  });

  // Run once at startup
  Promise.all([
    appointmentService.expireOldAppointments(),
    visitorService.cleanupExpiredOtps(),
  ]).catch((error) => {
    logger.error('Cron initial run error:', error);
  });

  logger.info('Cron jobs started (every hour)');
}
