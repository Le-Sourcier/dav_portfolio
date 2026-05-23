export interface ProjectMetric {
  name: string;
  value: number;
  previousValue: number;
  unit: string;
}

export interface ProjectChartPoint {
  name: string;
  value: number;
}

export interface ProjectDiagramNode {
  id: string;
  label: string;
  type: string;
}

export interface ProjectDiagramConnection {
  from: string;
  to: string;
  label?: string;
}

export interface ProjectSolutionDiagram {
  nodes: ProjectDiagramNode[];
  connections: ProjectDiagramConnection[];
}

export interface ProjectImpactPoint {
  label: string;
  value: number;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  title_en?: string | null;
  name: string;
  category: string;
  image: string;
  description: string;
  description_en?: string | null;
  headline?: string;
  headline_en?: string | null;
  problem: string;
  problem_en?: string | null;
  solution: string;
  solution_en?: string | null;
  result?: string;
  result_en?: string | null;
  metric?: string;
  metric_en?: string | null;
  role?: string;
  role_en?: string | null;
  tech: string[];
  links: ProjectLink[];
  featured: boolean;
  results: string[];
  results_en?: string[] | null;
  metrics: ProjectMetric[];
  chartData: ProjectChartPoint[];
  solutionDiagram?: ProjectSolutionDiagram | null;
  impactGraph?: ProjectImpactPoint[] | null;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}
