/**
 * Agrégateur des seeds projets — re-exporte la liste complète consommée
 * par `seed.ts` et `seed-projects-only.ts`.
 *
 * Ordre d'affichage : les `featured: true` d'abord, puis les autres.
 * (L'ordre de l'array n'impacte pas l'affichage côté frontend qui trie
 * par `createdAt` ou `featured`, mais reste lisible ici.)
 */
import type { ProjectSeed } from "./types.js";
import { nexusPlatform } from "./projects/nexus-platform.js";
import { prospectPro } from "./projects/prospect-pro.js";
import { runweek } from "./projects/runweek.js";
import { homeEnergy } from "./projects/home-energy.js";
import { mailcraft } from "./projects/mailcraft.js";
import { volvoEx30 } from "./projects/volvo-ex30.js";
import { drapeauGroup } from "./projects/drapeau-group.js";
import { n8nNodesMailwizz } from "./projects/n8n-nodes-mailwizz.js";
import { n8nNodesMailwizzLs } from "./projects/n8n-nodes-mailwizz-ls.js";
import { n8nNodesGptOss } from "./projects/n8n-nodes-gpt-oss.js";

export const projectsSeed: ProjectSeed[] = [
  // Featured d'abord
  nexusPlatform,
  prospectPro,
  runweek,
  // Produits SaaS livrés
  homeEnergy,
  mailcraft,
  volvoEx30,
  drapeauGroup,
  // Open-source NPM
  n8nNodesMailwizz,
  n8nNodesMailwizzLs,
  n8nNodesGptOss,
];
