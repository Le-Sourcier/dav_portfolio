import { Request, Response, NextFunction } from 'express';
import { appointmentService } from '../services/appointment.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

export const getAllAppointments = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointments = await appointmentService.findAll();
    sendSuccess(res, appointments, 'Appointments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getUpcomingAppointments = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointments = await appointmentService.findUpcoming();
    sendSuccess(res, appointments, 'Upcoming appointments retrieved');
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await appointmentService.findById(req.params.id);
    sendSuccess(res, appointment, 'Appointment retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await appointmentService.create(req.body);
    sendCreated(res, appointment, 'Appointment booked successfully');
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await appointmentService.updateStatus(req.params.id, req.body.status);
    sendSuccess(res, appointment, 'Appointment status updated');
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await appointmentService.delete(req.params.id);
    sendSuccess(res, null, 'Appointment deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getAvailableSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const slots = await appointmentService.getAvailableSlots(date);
    sendSuccess(res, { date: date.toISOString(), availableSlots: slots }, 'Available slots retrieved');
  } catch (error) {
    next(error);
  }
};

export const checkExisting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const email = req.query.email as string;
    if (!email) {
      sendSuccess(res, [], 'No email provided');
      return;
    }
    const appointments = await appointmentService.findActiveByEmail(email);
    sendSuccess(res, appointments, 'Active appointments retrieved');
  } catch (error) {
    next(error);
  }
};

export default {
  getAllAppointments,
  getUpcomingAppointments,
  getAppointmentById,
  createAppointment,
  updateStatus,
  deleteAppointment,
  getAvailableSlots,
};
