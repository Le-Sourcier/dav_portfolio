import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site } from "@/lib/portfolio";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  return (
    <>
      <Header showProjects={false} />
      <main className="not-found-page">
        <section className="not-found-shell" aria-labelledby="not-found-title">
          <div className="not-found-copy">
            <p className="section-kicker">{t("kicker")}</p>
            <h1 id="not-found-title">{t("title")}</h1>
            <p>{t("description")}</p>
            <div className="not-found-actions">
              <Link className="primary-button liquid-cta" href="/">
                {t("homeButton")}
              </Link>
              <Link className="secondary-button" href="/blog">
                {t("blogButton")}
              </Link>
              <a className="secondary-button" href={`mailto:${site.email}?subject=Page%20introuvable`}>
                {t("contactButton")}
              </a>
            </div>
          </div>

          <div className="not-found-panel" aria-label={t("panelAriaLabel")}>
            <span>{t("panelLabel")}</span>
            <strong>{t("panelValue")}</strong>
            <div>
              <p>{t("diagUrlAbsente")}</p>
              <i aria-hidden="true" />
            </div>
            <div>
              <p>{t("diagContenuDeplace")}</p>
              <i aria-hidden="true" />
            </div>
            <div>
              <p>{t("diagRetourPossible")}</p>
              <i aria-hidden="true" />
            </div>
          </div>
        </section>
      </main>
      <Footer showProjects={false} />
    </>
  );
}
