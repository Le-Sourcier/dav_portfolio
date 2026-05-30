/**
 * Image statique d'asset `/brand/*` avec format moderne servi en priorité
 * et fallback PNG pour les navigateurs anciens.
 *
 * Pourquoi un <picture> natif plutôt que next/image ?
 *   La config `images.unoptimized: true` (présente pour éviter les 500 sur
 *   /_next/image en prod) désactive le srcset multi-format de next/image.
 *   <picture> bypass ce pipeline et sert directement le WebP optimisé sans
 *   dépendre de l'optimiseur runtime.
 *
 * Convention : on attend qu'un `name.webp` co-existe à côté du `name.png`
 * d'origine, généré une fois par le script de build d'assets (sharp).
 */
type BrandImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
};

const PNG_EXTENSION = /\.png$/i;

export function BrandImage({
  src,
  alt,
  width,
  height,
  className,
  loading = "lazy",
  fetchPriority,
}: BrandImageProps) {
  const webpSrc = src.replace(PNG_EXTENSION, ".webp");

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
      />
    </picture>
  );
}
