import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Newsletter } from "@/components/Newsletter";
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
  const [featured, ...rest] = blogPosts;

  return (
    <>
      <Header />
      <main>
        <section className="blog-hero section">
          <p className="section-kicker">Blog</p>
          <h1>Réflexions techniques pour construire des produits plus solides.</h1>
          <p>
            Des notes courtes et concrètes sur l&apos;architecture SaaS, l&apos;automatisation, le produit et la
            qualité d&apos;exécution.
          </p>
        </section>

        <section className="section blog-index">
          <Link href={`/blog/${featured.slug}`} className="blog-featured">
            <div className="blog-featured-visual">
              <span>{featured.category}</span>
              <strong>{featured.readTime}</strong>
            </div>
            <div>
              <span>{featured.date}</span>
              <h2>{featured.title}</h2>
              <p>{featured.excerpt}</p>
            </div>
          </Link>

          <div className="blog-list">
            {rest.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.slug} className="blog-list-item">
                <div>
                  <span>{post.category} · {post.readTime}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>
                <strong>Lire</strong>
              </Link>
            ))}
          </div>
        </section>
        <Newsletter />
        <Footer />
      </main>
    </>
  );
}
