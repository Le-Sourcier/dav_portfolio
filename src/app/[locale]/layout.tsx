import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { BackToTop } from "@/components/blog/BackToTop";
import { ClientAnalytics } from "@/components/ClientAnalytics";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LocaleHtmlSync } from "@/components/LocaleHtmlSync";
import { PortfolioAssistant } from "@/components/PortfolioAssistant";
import { isAppLocale, locales } from "@/i18n/config";
import {
  loadBlogPosts,
  loadExperiences,
} from "@/services/portfolio/contentLoaders";
import { loadProjects } from "@/services/portfolio/projectsLoader";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  // Fetchs dédupliqués par la Request Memoization de Next : si une page appelle
  // les mêmes loaders avec la même locale, le cache fetch les déduplique pour
  // ce rendu. Permet de centraliser la visibilité Header/Footer ici.
  const [projects, blogPosts, experiences] = await Promise.all([
    loadProjects(locale),
    loadBlogPosts(locale),
    loadExperiences(locale),
  ]);
  const hasProjects = projects.length > 0;
  const hasBlog = blogPosts.length > 0;
  const hasJourney = experiences.length > 0;

  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
      <LocaleHtmlSync locale={locale} />
      <Header
        showProjects={hasProjects}
        showJourney={hasJourney}
        showBlog={hasBlog}
      />
      {children}
      <Footer
        showProjects={hasProjects}
        showJourney={hasJourney}
        showBlog={hasBlog}
        locale={locale}
      />
      <BackToTop />
      <PortfolioAssistant />
      <ClientAnalytics />
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
