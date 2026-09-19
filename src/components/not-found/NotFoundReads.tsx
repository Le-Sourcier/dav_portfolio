import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/config";
import type { BlogPost } from "@/types/blog";
import { localizedPath } from "@/lib/routing/localizedPath";
import { formatShortDate } from "@/utils/date";

export async function NotFoundReads({ posts, locale }: { posts: BlogPost[]; locale: AppLocale }) {
  if (posts.length === 0) return null;
  const t = await getTranslations({ locale, namespace: "NotFoundPremium" });
  return (
    <section className="section notfound-reads" aria-labelledby="notfound-reads-title">
      <div className="notfound-reads-head">
        <div><p className="section-kicker">{t("recentReads")}</p><h2 id="notfound-reads-title">{t("readsTitle")}</h2></div>
        <Link className="text-link" href={localizedPath("/blog", locale)}>{t("allArticles")}</Link>
      </div>
      <div className="notfound-reads-list">
        {posts.map(post => (
          <Link className="notfound-read-item" href={localizedPath(`/blog/${post.slug}`, locale)} key={post.slug}>
            <span>{post.category}</span><strong>{post.title}</strong><p>{post.excerpt}</p>
            <small>{formatShortDate(post.date, locale)} · {post.readTime}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}
