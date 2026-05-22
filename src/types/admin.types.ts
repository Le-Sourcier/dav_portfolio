// ========================
// API Response Types
// ========================
export interface ApiMeta {
  timestamp: string;
  requestId: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta: ApiMeta;
}

export interface ApiPaginatedResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
  meta: ApiMeta;
}

export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details?: string;
  };
}

// ========================
// Auth Types
// ========================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ========================
// Project Types
// ========================
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
  type: "client" | "gateway" | "service" | "database" | "external" | "ai";
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

export type ProjectCategory =
  | "UI/UX"
  | "Branding"
  | "Web"
  | "Art"
  | "Photo"
  | "Fullstack"
  | "Software";

export interface Project {
  id: string;
  title: string;
  title_en?: string;
  category: ProjectCategory;
  image: string;
  description: string;
  description_en?: string;
  problem: string;
  problem_en?: string;
  solution: string;
  solution_en?: string;
  results: string[];
  metrics: ProjectMetric[];
  chartData: ChartDataPoint[];
  technologies?: string[];
  url?: string;
  solutionDiagram?: SolutionDiagram;
  impactGraph?: ImpactData[];
  createdAt?: string;
  updatedAt?: string;
}

export type ProjectFormData = Omit<Project, "id" | "createdAt" | "updatedAt">;

// ========================
// Experience Types
// ========================
export interface ExperienceAchievement {
  title: string;
  description: string;
  icon?: string;
}

export interface ExperienceLink {
  label: string;
  url: string;
}

export interface Experience {
  id: string;
  title: string;
  title_en?: string;
  company: string;
  location?: string;
  dates: string;
  description: string;
  description_en?: string;
  details?: string[];
  links?: ExperienceLink[];
  coverImage?: string;
  illustrativeImages?: string[];
  stack?: string[];
  challenges?: string[];
  achievements?: ExperienceAchievement[];
  solutionDiagram?: SolutionDiagram;
  impactGraph?: ImpactData[];
  createdAt?: string;
  updatedAt?: string;
}

export type ExperienceFormData = Omit<
  Experience,
  "id" | "createdAt" | "updatedAt"
>;

// ========================
// Blog Types
// ========================
export interface BlogComment {
  id: string;
  author: string;
  email: string;
  content: string;
  postId: string;
  parentId?: string | null;
  mentions?: string[];
  createdAt: string;
  replies?: BlogComment[];
  BlogPost?: Pick<BlogPost, "id" | "title" | "slug">;
}

export interface BlogPost {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  excerpt: string;
  excerpt_en?: string;
  content: string;
  content_en?: string;
  category: string;
  imageUrl: string;
  readTime: string;
  author: string;
  published: boolean;
  viewCount: number;
  shareCount: number;
  tags?: string[];
  comments?: BlogComment[];
  createdAt?: string;
  updatedAt?: string;
}

export type BlogPostFormData = Omit<
  BlogPost,
  | "id"
  | "slug"
  | "readTime"
  | "viewCount"
  | "shareCount"
  | "comments"
  | "createdAt"
  | "updatedAt"
>;

export interface BlogStats {
  totalViews: number;
  totalShares: number;
  totalComments: number;
  totalPosts: number;
  publishedPosts: number;
  topPosts: Pick<
    BlogPost,
    "id" | "title" | "slug" | "viewCount" | "shareCount"
  >[];
}

export interface BlogCommentFilters {
  page?: number;
  limit?: number;
  postId?: string;
  search?: string;
  mentioned?: string;
  parentOnly?: boolean;
  sort?: "recent" | "oldest";
}

export interface BlogCommentListResponse {
  comments: BlogComment[];
  pagination: PaginationMeta;
}

// ========================
// Contact Types
// ========================
export interface Contact {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

// ========================
// Appointment Types
// ========================
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "expired";
export type AppointmentUrgency = "non-urgent" | "urgent";

export interface Appointment {
  id: string;
  name: string;
  email: string;
  subject: string;
  urgency: AppointmentUrgency;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ========================
// Newsletter Types
// ========================
export interface NewsletterSubscriber {
  id: string;
  email: string;
  active: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
}

// ========================
// Testimonial Types
// ========================
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  role_en?: string;
  company?: string;
  avatar?: string;
  content: string;
  content_en?: string;
  rating?: number;
  visible: boolean;
  createdAt?: string;
}

export type TestimonialFormData = Omit<
  Testimonial,
  "id" | "visible" | "createdAt"
>;

// ========================
// Dashboard Stats
// ========================
export interface DashboardStats {
  projects: number;
  experiences: number;
  blogPosts: number;
  contacts: number;
  appointments: number;
  newsletterSubscribers: number;
  unreadMessages: number;
  upcomingAppointments: number;
}

// ========================
// Table Types
// ========================
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface TableAction<T> {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
}

// ========================
// Navigation Types
// ========================
export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: number;
}
