import type { BackendProject } from '@/types/backend-project.types';
import type { AppLocale } from '@/i18n/config';
import { defaultLocale } from '@/i18n/config';
import { localizeText } from '@/i18n/localize';
import type { Project, ProjectMetric } from '@/types/portfolio.types';

function formatMetric(metric?: ProjectMetric): string {
  if (!metric) return '';
  const unit = metric.unit?.trim() ?? '';
  return `${metric.value}${unit.toLowerCase() === 'n' ? '' : unit}`;
}

export function normalizeProject(item: BackendProject, locale: AppLocale = defaultLocale): Project {
  const tech = Array.isArray(item.tech)
    ? item.tech
    : Array.isArray(item.technologies)
      ? item.technologies
      : [];
  const primaryResult = item.result || item.results?.find(Boolean) || '';
  const primaryMetric = item.metric || formatMetric(item.metrics?.find((metric) => metric.name));
  const links = Array.isArray(item.links) ? [...item.links] : [];
  const title = localizeText(locale, item.title || item.name, item.title_en);
  const description = localizeText(locale, item.description, item.description_en);
  const problem = localizeText(locale, item.problem, item.problem_en);
  const solution = localizeText(locale, item.solution, item.solution_en);

  if (item.url && !links.some((link) => link.href === item.url)) {
    links.push({ label: 'Voir le projet', href: item.url });
  }

  return {
    id: item.id,
    slug: item.slug,
    title,
    title_en: item.title_en,
    name: title || item.name || item.title,
    category: item.category,
    image: item.image || item.imageUrl || '',
    description,
    description_en: item.description_en,
    headline: item.headline || description || primaryResult,
    problem,
    problem_en: item.problem_en,
    solution,
    solution_en: item.solution_en,
    result: primaryResult,
    metric: primaryMetric,
    role: item.role || item.category,
    tech,
    links,
    featured: Boolean(item.featured),
    results: Array.isArray(item.results) ? item.results : [],
    metrics: Array.isArray(item.metrics) ? item.metrics : [],
    chartData: Array.isArray(item.chartData) ? item.chartData : [],
    solutionDiagram: item.solutionDiagram ?? null,
    impactGraph: Array.isArray(item.impactGraph) ? item.impactGraph : null,
    url: item.url || undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
