import { apiClient } from './client';
import type { Contact } from '@/types/admin.types';

export const contactsApi = {
  async getAll(): Promise<Contact[]> {
    return apiClient.get<Contact[]>('/contact');
  },

  async getById(id: string): Promise<Contact> {
    return apiClient.get<Contact>(`/contact/${id}`);
  },

  async create(data: { name: string; email: string; subject?: string; message: string }): Promise<Contact> {
    return apiClient.post<Contact>('/contact', data);
  },

  async reply(id: string, reply: string): Promise<Contact> {
    return apiClient.post<Contact>(`/contact/${id}/reply`, { reply });
  },

  async markAsRead(id: string): Promise<Contact> {
    return apiClient.patch<Contact>(`/contact/${id}/read`);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/contact/${id}`);
  },

  async getUnreadCount(): Promise<{ count: number }> {
    return apiClient.get<{ count: number }>('/contact/unread');
  },
};

export default contactsApi;
