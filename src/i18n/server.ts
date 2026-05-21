import { getLocale } from "next-intl/server";
import { normalizeLocale, type AppLocale } from "@/i18n/config";

export async function getRequestLocale(): Promise<AppLocale> {
  return normalizeLocale(await getLocale());
}
