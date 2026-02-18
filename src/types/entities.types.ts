// ========================
// Project Types
// ========================
export interface ProjectMetric {
  name: string;
  value: number;
  previousValue: number;
  unit: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface DiagramNode {
  id: string;
  label: string;
  type: 'client' | 'gateway' | 'service' | 'database' | 'external' | 'ai';
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

export type ProjectCategory = 'UI/UX' | 'Branding' | 'Web' | 'Art' | 'Photo' | 'Fullstack' | 'Software';

export interface IProject {
  id: string;
  title: string;
  category: ProjectCategory;
  image: string;
  description: string;
  problem: string;
  solution: string;
  results: string[];
  metrics: ProjectMetric[];
  chartData: ChartData[];
  url?: string;
  solutionDiagram?: SolutionDiagram;
  impactGraph?: ImpactData[];
  createdAt?: Date;
  updatedAt?: Date;
}

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

export interface IExperience {
  id: string;
  title: string;
  company: string;
  location?: string;
  dates: string;
  description: string;
  details?: string[];
  links?: ExperienceLink[];
  coverImage?: string;
  illustrativeImages?: string[];
  stack?: string[];
  challenges?: string[];
  achievements?: ExperienceAchievement[];
  solutionDiagram?: SolutionDiagram;
  impactGraph?: ImpactData[];
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
  createdAt: Date;
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
  viewCount: number;
  shareCount: number;
  comments?: IBlogComment[];
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
