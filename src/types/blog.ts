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

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  coverImageAlt?: string;
  category: string;
  date: string;
  updatedAt?: string;
  readTime: string;
  wordCount?: number;
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
