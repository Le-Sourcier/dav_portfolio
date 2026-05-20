import { projectsApi } from '@/services/api/projects.api';
import { projects as staticProjects } from '@/lib/portfolio';
import type { Project } from '@/types/portfolio.types';

type StaticProject = (typeof staticProjects)[number];

function fromStatic(item: StaticProject): Project {
  return {
    id: item.slug,
    slug: item.slug,
    title: item.name,
    name: item.name,
    category: item.category,
    image: '',
    description: item.description,
    headline: item.headline,
    problem: '',
    solution: '',
    result: item.result,
    metric: item.metric,
    role: item.role,
    tech: [...item.tech],
    links: item.links.map((link) => ({ label: link.label, href: link.href })),
    featured: item.featured ?? false,
    results: [item.result],
    metrics: [],
    chartData: [],
  };
}

const staticProjectsMapped: Project[] = staticProjects.map(fromStatic);

export async function loadProjects(): Promise<Project[]> {
  try {
    const data = await projectsApi.getAll();
    if (Array.isArray(data) && data.length > 0) return data;
    return staticProjectsMapped;
  } catch {
    return staticProjectsMapped;
  }
}

export async function loadProjectBySlug(slug: string): Promise<Project | null> {
  try {
    return await projectsApi.getBySlug(slug);
  } catch {
    const fallback = staticProjectsMapped.find((p) => p.slug === slug);
    return fallback ?? null;
  }
}

export function listStaticProjectSlugs(): string[] {
  return staticProjectsMapped.map((p) => p.slug);
}
