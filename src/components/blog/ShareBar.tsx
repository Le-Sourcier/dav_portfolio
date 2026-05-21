"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type ShareBarProps = {
  url: string;
  title: string;
  compact?: boolean;
};

const buildTwitterHref = (url: string, title: string) =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} — ${url}`)}`;

const buildLinkedInHref = (url: string) =>
  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

const buildMailHref = (url: string, title: string) =>
  `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

export function ShareBar({ url, title, compact = false }: ShareBarProps) {
  const t = useTranslations("BlogArticle");
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
      window.prompt(t("copyPrompt"), url);
    }
  };

  return (
    <div className={`article-share${compact ? " is-compact" : ""}`} role="group" aria-label={t("share")}>
      {!compact ? <span>{t("share")}</span> : null}
      <a href={buildTwitterHref(url, title)} target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
        X
      </a>
      <a href={buildLinkedInHref(url)} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        in
      </a>
      <a href={buildMailHref(url, title)} aria-label="Email">
        @
      </a>
      <button type="button" onClick={handleCopy} aria-live="polite">
        {copied ? t("copied") : t("copy")}
      </button>
    </div>
  );
}
