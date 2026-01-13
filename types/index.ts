
export type AdminRole = 'SUPER_ADMIN' | 'EDITOR' | 'VIEWER';

export interface ProjectRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  category: 'Web Development' | 'Mobile App' | 'AI Integration' | 'Automation' | 'Audit & Consulting';
  description: string;
  budget?: string;
  date: string;
  status: 'New' | 'Contacted' | 'Archived';
}

export interface Project {
  title: string;
  description: string;
  stack: string[];
  demoUrl?: string;
  githubUrl?: string;
  image?: string;
  category: 'Professional' | 'Personal' | 'Open Source';
  featured?: boolean;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  tasks: string[];
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  date: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  tags: string[];
  readTime: string;
  image: string;
}

export interface PortfolioData {
  name: string;
  role: string;
  bio: string;
  cvUrl: string;
  contact: {
    email: string;
    phone: string;
    github: string;
    linkedin: string;
    address: string;
  };
  skills: SkillCategory[];
  experiences: Experience[];
  projects: Project[];
  npmPackages: { name: string; downloads?: string; version: string }[];
  blogs: BlogPost[];
  requests?: ProjectRequest[]; // Optionnel pour la compatibilité
}
