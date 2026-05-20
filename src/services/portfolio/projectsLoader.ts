import { envConfig } from '@/config/env';
import type { ApiResponse } from '@/types/api.types';
import type { BackendProject } from '@/types/backend-project.types';
import { normalizeProject } from '@/services/portfolio/projectMapper';
import type { Project } from '@/types/portfolio.types';

async function requestApi<T>(path: string): Promise<T> {
  const url = `${envConfig.apiUrl}${path}`;
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as ApiResponse<T> | T;

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }

  return payload as T;
}

export async function loadProjects(): Promise<Project[]> {
  try {
    const data = await requestApi<BackendProject[]>('/projects');
    return Array.isArray(data) ? data.map(normalizeProject) : [];
  } catch (error) {
    console.error(`[portfolio] Unable to load projects from API (${envConfig.apiUrl}/projects):`, error);
    return [];
  }
}

export async function loadProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const project = await requestApi<BackendProject>(`/projects/slug/${encodeURIComponent(slug)}`);
    return normalizeProject(project);
  } catch (error) {
    console.error(`[portfolio] Unable to load project "${slug}" from API (${envConfig.apiUrl}/projects/slug/${slug}):`, error);
    return null;
  }
}
