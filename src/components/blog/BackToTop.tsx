"use client";

import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const ratio = Math.min(Math.max(window.scrollY / max, 0), 1);
      setProgress(ratio);
      setVisible(window.scrollY > 720);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const circumference = 2 * Math.PI * 22;
  const dashOffset = circumference * (1 - progress);

  return (
    <button
      type="button"
      className={`article-back-to-top${visible ? " is-visible" : ""}`}
      onClick={handleClick}
      aria-label="Revenir en haut de l'article"
    >
      <svg className="article-back-to-top-ring" viewBox="0 0 50 50" aria-hidden="true">
        <circle cx="25" cy="25" r="22" />
        <circle
          cx="25"
          cy="25"
          r="22"
          style={{ strokeDasharray: circumference, strokeDashoffset: dashOffset }}
        />
      </svg>
      <svg className="article-back-to-top-arrow" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 19V6M6 12l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Haut</span>
    </button>
  );
}
