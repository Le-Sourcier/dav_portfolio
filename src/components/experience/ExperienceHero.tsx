import Link from "next/link";
import type { PortfolioExperienceDetail } from "@/services/portfolio/contentLoaders";
import { localizedPath } from "@/lib/routing/localizedPath";
import { site } from "@/lib/portfolio";
import { getLocale, getTranslations } from "next-intl/server";

interface ExperienceHeroProps {
  experience: PortfolioExperienceDetail;
  contactSubject: string;
  contactBody: string;
}

export async function ExperienceHero({
  experience,
  contactSubject,
  contactBody,
}: ExperienceHeroProps) {
  const t = await getTranslations("ExperienceHero");
  const locale = await getLocale();
  const meta = Array.from(
    new Set(
      [experience.period, experience.location].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  );
  const [primaryLink, secondaryLink] = experience.links;
  const focusTag = experience.focus && experience.focus !== experience.location
    ? experience.focus
    : null;

  return (
    <section className="xp-hero" aria-label={experience.role}>
      <Link href={localizedPath("/#parcours", locale)} className="xp-hero-back">
        {t("backLink")}
      </Link>

      <div className="xp-hero-grid">
        <div className="xp-hero-copy">
          <p className="xp-hero-kicker">
            <span className="xp-hero-kicker-company">{experience.company}</span>
            {meta.map((value) => (
              <span key={value}>{value}</span>
            ))}
          </p>

          <h1>{experience.role}</h1>

          <span className="xp-hero-rule" aria-hidden="true" />

          {experience.stack.length > 0 ? (
            <p className="xp-hero-stack" aria-label={t("stackAriaLabel")}>
              {experience.stack.map((tech, index) => (
                <span key={tech}>
                  {index > 0 ? <i aria-hidden="true">·</i> : null}
                  {tech}
                </span>
              ))}
            </p>
          ) : null}

          <div className="xp-hero-actions">
            <a
              className="primary-button liquid-cta"
              href={`mailto:${site.email}?subject=${contactSubject}&body=${contactBody}`}>
              {t("ctaButton")}
            </a>
            {primaryLink ? (
              <a
                className="xp-hero-link"
                href={primaryLink.url}
                target="_blank"
                rel="noreferrer">
                {primaryLink.label}
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}
            {secondaryLink ? (
              <a
                className="xp-hero-link"
                href={secondaryLink.url}
                target="_blank"
                rel="noreferrer">
                {secondaryLink.label}
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </div>
        </div>

        <div className="xp-hero-visual" aria-hidden="true">
          <div className="xp-hero-visual-grid" />
          <div className="xp-hero-visual-frame">
            {experience.coverImage ? (
              <img src={experience.coverImage} alt="" />
            ) : (
              <div className="xp-hero-visual-fallback">
                <span>{experience.company.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          {focusTag ? (
            <div className="xp-hero-visual-tag">
              <span>{t("focusLabel")}</span>
              <strong>{focusTag}</strong>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
