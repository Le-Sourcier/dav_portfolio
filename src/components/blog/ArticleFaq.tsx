import type { BlogFaqEntry } from "@/types/blog";
import { getTranslations } from "next-intl/server";

type ArticleFaqProps = {
  entries: BlogFaqEntry[];
};

export async function ArticleFaq({ entries }: ArticleFaqProps) {
  const t = await getTranslations("ArticleFaq");

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="article-faq" aria-labelledby="article-faq-title">
      <div>
        <p className="section-kicker">{t("kicker")}</p>
        <h2 id="article-faq-title">{t("title")}</h2>
      </div>
      <div className="article-faq-list">
        {entries.map((entry, index) => (
          <details key={entry.question} name="article-faq" open={index === 0}>
            <summary>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {entry.question}
            </summary>
            <p>{entry.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
