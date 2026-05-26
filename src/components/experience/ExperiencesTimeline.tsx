import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { localizedPath } from "@/lib/routing/localizedPath";
import type { PortfolioExperienceItem } from "@/services/portfolio/contentLoaders";

type ExperiencesTimelineProps = {
  experiences: PortfolioExperienceItem[];
};

export function ExperiencesTimeline({ experiences }: ExperiencesTimelineProps) {
  const t = useTranslations("ExperiencesIndex");
  const locale = useLocale();

  if (experiences.length === 0) {
    return (
      <section className="section project-empty-state">
        <strong>{t("emptyTitle")}</strong>
        <p>{t("emptyText")}</p>
      </section>
    );
  }

  return (
    <section className="section parcours-section" aria-labelledby="experiences-title">
      <div className="parcours-timeline">
        {experiences.map((item, index) => (
          <article
            className="parcours-card"
            key={`${item.company}-${item.period}`}
          >
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
                className="text-link parcours-link"
              >
                {t("journeyDetailLink")}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
