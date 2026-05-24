import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, localeCookieName, normalizeLocale } from "@/i18n/config";

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const cookieStore = await cookies();
  const headersStore = await headers();

  const requestedLocale = locale ?? (await requestLocale);
  const cookieLocale = cookieStore.get(localeCookieName)?.value;

  const acceptLang = headersStore.get("Accept-Language") || "";
  const browserLocale = normalizeLocale(acceptLang.split(",")[0]);

  const activeLocale = normalizeLocale(requestedLocale ?? cookieLocale ?? browserLocale ?? defaultLocale);

  return {
    locale: activeLocale,
    messages: (await import(`../../messages/${activeLocale}.json`)).default,
  };
});
