import type { BlogResource } from "@/types/blog";
import { getTranslations } from "next-intl/server";

type ArticleResourcesProps = {
  resources: BlogResource[];
};

export async function ArticleResources({ resources }: ArticleResourcesProps) {
  const t = await getTranslations("ArticleResources");

  if (resources.length === 0) {
    return null;
  }

  return (
    <section className="article-resources" aria-labelledby="article-resources-title">
      <div>
        <p className="section-kicker">{t("kicker")}</p>
        <h2 id="article-resources-title">{t("title")}</h2>
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
