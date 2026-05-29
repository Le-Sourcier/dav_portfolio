import { apiClient } from './client';
import type { Experience, ExperienceFormData } from '@/types/admin.types';

export const experiencesApi = {
  async getAll(): Promise<Experience[]> {
    return apiClient.get<Experience[]>('/experiences/admin/experiences');
  },

  async getById(id: string): Promise<Experience> {
    return apiClient.get<Experience>(`/experiences/admin/experiences/${id}`);
  },

  async create(data: ExperienceFormData): Promise<Experience> {
    return apiClient.post<Experience>('/experiences', data);
  },

  async update(id: string, data: Partial<ExperienceFormData>): Promise<Experience> {
    return apiClient.put<Experience>(`/experiences/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/experiences/${id}`);
  },
};

export default experiencesApi;
