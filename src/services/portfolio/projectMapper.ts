import type { BackendProject } from '@/types/backend-project.types';
import type { AppLocale } from '@/i18n/config';
import { defaultLocale } from '@/i18n/config';
import { localizeText } from '@/i18n/localize';
import type {
  Project,
  ProjectChartPoint,
  ProjectImpactPoint,
  ProjectLink,
  ProjectMetric,
  ProjectSolutionDiagram,
} from '@/types/portfolio.types';

function formatMetric(metric?: ProjectMetric): string {
  if (!metric) return '';
  const unit = metric.unit?.trim() ?? '';
  return `${metric.value}${unit.toLowerCase() === 'n' ? '' : unit}`;
}

const englishLabels: Record<string, string> = {
  "api health": "API health",
  "adoption communauté": "Community adoption",
  "blog technique": "Technical blog",
  "calcul énergie": "Energy calculation",
  "couverture api": "API coverage",
  "couverture wearables": "Wearable coverage",
  "dashboard admin": "Admin dashboard",
  "dashboards": "Dashboards",
  "demo": "Demo",
  "démo": "Demo",
  "démo publique": "Public demo",
  "documentation": "Documentation",
  "expérience utilisateur": "User experience",
  "gestion admin": "Admin management",
  "interface client": "Client interface",
  "qualité code": "Code quality",
  "qualité données": "Data quality",
  "performance sync": "Sync performance",
  "précision ia": "AI precision",
  "roi": "ROI",
  "site principal": "Main site",
  "téléchargement mobile": "Mobile download",
};

const englishCategories: Record<string, string> = {
  "backend": "Backend",
  "frontend": "Frontend",
  "fullstack": "Fullstack",
  "mobile": "Mobile",
  "open source": "Open source",
  "saas b2b": "B2B SaaS",
  "saas énergie": "Energy SaaS",
};

function dictionaryLabel(value?: string | null): string {
  if (!value?.trim()) return '';
  return englishLabels[value.trim().toLowerCase()] ?? value.trim();
}

function localizedLabel(
  locale: AppLocale,
  french?: string | null,
  english?: string | null,
): string {
  if (locale === "en") return localizeText(locale, french, english) || dictionaryLabel(french);
  return french?.trim() ?? "";
}

function localizedCategory(
  category: string,
  locale: AppLocale,
  categoryEn?: string | null,
): string {
  if (locale !== "en") return category;
  if (categoryEn?.trim()) return categoryEn.trim();
  return englishCategories[category.trim().toLowerCase()] ?? category;
}

function localizeLinks(links: ProjectLink[], locale: AppLocale): ProjectLink[] {
  return links.map((link) => ({
    ...link,
    label: localizedLabel(locale, link.label, link.label_en),
  }));
}

function localizeMetrics(metrics: ProjectMetric[], locale: AppLocale): ProjectMetric[] {
  return metrics.map((metric) => ({
    ...metric,
    name: localizedLabel(locale, metric.name, metric.name_en),
  }));
}

function localizeChartData(points: ProjectChartPoint[], locale: AppLocale): ProjectChartPoint[] {
  return points.map((point) => ({
    ...point,
    name: localizedLabel(locale, point.name, point.name_en),
  }));
}

function localizeImpactGraph(points: ProjectImpactPoint[] | null | undefined, locale: AppLocale) {
  if (!Array.isArray(points)) return null;
  return points.map((point) => ({
    ...point,
    label: localizedLabel(locale, point.label, point.label_en),
  }));
}

function localizeSolutionDiagram(
  diagram: ProjectSolutionDiagram | null | undefined,
  locale: AppLocale,
): ProjectSolutionDiagram | null {
  if (!diagram) return null;
  return {
    nodes: Array.isArray(diagram.nodes)
      ? diagram.nodes.map((node) => ({
          ...node,
          label: localizedLabel(locale, node.label, node.label_en),
        }))
      : [],
    connections: Array.isArray(diagram.connections)
      ? diagram.connections.map((connection) => ({
          ...connection,
          label: localizedLabel(locale, connection.label, connection.label_en) || undefined,
        }))
      : [],
  };
}

export function normalizeProject(item: BackendProject, locale: AppLocale = defaultLocale): Project {
  const tech = Array.isArray(item.tech)
    ? item.tech
    : Array.isArray(item.technologies)
      ? item.technologies
      : [];
  const primaryResult = localizeText(locale, item.result, item.result_en) || item.results?.find(Boolean) || '';
  const primaryMetric = localizeText(locale, item.metric, item.metric_en) || formatMetric(item.metrics?.find((metric) => metric.name));
  const links = Array.isArray(item.links) ? localizeLinks([...item.links], locale) : [];
  const title = localizeText(locale, item.title || item.name, item.title_en);
  const description = localizeText(locale, item.description, item.description_en);
  const problem = localizeText(locale, item.problem, item.problem_en);
  const solution = localizeText(locale, item.solution, item.solution_en);
  const headline = localizeText(locale, item.headline, item.headline_en) || description || primaryResult;
  const role = localizeText(locale, item.role, item.role_en) || item.category;
  const category = localizedCategory(item.category, locale, item.category_en);
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
    category,
    category_en: item.category_en,
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
    metrics: Array.isArray(item.metrics) ? localizeMetrics(item.metrics, locale) : [],
    chartData: Array.isArray(item.chartData) ? localizeChartData(item.chartData, locale) : [],
    solutionDiagram: localizeSolutionDiagram(item.solutionDiagram, locale),
    impactGraph: localizeImpactGraph(item.impactGraph, locale),
    url: item.url || undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
