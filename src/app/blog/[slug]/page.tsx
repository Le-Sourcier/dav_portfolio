import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Newsletter } from "@/components/Newsletter";
import { blogPosts, site } from "@/lib/portfolio";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `${site.url}/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `${site.url}/blog/${post.slug}`,
      publishedTime: post.date,
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 2);

  return (
    <>
      <Header />
      <main>
        <article className="article-shell">
          <header className="article-hero">
            <Link href="/blog" className="text-link">
              Retour au blog
            </Link>
            <p className="section-kicker">{post.category} · {post.readTime}</p>
            <h1>{post.title}</h1>
            <p>{post.intro}</p>
            <div className="article-meta">
              <span>{post.date}</span>
              <span>{site.name}</span>
            </div>
          </header>

          <div className="article-body">
            {post.sections.map((section) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </section>
            ))}
          </div>
        </article>

        <Newsletter compact />

        <section className="section related-section">
          <div className="section-heading">
            <p className="section-kicker">À lire ensuite</p>
            <h2>Continuer la lecture.</h2>
          </div>
          <div className="blog-card-grid">
            {relatedPosts.map((related) => (
              <Link href={`/blog/${related.slug}`} key={related.slug} className="blog-card">
                <span>{related.category} · {related.readTime}</span>
                <h3>{related.title}</h3>
                <p>{related.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
