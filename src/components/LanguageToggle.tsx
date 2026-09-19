"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { locales, normalizeLocale, type AppLocale } from "@/i18n/config";
import { persistLocale } from "@/lib/routing/localeCookie";
import { switchLocalePath } from "@/lib/routing/localizedPath";

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = normalizeLocale(useLocale());
  const t = useTranslations("LanguageToggle");
  const [isPending, startTransition] = useTransition();

  const selectLocale = (nextLocale: AppLocale) => {
    if (nextLocale === locale) return;

    persistLocale(nextLocale);
    startTransition(() => router.push(switchLocalePath(pathname, nextLocale)));
  };

  return (
    <div className="language-toggle" role="group" aria-label={t("label")} aria-busy={isPending}>
      {locales.map((item) => (
        <button
          key={item}
          type="button"
          className={item === locale ? "is-active" : ""}
          aria-pressed={item === locale}
          title={t("switchTo", { locale: item.toUpperCase() })}
          onClick={() => selectLocale(item)}
        >
          {t(item)}
        </button>
      ))}
    </div>
  );
}
