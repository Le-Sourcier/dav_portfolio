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

interface ExperienceDetailProps {
  experience: PortfolioExperienceDetail;
}

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];

export function ExperienceDetail({ experience }: ExperienceDetailProps) {
  const contactSubject = encodeURIComponent(`Mission similaire à ${experience.role}`);
  const contactBody = encodeURIComponent(
    `Bonjour David,\n\nJ'ai consulté votre expérience chez ${experience.company} et je souhaite discuter d'un besoin similaire.\n\nContexte rapide:\nBudget / délai:\n\nMerci.`,
  );

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
    hasMission && { id: "mission", label: "Mission" },
    hasChallenges && { id: "challenges", label: "Défis" },
    hasAchievements && { id: "achievements", label: "Réalisations" },
    hasDetails && { id: "perimeter", label: "Périmètre" },
    hasDiagram && { id: "architecture", label: "Architecture" },
    hasImpact && { id: "impact", label: "Impact" },
    hasGallery && { id: "gallery", label: "Visuels" },
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
            <ExperienceSection id="mission" kicker="Mission" title="Le contexte">
              <div className="xp-mission">
                <MarkdownContent content={experience.description} />
              </div>
            </ExperienceSection>
          ) : null}

          {hasChallenges ? (
            <ExperienceSection
              id="challenges"
              kicker="Défis"
              title="Ce qu'il fallait résoudre">
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
              kicker="Réalisations"
              title="Ce qui a été livré"
              lead="Les contributions structurantes durant cette mission.">
              <ExperienceAchievements achievements={experience.achievements} />
            </ExperienceSection>
          ) : null}

          {hasDetails ? (
            <ExperienceSection
              id="perimeter"
              kicker="Périmètre"
              title="Sur quoi j'ai travaillé">
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
              kicker="Architecture"
              title="Le système conçu"
              lead="Une lecture rapide des blocs et de leurs flux."
              wide>
              <ExperienceDiagram diagram={experience.solutionDiagram} />
            </ExperienceSection>
          ) : null}

          {hasImpact ? (
            <ExperienceSection
              id="impact"
              kicker="Impact"
              title="Les indicateurs clés"
              lead="Mesure synthétique des effets produits."
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
              kicker="Visuels"
              title="Galerie"
              wide>
              <ExperienceGallery images={experience.illustrativeImages} />
            </ExperienceSection>
          ) : null}

          <section className="xp-closing" aria-labelledby="xp-closing-title">
            <p className="xp-section-kicker">Collaboration</p>
            <h2 id="xp-closing-title">
              Une mission similaire à mener ? Discutons-en.
            </h2>
            <p>
              Diagnostic produit, architecture, livraison. L&apos;objectif reste
              le même : transformer un besoin flou en plateforme claire,
              maintenable et prête à évoluer.
            </p>
            <div className="xp-closing-actions">
              <a
                className="primary-button liquid-cta"
                href={`mailto:${site.email}?subject=${contactSubject}&body=${contactBody}`}>
                Me confier une mission
              </a>
              <a className="xp-hero-link" href="/cv/david-logan-cv.pdf">
                Télécharger le CV
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
