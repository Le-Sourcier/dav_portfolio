import { defaultLocale, isAppLocale, locales, type AppLocale } from "@/i18n/config";

const normalizePath = (path = "/") => {
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path : `/${path}`;
};

export function localizedPath(path: string, locale: string | AppLocale = defaultLocale): string {
  const activeLocale = isAppLocale(locale) ? locale : defaultLocale;
  return `/${activeLocale}${normalizePath(path)}`;
}

export function switchLocalePath(pathname: string, nextLocale: AppLocale): string {
  const parts = pathname.split("/");
  if (isAppLocale(parts[1])) {
    parts[1] = nextLocale;
    return parts.join("/") || `/${nextLocale}`;
  }
  return localizedPath(pathname, nextLocale);
}

export function localizedLanguages(path: string): Record<AppLocale, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, localizedPath(path, locale)]),
  ) as Record<AppLocale, string>;
}
