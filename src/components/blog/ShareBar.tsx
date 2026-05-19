"use client";

import { useEffect, useState } from "react";

type ShareBarProps = {
  url: string;
  title: string;
};

const buildTwitterHref = (url: string, title: string) =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} — ${url}`)}`;

const buildLinkedInHref = (url: string) =>
  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

const buildMailHref = (url: string, title: string) =>
  `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

export function ShareBar({ url, title }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch (error) {
      // Clipboard API unavailable (insecure context, permission denied) — surface a fallback.
      console.warn("Copy to clipboard failed", error);
      window.prompt("Copier le lien :", url);
    }
  };

  return (
    <div className="article-share" role="group" aria-label="Partager l'article">
      <span>Partager</span>
      <a href={buildTwitterHref(url, title)} target="_blank" rel="noopener noreferrer" aria-label="Partager sur X / Twitter">
        X
      </a>
      <a href={buildLinkedInHref(url)} target="_blank" rel="noopener noreferrer" aria-label="Partager sur LinkedIn">
        in
      </a>
      <a href={buildMailHref(url, title)} aria-label="Partager par email">
        @
      </a>
      <button type="button" onClick={handleCopy} aria-live="polite">
        {copied ? "Lien copié ✓" : "Copier le lien"}
      </button>
    </div>
  );
}
