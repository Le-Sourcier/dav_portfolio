import { localeCookieName, type AppLocale } from "@/i18n/config";

export function persistLocale(locale: AppLocale): void {
  document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}
