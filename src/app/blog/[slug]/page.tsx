import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Newsletter } from "@/components/Newsletter";
import { ArticleFaq } from "@/components/blog/ArticleFaq";
import { ArticleFigure } from "@/components/blog/ArticleFigure";
import { ArticleHero } from "@/components/blog/ArticleHero";
import { ArticleResources } from "@/components/blog/ArticleResources";
import { BackToTop } from "@/components/blog/BackToTop";
import { PullQuote } from "@/components/blog/PullQuote";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ShareBar } from "@/components/blog/ShareBar";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { blogPosts, site } from "@/lib/portfolio";
import { loadProjects } from "@/services/portfolio/projectsLoader";
import type { BlogPost } from "@/types/blog";
import { sectionId } from "@/utils/sectionId";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

const findPost = (slug: string): BlogPost | undefined =>
  (blogPosts as BlogPost[]).find((item) => item.slug === slug);

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    alternates: { canonical: `${site.url}/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `${site.url}/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updatedAt ?? post.date,
      section: post.category,
      tags: post.tags,
      authors: [site.name],
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: ["/opengraph-image"],
    },
  };
}

const buildJsonLd = (post: BlogPost) => ({
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
  image: post.coverImage ? `${site.url}${post.coverImage}` : undefined,
  author: { "@type": "Person", name: site.name },
  publisher: { "@type": "Person", name: site.name },
  mainEntityOfPage: `${site.url}/blog/${post.slug}`,
});

const buildBreadcrumbJsonLd = (post: BlogPost) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: site.url },
    { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog` },
    { "@type": "ListItem", position: 3, name: post.title, item: `${site.url}/blog/${post.slug}` },
  ],
});

const buildFaqJsonLd = (post: BlogPost) =>
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = findPost(slug);

  if (!post) {
    notFound();
  }

  const allPosts = blogPosts as BlogPost[];
  const currentIndex = allPosts.findIndex((item) => item.slug === post.slug);
  const previousPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const articleUrl = `${site.url}/blog/${post.slug}`;
  const contactHref = `mailto:${site.email}?subject=${encodeURIComponent(`Discussion autour de: ${post.title}`)}`;
  const tocItems = post.sections.map((section) => ({
    id: sectionId(section.title),
    title: section.title,
  }));
  const jsonLd = buildJsonLd(post);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(post);
  const faqJsonLd = buildFaqJsonLd(post);
  const pullQuoteIndex = post.sections.length >= 3 ? 1 : 0;
  const projects = await loadProjects();
  const hasProjects = projects.length > 0;

  return (
    <>
      <Header showProjects={hasProjects} />
      <ReadingProgress />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        {faqJsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        ) : null}
        <article className="article-shell">
          <Link href="/blog" className="text-link article-back-link">
            ← Retour au blog
          </Link>
          <ArticleHero post={post} authorInitials={site.initials} authorName={site.name} />
          <div className="article-intro">
            <p>{post.intro}</p>
            <aside className="article-takeaway">
              <span>À retenir</span>
              <p>{post.takeaway}</p>
            </aside>
          </div>

          <section className="article-keypoints" aria-labelledby="synthese-article">
            <div>
              <p className="section-kicker" id="synthese-article">
                Synthèse
              </p>
              <h2>Trois décisions qui changent la qualité du produit.</h2>
            </div>
            <div>
              {post.keyPoints.map((point, index) => (
                <article key={point}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{point}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="article-layout">
            <aside className="article-sidebar">
              <TableOfContents items={tocItems} />
            </aside>

            <div className="article-body">
              {post.sections.map((section, index) => (
                <div key={section.title}>
                  <section id={sectionId(section.title)}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h2>{section.title}</h2>
                    <p>{section.body}</p>
                    {section.image ? (
                      <ArticleFigure
                        src={section.image}
                        alt={section.imageAlt ?? section.title}
                        caption={section.imageCaption}
                      />
                    ) : null}
                  </section>
                  {post.pullQuote && index === pullQuoteIndex ? (
                    <PullQuote text={post.pullQuote} attribution={site.name} />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {post.faq && post.faq.length > 0 ? <ArticleFaq entries={post.faq} /> : null}

          {post.resources && post.resources.length > 0 ? (
            <ArticleResources resources={post.resources} />
          ) : null}

          <section className="article-cta">
            <div>
              <p className="section-kicker">Passer à l&apos;action</p>
              <h2>Transformer cette réflexion en décision produit.</h2>
              <p>
                Si ce sujet ressemble à un problème réel dans votre produit, le plus utile est de clarifier le contexte,
                les contraintes et les prochains choix techniques.
              </p>
            </div>
            <div>
              <a className="primary-button" href={contactHref}>
                Discuter du sujet
              </a>
              {hasProjects ? (
                <Link className="secondary-button" href="/#projets">
                  Voir les projets
                </Link>
              ) : null}
            </div>
          </section>

          <ShareBar url={articleUrl} title={post.title} />

          <nav className="article-pagination" aria-label="Navigation entre articles">
            {previousPost ? (
              <Link href={`/blog/${previousPost.slug}`}>
                <span>Précédent</span>
                <strong>{previousPost.title}</strong>
                <small>{previousPost.category} · {previousPost.readTime}</small>
              </Link>
            ) : (
              <span />
            )}
            {nextPost ? (
              <Link href={`/blog/${nextPost.slug}`}>
                <span>Suivant</span>
                <strong>{nextPost.title}</strong>
                <small>{nextPost.category} · {nextPost.readTime}</small>
              </Link>
            ) : (
              <span />
            )}
          </nav>

          <div className="article-author">
            <div>
              <span>{site.initials}</span>
            </div>
            <section>
              <p className="section-kicker">Auteur</p>
              <h2>{site.name}</h2>
              <p>
                Développeur fullstack orienté produits SaaS, backend critique, automatisation métier et interfaces web
                premium.
              </p>
            </section>
          </div>
        </article>

        <Newsletter compact />
        <Footer showProjects={hasProjects} />
      </main>
      <BackToTop />
    </>
  );
}
