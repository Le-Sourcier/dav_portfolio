"use client";

import { useEffect, useState } from "react";

type ThemePreference = "system" | "light" | "dark";

const themes: Array<{ value: ThemePreference; label: string; short: string }> = [
  { value: "system", label: "Thème du device", short: "Auto" },
  { value: "light", label: "Thème clair", short: "Clair" },
  { value: "dark", label: "Thème sombre", short: "Sombre" },
];

const storageKey = "ydl-theme";

function resolveTheme(preference: ThemePreference) {
  if (preference !== "system") return preference;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);

  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = preference;
  localStorage.setItem(storageKey, preference);
}

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") return "system";

    return (localStorage.getItem(storageKey) as ThemePreference | null) ?? "system";
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemThemeChange = () => {
      if ((localStorage.getItem(storageKey) ?? "system") === "system") {
        applyTheme("system");
      }
    };

    applyTheme(preference);
    media.addEventListener("change", onSystemThemeChange);

    return () => media.removeEventListener("change", onSystemThemeChange);
  }, [preference]);

  const updatePreference = (nextPreference: ThemePreference) => {
    setPreference(nextPreference);
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
