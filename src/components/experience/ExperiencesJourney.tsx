"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { localizedPath } from "@/lib/routing/localizedPath";
import type { PortfolioExperienceItem } from "@/services/portfolio/contentLoaders";

type ExperiencesJourneyProps = {
  experiences: PortfolioExperienceItem[];
};

export function ExperiencesJourney({ experiences }: ExperiencesJourneyProps) {
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
    <section className="xp-index" aria-labelledby="experiences-title">
      <svg className="xp-index-bg" viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0,100 Q80,30 160,100 T320,100 T480,100 T640,100 T800,100 T960,100 T1120,100 T1280,100"
          fill="none"
          stroke="rgba(15,118,110,0.08)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
      </svg>
      <div className="xp-index-grid">
        {experiences.map((item, index) => (
          <Link
            key={`${item.company}-${item.period}`}
            href={localizedPath(`/experiences/${item.id}`, locale)}
            className="xp-index-node"
          >
            <span className="xp-index-dot" />
            <span className="xp-index-num">{String(index + 1).padStart(2, "0")}</span>
            <div className="xp-index-body">
              <div className="xp-index-head">
                <strong>{item.company}</strong>
                <span>{item.period}</span>
              </div>
              <span className="xp-index-title">{item.role}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
