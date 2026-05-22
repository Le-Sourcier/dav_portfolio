import type { PortfolioExperienceDetail } from "@/services/portfolio/contentLoaders";

interface ExperienceSignalProps {
  experience: PortfolioExperienceDetail;
}

export function ExperienceSignal({ experience }: ExperienceSignalProps) {
  const facts: { label: string; value: string }[] = [];

  if (experience.period) {
    facts.push({ label: "Période", value: experience.period });
  }
  if (experience.location) {
    facts.push({ label: "Lieu", value: experience.location });
  }
  if (experience.stack.length > 0) {
    facts.push({
      label: "Stack",
      value: `${experience.stack.length} techno${experience.stack.length > 1 ? "s" : ""}`,
    });
  }
  if (experience.achievements.length > 0) {
    facts.push({
      label: "Réalisations",
      value: String(experience.achievements.length),
    });
  }
  if (experience.impactGraph.length > 0) {
    facts.push({
      label: "Indicateurs",
      value: `${experience.impactGraph.length} axe${experience.impactGraph.length > 1 ? "s" : ""}`,
    });
  }

  if (facts.length === 0) return null;

  return (
    <aside className="xp-signal" aria-label="Signaux rapides">
      <dl>
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
