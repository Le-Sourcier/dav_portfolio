interface ExperienceGalleryProps {
  images: string[];
}

/**
 * Bento layout pour les visuels :
 * - 1 image  -> pleine largeur
 * - 2 images -> 50/50
 * - 3 images -> feature + 2 colonnes
 * - 4 images -> feature + 3 vignettes côte à côte
 * - 5+ images -> feature + 4 vignettes 2x2
 */
function patternFor(count: number): string {
  if (count <= 1) return "single";
  if (count === 2) return "pair";
  if (count === 3) return "trio";
  if (count === 4) return "quartet";
  return "ensemble";
}

export function ExperienceGallery({ images }: ExperienceGalleryProps) {
  const pattern = patternFor(images.length);

  return (
    <div className={`xp-gallery xp-gallery--${pattern}`}>
      {images.map((src, index) => (
        <figure key={src} className="xp-gallery-item" data-index={index}>
          <img src={src} alt="" loading="lazy" />
        </figure>
      ))}
    </div>
  );
}
