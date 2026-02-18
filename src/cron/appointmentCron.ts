import cron from 'node-cron';
import { appointmentService } from '../services/appointment.service.js';
import { logger } from '../utils/logger.js';

/**
 * Auto-expire old appointments every hour:
 * - pending + date > 48h ago → expired
 * - confirmed + date > 24h ago → completed
 */
export function startAppointmentCron(): void {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      await appointmentService.expireOldAppointments();
    } catch (error) {
      logger.error('Appointment cron error:', error);
    }
  });

  // Also run once at startup
  appointmentService.expireOldAppointments().catch((error) => {
    logger.error('Appointment cron initial run error:', error);
  });

  logger.info('Appointment cron started (every hour)');
}
