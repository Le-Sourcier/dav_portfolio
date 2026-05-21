import type { AppLocale } from "@/i18n/config";

export function localizeText(
  locale: AppLocale,
  french?: string | null,
  english?: string | null,
): string {
  if (locale === "en" && english?.trim()) return english.trim();
  return french?.trim() ?? "";
}
