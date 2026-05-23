import type { ProjectSeed } from "../types.js";

export const volvoEx30: ProjectSeed = {
  slug: "volvo-ex30-demo",
  title: "Volvo EX30 — Démo interactive",
  title_en: "Volvo EX30 — Interactive Demo",
  name: "Volvo EX30 Demo",
  category: "Frontend",
  image:
    "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1600&q=80",
  headline:
    "Showcase web immersif d'un véhicule électrique : storytelling scroll-driven, performance et accessibilité.",
  description: `Démonstration frontend d'une expérience de marque automobile autour de la Volvo EX30. L'objectif : prouver qu'un site produit haut de gamme peut être à la fois immersif, performant (LCP < 2.5s sur 3G simulé) et accessible (AA conforme).

Le site combine storytelling scroll-driven, animations sobres et fiches techniques interactives, sans dépendre d'une bibliothèque WebGL lourde.`,
  description_en: `Frontend demo of an automotive brand experience around the Volvo EX30. The goal: prove that a premium product site can be immersive, fast (LCP < 2.5s on simulated 3G) and accessible (AA compliant) at the same time.

The site combines scroll-driven storytelling, restrained animations and interactive specs, without relying on a heavy WebGL library.`,
  problem: `Les sites constructeurs automobiles oscillent entre WebGL lourd (qui plombe les perfs mobile) et pages statiques sans émotion. Difficile de prouver à un commanditaire qu'un compromis "immersif + rapide + accessible" est tenable sur un budget serré.`,
  problem_en: `Automotive maker websites swing between heavy WebGL (which kills mobile performance) and static pages with no emotion. Hard to prove to a sponsor that an "immersive + fast + accessible" compromise is achievable on a tight budget.`,
  solution: `Animations CSS et GSAP scroll-driven, images servies en AVIF/WebP avec fallbacks, lazy-loading systématique des sections hors viewport. Tous les éléments interactifs sont accessibles au clavier et annoncés correctement par les lecteurs d'écran.

Architecture Next.js minimaliste : pas de SSR coûteux, génération statique + revalidation, hydratation partielle des composants interactifs.`,
  solution_en: `CSS and GSAP scroll-driven animations, images served in AVIF/WebP with fallbacks, systematic lazy-loading of off-viewport sections. All interactive elements are keyboard-accessible and properly announced by screen readers.

Minimalist Next.js architecture: no expensive SSR, static generation with revalidation, partial hydration of interactive components.`,
  headline_en: "Immersive web showcase for an electric vehicle: scroll-driven storytelling, performance and accessibility.",
  result_en: "LCP < 2.5s on simulated 3G, Lighthouse 95+ accessibility, immersive experience without WebGL.",
  metric_en: "Lighthouse 95+, LCP < 2.5s on simulated 3G",
  role_en: "Frontend Engineer & Motion Design",
  results_en: [
    "Scroll-driven storytelling without WebGL",
    "Images served in AVIF/WebP with fallbacks",
    "AA accessibility compliance (keyboard, screen readers)",
    "Lighthouse Performance 95+ and Accessibility 95+",
    "Partial hydration of interactive components",
  ],
  result:
    "LCP < 2.5s sur 3G simulé, Lighthouse 95+ accessibilité, expérience immersive sans WebGL.",
  metric: "Lighthouse 95+, LCP < 2.5s sur 3G simulé",
  role: "Frontend Engineer & Motion Design",
  tech: ["Next.js", "React", "TypeScript", "GSAP", "CSS Modules"],
  links: [{ label: "Démo publique", href: "https://vol-vo-ex-30.vercel.app" }],
  featured: false,
  results: [
    "Storytelling scroll-driven sans WebGL",
    "Images servies en AVIF/WebP avec fallbacks",
    "Conformité accessibilité AA (clavier, lecteurs d'écran)",
    "Lighthouse Performance 95+ et Accessibilité 95+",
    "Hydratation partielle des composants interactifs",
  ],
  metrics: [
    { name: "Lighthouse perf", value: 95, previousValue: 62, unit: "" },
    { name: "LCP 3G simulé", value: 2.3, previousValue: 6.8, unit: "s" },
    { name: "Accessibilité", value: 96, previousValue: 70, unit: "" },
  ],
  chartData: [
    { name: "Hero", value: 100 },
    { name: "Specs", value: 92 },
    { name: "Galerie", value: 88 },
    { name: "Config", value: 90 },
  ],
  url: "https://vol-vo-ex-30.vercel.app",
  impactGraph: [
    { label: "Performance", value: 95 },
    { label: "Accessibilité", value: 96 },
    { label: "Émotion produit", value: 90 },
    { label: "Maintenabilité", value: 88 },
  ],
};
