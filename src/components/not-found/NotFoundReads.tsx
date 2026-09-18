import Link from "next/link";
import type { BlogPost } from "@/types/blog";
import { formatShortDate } from "@/utils/date";

type NotFoundReadsProps = {
  posts: BlogPost[];
};

export function NotFoundReads({ posts }: NotFoundReadsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="section notfound-reads" aria-labelledby="notfound-reads-title">
      <div className="notfound-reads-head">
        <div>
          <p className="section-kicker">Lectures récentes</p>
          <h2 id="notfound-reads-title">Repartir avec quelque chose d&apos;utile.</h2>
        </div>
        <Link className="text-link" href="/blog">
          Tous les articles
        </Link>
      </div>

      <div className="notfound-reads-list">
        {posts.map((post) => (
          <Link className="notfound-read-item" href={`/blog/${post.slug}`} key={post.slug}>
            <span>{post.category}</span>
            <strong>{post.title}</strong>
            <p>{post.excerpt}</p>
            <small>
              {formatShortDate(post.date)} · {post.readTime}
            </small>
          </Link>
        ))}
      </div>
    </section>
  );
}
