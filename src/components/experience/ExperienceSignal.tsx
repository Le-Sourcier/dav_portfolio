import type { PortfolioExperienceDetail } from "@/services/portfolio/contentLoaders";
import type { AppLocale } from "@/i18n/config";
import { getTranslations } from "next-intl/server";

interface ExperienceSignalProps {
  experience: PortfolioExperienceDetail;
  locale: AppLocale;
}

export async function ExperienceSignal({ experience, locale }: ExperienceSignalProps) {
  const t = await getTranslations({ locale, namespace: "ExperienceSignal" });
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
      value: t("stackCount", { count: experience.stack.length }),
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
      value: t("axisCount", { count: experience.impactGraph.length }),
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
