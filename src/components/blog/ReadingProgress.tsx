"use client";

import { useEffect, useRef } from "react";

/**
 * Reading progress bar driven by scroll position.
 * Falls back to JS for browsers without animation-timeline support; the CSS
 * `.article-progress` keyframes still drive evergreen browsers.
 */
export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (CSS.supports("animation-timeline: scroll()")) {
      return;
    }

    const update = () => {
      const node = barRef.current;
      if (!node) {
        return;
      }
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const ratio = Math.min(Math.max(window.scrollY / max, 0), 1);
      node.style.transform = `scaleX(${ratio})`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <div ref={barRef} className="article-progress" aria-hidden="true" />;
}
