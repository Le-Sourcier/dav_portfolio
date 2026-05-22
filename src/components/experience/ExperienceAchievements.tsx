import type { PortfolioExperienceDetail } from "@/services/portfolio/contentLoaders";

interface ExperienceAchievementsProps {
  achievements: PortfolioExperienceDetail["achievements"];
}

export function ExperienceAchievements({
  achievements,
}: ExperienceAchievementsProps) {
  return (
    <ol className="xp-achievements">
      {achievements.map((item, index) => (
        <li key={item.title}>
          <span className="xp-achievements-index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
