export const locales = ["fr", "en"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "fr";
export const localeCookieName = "NEXT_LOCALE";

export function isAppLocale(value: string | undefined | null): value is AppLocale {
  return locales.includes(value as AppLocale);
}

export function normalizeLocale(value: string | undefined | null): AppLocale {
  if (!value) return defaultLocale;
  const normalized = value.toLowerCase().split("-")[0];
  return isAppLocale(normalized) ? normalized : defaultLocale;
}
