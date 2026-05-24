"use client";

import { useEffect, useMemo, useState } from "react";

const AVATAR_TONES = ["a", "b", "c", "d", "e"] as const;

function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("") || "?"
  );
}

function toneOf(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_TONES[Math.abs(h) % AVATAR_TONES.length];
}

interface MentionPopupProps {
  query: string;
  candidates: string[];
  onSelect: (name: string) => void;
  onClose: () => void;
}

export function MentionPopup({ query, candidates, onSelect, onClose }: MentionPopupProps) {
  const filtered = useMemo(
    () => candidates.filter((n) => n.toLowerCase().includes(query.toLowerCase())),
    [query, candidates],
  );
  const [active, setActive] = useState(0);
  const safeActive = Math.min(active, Math.max(filtered.length - 1, 0));

  useEffect(() => {
    if (filtered.length === 0) {
      onClose();
      return;
    }
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        onSelect(filtered[safeActive]);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [filtered, safeActive, onSelect, onClose]);

  if (filtered.length === 0) return null;

  return (
    <div className="mention-popup" role="listbox">
      {filtered.slice(0, 6).map((name, i) => (
        <button
          key={name}
          type="button"
          role="option"
          aria-selected={i === safeActive}
          className={i === safeActive ? "mention-popup-item is-active" : "mention-popup-item"}
          onMouseEnter={() => setActive(i)}
          onClick={() => onSelect(name)}
        >
          <span className={`mention-popup-avatar mention-popup-avatar--${toneOf(name)}`}>
            {initialsOf(name)}
          </span>
          <span>{name}</span>
        </button>
      ))}
    </div>
  );
}
