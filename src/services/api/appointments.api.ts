import { apiClient } from './client';
import type { Appointment, AppointmentStatus } from '@/types/admin.types';

export const appointmentsApi = {
  async getAll(): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>('/appointments');
  },

  async getUpcoming(): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>('/appointments/upcoming');
  },

  async getById(id: string): Promise<Appointment> {
    return apiClient.get<Appointment>(`/appointments/${id}`);
  },

  async create(data: {
    name: string;
    email: string;
    subject: string;
    urgency?: 'non-urgent' | 'urgent';
    date: string;
    time: string;
  }): Promise<Appointment> {
    return apiClient.post<Appointment>('/appointments', data);
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    return apiClient.patch<Appointment>(`/appointments/${id}/status`, { status });
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/appointments/${id}`);
  },

  async getAvailableSlots(date: string): Promise<{ date: string; availableSlots: string[] }> {
    return apiClient.get<{ date: string; availableSlots: string[] }>(
      `/appointments/available?date=${date}`
    );
  },

  async checkExisting(email: string): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>(`/appointments/check?email=${encodeURIComponent(email)}`);
  },
};

export default appointmentsApi;
