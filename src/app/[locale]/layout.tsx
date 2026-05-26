import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { ClientAnalytics } from "@/components/ClientAnalytics";
import { LocaleHtmlSync } from "@/components/LocaleHtmlSync";
import { PortfolioAssistant } from "@/components/PortfolioAssistant";
import { isAppLocale, locales } from "@/i18n/config";
import { loadBlogPosts, loadExperiences } from "@/services/portfolio/contentLoaders";
import { loadProjects } from "@/services/portfolio/projectsLoader";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();

  const messages = (await import(`../../../messages/${locale}.json`)).default;
  const [assistantProjects, assistantPosts, assistantExperiences] = await Promise.all([
    loadProjects(locale),
    loadBlogPosts(locale),
    loadExperiences(locale),
  ]);

  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
      <LocaleHtmlSync locale={locale} />
      {children}
      <PortfolioAssistant
        projects={assistantProjects}
        posts={assistantPosts}
        experiences={assistantExperiences}
      />
      <ClientAnalytics />
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
