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

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  name: string;
  category: string;
  image: string;
  description: string;
  headline?: string;
  problem: string;
  solution: string;
  result?: string;
  metric?: string;
  role?: string;
  tech: string[];
  links: ProjectLink[];
  featured: boolean;
  results: string[];
  metrics: ProjectMetric[];
  chartData: ProjectChartPoint[];
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}
