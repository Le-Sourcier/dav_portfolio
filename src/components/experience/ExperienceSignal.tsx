import type { PortfolioExperienceDetail } from "@/services/portfolio/contentLoaders";
import { getTranslations } from "next-intl/server";

interface ExperienceSignalProps {
  experience: PortfolioExperienceDetail;
}

export async function ExperienceSignal({ experience }: ExperienceSignalProps) {
  const t = await getTranslations("ExperienceSignal");
  const facts: { label: string; value: string }[] = [];

  if (experience.period) {
    facts.push({ label: t("periodLabel"), value: experience.period });
  }
  if (experience.location) {
    facts.push({ label: t("locationLabel"), value: experience.location });
  }
  if (experience.stack.length > 0) {
    facts.push({
      label: t("stackLabel"),
      value: `${experience.stack.length} techno${experience.stack.length > 1 ? "s" : ""}`,
    });
  }
  if (experience.achievements.length > 0) {
    facts.push({
      label: t("achievementsLabel"),
      value: String(experience.achievements.length),
    });
  }
  if (experience.impactGraph.length > 0) {
    facts.push({
      label: t("indicatorsLabel"),
      value: `${experience.impactGraph.length} axe${experience.impactGraph.length > 1 ? "s" : ""}`,
    });
  }

  if (facts.length === 0) return null;

  return (
    <aside className="xp-signal" aria-label={t("signalAriaLabel")}>
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
