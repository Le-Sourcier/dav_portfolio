export interface ApiMeta {
  timestamp: string;
  requestId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiPaginatedResponse<T = unknown> {
  success: true;
  message: string;
  data: T[];
  pagination: PaginationMeta;
  meta?: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: {
    code: string;
    details?: unknown;
  };
  meta?: ApiMeta;
}

export type BackendApiResponse<T = unknown> =
  | ApiSuccessResponse<T>
  | ApiPaginatedResponse<T>
  | ApiErrorResponse;

export type LocalizedTextField<T extends string> = Partial<Record<`${T}_en`, string | null>>;

export interface ProjectMetric {
  name: string;
  value: number;
  previousValue: number;
  unit: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface DiagramNode {
  id: string;
  label: string;
  type: "client" | "gateway" | "service" | "database" | "external" | "ai" | string;
}

export interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
}

export interface SolutionDiagram {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
}

export interface ImpactData {
  label: string;
  value: number;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface BackendProject
  extends LocalizedTextField<"title" | "description" | "problem" | "solution" | "headline" | "result" | "metric" | "role"> {
  id: string;
  slug: string;
  title: string;
  name: string;
  category: string;
  image: string;
  imageUrl?: string | null;
  description: string;
  headline?: string | null;
  problem: string;
  solution: string;
  result?: string | null;
  metric?: string | null;
  role?: string | null;
  tech: string[];
  technologies?: string[];
  links: ProjectLink[];
  featured: boolean;
  results: string[];
  results_en?: string[] | null;
  metrics: ProjectMetric[];
  chartData: ChartDataPoint[];
  url?: string | null;
  solutionDiagram?: SolutionDiagram | null;
  impactGraph?: ImpactData[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExperienceAchievement {
  title: string;
  description: string;
  icon?: string;
}

export interface ExperienceLink {
  label: string;
  url: string;
}

export interface BackendExperience extends LocalizedTextField<"title" | "description"> {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  dates: string;
  description: string;
  details?: string[];
  links?: ExperienceLink[];
  coverImage?: string | null;
  illustrativeImages?: string[];
  stack?: string[];
  challenges?: string[];
  achievements?: ExperienceAchievement[];
  solutionDiagram?: SolutionDiagram | null;
  impactGraph?: ImpactData[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendBlogComment {
  id: string;
  author: string;
  email: string;
  content: string;
  postId: string;
  parentId: string | null;
  mentions: string[];
  createdAt: string;
  replies?: BackendBlogComment[];
}

export interface BackendBlogPost extends LocalizedTextField<"title" | "excerpt" | "content"> {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl?: string | null;
  readTime: string;
  author: string;
  published: boolean;
  viewCount: number;
  shareCount: number;
  comments?: BackendBlogComment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendTestimonial extends LocalizedTextField<"content" | "role"> {
  id: string;
  name: string;
  role: string;
  company?: string | null;
  avatar?: string | null;
  content: string;
  rating?: number | null;
  visible: boolean;
  createdAt?: string;
}

export interface BackendContact {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  read: boolean;
  reply?: string | null;
  repliedAt?: string | null;
  createdAt?: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  lang?: "fr" | "en";
}

export interface BackendNewsletterSubscriber {
  id: string;
  email: string;
  active: boolean;
  subscribedAt: string;
  unsubscribedAt?: string | null;
}
