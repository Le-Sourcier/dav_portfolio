import type { BackendProject } from '@/types/backend-project.types';
import type { AppLocale } from '@/i18n/config';
import { defaultLocale } from '@/i18n/config';
import { envConfig } from '@/config/env';
import { requestApi } from '@/services/portfolio/apiRequest';
import { normalizeProject } from '@/services/portfolio/projectMapper';
import type { Project } from '@/types/portfolio.types';

export async function loadProjects(locale: AppLocale = defaultLocale): Promise<Project[]> {
  try {
    const data = await requestApi<BackendProject[]>('/projects');
    return Array.isArray(data) ? data.map((item) => normalizeProject(item, locale)) : [];
  } catch (error) {
    return [];
  }
}

export async function loadProjectBySlug(slug: string, locale: AppLocale = defaultLocale): Promise<Project | null> {
  try {
    const project = await requestApi<BackendProject>(`/projects/slug/${encodeURIComponent(slug)}`);
    return normalizeProject(project, locale);
  } catch (error) {
    return null;
  }
}
