"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Project } from "@/types/portfolio.types";

type ProjectsDirectoryProps = {
  projects: Project[];
};

type SortKey = "featured" | "recent" | "impact";

const formatDate = (iso?: string, locale = "fr") => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    month: "short",
    year: "numeric",
  });
};

const projectScore = (project: Project) =>
  (project.featured ? 120 : 0) +
  project.metrics.length * 18 +
  project.results.length * 10 +
  project.chartData.length * 4 +
  project.tech.length;

const searchableProject = (project: Project) =>
  [
    project.name,
    project.title,
    project.category,
    project.role,
    project.headline,
    project.description,
    project.problem,
    project.solution,
    project.result,
    project.metric,
    ...project.tech,
    ...project.results,
    ...project.metrics.map(
      (metric) => `${metric.name} ${metric.value}${metric.unit}`,
    ),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export function ProjectsDirectory({ projects }: ProjectsDirectoryProps) {
  const locale = useLocale();
  const t = useTranslations("ProjectsIndex");
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const categories = useMemo(
    () =>
      Array.from(
        new Set(projects.map((project) => project.category).filter(Boolean)),
      ),
    [projects],
  );
  const featuredProject = useMemo(
    () =>
      [...projects].sort((a, b) => {
        const scoreDelta = projectScore(b) - projectScore(a);
        if (scoreDelta !== 0) return scoreDelta;
        return (
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
        );
      })[0],
    [projects],
  );
  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return projects
      .filter((project) => {
        const matchesCategory =
          activeCategory === "all" || project.category === activeCategory;
        const matchesQuery =
          !normalizedQuery ||
          searchableProject(project).includes(normalizedQuery);
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sort === "impact") return projectScore(b) - projectScore(a);
        if (sort === "recent") {
          return (
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()
          );
        }
        const featuredDelta = Number(b.featured) - Number(a.featured);
        if (featuredDelta !== 0) return featuredDelta;
        return projectScore(b) - projectScore(a);
      });
  }, [activeCategory, projects, query, sort]);
  const hasFilters = activeCategory !== "all" || query.trim() !== "";
  const visibleProjects =
    !hasFilters && featuredProject
      ? filteredProjects.filter(
          (project) => project.slug !== featuredProject.slug,
        )
      : filteredProjects;
  const resetFilters = () => {
    setActiveCategory("all");
    setQuery("");
    setSort("featured");
  };

  if (projects.length === 0) {
    return (
      <section className="section project-empty-state">
        <strong>{t("emptyTitle")}</strong>
        <p>{t("emptyText")}</p>
      </section>
    );
  }

  return (
    <section
      className="section project-index"
      aria-labelledby="project-index-title">
      <div className="project-index-controls">
        <div>
          <span>{t("count", { count: projects.length })}</span>
          <strong id="project-index-title">{t("filterTitle")}</strong>
        </div>
        <div className="project-filter-panel">
          <label className="project-search">
            <span>{t("searchLabel")}</span>
            <div className="filter-search-shell">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
              />
              <button
                type="button"
                className="filter-settings-button"
                aria-label={t("sortLabel")}
                aria-expanded={settingsOpen}
                onClick={() => setSettingsOpen((current) => !current)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 7h10" />
                  <path d="M18 7h2" />
                  <path d="M16 5v4" />
                  <path d="M4 17h2" />
                  <path d="M10 17h10" />
                  <path d="M8 15v4" />
                </svg>
              </button>
              {settingsOpen ? (
                <div className="filter-settings-popover">
                  <span>{t("sortLabel")}</span>
                  <div>
                    {[
                      ["featured", t("sortFeatured")],
                      ["recent", t("sortRecent")],
                      ["impact", t("sortImpact")],
                    ].map(([value, label]) => (
                      <button
                        type="button"
                        key={value}
                        className={sort === value ? "is-active" : ""}
                        onClick={() => {
                          setSort(value as SortKey);
                          setSettingsOpen(false);
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </label>
        </div>
        <div className="project-category-row" aria-label="Filtres projets">
          <button
            type="button"
            className={activeCategory === "all" ? "is-active" : ""}
            onClick={() => setActiveCategory("all")}>
            {t("categoryAll")}
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={activeCategory === category ? "is-active" : ""}
              onClick={() => setActiveCategory(category)}>
              {category}
            </button>
          ))}
          {hasFilters ? (
            <button
              type="button"
              className="project-reset-filter"
              onClick={resetFilters}>
              {t("resetFilters")}
            </button>
          ) : null}
        </div>
      </div>

      {featuredProject && !hasFilters ? (
        <Link
          href={`/projects/${featuredProject.slug}`}
          className="project-featured-case">
          <div
            className={`project-featured-media${featuredProject.image ? " has-image" : ""}`}>
            {featuredProject.image ? (
              <img src={featuredProject.image} alt="" loading="lazy" />
            ) : null}
            <span>{t("leadBadge")}</span>
          </div>
          <div className="project-featured-copy">
            <span>{featuredProject.category}</span>
            <h2>{featuredProject.name}</h2>
            <p>{featuredProject.headline || featuredProject.description}</p>
            <dl>
              {featuredProject.metric ? (
                <div>
                  <dt>{t("signalTag")}</dt>
                  <dd>{featuredProject.metric}</dd>
                </div>
              ) : null}
              {featuredProject.role ? (
                <div>
                  <dt>{t("roleLabel")}</dt>
                  <dd>{featuredProject.role}</dd>
                </div>
              ) : null}
              {featuredProject.tech.length > 0 ? (
                <div>
                  <dt>{t("stackTag")}</dt>
                  <dd>{featuredProject.tech.slice(0, 3).join(" · ")}</dd>
                </div>
              ) : null}
            </dl>
            <strong>{t("readCase")}</strong>
          </div>
        </Link>
      ) : null}

      <div className="project-results-line">
        <span>{t("resultsCount", { count: filteredProjects.length })}</span>
        <p>{hasFilters ? `${query || activeCategory}` : t("defaultHint")}</p>
      </div>

      {visibleProjects.length > 0 ? (
        <div className="project-index-grid">
          {visibleProjects.map((project) => (
            <Link
              href={`/projects/${project.slug}`}
              key={project.slug}
              className="project-index-card">
              <div
                className={`project-index-media${project.image ? " has-image" : ""}`}>
                {project.image ? (
                  <img src={project.image} alt="" loading="lazy" />
                ) : null}
                {project.metric ? <strong>{project.metric}</strong> : null}
              </div>
              <div className="project-index-body">
                <div className="project-index-meta">
                  <span>{project.category}</span>
                  {formatDate(project.createdAt, locale) ? (
                    <small>{formatDate(project.createdAt, locale)}</small>
                  ) : null}
                </div>
                <h3>{project.name}</h3>
                <p>{project.headline || project.description}</p>
                <div className="project-index-stack">
                  {project.tech.slice(0, 4).map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
                <strong>{t("readCase")}</strong>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="project-empty-state">
          <strong>{t("noResultsTitle")}</strong>
          <p>{t("noResultsText")}</p>
          <button type="button" onClick={resetFilters}>
            {t("resetFilters")}
          </button>
        </div>
      )}
    </section>
  );
}
