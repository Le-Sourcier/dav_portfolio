import type { ProjectSeed } from "../types.js";

export const mailcraft: ProjectSeed = {
  slug: "mailcraft",
  title: "MailCraft",
  title_en: "MailCraft",
  name: "MailCraft",
  category: "Fullstack",
  image:
    "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=1600&q=80",
  headline:
    "Éditeur WYSIWYG de newsletters avec génération PDF et bibliothèque de templates responsives.",
  description: `Outil d'édition de newsletters professionnelles : WYSIWYG drag-and-drop, bibliothèque de blocs responsives, prévisualisation client (mobile, dark mode), et exports HTML + PDF en un clic. Conçu pour les équipes marketing qui veulent industrialiser leur production éditoriale sans dépendre d'un designer pour chaque envoi.

Les newsletters sont testées contre les principaux clients (Gmail, Outlook, Apple Mail) via un linter intégré qui flag les incompatibilités avant l'envoi.`,
  description_en: `Professional newsletter editor: drag-and-drop WYSIWYG, library of responsive blocks, client preview (mobile, dark mode), and one-click HTML + PDF exports. Built for marketing teams who want to industrialize their editorial production without depending on a designer for every send.

Newsletters are tested against major clients (Gmail, Outlook, Apple Mail) via a built-in linter that flags incompatibilities before sending.`,
  problem: `Produire une newsletter qui s'affiche correctement sur Gmail, Outlook et Apple Mail reste un casse-tête. Les éditeurs WYSIWYG du marché soit limitent la personnalisation, soit génèrent un HTML cassé sur Outlook. Les équipes marketing perdent un temps fou en aller-retours avec leur designer.`,
  problem_en: `Producing a newsletter that renders correctly on Gmail, Outlook and Apple Mail remains a headache. WYSIWYG editors on the market either limit customization or generate broken HTML on Outlook. Marketing teams waste hours in back-and-forth with their designer.`,
  solution: `Éditeur drag-and-drop construit en React avec une bibliothèque de blocs validés sur les clients mail majeurs. Le rendu HTML est généré côté serveur avec des fallbacks Outlook (VML pour les boutons, tables imbriquées). Un linter détecte les pièges (média queries non supportées, propriétés CSS interdites) avant export.

Génération PDF via Puppeteer pour les versions imprimables ou les archives. Mode sombre testé via prévisualisation simulée. API de templates pour réutiliser les éléments validés entre campagnes.`,
  solution_en: `Drag-and-drop editor built in React with a library of blocks validated across major mail clients. HTML rendering is server-side with Outlook fallbacks (VML for buttons, nested tables). A linter catches pitfalls (unsupported media queries, forbidden CSS properties) before export.

PDF generation via Puppeteer for print versions or archives. Dark mode tested through simulated preview. Template API to reuse validated blocks across campaigns.`,
  result:
    "Production newsletter divisée par 3 avec un rendu fiable sur Gmail, Outlook et Apple Mail.",
  metric: "Production éditoriale x3 sans designer dédié",
  role: "Fullstack Engineer",
  tech: ["Next.js", "React", "TypeScript", "Node.js", "Puppeteer", "PostgreSQL"],
  links: [{ label: "Démo publique", href: "https://mailcraft.vercel.app" }],
  featured: false,
  results: [
    "Éditeur WYSIWYG drag-and-drop avec bibliothèque de blocs",
    "Génération HTML compatible Gmail, Outlook et Apple Mail",
    "Export PDF via Puppeteer pour archives et impression",
    "Linter intégré qui flag les incompatibilités client",
    "Mode sombre simulé en prévisualisation",
  ],
  metrics: [
    { name: "Compatibilité clients mail", value: 96, previousValue: 60, unit: "%" },
    { name: "Temps de production", value: 35, previousValue: 105, unit: "min" },
    { name: "Templates réutilisables", value: 24, previousValue: 0, unit: "" },
  ],
  chartData: [
    { name: "Avant", value: 105 },
    { name: "M1", value: 78 },
    { name: "M2", value: 52 },
    { name: "M3", value: 35 },
  ],
  url: "https://mailcraft.vercel.app",
  impactGraph: [
    { label: "Compatibilité mail", value: 92 },
    { label: "Vitesse production", value: 88 },
    { label: "Qualité rendu", value: 90 },
    { label: "Adoption équipe", value: 84 },
  ],
};
