import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ContactSection } from "@/components/ContactSection";
import { ExpertiseCarousel } from "@/components/ExpertiseCarousel";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Newsletter } from "@/components/Newsletter";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { BackToTop } from "@/components/blog/BackToTop";
import { site, stack } from "@/lib/portfolio";
import { getRequestLocale } from "@/i18n/server";
import { localizedPath } from "@/lib/routing/localizedPath";
import {
  loadBlogPosts,
  loadExperiences,
  loadTestimonials,
} from "@/services/portfolio/contentLoaders";
import { loadProjects } from "@/services/portfolio/projectsLoader";

export const revalidate = 60;

export default async function Home() {
  const locale = await getRequestLocale();
  const [projects, blogPosts, experience, testimonials] = await Promise.all([
    loadProjects(locale),
    loadBlogPosts(locale),
    loadExperiences(locale),
    loadTestimonials(locale),
  ]);
  const featuredProjects = projects.filter((project) => project.featured);
  const visibleProjects =
    featuredProjects.length > 0 ? featuredProjects : projects;
  const hasProjects = visibleProjects.length > 0;
  const hasJourney = experience.length > 0;
  const hasBlog = blogPosts.length > 0;
  const hasTestimonials = testimonials.length > 0;
  const t = await getTranslations("HomePage");
  const proofStats = [1, 2, 3, 4].map((i) => ({
    value: t(`proofStat${i}Value`),
    label: t(`proofStat${i}Label`),
    detail: t(`proofStat${i}Detail`),
  }));
  const dateFormatter = new Intl.DateTimeFormat(
    locale === "en" ? "en-US" : "fr-FR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );

  return (
    <>
      <Header
        showProjects={hasProjects}
        showJourney={hasJourney}
        showBlog={hasBlog}
      />

      <main>
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">{t("heroAvailability")}</p>
              <h1>{t("heroTitle")}</h1>
              <p className="hero-lead">{t("heroPromise")}</p>

              <div className="hero-actions">
                <a
                  className="primary-button liquid-cta"
                  href={`mailto:${site.email}?subject=Projet%20SaaS%20ou%20mission`}>
                  {t("heroCta")}
                </a>
                {hasProjects ? (
                  <a className="secondary-button" href="#projects">
                    {t("heroSecondary")}
                  </a>
                ) : null}
              </div>

              <div className="trust-row" aria-label={t("trustAriaLabel")}>
                <span>{t("trustMultiTenant")}</span>
                <span>{t("trustRbac")}</span>
                <span>{t("trustPayments")}</span>
                <span>{t("trustBackoffice")}</span>
              </div>
            </div>

            <div
              className="hero-visual saas-readiness-card"
              aria-label={t("readinessAriaLabel")}>
              <div className="visual-header readiness-header">
                <div>
                  <span>{t("readinessBrand")}</span>
                  <strong>{t("readinessLabel")}</strong>
                </div>
                <p>{t("readinessBefore")}</p>
              </div>

              <div className="readiness-score-panel">
                <div>
                  <span>{t("readinessPanelLabel")}</span>
                  <strong>{t("readinessPanelValue")}</strong>
                </div>
                <p>{t("readinessPanelDesc")}</p>
              </div>

              <div className="readiness-checks">
                {[
                  {
                    titleKey: "readinessCheckAuth",
                    detailKey: "readinessCheckAuthDetail",
                    statusKey: "readinessCheckAuthStatus",
                    maturity: "is-ready",
                  },
                  {
                    titleKey: "readinessCheckBilling",
                    detailKey: "readinessCheckBillingDetail",
                    statusKey: "readinessCheckBillingStatus",
                    maturity: "is-planned",
                  },
                  {
                    titleKey: "readinessCheckOps",
                    detailKey: "readinessCheckOpsDetail",
                    statusKey: "readinessCheckOpsStatus",
                    maturity: "is-watch",
                  },
                  {
                    titleKey: "readinessCheckData",
                    detailKey: "readinessCheckDataDetail",
                    statusKey: "readinessCheckDataStatus",
                    maturity: "is-ready",
                  },
                ].map(({ titleKey, detailKey, statusKey, maturity }) => (
                  <div className="readiness-check" key={titleKey}>
                    <i aria-hidden="true" />
                    <div>
                      <strong>{t(titleKey)}</strong>
                      <span>{t(detailKey)}</span>
                    </div>
                    <div
                      className={`readiness-maturity ${maturity}`}
                      aria-label={t("readinessMaturityLabel", {
                        status: t(statusKey),
                      })}>
                      <small>{t(statusKey)}</small>
                      <span aria-hidden="true" />
                      <span aria-hidden="true" />
                      <span aria-hidden="true" />
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="readiness-architecture"
                aria-label={t("architectureAriaLabel")}>
                <span>{t("architectureClient")}</span>
                <i aria-hidden="true" />
                <span>{t("architectureApi")}</span>
                <i aria-hidden="true" />
                <span>{t("architectureData")}</span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section proof-band"
          aria-label={t("proofsAriaLabel")}>
          {proofStats.map((stat) => (
            <article key={stat.label}>
              <strong>{stat.value}</strong>
              <h2>{stat.label}</h2>
              <p>{stat.detail}</p>
            </article>
          ))}
          <small className="proof-disclaimer">{t("proofDisclaimer")}</small>
        </section>

        <section id="apropos" className="section about-section">
          <div className="about-copy">
            <p className="section-kicker">{t("aboutKicker")}</p>
            <h2>{t("aboutTitle")}</h2>
            <p>{t("aboutDescription")}</p>
            <div className="about-actions">
              <a
                className="primary-button liquid-cta"
                href={`mailto:${site.email}?subject=Mission%20fullstack%20SaaS&body=Bonjour%20David,%0A%0AJ'aimerais%20discuter%20d'une%20opportunit%C3%A9%20de%20collaboration.%0A`}>
                {t("aboutCta")}
              </a>
              <a
                className="secondary-button"
                href="/cv/david-logan-cv.pdf"
                download>
                {t("aboutCv")}
              </a>
            </div>
          </div>

          <div
            className="about-panel about-brief"
            aria-label={t("methodAriaLabel")}>
            <div className="about-brief-top">
              <span>{t("methodPanelLabel")}</span>
              <strong>{t("methodPanelTitle")}</strong>
            </div>

            <div
              className="about-brief-flow"
              aria-label={t("methodFlowAriaLabel")}>
              {[
                t("methodStep1"),
                t("methodStep2"),
                t("methodStep3"),
                t("methodStep4"),
              ].map((item, index) => (
                <div key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>

            <blockquote className="about-brief-note">
              {t("methodBlockquote")}
            </blockquote>

            <div className="about-brief-bottom">
              <div>
                <span>{t("methodDeliverablesLabel")}</span>
                <p>{t("methodDeliverablesValue")}</p>
              </div>
              <div>
                <span>{t("methodPositioningLabel")}</span>
                <p>{t("methodPositioningValue")}</p>
              </div>
            </div>
          </div>
        </section>

        <ExpertiseCarousel />

        {hasProjects ? (
          <section id="projects" className="section projects-section">
            <div className="section-heading">
              <p className="section-kicker">{t("projectsKicker")}</p>
              <h2>{t("projectsTitle")}</h2>
              <p>{t("projectsDescription")}</p>
            </div>

            <div className="project-grid">
              {visibleProjects.map((project, index) => (
                <article className="project-card" key={project.slug}>
                  <div
                    className={`project-preview${project.image ? " has-image" : ""}`}
                    aria-hidden="true">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt=""
                        loading="lazy"
                        className="project-preview-image"
                      />
                    ) : null}
                    <div className="project-preview-overlay">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {project.metric ? (
                        <strong>{project.metric}</strong>
                      ) : null}
                    </div>
                  </div>
                  <div className="project-content">
                    <p>{project.category}</p>
                    <h3>{project.name}</h3>
                    <h4>{project.headline}</h4>
                    <p>{project.result}</p>
                    {project.tech.length > 0 ? (
                      <div className="tag-list">
                        {project.tech.map((tech) => (
                          <span key={tech}>{tech}</span>
                        ))}
                      </div>
                    ) : null}
                    <Link
                      href={localizedPath(`/projects/${project.slug}`, locale)}
                      className="text-link">
                      {t("projectsReadCase")}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {hasJourney ? (
          <section id="parcours" className="section parcours-section pt-20">
            <div className="parcours-copy">
              <p className="section-kicker">{t("journeyKicker")}</p>
              <h2>{t("journeyTitle")}</h2>
              <p>{t("journeyDescription")}</p>
              <div className="parcours-proof">
                <span>{t("journeyTagProduct")}</span>
                <span>{t("journeyTagBackend")}</span>
                <span>{t("journeyTagAutomation")}</span>
                <span>{t("journeyTagSeo")}</span>
              </div>
              {experience.length > 3 ? (
                <Link
                  href={localizedPath("/experiences", locale)}
                  className="secondary-button parcours-cta">
                  {t("journeyAllLink")}
                </Link>
              ) : null}
            </div>

            <div className="parcours-timeline">
              {experience.slice(0, 3).map((item, index) => (
                <article
                  className="parcours-card"
                  key={`${item.company}-${item.period}`}>
                  <div className="parcours-marker" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <span>{item.period}</span>
                    <p className="parcours-focus">{item.focus}</p>
                    <h3>{item.role}</h3>
                    <p className="company">{item.company}</p>
                    <p className="parcours-summary">{item.summary}</p>
                    {item.points.length > 0 ? (
                      <div className="parcours-tags">
                        {item.points.map((point) => (
                          <small key={point}>{point}</small>
                        ))}
                      </div>
                    ) : null}
                    <Link
                      href={localizedPath(`/experiences/${item.id}`, locale)}
                      className="text-link parcours-link">
                      {t("journeyDetailLink")}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section stack-section">
          <div className="stack-intro">
            <p className="section-kicker">{t("stackKicker")}</p>
            <h2>{t("stackTitle")}</h2>
            <p>{t("stackDescription")}</p>
            <div className="stack-principles">
              <span>{t("stackPrincipleProduct")}</span>
              <span>{t("stackPrincipleScale")}</span>
              <span>{t("stackPrincipleMaintenance")}</span>
            </div>
          </div>
          <div className="stack-brand-showcase">
            <div className="stack-marquee" aria-label={t("stackAriaLabel")}>
              <div className="stack-marquee-track">
                {[...stack, ...stack].map((item, index) => (
                  <div
                    className="stack-logo-tile"
                    key={`${item.name}-${index}`}
                    tabIndex={0}
                    aria-hidden={index >= stack.length}>
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={42}
                      height={42}
                    />
                    <span className="stack-tooltip">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {hasTestimonials ? (
          <TestimonialsCarousel testimonials={testimonials} />
        ) : null}

        {hasBlog ? (
          <section id="blog" className="section blog-section">
            <div className="section-heading blog-heading">
              <div>
                <p className="section-kicker">{t("blogKicker")}</p>
                <h2>{t("blogTitle")}</h2>
              </div>
              <Link href={localizedPath("/blog", locale)} className="secondary-button">
                {t("blogAllLink")}
              </Link>
            </div>
            <div className="blog-card-grid">
              {blogPosts.slice(0, 3).map((post) => (
                <Link
                  href={localizedPath(`/blog/${post.slug}`, locale)}
                  key={post.slug}
                  className={`blog-card home-blog-card${post.coverImage ? " has-cover" : ""}`}>
                  <div className="home-blog-card-media">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt=""
                        loading="lazy"
                        className="blog-card-cover"
                      />
                    ) : null}
                    <div className="home-blog-card-overlay">
                      <span>
                        {post.category} · {post.readTime}
                      </span>
                      <h3>{post.title}</h3>
                    </div>
                  </div>
                  <p>{post.excerpt}</p>
                  <small className="blog-card-meta">
                    {post.author || site.name} ·{" "}
                    {dateFormatter.format(new Date(post.date))}
                  </small>
                  <strong className="blog-card-action">
                    {t("blogReadArticle")}
                  </strong>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <Newsletter />

        <ContactSection />

        <Footer
          showProjects={hasProjects}
          showJourney={hasJourney}
          showBlog={hasBlog}
        />
      </main>
      <BackToTop />
    </>
  );
}
