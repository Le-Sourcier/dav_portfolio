import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ExperienceGlobe } from "@/components/experience/ExperienceGlobe";
import { ExperiencesJourney } from "@/components/experience/ExperiencesJourney";
import { BackToTop } from "@/components/blog/BackToTop";
import { getRequestLocale } from "@/i18n/server";
import { localizedLanguages, localizedPath } from "@/lib/routing/localizedPath";
import { site } from "@/lib/portfolio";
import { loadBlogPosts } from "@/services/portfolio/contentLoaders";
import { loadExperiences } from "@/services/portfolio/contentLoaders";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale: routeLocale } = await params;
  const locale = await getRequestLocale(routeLocale);
  const t = await getTranslations({ locale, namespace: "ExperiencesIndex" });
  return {
    title: t("pageTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${site.url}${localizedPath("/experiences", locale)}`,
      languages: localizedLanguages("/experiences"),
    },
  };
}

export const revalidate = 60;

export default async function ExperiencesPage({ params }: LocalePageProps) {
  const { locale: routeLocale } = await params;
  const locale = await getRequestLocale(routeLocale);
  const t = await getTranslations({ locale, namespace: "ExperiencesIndex" });
  const [experiences, blogPosts] = await Promise.all([
    loadExperiences(locale),
    loadBlogPosts(locale),
  ]);
  const hasExperiences = experiences.length > 0;
  const hasBlog = blogPosts.length > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("pageTitle"),
    description: t("metaDescription"),
    url: `${site.url}${localizedPath("/experiences", locale)}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: experiences.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${site.url}${localizedPath(`/experiences/${item.id}`, locale)}`,
        name: `${item.role} - ${item.company}`,
        description: item.summary,
      })),
    },
  };

  // In maintenance mode
  // Need to be desactivated in production when the page is not yet ready
  // if (process.env.NODE_ENV === "production") return <NotFound />;

  return (
    <>
      <Header showBlog={hasBlog} />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <section className="project-hero section">
          <div className="project-hero-copy">
            <p className="section-kicker">{t("sectionKicker")}</p>
            <h1>{t("sectionTitle")}</h1>
            <p>{t("sectionDescription")}</p>
          </div>
          <aside className="project-hero-proof" aria-label={t("summaryLabel")}>
            <span>{t("summaryCount")}</span>
            <strong>{experiences.length}</strong>
            <p>{t("countBadge", { count: experiences.length })}</p>
            <dl>
              <div>
                <dt>{t("roleLabel")}</dt>
                <dd>{t("focusLabel")}</dd>
              </div>
              <div>
                <dt>{t("totalLabel")}</dt>
                <dd>{experiences.length}</dd>
              </div>
            </dl>
          </aside>
        </section>

        <ExperienceGlobe experiences={experiences} />

        {hasExperiences ? (
          <section className="section experiences-proof-section" aria-labelledby="experiences-proof-title">
            <div className="experiences-proof-head">
              <div>
                <p className="section-kicker">{t("proofKicker")}</p>
                <h2 id="experiences-proof-title">{t("proofTitle")}</h2>
              </div>
              <p>{t("proofDescription")}</p>
            </div>

            <ExperiencesJourney experiences={experiences} />

            <dl className="experiences-proof-metrics" aria-label={t("proofStatsLabel")}>
              <div>
                <dt>{t("proofCompaniesLabel")}</dt>
                <dd>{new Set(experiences.map((item) => item.company)).size}</dd>
              </div>
              <div>
                <dt>{t("proofFocusLabel")}</dt>
                <dd>{experiences.slice(0, 3).map((item) => item.focus).filter(Boolean).join(" / ")}</dd>
              </div>
              <div>
                <dt>{t("proofMethodLabel")}</dt>
                <dd>{t("proofMethodValue")}</dd>
              </div>
            </dl>
          </section>
        ) : (
          <section className="section project-empty-state">
            <strong>{t("emptyTitle")}</strong>
            <p>{t("emptyText")}</p>
          </section>
        )}

        <section
          className="case-hire-cta project-hire-cta"
          aria-labelledby="experiences-hire-title">
          <div>
            <span>{t("nextKicker")}</span>
            <h2 id="experiences-hire-title">{t("nextTitle")}</h2>
          </div>
          <div className="case-hire-note">
            <p>{t("nextDescription")}</p>
            <dl>
              <div>
                <dt>{t("formatLabel")}</dt>
                <dd>{t("formatValue")}</dd>
              </div>
              <div>
                <dt>{t("focusLabel")}</dt>
                <dd>{t("focusValue")}</dd>
              </div>
            </dl>
          </div>
          <div className="case-hire-actions">
            <a
              href={`mailto:${site.email}?subject=Mission%20SaaS%20ou%20plateforme%20web`}>
              {t("ctaButton")}
            </a>
            <a href="/cv/david-logan-cv.pdf">{t("downloadCv")}</a>
          </div>
        </section>
        <Footer showBlog={hasBlog} locale={locale} />
      </main>
      <BackToTop />
    </>
  );
}
