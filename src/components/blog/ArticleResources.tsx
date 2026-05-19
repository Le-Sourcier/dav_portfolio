import type { BlogResource } from "@/types/blog";

type ArticleResourcesProps = {
  resources: BlogResource[];
};

export function ArticleResources({ resources }: ArticleResourcesProps) {
  if (resources.length === 0) {
    return null;
  }

  return (
    <section className="article-resources" aria-labelledby="article-resources-title">
      <div>
        <p className="section-kicker">Pour aller plus loin</p>
        <h2 id="article-resources-title">Ressources sélectionnées.</h2>
      </div>
      <ul>
        {resources.map((resource) => (
          <li key={resource.href}>
            <a href={resource.href} target="_blank" rel="noopener noreferrer">
              <span>{resource.type}</span>
              <strong>{resource.label}</strong>
              <small aria-hidden="true">↗</small>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
