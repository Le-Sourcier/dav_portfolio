import type { Metadata } from "next";
import Script from "next/script";
import { BlogDirectory } from "@/components/BlogDirectory";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Newsletter } from "@/components/Newsletter";
import { BackToTop } from "@/components/blog/BackToTop";
import { site } from "@/lib/portfolio";
import { getRequestLocale } from "@/i18n/server";
import { loadBlogPosts } from "@/services/portfolio/contentLoaders";
import { loadProjects } from "@/services/portfolio/projectsLoader";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles de Yao David Logan sur architecture SaaS, automatisation métier, Next.js et construction de produits web.",
  alternates: {
    canonical: `${site.url}/blog`,
  },
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const locale = await getRequestLocale();
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
    description: metadata.description,
    url: `${site.url}/blog`,
    author: {
      "@type": "Person",
      name: site.name,
    },
    blogPost: blogPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      url: `${site.url}/blog/${post.slug}`,
    })),
  };

  return (
    <>
      <Header showProjects={hasProjects} showBlog={hasBlog} />
      <main>
        <Script
          id="blog-index-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <section className="blog-hero section">
          <div>
            <p className="section-kicker">Blog</p>
            <h1>Réflexions techniques pour construire des produits plus solides.</h1>
            <p>
              Des notes concrètes sur architecture SaaS, automatisation, produit et qualité d&apos;exécution. Le but:
              aider à prendre de meilleures décisions techniques avant que la complexité coûte trop cher.
            </p>
          </div>
          <aside className="blog-hero-card" aria-label="Résumé du blog">
            <span>Bibliothèque</span>
            <strong>{blogPosts.length}</strong>
            <p>articles publiés</p>
            <div>
              {categories.map((category) => (
                <small key={category}>{category}</small>
              ))}
            </div>
          </aside>
        </section>

        <BlogDirectory posts={blogPosts} locale={locale} />
        <Newsletter />
        <Footer showProjects={hasProjects} showBlog={hasBlog} />
      </main>
      <BackToTop />
    </>
  );
}
