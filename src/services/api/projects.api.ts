import { apiClient } from './client';
import type { Project } from '@/types/portfolio.types';

export const projectsApi = {
  getAll: () => apiClient.get<Project[]>('/projects'),
  getById: (id: string) => apiClient.get<Project>(`/projects/${id}`),
  getBySlug: (slug: string) => apiClient.get<Project>(`/projects/slug/${slug}`),
};

export default projectsApi;
