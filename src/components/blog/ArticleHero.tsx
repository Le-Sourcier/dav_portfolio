import Link from "next/link";
import type { ReactNode } from "react";
import type { BlogPost } from "@/types/blog";

type ArticleHeroProps = {
  post: BlogPost;
  authorInitials: string;
  authorName: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
};

const formatDate = (iso: string, locale = "fr") =>
  new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export function ArticleHero({
  post,
  authorInitials,
  authorName,
  backHref,
  backLabel,
  actions,
}: ArticleHeroProps) {
  const chips: { label: string; type?: "author" }[] = [
    { label: authorName, type: "author" },
    { label: post.readTime },
  ];
  if (post.level) {
    chips.push({ label: post.level });
  }
  chips.push({ label: formatDate(post.date, post.language) });

  return (
    <section className="article-cover-hero" aria-label={post.title}>
      {post.coverImage ? (
        <img
          src={post.coverImage}
          alt={post.coverImageAlt ?? post.title}
          className="article-cover-hero-img"
        />
      ) : null}
      <div className="article-cover-overlay" aria-hidden="true" />
      <div className="article-cover-content">
        <div className="article-cover-toolbar">
          <div className="article-cover-toolbar-main">
            {backHref && backLabel ? (
              <Link href={backHref} className="article-cover-back-link">
                {backLabel}
              </Link>
            ) : null}
            <p className="article-cover-kicker">{post.category}</p>
          </div>
          {actions ? <div className="article-cover-actions">{actions}</div> : null}
        </div>
        <h1>{post.title}</h1>
        <div className="article-cover-meta-row">
          <div className="article-cover-meta">
            {chips.map((chip) => (
              <span key={chip.label} className={chip.type === "author" ? "is-author" : undefined}>
                {chip.type === "author" ? <small aria-hidden="true">{authorInitials}</small> : null}
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
