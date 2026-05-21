import type { BlogPost } from "@/types/blog";

type SiteContext = {
  url: string;
  name: string;
};

export const buildBlogPostingJsonLd = (post: BlogPost, site: SiteContext) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  description: post.excerpt,
  datePublished: post.date,
  dateModified: post.updatedAt ?? post.date,
  keywords: post.tags.join(", "),
  articleSection: post.category,
  inLanguage: post.language ?? "fr",
  wordCount: post.wordCount,
  image: post.coverImage
    ? post.coverImage.startsWith("http")
      ? post.coverImage
      : `${site.url}${post.coverImage}`
    : undefined,
  author: { "@type": "Person", name: site.name },
  publisher: { "@type": "Person", name: site.name },
  mainEntityOfPage: `${site.url}/blog/${post.slug}`,
});

export const buildBreadcrumbJsonLd = (post: BlogPost, site: SiteContext) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: site.url },
    { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog` },
    { "@type": "ListItem", position: 3, name: post.title, item: `${site.url}/blog/${post.slug}` },
  ],
});

export const buildFaqJsonLd = (post: BlogPost) =>
  post.faq && post.faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faq.map((entry) => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: { "@type": "Answer", text: entry.answer },
        })),
      }
    : null;
