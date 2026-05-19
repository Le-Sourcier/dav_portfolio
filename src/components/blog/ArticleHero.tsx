import Image from "next/image";
import type { BlogPost } from "@/types/blog";

type ArticleHeroProps = {
  post: BlogPost;
  authorInitials: string;
  authorName: string;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export function ArticleHero({ post, authorInitials, authorName }: ArticleHeroProps) {
  const chips: { label: string; type?: "author" }[] = [
    { label: authorName, type: "author" },
    { label: post.readTime },
  ];
  if (post.level) {
    chips.push({ label: post.level });
  }
  chips.push({ label: formatDate(post.date) });

  return (
    <section className="article-hero-cover" aria-label={post.title}>
      {post.coverImage ? (
        <Image
          src={post.coverImage}
          alt={post.coverImageAlt ?? post.title}
          fill
          sizes="(min-width: 1280px) 1180px, 100vw"
          priority
          className="article-hero-cover-img"
        />
      ) : null}
      <div className="article-hero-cover-veil" aria-hidden="true" />
      <div className="article-hero-cover-content">
        <p className="article-hero-cover-kicker">{post.category}</p>
        <h1>{post.title}</h1>
        <div className="article-hero-cover-chips">
          {chips.map((chip) => (
            <span key={chip.label} className={chip.type === "author" ? "is-author" : undefined}>
              {chip.type === "author" ? <small aria-hidden="true">{authorInitials}</small> : null}
              {chip.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
