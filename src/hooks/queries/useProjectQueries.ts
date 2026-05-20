import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/services/api/projects.api';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  bySlug: (slug: string) => [...projectKeys.all, 'slug', slug] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: () => projectsApi.getAll(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  });
}

export function useProjectBySlug(slug: string) {
  return useQuery({
    queryKey: projectKeys.bySlug(slug),
    queryFn: () => projectsApi.getBySlug(slug),
    enabled: !!slug,
  });
}
