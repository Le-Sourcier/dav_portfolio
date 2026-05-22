import type { ReactNode } from "react";

interface ExperienceSectionProps {
  id: string;
  kicker: string;
  title: string;
  lead?: string;
  wide?: boolean;
  children: ReactNode;
}

export function ExperienceSection({
  id,
  kicker,
  title,
  lead,
  wide = false,
  children,
}: ExperienceSectionProps) {
  return (
    <section
      id={id}
      className={`xp-section${wide ? " xp-section--wide" : ""}`}
      aria-labelledby={`${id}-title`}>
      <header className="xp-section-head">
        <p className="xp-section-kicker">{kicker}</p>
        <h2 id={`${id}-title`}>{title}</h2>
        {lead ? <p className="xp-section-lead">{lead}</p> : null}
      </header>
      <div className="xp-section-body">{children}</div>
    </section>
  );
}
