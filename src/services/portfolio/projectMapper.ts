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
  const primaryResult = localizeText(locale, item.result, item.result_en) || item.results?.find(Boolean) || '';
  const primaryMetric = localizeText(locale, item.metric, item.metric_en) || formatMetric(item.metrics?.find((metric) => metric.name));
  const links = Array.isArray(item.links) ? [...item.links] : [];
  const title = localizeText(locale, item.title || item.name, item.title_en);
  const description = localizeText(locale, item.description, item.description_en);
  const problem = localizeText(locale, item.problem, item.problem_en);
  const solution = localizeText(locale, item.solution, item.solution_en);
  const headline = localizeText(locale, item.headline, item.headline_en) || description || primaryResult;
  const role = localizeText(locale, item.role, item.role_en) || item.category;
  const results = locale === "en" && Array.isArray(item.results_en) && item.results_en.length > 0
    ? item.results_en
    : (Array.isArray(item.results) ? item.results : []);

  if (item.url && !links.some((link) => link.href === item.url)) {
    links.push({ label: locale === "en" ? 'View project' : 'Voir le projet', href: item.url });
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
    headline,
    headline_en: item.headline_en,
    problem,
    problem_en: item.problem_en,
    solution,
    solution_en: item.solution_en,
    result: primaryResult,
    result_en: item.result_en,
    metric: primaryMetric,
    metric_en: item.metric_en,
    role,
    role_en: item.role_en,
    tech,
    links,
    featured: Boolean(item.featured),
    results,
    results_en: Array.isArray(item.results_en) ? item.results_en : null,
    metrics: Array.isArray(item.metrics) ? item.metrics : [],
    chartData: Array.isArray(item.chartData) ? item.chartData : [],
    solutionDiagram: item.solutionDiagram ?? null,
    impactGraph: Array.isArray(item.impactGraph) ? item.impactGraph : null,
    url: item.url || undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
