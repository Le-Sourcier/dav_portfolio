import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Newsletter } from "@/components/Newsletter";
import { ArticleHero } from "@/components/blog/ArticleHero";
import { BackToTop } from "@/components/blog/BackToTop";
import { CommentsSection } from "@/components/blog/comments/CommentsSection";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ShareBar } from "@/components/blog/ShareBar";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { site } from "@/lib/portfolio";
import { getRequestLocale } from "@/i18n/server";
import { localizedLanguages, localizedPath } from "@/lib/routing/localizedPath";
import { loadBlogPostBySlug, loadBlogPosts } from "@/services/portfolio/contentLoaders";
import { loadProjects } from "@/services/portfolio/projectsLoader";
import type { BlogPost } from "@/types/blog";
import { sectionId } from "@/utils/sectionId";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const post = await loadBlogPostBySlug(slug, locale);

  if (!post) {
    return {};
  }

  const url = `${site.url}${localizedPath(`/blog/${post.slug}`, locale)}`;

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    alternates: {
      canonical: url,
      languages: localizedLanguages(`/blog/${post.slug}`),
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      publishedTime: post.date,
      modifiedTime: post.updatedAt ?? post.date,
      section: post.category,
      tags: post.tags,
      authors: [site.name],
      images: [
        {
          url: absoluteImageUrl(post.coverImage) ?? "/opengraph-image",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [absoluteImageUrl(post.coverImage) ?? "/opengraph-image"],
    },
  };
}

const absoluteImageUrl = (url?: string) =>
  url ? (url.startsWith("http") ? url : `${site.url}${url}`) : undefined;

const buildJsonLd = (post: BlogPost, locale: string) => ({
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
  image: absoluteImageUrl(post.coverImage),
  author: { "@type": "Person", name: site.name },
  publisher: { "@type": "Person", name: site.name },
  mainEntityOfPage: `${site.url}${localizedPath(`/blog/${post.slug}`, locale)}`,
  interactionStatistic: [
    {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/ReadAction",
      userInteractionCount: post.viewCount,
    },
    {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/ShareAction",
      userInteractionCount: post.shareCount,
    },
    {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/CommentAction",
      userInteractionCount: post.comments.length,
    },
  ],
});

const buildBreadcrumbJsonLd = (post: BlogPost, labels: { home: string; blog: string }, locale: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: labels.home, item: `${site.url}${localizedPath("/", locale)}` },
    { "@type": "ListItem", position: 2, name: labels.blog, item: `${site.url}${localizedPath("/blog", locale)}` },
    { "@type": "ListItem", position: 3, name: post.title, item: `${site.url}${localizedPath(`/blog/${post.slug}`, locale)}` },
  ],
});

const formatDate = (iso: string, locale = "fr") =>
  new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatCount = (value: number, locale = "fr") =>
  new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const t = await getTranslations("BlogArticle");
  const post = await loadBlogPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  const allPosts = await loadBlogPosts(locale);
  const currentIndex = allPosts.findIndex((item) => item.slug === post.slug);
  const previousPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const articleUrl = `${site.url}${localizedPath(`/blog/${post.slug}`, locale)}`;
  const tocItems = post.sections.map((section) => ({
    id: sectionId(section.title),
    title: section.title,
  }));
  const jsonLd = buildJsonLd(post, locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(post, { home: t("home"), blog: t("blog") }, locale);
  const projects = await loadProjects(locale);
  const hasProjects = projects.length > 0;
  const hasBlog = allPosts.length > 0;
  const hireSubject = encodeURIComponent(`Discussion autour de l'article : ${post.title}`);
  const hireBody = encodeURIComponent(
    `Bonjour David,\n\nJ'ai lu votre article "${post.title}" et je voudrais discuter d'un besoin proche.\n\nContexte :\nObjectif :\nDelai :\n\nMerci.`,
  );
  const articleFacts = [
    { label: t("category"), value: post.category },
    { label: t("readTime"), value: post.readTime },
    { label: t("published"), value: formatDate(post.date, post.language) },
    { label: t("views"), value: formatCount(post.viewCount, post.language) },
    { label: t("shares"), value: formatCount(post.shareCount, post.language) },
    { label: t("comments"), value: formatCount(post.comments.length, post.language) },
  ];

  return (
    <>
      <Header showProjects={hasProjects} showBlog={hasBlog} />
      <ReadingProgress />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <article className="article-shell article-shell--detail">
          <ArticleHero
            post={post}
            authorInitials={site.initials}
            authorName={post.author || site.name}
            backHref={localizedPath("/blog", locale)}
            backLabel={t("back")}
            actions={<ShareBar url={articleUrl} title={post.title} compact />}
          />

          <div className="article-layout">
            <aside className="article-sidebar">
              <div className="article-meta-panel" role="group" aria-label={t("articleMeta")}>
                {articleFacts.map((item) => (
                  <p key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </p>
                ))}
              </div>
              {tocItems.length > 0 ? <TableOfContents items={tocItems} /> : null}
            </aside>

            <div className="article-body">
              {post.excerpt ? <p className="article-standfirst">{post.excerpt}</p> : null}
              <MarkdownContent content={post.content} />
            </div>
          </div>

          <CommentsSection
            postId={post.id}
            initialComments={post.comments}
            language={post.language}
          />

          <nav className="article-pagination" aria-label="Navigation entre articles">
            {previousPost ? (
              <Link href={localizedPath(`/blog/${previousPost.slug}`, locale)} className="article-pagination-card is-prev">
                <span className="article-pagination-arrow" aria-hidden="true">&larr;</span>
                <span className="article-pagination-text">
                  <span className="article-pagination-label">{t("previous")}</span>
                  <strong>{previousPost.title}</strong>
                  <small>{previousPost.category} · {previousPost.readTime}</small>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {nextPost ? (
              <Link href={localizedPath(`/blog/${nextPost.slug}`, locale)} className="article-pagination-card is-next">
                <span className="article-pagination-text">
                  <span className="article-pagination-label">{t("next")}</span>
                  <strong>{nextPost.title}</strong>
                  <small>{nextPost.category} · {nextPost.readTime}</small>
                </span>
                <span className="article-pagination-arrow" aria-hidden="true">&rarr;</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>

          <section className="case-hire-cta article-contact-cta" aria-labelledby="article-contact-title">
            <div>
              <span>{t("contactKicker")}</span>
              <h2 id="article-contact-title">{t("contactTitle")}</h2>
            </div>
            <div className="case-hire-note">
              <p>{t("contactText")}</p>
              <dl>
                <div>
                  <dt>{t("contactFormat")}</dt>
                  <dd>{t("contactFormatValue")}</dd>
                </div>
                <div>
                  <dt>{t("contactFocus")}</dt>
                  <dd>{t("contactFocusValue")}</dd>
                </div>
              </dl>
            </div>
            <div className="case-hire-actions">
              <a href={`mailto:${site.email}?subject=${hireSubject}&body=${hireBody}`}>
                {t("contactPrimary")}
              </a>
              <a href="/cv/david-logan-cv.pdf">{t("downloadCv")}</a>
            </div>
          </section>
        </article>

        <Newsletter compact />
        <Footer showProjects={hasProjects} showBlog={hasBlog} />
      </main>
      <BackToTop />
    </>
  );
}
