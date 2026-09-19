import type { Metadata } from "next";
import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LocaleHtmlSync } from "@/components/LocaleHtmlSync";
import { NotFoundDiagnostic } from "@/components/not-found/NotFoundDiagnostic";
import { NotFoundReads } from "@/components/not-found/NotFoundReads";
import { NotFoundRoutes } from "@/components/not-found/NotFoundRoutes";
import { normalizeLocale } from "@/i18n/config";
import { localizedPath } from "@/lib/routing/localizedPath";
import { site } from "@/lib/portfolio";
import { loadBlogPosts } from "@/services/portfolio/contentLoaders";

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default async function NotFound() {
  const locale = normalizeLocale(await getLocale());
  const t = await getTranslations({ locale, namespace: "NotFoundPremium" });
  const messages = (await import(`../../messages/${locale}.json`)).default;
  const posts = (await loadBlogPosts(locale)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleHtmlSync locale={locale} />
      <Header showProjects={false} />
      <main className="notfound-page">
        <section className="section notfound-hero">
          <div className="notfound-copy">
            <p className="section-kicker">{t("kicker")}</p>
            <p className="notfound-code" aria-hidden="true">404</p>
            <h1>{t("title")}</h1>
            <p className="notfound-lead">{t("description")}</p>
            <div className="hero-actions">
              <Link className="primary-button" href={localizedPath("/", locale)}>{t("home")}</Link>
              <a className="secondary-button" href={`mailto:${site.email}`}>{t("report")}</a>
            </div>
            <div className="trust-row">
              {["expired", "mistyped", "moved"].map(key => <span key={key}>{t(key)}</span>)}
            </div>
          </div>
          <NotFoundDiagnostic locale={locale} />
        </section>
        <NotFoundRoutes locale={locale} />
        <NotFoundReads posts={posts} locale={locale} />
        <Footer showProjects={false} locale={locale} />
      </main>
    </NextIntlClientProvider>
  );
}
