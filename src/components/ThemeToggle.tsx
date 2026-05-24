"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

type ThemePreference = "system" | "light" | "dark";
type ThemeToggleVariant = "text" | "icon";

function ThemeIcon({ type }: { type: ThemePreference }) {
  if (type === "light") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
      </svg>
    );
  }

  if (type === "dark") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 14.2A7.5 7.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="11" rx="2" />
      <path d="M9 20h6M12 16v4" />
    </svg>
  );
}

const storageKey = "ydl-theme";
const themeChangeEvent = "ydl-theme-change";

function resolveTheme(preference: ThemePreference) {
  if (preference !== "system") return preference;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);

  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = preference;
  localStorage.setItem(storageKey, preference);
  window.dispatchEvent(new Event(themeChangeEvent));
}

function getThemePreference(): ThemePreference {
  if (typeof document === "undefined") return "system";

  return (document.documentElement.dataset.themePreference as ThemePreference | undefined) ?? "system";
}

function getSnapshot(): string {
  const preference = getThemePreference();
  if (preference !== "system") return preference;
  const resolved = document.documentElement.dataset.theme ?? "light";
  return `system:${resolved}`;
}

function subscribeToThemeChanges(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemThemeChange = () => {
    if (getThemePreference() === "system") {
      applyTheme("system");
    }
  };

  window.addEventListener(themeChangeEvent, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  media.addEventListener("change", handleSystemThemeChange);

  return () => {
    window.removeEventListener(themeChangeEvent, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
    media.removeEventListener("change", handleSystemThemeChange);
  };
}

export function ThemeToggle({ variant = "text" }: { variant?: ThemeToggleVariant }) {
  const snapshot = useSyncExternalStore(subscribeToThemeChanges, getSnapshot, () => "system:light");
  const preference: ThemePreference = snapshot.startsWith("system:") ? "system" : snapshot as ThemePreference;
  const t = useTranslations("ThemeToggle");

  const themes: Array<{ value: ThemePreference; label: string; short: string }> = [
    { value: "system", label: t("systemLabel"), short: t("systemShort") },
    { value: "light", label: t("lightLabel"), short: t("lightShort") },
    { value: "dark", label: t("darkLabel"), short: t("darkShort") },
  ];

  const updatePreference = (nextPreference: ThemePreference) => {
    applyTheme(nextPreference);
  };

  return (
    <div className={`theme-toggle ${variant === "icon" ? "theme-toggle--icon" : ""}`} aria-label={t("ariaLabel")}>
      {themes.map((theme) => (
        <button
          type="button"
          key={theme.value}
          className={preference === theme.value ? "is-active" : ""}
          onClick={() => updatePreference(theme.value)}
          aria-pressed={preference === theme.value}
          title={theme.label}
        >
          {variant === "icon" ? <ThemeIcon type={theme.value} /> : theme.short}
          {variant === "icon" ? <span className="sr-only">{theme.short}</span> : null}
        </button>
      ))}
    </div>
  );
}
