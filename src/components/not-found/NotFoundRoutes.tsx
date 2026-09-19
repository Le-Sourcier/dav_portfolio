import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/config";
import { localizedPath } from "@/lib/routing/localizedPath";

const destinations = [
  ["home", "/"], ["expertise", "/#expertise"], ["projects", "/projects"],
  ["journey", "/experiences"], ["blog", "/blog"], ["contact", "/#contact"],
] as const;

export async function NotFoundRoutes({ locale }: { locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: "NotFoundPremium" });
  return (
    <section className="section notfound-routes" aria-labelledby="notfound-routes-title">
      <div className="section-heading">
        <p className="section-kicker">{t("navigation")}</p>
        <h2 id="notfound-routes-title">{t("destinationTitle")}</h2>
        <p>{t("destinationDescription")}</p>
      </div>
      <div className="notfound-route-grid">
        {destinations.map(([key, href], index) => (
          <Link className="notfound-route-card" href={localizedPath(href, locale)} key={key}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{t(`routes.${key}.title`)}</strong>
            <p>{t(`routes.${key}.description`)}</p>
            <em>{t(`routes.${key}.action`)}</em>
          </Link>
        ))}
      </div>
    </section>
  );
}
