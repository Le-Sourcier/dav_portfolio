"use client";

import { CSSProperties, useEffect, useState } from "react";

type BackToTopStyle = CSSProperties & {
  "--scroll-progress": string;
};

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const ratio = Math.min(Math.max(window.scrollY / max, 0), 1);
      setProgress(ratio);
      setVisible(window.scrollY > 320);
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

  const progressAngle = `${Math.round(progress * 360)}deg`;

  return (
    <button
      type="button"
      className={`article-back-to-top${visible ? " is-visible" : ""}`}
      onClick={handleClick}
      aria-label="Revenir en haut de la page"
      style={{ "--scroll-progress": progressAngle } as BackToTopStyle}
    >
      <svg className="article-back-to-top-arrow" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 19V6M6 12l6-6 6 6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      <span>Haut</span>
    </button>
  );
}
