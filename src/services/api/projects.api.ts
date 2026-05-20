import { apiClient } from './client';
import type { BackendProject } from '@/types/backend-project.types';

export const projectsApi = {
  getAll: () => apiClient.get<BackendProject[]>('/projects'),
  getById: (id: string) => apiClient.get<BackendProject>(`/projects/${id}`),
  getBySlug: (slug: string) => apiClient.get<BackendProject>(`/projects/slug/${slug}`),
};

export default projectsApi;
