import { apiClient } from './client';
import type { Project, ProjectFormData } from '@/types/admin.types';

export const projectsApi = {
  async getAll(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects/admin/projects');
  },

  async getById(id: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/admin/projects/${id}`);
  },

  async create(data: ProjectFormData): Promise<Project> {
    return apiClient.post<Project>('/projects', data);
  },

  async update(id: string, data: Partial<ProjectFormData>): Promise<Project> {
    return apiClient.put<Project>(`/projects/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/projects/${id}`);
  },
};

export default projectsApi;
