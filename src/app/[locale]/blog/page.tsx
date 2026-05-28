import type { Metadata } from "next";
import { BlogDirectory } from "@/components/BlogDirectory";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Newsletter } from "@/components/Newsletter";
import { BackToTop } from "@/components/blog/BackToTop";
import { site } from "@/lib/portfolio";
import { getTranslations } from "next-intl/server";
import { getRequestLocale } from "@/i18n/server";
import { localizedLanguages, localizedPath } from "@/lib/routing/localizedPath";
import { loadBlogPosts } from "@/services/portfolio/contentLoaders";
import { loadProjects } from "@/services/portfolio/projectsLoader";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale: routeLocale } = await params;
  const locale = await getRequestLocale(routeLocale);
  const t = await getTranslations({ locale, namespace: "BlogPage" });
  return {
    title: t("pageTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${site.url}${localizedPath("/blog", locale)}`,
      languages: localizedLanguages("/blog"),
    },
  };
}

export const revalidate = 60;

export default async function BlogPage({ params }: LocalePageProps) {
  const { locale: routeLocale } = await params;
  const locale = await getRequestLocale(routeLocale);
  const t = await getTranslations({ locale, namespace: "BlogPage" });
  const [projects, blogPosts] = await Promise.all([
    loadProjects(locale),
    loadBlogPosts(locale),
  ]);
  const hasProjects = projects.length > 0;
  const hasBlog = blogPosts.length > 0;
  const categories = Array.from(new Set(blogPosts.map((post) => post.category)));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog Yao David Logan",
    description: t("metaDescription"),
    url: `${site.url}${localizedPath("/blog", locale)}`,
    author: {
      "@type": "Person",
      name: site.name,
    },
    blogPost: blogPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      url: `${site.url}${localizedPath(`/blog/${post.slug}`, locale)}`,
    })),
  };

  return (
    <>
      <Header showProjects={hasProjects} showBlog={hasBlog} />
      <main>
        <script
          id="blog-index-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <section className="blog-hero section">
          <div>
            <p className="section-kicker">{t("sectionKicker")}</p>
            <h1>{t("sectionTitle")}</h1>
            <p>{t("sectionDescription")}</p>
          </div>
          <aside className="blog-hero-card" aria-label="Résumé du blog">
            <span>{t("libraryLabel")}</span>
            <strong>{blogPosts.length}</strong>
            <p>{t("articlesLabel")}</p>
            <div>
              {categories.map((category) => (
                <small key={category}>{category}</small>
              ))}
            </div>
          </aside>
        </section>

        <BlogDirectory posts={blogPosts} locale={locale} />
        <Newsletter />
        <Footer showProjects={hasProjects} showBlog={hasBlog} locale={locale} />
      </main>
      <BackToTop />
    </>
  );
}
