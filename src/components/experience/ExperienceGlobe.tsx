"use client";

import dynamic from "next/dynamic";
import type { PortfolioExperienceItem } from "@/services/portfolio/contentLoaders";

type Props = { experiences: PortfolioExperienceItem[] };

const GlobeScene = dynamic(() => import("./GlobeScene").then((m) => m.GlobeScene), {
  ssr: false,
  loading: () => <section className="globe-section globe-section--loading" />,
});

export function ExperienceGlobe({ experiences }: Props) {
  if (experiences.length === 0) return null;
  return <GlobeScene experiences={experiences} />;
}
