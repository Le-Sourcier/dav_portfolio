import type { Metadata } from "next";
import { BlogDirectory } from "@/components/BlogDirectory";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Newsletter } from "@/components/Newsletter";
import { BackToTop } from "@/components/blog/BackToTop";
import { blogPosts, site } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles de Yao David Logan sur architecture SaaS, automatisation métier, Next.js et construction de produits web.",
  alternates: {
    canonical: `${site.url}/blog`,
  },
};

export default function BlogPage() {
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
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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

        <BlogDirectory />
        <Newsletter />
        <Footer />
      </main>
      <BackToTop />
    </>
  );
}
