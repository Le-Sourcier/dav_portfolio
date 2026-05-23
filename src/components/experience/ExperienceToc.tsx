"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface ExperienceTocProps {
  items: { id: string; label: string }[];
}

export function ExperienceToc({ items }: ExperienceTocProps) {
  const t = useTranslations("ExperienceToc");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: 0,
      },
    );

    items.forEach(({ id }) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="xp-toc" aria-label={t("navAriaLabel")}>
      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            className={item.id === activeId ? "is-active" : undefined}>
            <a href={`#${item.id}`}>
              <span aria-hidden="true" />
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
