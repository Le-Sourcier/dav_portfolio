import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { defaultLocale, localeCookieName, normalizeLocale, type AppLocale } from "@/i18n/config";

const cleanPath = (path = "/") => {
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path : `/${path}`;
};

export async function resolvePreferredLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const headersStore = await headers();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  const acceptLang = headersStore.get("Accept-Language") || "";
  const browserLocale = normalizeLocale(acceptLang.split(",")[0]);

  return normalizeLocale(cookieLocale ?? browserLocale ?? defaultLocale);
}

export async function redirectToPreferredLocale(path = "/"): Promise<never> {
  const locale = await resolvePreferredLocale();
  redirect(`/${locale}${cleanPath(path)}`);
}
