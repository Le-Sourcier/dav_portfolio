import Link from "next/link";
import Image from "next/image";
import type { PortfolioExperienceDetail } from "@/services/portfolio/contentLoaders";
import { localizedPath } from "@/lib/routing/localizedPath";
import { site } from "@/lib/portfolio";
import type { AppLocale } from "@/i18n/config";
import { getTranslations } from "next-intl/server";

interface ExperienceHeroProps {
  experience: PortfolioExperienceDetail;
  contactSubject: string;
  contactBody: string;
  locale: AppLocale;
}

export async function ExperienceHero({
  experience,
  contactSubject,
  contactBody,
  locale,
}: ExperienceHeroProps) {
  const t = await getTranslations({ locale, namespace: "ExperienceHero" });
  const meta = Array.from(
    new Set(
      [experience.period, experience.location].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  );
  const [primaryLink, secondaryLink] = experience.links;
  const focusTag =
    experience.focus && experience.focus !== experience.location
      ? experience.focus
      : null;

  // Variante immersive (calquée sur ArticleHero) quand une cover image est
  // disponible. Sans image, on retombe sur le layout grid 2-colonnes
  // historique qui reste qualitatif grâce au visual-fallback initiale.
  if (experience.coverImage) {
    return (
      <ImmersiveExperienceHero
        experience={experience}
        contactSubject={contactSubject}
        contactBody={contactBody}
        locale={locale}
        meta={meta}
        focusTag={focusTag}
        primaryLink={primaryLink}
        secondaryLink={secondaryLink}
        labels={{
          backLink: t("backLink"),
          stackAriaLabel: t("stackAriaLabel"),
          ctaButton: t("ctaButton"),
          focusLabel: t("focusLabel"),
        }}
      />
    );
  }

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
            <div className="xp-hero-stack" role="group" aria-label={t("stackAriaLabel")}>
              {experience.stack.map((tech, index) => (
                <span key={tech}>
                  {index > 0 ? <i aria-hidden="true">·</i> : null}
                  {tech}
                </span>
              ))}
            </div>
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
            <div className="xp-hero-visual-fallback">
              <span>{experience.company.charAt(0).toUpperCase()}</span>
            </div>
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

type ImmersiveProps = {
  experience: PortfolioExperienceDetail;
  contactSubject: string;
  contactBody: string;
  locale: AppLocale;
  meta: string[];
  focusTag: string | null;
  primaryLink?: { label: string; url: string };
  secondaryLink?: { label: string; url: string };
  labels: {
    backLink: string;
    stackAriaLabel: string;
    ctaButton: string;
    focusLabel: string;
  };
};

function ImmersiveExperienceHero({
  experience,
  contactSubject,
  contactBody,
  locale,
  meta,
  focusTag,
  primaryLink,
  secondaryLink,
  labels,
}: ImmersiveProps) {
  return (
    <section className="xp-cover-hero" aria-label={experience.role}>
      <Image
        src={experience.coverImage as string}
        alt=""
        width={1920}
        height={1080}
        sizes="100vw"
        priority
        className="xp-cover-hero-img"
      />
      <div className="xp-cover-overlay" aria-hidden="true" />
      <div className="xp-cover-content">
        <div className="xp-cover-toolbar">
          <Link
            href={localizedPath("/#parcours", locale)}
            className="xp-cover-back-link">
            {labels.backLink}
          </Link>
          <p className="xp-cover-kicker">{experience.company}</p>
        </div>

        <h1>{experience.role}</h1>

        {meta.length > 0 || experience.stack.length > 0 || focusTag ? (
          <div className="xp-cover-meta-row">
            <div className="xp-cover-meta">
              {meta.map((value) => (
                <span key={value}>{value}</span>
              ))}
              {focusTag ? (
                <span className="is-focus">
                  <small aria-hidden="true">{labels.focusLabel}</small>
                  {focusTag}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {experience.stack.length > 0 ? (
          <div
            className="xp-cover-stack"
            role="group"
            aria-label={labels.stackAriaLabel}>
            {experience.stack.map((tech, index) => (
              <span key={tech}>
                {index > 0 ? <i aria-hidden="true">·</i> : null}
                {tech}
              </span>
            ))}
          </div>
        ) : null}

        <div className="xp-cover-actions">
          <a
            className="primary-button liquid-cta"
            href={`mailto:${site.email}?subject=${contactSubject}&body=${contactBody}`}>
            {labels.ctaButton}
          </a>
          {primaryLink ? (
            <a
              className="xp-cover-link"
              href={primaryLink.url}
              target="_blank"
              rel="noreferrer">
              {primaryLink.label}
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
          {secondaryLink ? (
            <a
              className="xp-cover-link"
              href={secondaryLink.url}
              target="_blank"
              rel="noreferrer">
              {secondaryLink.label}
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
