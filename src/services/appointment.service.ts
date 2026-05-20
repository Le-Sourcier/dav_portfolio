import Appointment from '../models/Appointment.js';
import { IAppointment, AppointmentStatus } from '../types/entities.types.js';
import { AppError } from '../middlewares/error.middleware.js';
import { ErrorCode, HttpStatus } from '../types/response.types.js';
import { sendEmail } from '../helpers/mailer.js';
import { appointmentConfirmationTemplate } from '../views/emails/appointment.template.js';
import { Op } from 'sequelize';
import { logger } from '../utils/logger.js';
import { todayLocal, dateToLocal } from '../utils/helpers.js';

// Valid status transitions (state machine)
const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],   // terminal
  cancelled: [],   // terminal
  expired: [],     // terminal
};

class AppointmentService {
  private availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  async findAll(): Promise<IAppointment[]> {
    const appointments = await Appointment.findAll({
      order: [['createdAt', 'DESC']],
    });
    return appointments;
  }

  async findById(id: string): Promise<IAppointment> {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      throw new AppError('Appointment not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return appointment;
  }

  async findActiveByEmail(email: string): Promise<IAppointment[]> {
    const appointments = await Appointment.findAll({
      where: {
        email,
        status: { [Op.in]: ['pending', 'confirmed'] },
      },
      order: [['date', 'ASC'], ['time', 'ASC']],
    });
    return appointments;
  }

  async create(data: Omit<IAppointment, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<IAppointment> {
    // Block past dates (local timezone)
    const today = todayLocal();
    if (String(data.date) < today) {
      throw new AppError('Impossible de reserver un creneau dans le passe', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Auto-cancel past pending RDVs for this email, then check for future pending
    const pendingByEmail = await Appointment.findAll({
      where: {
        email: data.email,
        status: 'pending',
      },
    });

    for (const pending of pendingByEmail) {
      if (String(pending.date) < today) {
        // Past pending → auto-cancel (was never honoured)
        await pending.update({ status: 'cancelled' });
        logger.info(`Auto-cancelled past pending RDV ${pending.id} for ${data.email}`);
      }
    }

    // Check if there's still an active future pending RDV
    const futurePending = await Appointment.findOne({
      where: {
        email: data.email,
        status: 'pending',
        date: { [Op.gte]: today },
      },
    });
    if (futurePending) {
      throw new AppError(
        'Vous avez deja un rendez-vous en attente de confirmation. Veuillez patienter ou nous contacter pour l\'annuler.',
        HttpStatus.CONFLICT,
        ErrorCode.CONFLICT,
      );
    }

    // Check if slot is available (excludes cancelled/expired)
    const existing = await Appointment.findOne({
      where: {
        date: data.date,
        time: data.time,
        status: { [Op.in]: ['pending', 'confirmed'] },
      },
    });

    if (existing) {
      throw new AppError('Ce creneau est deja reserve', HttpStatus.CONFLICT, ErrorCode.CONFLICT);
    }

    const appointment = await Appointment.create({
      ...data,
      status: 'pending',
    });

    // Send confirmation email (silent failure)
    try {
      await sendEmail({
        to: data.email,
        subject: 'Confirmation de votre rendez-vous',
        html: appointmentConfirmationTemplate({
          name: data.name,
          date: new Date(data.date).toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          }),
          time: data.time,
          subject: data.subject,
        }),
      });
    } catch {
      // Don't fail if email sending fails
    }

    return appointment;
  }

  async updateStatus(id: string, newStatus: AppointmentStatus): Promise<IAppointment> {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      throw new AppError('Appointment not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const currentStatus = appointment.status as AppointmentStatus;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Transition invalide : "${currentStatus}" ne peut pas passer a "${newStatus}". Transitions possibles : ${allowed.length > 0 ? allowed.join(', ') : 'aucune (statut terminal)'}`,
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    await appointment.update({ status: newStatus });
    return appointment;
  }

  async delete(id: string): Promise<void> {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      throw new AppError('Appointment not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    await appointment.destroy();
  }

  /**
   * Cancel all pending appointments for an email.
   * Returns the number of cancelled appointments.
   */
  async cancelPendingByEmail(email: string): Promise<number> {
    const [count] = await Appointment.update(
      { status: 'cancelled' },
      { where: { email, status: 'pending' } },
    );
    return count;
  }

  /**
   * Reschedule an existing pending appointment to a new date/time.
   */
  async reschedule(id: string, newDate: Date, newTime: string): Promise<IAppointment> {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      throw new AppError('Appointment not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
      throw new AppError('Seuls les RDV pending ou confirmed peuvent être reprogrammés', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    // Block past dates
    const today = todayLocal();
    const dateStr = dateToLocal(newDate);
    if (dateStr < today) {
      throw new AppError('Impossible de reprogrammer dans le passé', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    // Check slot
    const existing = await Appointment.findOne({
      where: {
        date: newDate,
        time: newTime,
        status: { [Op.in]: ['pending', 'confirmed'] },
        id: { [Op.ne]: id },
      },
    });
    if (existing) {
      throw new AppError('Ce créneau est déjà réservé', HttpStatus.CONFLICT, ErrorCode.CONFLICT);
    }
    await appointment.update({ date: newDate, time: newTime });

    // Send confirmation email
    try {
      await sendEmail({
        to: appointment.email,
        subject: 'Rendez-vous reprogrammé',
        html: appointmentConfirmationTemplate({
          name: appointment.name,
          date: new Date(newDate).toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          }),
          time: newTime,
          subject: appointment.subject,
        }),
      });
    } catch { /* silent */ }

    return appointment;
  }

  async getAvailableSlots(date: Date): Promise<string[]> {
    const bookedSlots = await Appointment.findAll({
      where: {
        date,
        status: { [Op.in]: ['pending', 'confirmed'] },
      },
      attributes: ['time'],
    });
    const bookedTimes = bookedSlots.map((a) => a.time);
    return this.availableTimes.filter((time) => !bookedTimes.includes(time));
  }

  async findUpcoming(): Promise<IAppointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointments = await Appointment.findAll({
      where: {
        date: { [Op.gte]: today },
        status: { [Op.in]: ['pending', 'confirmed'] },
      },
      order: [['date', 'ASC'], ['time', 'ASC']],
    });
    return appointments;
  }

  /**
   * Auto-expire old appointments. Called by cron job.
   * - pending + date passed > 48h → expired
   * - confirmed + date passed > 24h → completed
   */
  async expireOldAppointments(): Promise<{ expired: number; completed: number }> {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [expiredCount] = await Appointment.update(
      { status: 'expired' },
      {
        where: {
          status: 'pending',
          date: { [Op.lt]: dateToLocal(twoDaysAgo) },
        },
      }
    );

    const [completedCount] = await Appointment.update(
      { status: 'completed' },
      {
        where: {
          status: 'confirmed',
          date: { [Op.lt]: dateToLocal(oneDayAgo) },
        },
      }
    );

    if (expiredCount > 0 || completedCount > 0) {
      logger.info(`Cron: ${expiredCount} RDV expires, ${completedCount} RDV completes automatiquement`);
    }

    return { expired: expiredCount, completed: completedCount };
  }
}

export const appointmentService = new AppointmentService();
export default appointmentService;
