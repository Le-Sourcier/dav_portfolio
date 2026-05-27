import { BackToTop } from "@/components/blog/BackToTop";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

function SkeletonLine({
  width,
  className = "",
}: {
  width?: string;
  className?: string;
}) {
  return (
    <span
      className={`skeleton-line ${className}`.trim()}
      style={width ? { width } : undefined}
      aria-hidden="true"
    />
  );
}

function SkeletonPill({ width }: { width?: string }) {
  return (
    <span
      className="skeleton-pill"
      style={width ? { width } : undefined}
      aria-hidden="true"
    />
  );
}

export function BlogArticleSkeleton() {
  return (
    <>
      <Header showBlog showProjects />
      <main aria-busy="true" aria-label="Chargement de l'article">
        <article className="article-shell article-shell--detail detail-skeleton">
          <section className="article-cover-hero detail-skeleton-hero">
            <div className="article-cover-overlay" />
            <div className="article-cover-content">
              <div className="article-cover-toolbar">
                <div className="article-cover-toolbar-main">
                  <SkeletonPill width="118px" />
                  <SkeletonPill width="92px" />
                </div>
                <div className="article-cover-actions">
                  <SkeletonPill width="168px" />
                </div>
              </div>
              <SkeletonLine className="skeleton-title is-article" width="68%" />
              <SkeletonLine className="skeleton-title is-article is-short" width="46%" />
              <div className="article-cover-meta-row">
                <div className="article-cover-meta">
                  <SkeletonPill width="142px" />
                  <SkeletonPill width="128px" />
                  <SkeletonPill width="150px" />
                </div>
              </div>
            </div>
          </section>

          <div className="article-layout detail-skeleton-layout">
            <aside className="article-sidebar">
              <div className="detail-skeleton-panel">
                {Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonLine key={index} width={index % 2 ? "68%" : "88%"} />
                ))}
              </div>
              <div className="detail-skeleton-panel">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonLine key={index} width={`${92 - index * 12}%`} />
                ))}
              </div>
            </aside>
            <div className="article-body detail-skeleton-body">
              <SkeletonLine className="skeleton-lead" width="86%" />
              <SkeletonLine className="skeleton-lead" width="72%" />
              <div className="detail-skeleton-copy">
                {Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonLine
                    key={index}
                    width={index % 4 === 3 ? "58%" : "100%"}
                  />
                ))}
              </div>
              <div className="detail-skeleton-media" />
            </div>
          </div>
        </article>
        <Footer showBlog showProjects />
      </main>
      <BackToTop />
    </>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <>
      <Header showProjects />
      <main className="case-page detail-skeleton" aria-busy="true" aria-label="Chargement du projet">
        <section className="case-cover-hero detail-skeleton-hero">
          <div className="case-cover-overlay" />
          <div className="case-cover-content">
            <SkeletonPill width="130px" />
            <SkeletonPill width="96px" />
            <SkeletonLine className="skeleton-title is-case" width="76%" />
            <SkeletonLine className="skeleton-title is-case is-short" width="52%" />
            <SkeletonLine className="skeleton-lead" width="62%" />
            <div className="case-hero-meta">
              <SkeletonPill width="132px" />
              <SkeletonPill width="86px" />
              <SkeletonPill width="172px" />
            </div>
          </div>
        </section>

        <section className="case-study-shell detail-skeleton-layout">
          <article className="case-story">
            <section className="case-intro detail-skeleton-stack">
              <SkeletonLine width="130px" />
              <SkeletonLine className="skeleton-heading" width="82%" />
              <SkeletonLine className="skeleton-heading is-short" width="64%" />
              <div className="detail-skeleton-facts">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index}>
                    <SkeletonLine width="64%" />
                    <SkeletonLine width="82%" />
                  </div>
                ))}
              </div>
            </section>

            <section className="case-duo">
              {Array.from({ length: 2 }).map((_, index) => (
                <article className="case-duo-card detail-skeleton-card" key={index}>
                  <SkeletonLine width="92px" />
                  <SkeletonLine className="skeleton-heading is-compact" width="86%" />
                  <SkeletonLine width="100%" />
                  <SkeletonLine width="76%" />
                </article>
              ))}
            </section>

            <section className="case-measure detail-skeleton-stack">
              <SkeletonLine width="110px" />
              <SkeletonLine className="skeleton-heading" width="58%" />
              <div className="detail-skeleton-metrics">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index}>
                    <SkeletonLine width="42%" />
                    <SkeletonLine className="skeleton-number" width="68%" />
                    <SkeletonLine width="88%" />
                  </div>
                ))}
              </div>
              <div className="detail-skeleton-chart" />
            </section>
          </article>

          <aside className="case-aside">
            <div className="detail-skeleton-panel is-tall">
              <SkeletonLine className="skeleton-number" width="74%" />
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonLine key={index} width={index % 3 === 2 ? "62%" : "94%"} />
              ))}
            </div>
          </aside>
        </section>
      </main>
      <Footer showProjects />
      <BackToTop />
    </>
  );
}

export function ExperienceDetailSkeleton() {
  return (
    <>
      <Header />
      <main className="xp-page detail-skeleton" aria-busy="true" aria-label="Chargement du parcours">
        <section className="xp-hero">
          <SkeletonPill width="116px" />
          <div className="xp-hero-grid">
            <div className="xp-hero-copy">
              <SkeletonLine width="220px" />
              <SkeletonLine className="skeleton-title is-xp" width="92%" />
              <SkeletonLine className="skeleton-title is-xp is-short" width="70%" />
              <SkeletonLine width="64px" />
              <div className="xp-hero-actions">
                <SkeletonPill width="132px" />
                <SkeletonPill width="154px" />
              </div>
            </div>
            <div className="xp-hero-visual">
              <div className="xp-hero-visual-grid" />
              <div className="xp-hero-visual-frame detail-skeleton-media" />
            </div>
          </div>
        </section>

        <section className="xp-signal">
          <dl>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index}>
                <dt><SkeletonLine width="72%" /></dt>
                <dd><SkeletonLine width="88%" /></dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="xp-shell">
          <div className="xp-flow">
            {Array.from({ length: 3 }).map((_, index) => (
              <section className="xp-section detail-skeleton-stack" key={index}>
                <SkeletonLine width="120px" />
                <SkeletonLine className="skeleton-heading" width={index === 1 ? "64%" : "78%"} />
                <div className="detail-skeleton-copy">
                  <SkeletonLine width="100%" />
                  <SkeletonLine width="92%" />
                  <SkeletonLine width="68%" />
                </div>
              </section>
            ))}
          </div>
          <aside className="xp-aside">
            <div className="detail-skeleton-panel is-tall">
              {Array.from({ length: 7 }).map((_, index) => (
                <SkeletonLine key={index} width={index % 2 ? "72%" : "90%"} />
              ))}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
