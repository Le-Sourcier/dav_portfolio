import { ExperienceToc } from "@/components/experience/ExperienceToc";
import type { PortfolioExperienceDetail } from "@/services/portfolio/contentLoaders";
import { site } from "@/lib/portfolio";

interface ExperienceAsideProps {
  experience: PortfolioExperienceDetail;
  toc: { id: string; label: string }[];
  contactSubject: string;
  contactBody: string;
}

export function ExperienceAside({
  experience,
  toc,
  contactSubject,
  contactBody,
}: ExperienceAsideProps) {
  return (
    <aside className="xp-rail" aria-label="Repères">
      <div className="xp-rail-inner">
        <ExperienceToc items={toc} />

        {experience.stack.length > 0 ? (
          <section className="xp-rail-section">
            <p className="xp-rail-kicker">Stack</p>
            <ul className="xp-rail-stack">
              {experience.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {experience.links.length > 0 ? (
          <section className="xp-rail-section">
            <p className="xp-rail-kicker">Ressources</p>
            <ul className="xp-rail-links">
              {experience.links.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noreferrer">
                    {link.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <a
          className="xp-rail-cta"
          href={`mailto:${site.email}?subject=${contactSubject}&body=${contactBody}`}>
          Me contacter
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </aside>
  );
}
