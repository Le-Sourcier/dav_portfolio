import { getRequestConfig } from "next-intl/server";
import { defaultLocale, normalizeLocale } from "@/i18n/config";

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const requestedLocale = locale ?? (await requestLocale);
  const activeLocale = normalizeLocale(requestedLocale ?? defaultLocale);

  return {
    locale: activeLocale,
    messages: (await import(`../../messages/${activeLocale}.json`)).default,
  };
});
