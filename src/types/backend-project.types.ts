import type {
  ProjectChartPoint,
  ProjectImpactPoint,
  ProjectLink,
  ProjectMetric,
  ProjectSolutionDiagram,
} from './portfolio.types';

export interface BackendProject {
  id: string;
  slug: string;
  title: string;
  name: string;
  category: string;
  image: string;
  description: string;
  headline: string | null;
  problem: string;
  solution: string;
  result: string | null;
  metric: string | null;
  role: string | null;
  tech: string[];
  technologies?: string[];
  links: ProjectLink[];
  featured: boolean;
  results: string[];
  metrics: ProjectMetric[];
  chartData: ProjectChartPoint[];
  url: string | null;
  imageUrl?: string | null;
  solutionDiagram?: ProjectSolutionDiagram | null;
  impactGraph?: ProjectImpactPoint[] | null;
  title_en?: string | null;
  description_en?: string | null;
  problem_en?: string | null;
  solution_en?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
