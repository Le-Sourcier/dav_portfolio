import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExperienceDetail } from "@/components/experience/ExperienceDetail";
import { getRequestLocale } from "@/i18n/server";
import { localizedLanguages, localizedPath } from "@/lib/routing/localizedPath";
import { site } from "@/lib/portfolio";
import { loadExperienceById } from "@/services/portfolio/contentLoaders";

export const revalidate = 300;
export const dynamicParams = true;

type ExperiencePageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({
  params,
}: ExperiencePageProps): Promise<Metadata> {
  const { locale: routeLocale, id } = await params;
  const locale = await getRequestLocale(routeLocale);
  const experience = await loadExperienceById(id, locale);

  if (!experience) {
    return {};
  }

  const description = experience.summary.slice(0, 220);
  const url = `${site.url}${localizedPath(`/experiences/${experience.id}`, locale)}`;

  return {
    title: `${experience.role} - ${experience.company}`,
    description,
    alternates: {
      canonical: url,
      languages: localizedLanguages(`/experiences/${experience.id}`),
    },
    openGraph: {
      title: `${experience.role} - ${experience.company}`,
      description,
      url,
      type: "article",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: experience.role,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${experience.role} - ${experience.company}`,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { locale: routeLocale, id } = await params;
  const locale = await getRequestLocale(routeLocale);
  const experience = await loadExperienceById(id, locale);

  if (!experience) {
    notFound();
  }

  return <ExperienceDetail experience={experience} locale={locale} />;
}
