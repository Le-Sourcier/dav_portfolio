// ========================
// Project Types
// ========================
export interface ProjectMetric {
  name: string;
  name_en?: string | null;
  value: number;
  previousValue: number;
  unit: string;
}

export interface ChartData {
  name: string;
  name_en?: string | null;
  value: number;
}

export interface DiagramNode {
  id: string;
  label: string;
  label_en?: string | null;
  type: 'client' | 'gateway' | 'service' | 'database' | 'external' | 'ai';
}

export interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
  label_en?: string | null;
}

export interface SolutionDiagram {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
}

export interface ImpactData {
  label: string;
  label_en?: string | null;
  value: number;
}

export type ProjectCategory = string;

export interface ProjectLink {
  label: string;
  label_en?: string | null;
  href: string;
}

export interface IProject {
  id: string;
  slug: string;
  title: string;
  name: string;
  category: ProjectCategory;
  category_en?: string | null;
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
  published: boolean;
  publishedAt?: Date | null;
  results: string[];
  metrics: ProjectMetric[];
  chartData: ChartData[];
  url?: string;
  solutionDiagram?: SolutionDiagram;
  impactGraph?: ImpactData[];
  title_en?: string;
  description_en?: string;
  problem_en?: string;
  solution_en?: string;
  headline_en?: string;
  result_en?: string;
  metric_en?: string;
  role_en?: string;
  results_en?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ========================
// Experience Types
// ========================
export interface ExperienceAchievement {
  title: string;
  title_en?: string | null;
  description: string;
  description_en?: string | null;
  icon?: string;
}

export interface ExperienceLink {
  label: string;
  label_en?: string | null;
  url: string;
}

export interface IExperience {
  id: string;
  title: string;
  company: string;
  location?: string;
  dates: string;
  description: string;
  details?: string[];
  details_en?: string[];
  links?: ExperienceLink[];
  coverImage?: string;
  illustrativeImages?: string[];
  stack?: string[];
  challenges?: string[];
  challenges_en?: string[];
  achievements?: ExperienceAchievement[];
  solutionDiagram?: SolutionDiagram;
  impactGraph?: ImpactData[];
  title_en?: string;
  description_en?: string;
  published: boolean;
  publishedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// ========================
// Blog Types
// ========================
export interface IBlogComment {
  id: string;
  author: string;
  email: string;
  content: string;
  postId: string;
  parentId: string | null;
  mentions: string[];
  createdAt: Date;
  replies?: IBlogComment[];
}

export interface IBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  readTime: string;
  author: string;
  published: boolean;
  publishedAt?: Date | null;
  newsletterSentAt?: Date | null;
  viewCount: number;
  shareCount: number;
  tags?: string[];
  tagIds?: string[];
  blogTags?: IBlogTag[];
  title_en?: string;
  excerpt_en?: string;
  content_en?: string;
  comments?: IBlogComment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBlogTag {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  isVisible: boolean;
  postsCount?: number;
  viewsCount?: number;
  sharesCount?: number;
  commentsCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ========================
// Contact Types
// ========================
export interface IContact {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  reply?: string;
  repliedAt?: Date;
  createdAt?: Date;
}

// ========================
// Appointment Types
// ========================
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
export type AppointmentUrgency = 'non-urgent' | 'urgent';

export interface IAppointment {
  id: string;
  name: string;
  email: string;
  subject: string;
  urgency: AppointmentUrgency;
  date: Date;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ========================
// Newsletter Types
// ========================
export interface INewsletter {
  id: string;
  email: string;
  locale: 'fr' | 'en';
  active: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

// ========================
// Testimonial Types
// ========================
export interface ITestimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  content: string;
  rating?: number;
  content_en?: string;
  role_en?: string;
  visible: boolean;
  createdAt?: Date;
}

// ========================
// Admin Types
// ========================
export type AdminRole = 'admin' | 'super_admin';

export interface IAdmin {
  id: string;
  email: string;
  password: string;
  name: string;
  role: AdminRole;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// ========================
// Chatbot Types
// ========================
export type MessageType = 'text' | 'appointment_picker' | 'project_link' | 'experience_link' | 'blog_link' | 'contact_form' | 'loading';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: MessageType;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}
