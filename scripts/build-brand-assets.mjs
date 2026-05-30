#!/usr/bin/env node
/**
 * Génère des variantes WebP optimisées pour chaque asset statique servi en
 * <picture>. À lancer manuellement quand un PNG dans public/brand/ change :
 *
 *   npm run build:assets
 *
 * Convention : pour chaque entrée, on produit `<name>.webp` à côté du PNG
 * source. Le composant BrandImage attend cette convention.
 *
 * Pourquoi un script séparé plutôt que next/image runtime ?
 *   Cf. `src/components/ui/BrandImage.tsx` — on bypass l'optimiseur Next
 *   parce que `images.unoptimized: true` est actif (workaround prod /_next/image).
 */
import sharp from "sharp";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(import.meta.url), "../..");

/**
 * @typedef {Object} BrandAsset
 * @property {string} src        Chemin relatif au repo (PNG d'origine)
 * @property {number|null} width Largeur cible (null = taille d'origine)
 * @property {number} [quality]  Qualité WebP (défaut 85)
 */

/** @type {BrandAsset[]} */
const assets = [
  // Logos horizontaux : affichés en 176×65 (Header) et 220×81 (Footer).
  // On cible 2× la plus grande dimension pour rester net en HiDPI.
  { src: "public/brand/logo-horizontal-clean.png", width: 440 },
  { src: "public/brand/logo-horizontal-clean-dark.png", width: 440 },
  // Avatar assistant : déjà petit, on garde la résolution source.
  { src: "public/brand/assistant-avatar-small.png", width: null },
];

const formatKb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function generate(asset) {
  const src = resolve(projectRoot, asset.src);
  if (!existsSync(src)) {
    console.warn(`SKIP ${asset.src} — fichier absent`);
    return;
  }
  const dst = src.replace(/\.png$/i, ".webp");
  const sourceMeta = await sharp(src).metadata();
  const before = statSync(src).size;

  let pipeline = sharp(src);
  if (asset.width && sourceMeta.width && sourceMeta.width > asset.width) {
    pipeline = pipeline.resize({
      width: asset.width,
      withoutEnlargement: true,
    });
  }
  await pipeline
    .webp({ quality: asset.quality ?? 85, effort: 6 })
    .toFile(dst);

  const after = statSync(dst).size;
  const gain = Math.round((1 - after / before) * 100);
  console.log(
    `OK  ${asset.src}  ${sourceMeta.width}×${sourceMeta.height}  ${formatKb(before)} → ${formatKb(after)}  (-${gain}%)`,
  );
}

(async () => {
  console.log(`Regénération des variantes WebP (${assets.length} assets)…\n`);
  for (const asset of assets) {
    try {
      await generate(asset);
    } catch (error) {
      console.error(`FAIL ${asset.src} —`, error.message);
      process.exitCode = 1;
    }
  }
  console.log("\nTerminé.");
})();
