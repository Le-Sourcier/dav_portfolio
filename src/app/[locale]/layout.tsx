import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ClientAnalytics } from "@/components/ClientAnalytics";
import { LocaleHtmlSync } from "@/components/LocaleHtmlSync";
import { PortfolioAssistant } from "@/components/PortfolioAssistant";
import { isAppLocale, locales } from "@/i18n/config";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
      <LocaleHtmlSync locale={locale} />
      {children}
      <PortfolioAssistant />
      <ClientAnalytics />
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
