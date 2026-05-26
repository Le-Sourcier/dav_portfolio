import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { BackToTop } from "@/components/blog/BackToTop";
import { getRequestLocale } from "@/i18n/server";
import { site } from "@/lib/portfolio";
import { loadProjectBySlug } from "@/services/portfolio/projectsLoader";
import type { ProjectMetric } from "@/types/portfolio.types";

export const revalidate = 300;
export const dynamicParams = true;

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

function metricDelta(metric: ProjectMetric) {
  if (!metric.previousValue) return null;
  return Math.round(
    ((metric.value - metric.previousValue) / metric.previousValue) * 100,
  );
}

function metricUnit(metric: ProjectMetric) {
  const unit = metric.unit?.trim() ?? "";
  return unit.toLowerCase() === "n" ? "" : unit;
}

function metricValue(metric: ProjectMetric, value = metric.value) {
  const unit = metricUnit(metric);
  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
  }).format(value);

  if (!unit) return formatted;
  return ["%", "x"].includes(unit)
    ? `${formatted}${unit}`
    : `${formatted} ${unit}`;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const project = await loadProjectBySlug(slug, locale);

  if (!project) {
    return {};
  }

  const t = await getTranslations("ProjectDetail");
  const description = [project.headline, project.result]
    .filter(Boolean)
    .join(" ")
    .trim();
  const title = `${project.name} ${t("metaTitleSuffix")}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${site.url}/projects/${project.slug}`,
    },
    openGraph: {
      title,
      description: project.result ?? description,
      url: `${site.url}/projects/${project.slug}`,
      type: "article",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: project.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.result ?? description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const project = await loadProjectBySlug(slug, locale);

  if (!project) {
    notFound();
  }

  const t = await getTranslations("ProjectDetail");

  const chartMax = Math.max(...project.chartData.map((item) => item.value), 1);
  const chartMin = Math.min(...project.chartData.map((item) => item.value), 0);
  const chartRange = Math.max(chartMax - chartMin, 1);
  const chartMid = Math.round(chartMin + chartRange / 2);
  const chartPlot = { left: 11, right: 98, top: 8, middle: 26, bottom: 44 };
  const chartWidth = chartPlot.right - chartPlot.left;
  const chartPoints = project.chartData.map((point, index) => {
    const x =
      project.chartData.length > 1
        ? chartPlot.left + (index / (project.chartData.length - 1)) * chartWidth
        : chartPlot.left + chartWidth / 2;
    const y =
      chartPlot.bottom -
      ((point.value - chartMin) / chartRange) *
        (chartPlot.bottom - chartPlot.top);
    return { ...point, x, y };
  });
  const chartPath = chartPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  const chartArea =
    chartPoints.length > 0
      ? `${chartPlot.left},${chartPlot.bottom} ${chartPath} ${
          chartPoints[chartPoints.length - 1].x
        },${chartPlot.bottom}`
      : "";
  const hasMetrics = project.metrics.length > 0;
  const hasArchitecture = Boolean(
    project.solutionDiagram || project.impactGraph?.length,
  );
  const projectYear = project.createdAt
    ? new Date(project.createdAt).getFullYear()
    : null;
  const projectScope = [project.role, project.category]
    .filter(Boolean)
    .join(" · ");
  const projectStackSignal = project.tech.slice(0, 3).join(" · ");
  const hasContextHeadline = Boolean(
    project.headline?.trim() &&
    project.headline.trim() !== project.description.trim(),
  );
  const contextFacts = [
    [t("perimeterFact"), projectScope],
    [t("stackFact"), projectStackSignal],
    [t("signalFact"), project.metric],
  ].filter(([, value]) => Boolean(value));
  const hireSubject = encodeURIComponent(
    t("hireSubject", { name: project.name }),
  );
  const hireBody = encodeURIComponent(t("hireBody", { name: project.name }));

  return (
    <>
      <Header showProjects />
      <main className="case-page">
        <section className="case-cover-hero">
          {project.image ? (
            <img src={project.image} alt="" aria-hidden="true" />
          ) : null}
          <div className="case-cover-overlay" />
          <div className="case-cover-content">
            <Link
              href="/#projects"
              className="case-back-link"
              style={{ marginRight: "1rem" }}>
              {t("backLink")}
            </Link>
            <span className="case-category">{project.category}</span>
            <h1>{project.name}</h1>
            <p>{project.headline}</p>
            <div className="case-hero-meta" aria-label={t("summaryAriaLabel")}>
              <span>{project.role}</span>
              {projectYear ? <span>{projectYear}</span> : null}
              {project.metric ? <span>{project.metric}</span> : null}
            </div>
          </div>
        </section>

        <section className="case-study-shell">
          <article className="case-story">
            <section
              className="case-intro"
              aria-labelledby="case-context-title">
              <div className="case-intro-label">
                <span>{t("contextLabel")}</span>
                {projectYear ? <small>{projectYear}</small> : null}
              </div>
              <div className="case-intro-copy">
                <h2 id="case-context-title">
                  {hasContextHeadline ? project.headline : t("contextFallback")}
                </h2>
                <p>{project.description}</p>
                {contextFacts.length > 0 ? (
                  <dl className="case-context-facts">
                    {contextFacts.map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            </section>

            <section className="case-duo">
              {project.problem ? (
                <article className="case-duo-card">
                  <div className="case-duo-top">
                    <span>{t("challengeLabel")}</span>
                    <small>{t("challengeBefore")}</small>
                  </div>
                  <h2>{t("challengeTitle")}</h2>
                  <p>{project.problem}</p>
                  <div className="case-duo-signal">
                    <span>{t("riskLabel")}</span>
                    <strong>{projectScope || t("riskFallback")}</strong>
                  </div>
                </article>
              ) : null}
              {project.solution ? (
                <article className="case-duo-card is-solution">
                  <div className="case-duo-top">
                    <span>{t("approachLabel")}</span>
                    <small>{t("approachAfter")}</small>
                  </div>
                  <h2>{t("approachTitle")}</h2>
                  <p>{project.solution}</p>
                  <div className="case-duo-signal">
                    <span>{t("foundationLabel")}</span>
                    <strong>
                      {projectStackSignal || t("foundationFallback")}
                    </strong>
                  </div>
                </article>
              ) : null}
            </section>

            {hasMetrics || project.chartData.length > 0 ? (
              <section
                className="case-measure"
                aria-labelledby="case-performance-title">
                <div className="case-section-head">
                  <span>{t("resultsLabel")}</span>
                  <h2 id="case-performance-title">{t("resultsTitle")}</h2>
                  <p>{t("resultsDescription")}</p>
                </div>

                {hasMetrics ? (
                  <div
                    className="case-metrics"
                    aria-label={t("metricsAriaLabel")}>
                    {project.metrics.map((metric) => {
                      const delta = metricDelta(metric);
                      const metricMax = Math.max(
                        metric.value,
                        metric.previousValue || 0,
                        1,
                      );
                      const progress = Math.min(
                        100,
                        Math.max(0, (metric.value / metricMax) * 100),
                      );
                      const previousProgress = metric.previousValue
                        ? Math.min(
                            100,
                            Math.max(
                              8,
                              (metric.previousValue / metricMax) * 100,
                            ),
                          )
                        : 0;
                      return (
                        <article key={metric.name}>
                          <div className="case-metric-head">
                            <span>{metric.name}</span>
                            {delta !== null ? (
                              <small>
                                {t("deltaLabel", {
                                  delta:
                                    delta > 0 ? `+${delta}` : String(delta),
                                })}
                              </small>
                            ) : null}
                          </div>
                          <strong>{metricValue(metric)}</strong>
                          <div
                            className="case-metric-compare"
                            aria-hidden="true">
                            {metric.previousValue ? (
                              <div>
                                <span>{t("beforeLabel")}</span>
                                <i
                                  style={{
                                    width: `${previousProgress}%`,
                                  }}
                                />
                                <b>
                                  {metricValue(metric, metric.previousValue)}
                                </b>
                              </div>
                            ) : null}
                            <div>
                              <span>{t("afterLabel")}</span>
                              <i
                                className="is-after"
                                style={{ width: `${progress}%` }}
                              />
                              <b>{metricValue(metric)}</b>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : null}

                {project.chartData.length > 0 ? (
                  <div
                    className="case-chart"
                    aria-label={t("evolutionAriaLabel")}>
                    <div className="case-chart-head">
                      <span>{t("evolutionLabel")}</span>
                      <strong>{t("evolutionTitle")}</strong>
                    </div>
                    <div className="case-chart-visual">
                      <div className="case-chart-axis" aria-hidden="true">
                        <span style={{ top: `${(chartPlot.top / 48) * 100}%` }}>
                          {chartMax}
                        </span>
                        <span
                          style={{ top: `${(chartPlot.middle / 48) * 100}%` }}>
                          {chartMid}
                        </span>
                        <span
                          style={{ top: `${(chartPlot.bottom / 48) * 100}%` }}>
                          {chartMin}
                        </span>
                      </div>
                      <svg
                        viewBox="0 0 100 48"
                        preserveAspectRatio="none"
                        role="img"
                        aria-label={t("chartAriaLabel")}>
                        <defs>
                          <linearGradient
                            id={`case-chart-area-${project.slug}`}
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1">
                            <stop
                              offset="0%"
                              stopColor="var(--accent-strong)"
                              stopOpacity="0.14"
                            />
                            <stop
                              offset="100%"
                              stopColor="var(--accent-strong)"
                              stopOpacity="0"
                            />
                          </linearGradient>
                          <clipPath id={`case-chart-clip-${project.slug}`}>
                            <rect
                              x={chartPlot.left}
                              y={chartPlot.top}
                              width={chartWidth}
                              height={chartPlot.bottom - chartPlot.top}
                              rx="0.5"
                            />
                          </clipPath>
                        </defs>
                        <path
                          className="case-chart-grid"
                          d={`M${chartPlot.left} ${chartPlot.top}H${chartPlot.right} M${chartPlot.left} ${chartPlot.middle}H${chartPlot.right} M${chartPlot.left} ${chartPlot.bottom}H${chartPlot.right}`}
                        />
                        <g clipPath={`url(#case-chart-clip-${project.slug})`}>
                          {chartArea ? (
                            <polygon
                              className="case-chart-area"
                              points={chartArea}
                              fill={`url(#case-chart-area-${project.slug})`}
                            />
                          ) : null}
                          {chartPath ? (
                            <polyline
                              className="case-chart-line"
                              points={chartPath}
                            />
                          ) : null}
                        </g>
                      </svg>
                      <div className="case-chart-markers" aria-hidden="true">
                        {chartPoints.map((point) => (
                          <i
                            key={point.name}
                            style={{
                              left: `${point.x}%`,
                              top: `${(point.y / 48) * 100}%`,
                            }}
                          />
                        ))}
                      </div>
                      <div className="case-chart-xlabels" aria-hidden="true">
                        {chartPoints.map((point, index) => (
                          <div
                            key={point.name}
                            className="case-chart-xitem"
                            data-edge={
                              index === 0
                                ? "start"
                                : index === chartPoints.length - 1
                                  ? "end"
                                  : undefined
                            }
                            style={{ left: `${point.x}%` }}>
                            <span>{point.name.toUpperCase()}</span>
                            <strong>{point.value}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}

            {hasArchitecture ? (
              <section
                className="case-system"
                aria-labelledby="case-architecture-title">
                <div className="case-section-head">
                  <span>{t("architectureLabel")}</span>
                  <h2 id="case-architecture-title">{t("architectureTitle")}</h2>
                  <p>{t("architectureDescription")}</p>
                </div>

                {project.solutionDiagram ? (
                  <div className="case-architecture-grid">
                    <div className="case-diagram">
                      {project.solutionDiagram.nodes.map((node) => (
                        <article key={node.id} data-type={node.type}>
                          <span>{node.type}</span>
                          <strong>{node.label}</strong>
                        </article>
                      ))}
                    </div>
                    {project.solutionDiagram.connections.length > 0 ? (
                      <div className="case-connections">
                        {project.solutionDiagram.connections.map(
                          (connection) => {
                            const from = project.solutionDiagram?.nodes.find(
                              (node) => node.id === connection.from,
                            );
                            const to = project.solutionDiagram?.nodes.find(
                              (node) => node.id === connection.to,
                            );
                            return (
                              <div
                                key={`${connection.from}-${connection.to}-${connection.label ?? ""}`}>
                                <span>{from?.label ?? connection.from}</span>
                                <i aria-hidden="true" />
                                <strong>{to?.label ?? connection.to}</strong>
                                {connection.label ? (
                                  <small>{connection.label}</small>
                                ) : null}
                              </div>
                            );
                          },
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {project.impactGraph?.length ? (
                  <div className="case-impact-panel">
                    <div className="case-impact">
                      {project.impactGraph.map((point) => (
                        <div key={point.label}>
                          <span>{point.label}</span>
                          <strong>{point.value}%</strong>
                          <i
                            style={{
                              width: `${Math.min(100, Math.max(0, point.value))}%`,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}
          </article>

          <aside className="case-aside">
            {project.result || project.metric ? (
              <div className="case-aside-main">
                <span>{t("mainSignalLabel")}</span>
                {project.metric ? <strong>{project.metric}</strong> : null}
                <p>{project.result || project.description}</p>
              </div>
            ) : null}

            {project.results.length > 0 ? (
              <div className="case-aside-block">
                <span>{t("deliverablesLabel")}</span>
                <ul>
                  {project.results.map((result) => (
                    <li key={result}>{result}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {project.tech.length > 0 ? (
              <div className="case-aside-block">
                <span>{t("stackLabel")}</span>
                <div className="tag-list">
                  {project.tech.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="case-aside-actions">
              {project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer">
                  {link.label}
                </a>
              ))}
              <a
                href={`mailto:${site.email}?subject=${encodeURIComponent(t("hireSubject", { name: project.name }))}`}>
                {t("discussLink")}
              </a>
            </div>
          </aside>
        </section>

        <section className="case-hire-cta" aria-labelledby="case-hire-title">
          <div>
            <span>{t("collaborationLabel")}</span>
            <h2 id="case-hire-title">{t("collaborationTitle")}</h2>
          </div>
          <div className="case-hire-note">
            <p>{t("collaborationDescription")}</p>
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
              href={`mailto:${site.email}?subject=${hireSubject}&body=${hireBody}`}>
              {t("ctaButton")}
            </a>
            <a href="/cv/david-logan-cv.pdf">{t("downloadCv")}</a>
          </div>
        </section>
      </main>
      <Footer showProjects />
      <BackToTop />
    </>
  );
}
