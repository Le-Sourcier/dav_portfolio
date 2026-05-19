import Image from "next/image";

type ArticleFigureProps = {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
};

export function ArticleFigure({ src, alt, caption, priority = false }: ArticleFigureProps) {
  return (
    <figure className="article-figure">
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={630}
        sizes="(min-width: 960px) 760px, 100vw"
        priority={priority}
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
