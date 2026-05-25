import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ExperienceGlobe } from "@/components/experience/ExperienceGlobe";
import { BackToTop } from "@/components/blog/BackToTop";
import { getRequestLocale } from "@/i18n/server";
import { site } from "@/lib/portfolio";
import { loadBlogPosts } from "@/services/portfolio/contentLoaders";
import { loadExperiences } from "@/services/portfolio/contentLoaders";
import NotFound from "../not-found";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ExperiencesIndex");
  return {
    title: t("pageTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${site.url}/experiences`,
    },
  };
}

export const revalidate = 60;

export default async function ExperiencesPage() {
  const t = await getTranslations("ExperiencesIndex");
  const locale = await getRequestLocale();
  const [experiences, blogPosts] = await Promise.all([
    loadExperiences(locale),
    loadBlogPosts(locale),
  ]);
  const hasExperiences = experiences.length > 0;
  const hasBlog = blogPosts.length > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Parcours Yao David Logan",
    description: t("metaDescription"),
    url: `${site.url}/experiences`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: experiences.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${site.url}/experiences/${item.id}`,
        name: `${item.role} - ${item.company}`,
        description: item.summary,
      })),
    },
  };

  // In maintenance mode
  // Need to be desactivated in production when the page is not yet ready
  if (process.env.NODE_ENV === "production") return <NotFound />;

  return (
    <>
      <Header showBlog={hasBlog} />
      <main>
        <Script
          id="experiences-index-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
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
        <Footer showBlog={hasBlog} />
      </main>
      <BackToTop />
    </>
  );
}
