export type BlogSection = {
  title: string;
  body: string;
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
};

export type BlogFaqEntry = {
  question: string;
  answer: string;
};

export type BlogResource = {
  label: string;
  href: string;
  type: string;
};

export type BlogComment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  coverImageAlt?: string;
  category: string;
  date: string;
  updatedAt?: string;
  readTime: string;
  author?: string;
  wordCount?: number;
  viewCount: number;
  shareCount: number;
  comments: BlogComment[];
  level?: string;
  language?: string;
  featured: boolean;
  tags: string[];
  keyPoints: string[];
  takeaway: string;
  intro: string;
  pullQuote?: string;
  sections: BlogSection[];
  faq?: BlogFaqEntry[];
  resources?: BlogResource[];
};
