import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { ExperienceAchievements } from "@/components/experience/ExperienceAchievements";
import { ExperienceAside } from "@/components/experience/ExperienceAside";
import { ExperienceDiagram } from "@/components/experience/ExperienceDiagram";
import { ExperienceGallery } from "@/components/experience/ExperienceGallery";
import { ExperienceHero } from "@/components/experience/ExperienceHero";
import { ExperienceRadar } from "@/components/experience/ExperienceRadar";
import { ExperienceSection } from "@/components/experience/ExperienceSection";
import { ExperienceSignal } from "@/components/experience/ExperienceSignal";
import type { PortfolioExperienceDetail } from "@/services/portfolio/contentLoaders";
import { site } from "@/lib/portfolio";
import { getTranslations } from "next-intl/server";

interface ExperienceDetailProps {
  experience: PortfolioExperienceDetail;
}

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];

export async function ExperienceDetail({ experience }: ExperienceDetailProps) {
  const t = await getTranslations("ExperienceDetail");
  const contactSubject = encodeURIComponent(t("contactSubject", { role: experience.role }));
  const contactBody = encodeURIComponent(t("contactBody", { company: experience.company }));

  const hasMission = Boolean(experience.description);
  const hasAchievements = experience.achievements.length > 0;
  const hasChallenges = experience.challenges.length > 0;
  const hasDetails = experience.details.length > 0;
  const hasDiagram = Boolean(
    experience.solutionDiagram && experience.solutionDiagram.nodes.length > 0,
  );
  const hasImpact = experience.impactGraph.length > 0;
  const hasGallery = experience.illustrativeImages.length > 0;

  const toc: { id: string; label: string }[] = [
    hasMission && { id: "mission", label: t("tocMission") },
    hasChallenges && { id: "challenges", label: t("tocChallenges") },
    hasAchievements && { id: "achievements", label: t("tocAchievements") },
    hasDetails && { id: "perimeter", label: t("tocPerimeter") },
    hasDiagram && { id: "architecture", label: t("tocArchitecture") },
    hasImpact && { id: "impact", label: t("tocImpact") },
    hasGallery && { id: "gallery", label: t("tocGallery") },
  ].filter(
    (item): item is { id: string; label: string } => typeof item === "object" && item !== null,
  );

  return (
    <main className="xp-page">
      <ExperienceHero
        experience={experience}
        contactSubject={contactSubject}
        contactBody={contactBody}
      />

      <ExperienceSignal experience={experience} />

      <div className="xp-shell">
        <div className="xp-flow">
          {hasMission ? (
            <ExperienceSection id="mission" kicker={t("missionKicker")} title={t("missionTitle")}>
              <div className="xp-mission">
                <MarkdownContent content={experience.description} />
              </div>
            </ExperienceSection>
          ) : null}

          {hasChallenges ? (
            <ExperienceSection
              id="challenges"
              kicker={t("challengesKicker")}
              title={t("challengesTitle")}>
              <ol className="xp-challenges">
                {experience.challenges.map((challenge, index) => (
                  <li key={challenge}>
                    <span aria-hidden="true">{ROMAN[index] ?? String(index + 1)}.</span>
                    <p>{challenge}</p>
                  </li>
                ))}
              </ol>
            </ExperienceSection>
          ) : null}

          {hasAchievements ? (
            <ExperienceSection
              id="achievements"
              kicker={t("achievementsKicker")}
              title={t("achievementsTitle")}
              lead={t("achievementsLead")}>
              <ExperienceAchievements achievements={experience.achievements} />
            </ExperienceSection>
          ) : null}

          {hasDetails ? (
            <ExperienceSection
              id="perimeter"
              kicker={t("perimeterKicker")}
              title={t("perimeterTitle")}>
              <ul className="xp-perimeter">
                {experience.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </ExperienceSection>
          ) : null}

          {hasDiagram && experience.solutionDiagram ? (
            <ExperienceSection
              id="architecture"
              kicker={t("architectureKicker")}
              title={t("architectureTitle")}
              lead={t("architectureLead")}
              wide>
              <ExperienceDiagram diagram={experience.solutionDiagram} />
            </ExperienceSection>
          ) : null}

          {hasImpact ? (
            <ExperienceSection
              id="impact"
              kicker={t("impactKicker")}
              title={t("impactTitle")}
              lead={t("impactLead")}
              wide>
              {experience.impactGraph.length >= 4 ? (
                <ExperienceRadar points={experience.impactGraph} />
              ) : (
                <ul className="xp-impact-bars">
                  {experience.impactGraph.map((point) => (
                    <li key={point.label}>
                      <span>{point.label}</span>
                      <strong>{point.value}%</strong>
                      <i
                        style={{
                          width: `${Math.min(100, Math.max(0, point.value))}%`,
                        }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </ExperienceSection>
          ) : null}

          {hasGallery ? (
            <ExperienceSection
              id="gallery"
              kicker={t("galleryKicker")}
              title={t("galleryTitle")}
              wide>
              <ExperienceGallery images={experience.illustrativeImages} />
            </ExperienceSection>
          ) : null}

          <section className="xp-closing" aria-labelledby="xp-closing-title">
            <p className="xp-section-kicker">{t("closingKicker")}</p>
            <h2 id="xp-closing-title">
              {t("closingTitle")}
            </h2>
            <p>
              {t("closingDescription")}
            </p>
            <div className="xp-closing-actions">
              <a
                className="primary-button liquid-cta"
                href={`mailto:${site.email}?subject=${contactSubject}&body=${contactBody}`}>
                {t("closingCta")}
              </a>
              <a className="xp-hero-link" href="/cv/david-logan-cv.pdf">
                {t("closingCv")}
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </section>
        </div>

        <ExperienceAside
          experience={experience}
          toc={toc}
          contactSubject={contactSubject}
          contactBody={contactBody}
        />
      </div>
    </main>
  );
}
