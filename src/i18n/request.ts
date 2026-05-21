import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, localeCookieName, normalizeLocale } from "@/i18n/config";

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const cookieStore = await cookies();
  const requestedLocale = locale ?? (await requestLocale);
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  const activeLocale = normalizeLocale(requestedLocale ?? cookieLocale ?? defaultLocale);

  return {
    locale: activeLocale,
    messages: (await import(`../../messages/${activeLocale}.json`)).default,
  };
});
