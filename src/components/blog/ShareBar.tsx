"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { blogApi } from "@/services/api/blog.api";

type ShareBarProps = {
  url: string;
  title: string;
  compact?: boolean;
  postId?: string;
};

const buildTwitterHref = (url: string, title: string) =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} — ${url}`)}`;

const buildLinkedInHref = (url: string) =>
  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

const buildMailHref = (url: string, title: string) =>
  `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

export function ShareBar({ url, title, compact = false, postId }: ShareBarProps) {
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
    if (postId) {
      blogApi.trackShare(postId).catch(() => undefined);
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt(t("copyPrompt"), url);
    }
  };

  const handleShareClick = () => {
    if (postId) {
      blogApi.trackShare(postId).catch(() => undefined);
    }
  };

  return (
    <div className={`article-share${compact ? " is-compact" : ""}`} role="group" aria-label={t("share")}>
      {!compact ? <span>{t("share")}</span> : null}
      <a href={buildTwitterHref(url, title)} target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" onClick={handleShareClick}>
        X
      </a>
      <a href={buildLinkedInHref(url)} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" onClick={handleShareClick}>
        in
      </a>
      <a href={buildMailHref(url, title)} aria-label="Email" onClick={handleShareClick}>
        @
      </a>
      <button type="button" onClick={handleCopy} aria-live="polite">
        {copied ? t("copied") : t("copy")}
      </button>
    </div>
  );
}
