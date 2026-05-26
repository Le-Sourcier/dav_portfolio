"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { localizedPath } from "@/lib/routing/localizedPath";
import type { BlogPost } from "@/types/blog";

type BlogDirectoryProps = {
  posts: BlogPost[];
  locale?: string;
};

type SortKey = "recent" | "popular" | "discussed";

const formatDate = (iso: string, locale = "fr") =>
  new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const scorePost = (post: BlogPost) =>
  post.viewCount * 3 + post.shareCount * 5 + post.comments.length * 8;

export function BlogDirectory({ posts, locale = "fr" }: BlogDirectoryProps) {
  const t = useTranslations("BlogIndex");
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const categories = useMemo(
    () => Array.from(new Set(posts.map((post) => post.category).filter(Boolean))),
    [posts],
  );

  const featured = useMemo(
    () =>
      [...posts].sort((a, b) => {
        const scoreDelta = scorePost(b) - scorePost(a);
        if (scoreDelta !== 0) return scoreDelta;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })[0],
    [posts],
  );
  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts
      .filter((post) => {
        const matchesCategory = activeCategory === "all" || post.category === activeCategory;
        const searchable = [
          post.title,
          post.excerpt,
          post.category,
          post.author,
          post.readTime,
          ...(post.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);

        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sort === "popular") return b.viewCount - a.viewCount;
        if (sort === "discussed") return b.comments.length - a.comments.length;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [activeCategory, posts, query, sort]);

  const visiblePosts =
    activeCategory === "all" && query.trim() === "" && featured
      ? filteredPosts.filter((post) => post.slug !== featured.slug)
      : filteredPosts;
  const hasFilters = activeCategory !== "all" || query.trim() !== "";
  const resetFilters = () => {
    setActiveCategory("all");
    setQuery("");
    setSort("recent");
  };

  return (
    <section className="section blog-index">
      <div className="blog-control-panel">
        <div>
          <span>{t("count", { count: posts.length })}</span>
          <strong>{t("controlTitle")}</strong>
        </div>
        <div className="blog-filter-box">
          <div className="blog-filter-row">
            <label className="blog-search">
              <span>{t("search")}</span>
              <div className="filter-search-shell">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("searchPlaceholder")}
                />
                <button
                  type="button"
                  className="filter-settings-button"
                  aria-label={t("sort")}
                  aria-expanded={settingsOpen}
                  onClick={() => setSettingsOpen((current) => !current)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 7h10" />
                    <path d="M18 7h2" />
                    <path d="M16 5v4" />
                    <path d="M4 17h2" />
                    <path d="M10 17h10" />
                    <path d="M8 15v4" />
                  </svg>
                </button>
                {settingsOpen ? (
                  <div className="filter-settings-popover">
                    <span>{t("sort")}</span>
                    <div>
                      {[
                        ["recent", t("sortRecent")],
                        ["popular", t("sortPopular")],
                        ["discussed", t("sortDiscussed")],
                      ].map(([value, label]) => (
                        <button
                          type="button"
                          key={value}
                          className={sort === value ? "is-active" : ""}
                          onClick={() => {
                            setSort(value as SortKey);
                            setSettingsOpen(false);
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </label>
          </div>
          <div className="blog-category-tabs" aria-label="Catégories du blog">
            <button
              type="button"
              className={activeCategory === "all" ? "is-active" : ""}
              onClick={() => setActiveCategory("all")}
            >
              {t("all")}
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={activeCategory === category ? "is-active" : ""}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
            {hasFilters ? (
              <button type="button" className="blog-reset-filter" onClick={resetFilters}>
                {t("reset")}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {featured && !hasFilters ? (
        <Link href={localizedPath(`/blog/${featured.slug}`, locale)} className="blog-featured" aria-label={`${t("read")} ${featured.title}`}>
          <img src={featured.coverImage} alt={featured.coverImageAlt ?? featured.title} />
          <div>
            <span>{t("featured")} · {featured.category}</span>
            <h2>{featured.title}</h2>
            <p>{featured.excerpt}</p>
            <div className="blog-featured-meta">
              <small>{formatDate(featured.date, locale)}</small>
              <small>{featured.readTime}</small>
              <small>{t("views", { count: featured.viewCount })}</small>
              <small>{t("comments", { count: featured.comments.length })}</small>
            </div>
            <strong>{t("readArticle")}</strong>
          </div>
        </Link>
      ) : (
        !featured ? (
          <div className="blog-empty-state">
            <strong>{t("emptyTitle")}</strong>
            <p>{t("emptyText")}</p>
          </div>
        ) : null
      )}

      <div className="blog-results-header">
        <span>{t("results", { count: filteredPosts.length })}</span>
        <p>
          {hasFilters
            ? t("filteredHint")
            : t("defaultHint")}
        </p>
      </div>

      {visiblePosts.length > 0 ? (
        <div className="blog-list">
          {visiblePosts.map((post) => (
            <Link href={localizedPath(`/blog/${post.slug}`, locale)} key={post.slug} className="blog-list-item">
              <img src={post.coverImage} alt={post.coverImageAlt ?? post.title} />
              <div>
                <span>{post.category}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className="blog-card-meta">
                  <small>{formatDate(post.date, locale)}</small>
                  <small>{post.readTime}</small>
                  <small>{t("views", { count: post.viewCount })}</small>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="blog-empty-state">
          <strong>{t("noResultsTitle")}</strong>
          <p>{t("noResultsText")}</p>
          <button type="button" onClick={resetFilters}>{t("resetFilters")}</button>
        </div>
      )}
    </section>
  );
}
