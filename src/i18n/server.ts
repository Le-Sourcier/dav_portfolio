import { getLocale } from "next-intl/server";
import { normalizeLocale, type AppLocale } from "@/i18n/config";

export function getRouteLocale(locale: string | undefined | null): AppLocale {
  return normalizeLocale(locale);
}

export async function getRequestLocale(routeLocale?: string | null): Promise<AppLocale> {
  if (routeLocale) return getRouteLocale(routeLocale);
  return normalizeLocale(await getLocale());
}
