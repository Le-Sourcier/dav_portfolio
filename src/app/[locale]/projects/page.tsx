import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProjectsDirectory } from "@/components/ProjectsDirectory";
import { BackToTop } from "@/components/blog/BackToTop";
import { getRequestLocale } from "@/i18n/server";
import { localizedPath } from "@/lib/routing/localizedPath";
import { site } from "@/lib/portfolio";
import { loadBlogPosts } from "@/services/portfolio/contentLoaders";
import { loadProjects } from "@/services/portfolio/projectsLoader";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProjectsIndex");
  const locale = await getRequestLocale();
  return {
    title: t("pageTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${site.url}${localizedPath("/projects", locale)}`,
    },
  };
}

export const revalidate = 60;

export default async function ProjectsPage() {
  const t = await getTranslations("ProjectsIndex");
  const locale = await getRequestLocale();
  const [projects, blogPosts] = await Promise.all([
    loadProjects(locale),
    loadBlogPosts(locale),
  ]);
  const hasProjects = projects.length > 0;
  const hasBlog = blogPosts.length > 0;
  const categories = Array.from(
    new Set(projects.map((project) => project.category).filter(Boolean)),
  );
  const featuredCount = projects.filter((project) => project.featured).length;
  const stackCount = new Set(projects.flatMap((project) => project.tech)).size;
  const measurableCount = projects.filter(
    (project) =>
      project.metrics.length > 0 ||
      project.metric ||
      project.chartData.length > 0,
  ).length;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Projects Yao David Logan",
    description: t("metaDescription"),
    url: `${site.url}${localizedPath("/projects", locale)}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${site.url}${localizedPath(`/projects/${project.slug}`, locale)}`,
        name: project.name,
        description: project.headline || project.description,
      })),
    },
  };

  return (
    <>
      <Header showProjects={hasProjects} showBlog={hasBlog} />
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
            <strong>{projects.length}</strong>
            <p>{t("countBadge", { count: projects.length })}</p>
            <dl>
              <div>
                <dt>{t("featuredLabel")}</dt>
                <dd>{featuredCount}</dd>
              </div>
              <div>
                <dt>{t("stacksLabel")}</dt>
                <dd>{stackCount}</dd>
              </div>
              <div>
                <dt>{t("measuredLabel")}</dt>
                <dd>{measurableCount}</dd>
              </div>
            </dl>
            {categories.length > 0 ? (
              <div className="project-hero-tags">
                {categories.slice(0, 5).map((category) => (
                  <small key={category}>{category}</small>
                ))}
              </div>
            ) : null}
          </aside>
        </section>

        <ProjectsDirectory projects={projects} />
        <section
          className="case-hire-cta project-hire-cta"
          aria-labelledby="projects-hire-title">
          <div>
            <span>{t("nextKicker")}</span>
            <h2 id="projects-hire-title">{t("nextTitle")}</h2>
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
        <Footer showProjects={hasProjects} showBlog={hasBlog} />
      </main>
      <BackToTop />
    </>
  );
}
