"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type TableOfContentsItem = {
  id: string;
  title: string;
};

type TableOfContentsProps = {
  items: TableOfContentsItem[];
};

export function TableOfContents({ items }: TableOfContentsProps) {
  const t = useTranslations("BlogArticle");
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null);

    if (nodes.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0, 0.25, 0.6, 1],
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="article-toc" aria-label={t("toc")}>
      <span>{t("toc")}</span>
      <ol>
        {items.map((item, index) => (
          <li key={item.id} className={item.id === activeId ? "is-active" : undefined}>
            <a href={`#${item.id}`}>
              <small>{String(index + 1).padStart(2, "0")}</small>
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
