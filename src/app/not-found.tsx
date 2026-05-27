import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LocaleHtmlSync } from "@/components/LocaleHtmlSync";
import { normalizeLocale } from "@/i18n/config";
import { localizedPath } from "@/lib/routing/localizedPath";
import { site } from "@/lib/portfolio";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  const locale = normalizeLocale(await getLocale());
  const messages = (await import(`../../messages/${locale}.json`)).default;
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleHtmlSync locale={locale} />
      <Header showProjects={false} />
      <main className="not-found-page">
        <section className="not-found-shell" aria-labelledby="not-found-title">
          <div className="not-found-copy">
            <p className="section-kicker">{t("kicker")}</p>
            <h1 id="not-found-title">{t("title")}</h1>
            <p>{t("description")}</p>
            <div className="not-found-actions">
              <Link className="primary-button liquid-cta" href={localizedPath("/", locale)}>
                {t("homeButton")}
              </Link>
              <Link className="secondary-button" href={localizedPath("/blog", locale)}>
                {t("blogButton")}
              </Link>
              <a className="secondary-button" href={`mailto:${site.email}?subject=Page%20introuvable`}>
                {t("contactButton")}
              </a>
            </div>
          </div>

          <div className="not-found-panel" role="group" aria-label={t("panelAriaLabel")}>
            <span>{t("panelLabel")}</span>
            <strong>{t("panelValue")}</strong>
            <div>
              <p>{t("diagUrlAbsente")}</p>
              <i aria-hidden="true" />
            </div>
            <div>
              <p>{t("diagContenuDeplace")}</p>
              <i aria-hidden="true" />
            </div>
            <div>
              <p>{t("diagRetourPossible")}</p>
              <i aria-hidden="true" />
            </div>
          </div>
        </section>
      </main>
      <Footer showProjects={false} />
    </NextIntlClientProvider>
  );
}
