"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { blogPosts } from "@/lib/portfolio";

const categories = ["Tous", ...Array.from(new Set(blogPosts.map((post) => post.category)))];

export function BlogDirectory() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [query, setQuery] = useState("");

  const featured = blogPosts[0];
  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return blogPosts.filter((post) => {
      const matchesCategory = activeCategory === "Tous" || post.category === activeCategory;
      const searchable = [post.title, post.excerpt, post.category, ...(post.tags ?? [])].join(" ").toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <section className="section blog-index">
      <div className="blog-control-panel">
        <div>
          <span>{blogPosts.length} articles</span>
          <strong>Explorer par problème, stack ou objectif produit.</strong>
        </div>
        <label className="blog-search">
          Recherche
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="SaaS, backend, ROI..."
          />
        </label>
      </div>

      <div className="blog-category-tabs" aria-label="Catégories du blog">
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
      </div>

      <Link href={`/blog/${featured.slug}`} className="blog-featured">
        <div className="blog-featured-visual">
          <span>Article sélectionné</span>
          <strong>{featured.category}</strong>
          <small>{featured.readTime}</small>
        </div>
        <div>
          <span>{featured.date}</span>
          <h2>{featured.title}</h2>
          <p>{featured.excerpt}</p>
          <div className="blog-tag-row">
            {featured.tags.map((tag) => (
              <small key={tag}>{tag}</small>
            ))}
          </div>
        </div>
      </Link>

      <div className="blog-results-header">
        <span>{filteredPosts.length} résultat{filteredPosts.length > 1 ? "s" : ""}</span>
        <p>Articles courts, structurés pour décider vite et appliquer proprement.</p>
      </div>

      <div className="blog-list">
        {filteredPosts.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.slug} className="blog-list-item">
            <div>
              <span>{post.category} · {post.readTime}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="blog-tag-row">
                {post.tags.map((tag) => (
                  <small key={tag}>{tag}</small>
                ))}
              </div>
            </div>
            <strong>Lire</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}
