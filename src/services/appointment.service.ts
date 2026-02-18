import Appointment from '../models/Appointment.js';
import { IAppointment, AppointmentStatus } from '../types/entities.types.js';
import { AppError } from '../middlewares/error.middleware.js';
import { ErrorCode, HttpStatus } from '../types/response.types.js';
import { sendEmail } from '../helpers/mailer.js';
import { appointmentConfirmationTemplate } from '../views/emails/appointment.template.js';
import { Op } from 'sequelize';
import { logger } from '../utils/logger.js';

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
      order: [['date', 'ASC'], ['time', 'ASC']],
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
    // Block past dates
    const today = new Date().toISOString().split('T')[0];
    if (String(data.date) < today) {
      throw new AppError('Impossible de reserver un creneau dans le passe', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
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
      throw new AppError('This time slot is already booked', HttpStatus.CONFLICT, ErrorCode.CONFLICT);
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
          date: { [Op.lt]: twoDaysAgo.toISOString().split('T')[0] },
        },
      }
    );

    const [completedCount] = await Appointment.update(
      { status: 'completed' },
      {
        where: {
          status: 'confirmed',
          date: { [Op.lt]: oneDayAgo.toISOString().split('T')[0] },
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
