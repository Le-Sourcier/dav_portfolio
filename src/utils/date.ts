export const formatArticleDate = (iso: string, locale = "fr") =>
  new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export const formatShortDate = (iso: string, locale = "fr") =>
  new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
