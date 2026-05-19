"use client";

import { useSyncExternalStore } from "react";

type ThemePreference = "system" | "light" | "dark";

const themes: Array<{ value: ThemePreference; label: string; short: string }> = [
  { value: "system", label: "Thème du device", short: "Auto" },
  { value: "light", label: "Thème clair", short: "Clair" },
  { value: "dark", label: "Thème sombre", short: "Sombre" },
];

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

export function ThemeToggle() {
  const preference = useSyncExternalStore(subscribeToThemeChanges, getThemePreference, () => "system");

  const updatePreference = (nextPreference: ThemePreference) => {
    applyTheme(nextPreference);
  };

  return (
    <div className="theme-toggle" aria-label="Choix du thème">
      {themes.map((theme) => (
        <button
          type="button"
          key={theme.value}
          className={preference === theme.value ? "is-active" : ""}
          onClick={() => updatePreference(theme.value)}
          aria-pressed={preference === theme.value}
          title={theme.label}
        >
          {theme.short}
        </button>
      ))}
    </div>
  );
}
