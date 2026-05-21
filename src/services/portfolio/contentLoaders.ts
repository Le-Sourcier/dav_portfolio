import { envConfig } from "@/config/env";
import { defaultLocale, type AppLocale } from "@/i18n/config";
import { localizeText } from "@/i18n/localize";
import { requestApi } from "@/services/portfolio/apiRequest";
import type {
  BackendBlogPost,
  BackendExperience,
  BackendTestimonial,
} from "@/types/backend.types";
import type { BlogPost, BlogSection } from "@/types/blog";

export type PortfolioExperienceItem = {
  company: string;
  role: string;
  period: string;
  focus: string;
  summary: string;
  points: string[];
};

export type PortfolioTestimonialItem = {
  id: string;
  quote: string;
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  rating?: number;
  createdAt?: string;
};

function stripContent(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeMarkdownContent(value: string): string {
  return value
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const fallbackCovers = ["/blog/cover-saas.svg", "/blog/cover-automation.svg", "/blog/cover-portfolio.svg"];

function fallbackCover(seed: string): string {
  const checksum = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return fallbackCovers[checksum % fallbackCovers.length];
}

function normalizeMediaUrl(url?: string | null, fallback?: string): string | undefined {
  if (!url?.trim()) return fallback;
  const value = url.trim();

  try {
    const parsed = new URL(value);
    if (parsed.hostname === "resource.yao.media") return fallback;
    if (!["http:", "https:"].includes(parsed.protocol)) return fallback;
    return value;
  } catch {
    if (
      value.startsWith("/") ||
      value.startsWith("uploads/") ||
      value.startsWith("storage/") ||
      value.startsWith("./") ||
      value.startsWith("../")
    ) {
      return value;
    }
    return fallback;
  }
}

function parseSections(content: string): BlogSection[] {
  const markdownSections = content
    .split(/\n(?=##\s+)/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (markdownSections.length > 1 || markdownSections[0]?.startsWith("## ")) {
    return markdownSections
      .map((chunk) => {
        const [heading = "", ...bodyLines] = chunk.split("\n");
        const title = heading.replace(/^##\s+/, "").trim();
        const body = stripContent(bodyLines.join("\n"));
        return title && body ? { title, body } : null;
      })
      .filter((section): section is BlogSection => Boolean(section));
  }

  return [];
}

function wordCount(value: string): number {
  const words = stripContent(value).match(/\S+/g);
  return words?.length ?? 0;
}

function normalizeBlogPost(
  post: BackendBlogPost,
  locale: AppLocale,
  featured = false,
): BlogPost {
  const title = localizeText(locale, post.title, post.title_en);
  const excerpt = localizeText(locale, post.excerpt, post.excerpt_en);
  const content = normalizeMarkdownContent(localizeText(locale, post.content, post.content_en));
  const sections = parseSections(content);
  const keyPoints = sections
    .map((section) => section.title)
    .filter((title) => title && title !== "Article")
    .slice(0, 3);
  const coverFallback = fallbackCover(`${post.slug}-${post.category}`);

  return {
    id: post.id,
    slug: post.slug,
    title,
    excerpt,
    content,
    coverImage: normalizeMediaUrl(post.imageUrl, coverFallback),
    coverImageAlt: title,
    category: post.category,
    date: post.createdAt ?? new Date().toISOString(),
    updatedAt: post.updatedAt,
    readTime: post.readTime || (locale === "en" ? "4 min read" : "4 min de lecture"),
    author: post.author,
    wordCount: wordCount(content),
    viewCount: Number(post.viewCount ?? 0),
    shareCount: Number(post.shareCount ?? 0),
    comments: Array.isArray(post.comments)
      ? post.comments.map((comment) => ({
          id: comment.id,
          author: comment.author,
          content: comment.content,
          createdAt: comment.createdAt,
        }))
      : [],
    language: locale,
    featured,
    tags: [post.category].filter(Boolean),
    keyPoints,
    takeaway: excerpt,
    intro: excerpt,
    sections,
  };
}

function normalizeExperience(
  item: BackendExperience,
  locale: AppLocale,
): PortfolioExperienceItem {
  const role = localizeText(locale, item.title, item.title_en);
  const summary = localizeText(locale, item.description, item.description_en);
  const points = [
    ...(Array.isArray(item.challenges) ? item.challenges : []),
    ...(Array.isArray(item.stack) ? item.stack : []),
  ]
    .filter(Boolean)
    .slice(0, 4);

  return {
    company: item.company,
    role,
    period: item.dates,
    focus: item.location || item.stack?.[0] || item.company,
    summary,
    points,
  };
}

function normalizeTestimonial(
  item: BackendTestimonial,
  locale: AppLocale,
): PortfolioTestimonialItem {
  const role = localizeText(locale, item.role, item.role_en);
  const avatar = item.avatar?.trim() || undefined;
  return {
    id: item.id,
    quote: localizeText(locale, item.content, item.content_en),
    name: item.name,
    role,
    company: item.company?.trim() || undefined,
    avatar,
    rating: typeof item.rating === "number" ? Math.max(0, Math.min(5, item.rating)) : undefined,
    createdAt: item.createdAt ?? undefined,
  };
}

export async function loadBlogPosts(locale: AppLocale = defaultLocale): Promise<BlogPost[]> {
  try {
    const posts = await requestApi<BackendBlogPost[]>("/blog");
    return Array.isArray(posts)
      ? posts.map((post, index) => normalizeBlogPost(post, locale, index === 0))
      : [];
  } catch (error) {
    console.error(`[portfolio] Unable to load blog posts from API (${envConfig.apiUrl}/blog):`, error);
    return [];
  }
}

export async function loadBlogPostBySlug(
  slug: string,
  locale: AppLocale = defaultLocale,
): Promise<BlogPost | null> {
  try {
    const post = await requestApi<BackendBlogPost>(`/blog/slug/${encodeURIComponent(slug)}`);
    return normalizeBlogPost(post, locale, true);
  } catch (error) {
    console.error(`[portfolio] Unable to load blog post "${slug}" from API (${envConfig.apiUrl}/blog/slug/${slug}):`, error);
    return null;
  }
}

export async function loadExperiences(
  locale: AppLocale = defaultLocale,
): Promise<PortfolioExperienceItem[]> {
  try {
    const experiences = await requestApi<BackendExperience[]>("/experiences");
    return Array.isArray(experiences)
      ? experiences.map((item) => normalizeExperience(item, locale))
      : [];
  } catch (error) {
    console.error(`[portfolio] Unable to load experiences from API (${envConfig.apiUrl}/experiences):`, error);
    return [];
  }
}

export async function loadTestimonials(
  locale: AppLocale = defaultLocale,
): Promise<PortfolioTestimonialItem[]> {
  try {
    const testimonials = await requestApi<BackendTestimonial[]>("/testimonials");
    return Array.isArray(testimonials)
      ? testimonials.map((item) => normalizeTestimonial(item, locale))
      : [];
  } catch (error) {
    console.error(`[portfolio] Unable to load testimonials from API (${envConfig.apiUrl}/testimonials):`, error);
    return [];
  }
}
