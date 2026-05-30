import Link from "next/link";
import { CookiePreferencesButton } from "@/components/CookiePreferencesButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandImage } from "@/components/ui/BrandImage";
import { localizedPath } from "@/lib/routing/localizedPath";
import { site } from "@/lib/portfolio";
import { getTranslations } from "next-intl/server";
import { defaultLocale, type AppLocale } from "@/i18n/config";

type FooterProps = {
  showProjects?: boolean;
  showJourney?: boolean;
  showBlog?: boolean;
  locale?: AppLocale;
};

export async function Footer({
  showProjects = true,
  showJourney = true,
  showBlog = true,
  locale = defaultLocale,
}: FooterProps) {
  const t = await getTranslations({ locale, namespace: "Footer" });

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Link href={localizedPath("/", locale)} className="footer-brand">
            <BrandImage
              className="brand-logo-light"
              src="/brand/logo-horizontal-clean.png"
              alt=""
              width={220}
              height={81}
            />
            <BrandImage
              className="brand-logo-dark"
              src="/brand/logo-horizontal-clean-dark.png"
              alt=""
              width={220}
              height={81}
            />
          </Link>
          <h2>{site.name}</h2>
          <p>{t("description", { title: site.title })}</p>
        </div>
        <nav aria-label={t("linksAriaLabel")}>
          <span>{t("navTitle")}</span>
          <Link href={localizedPath("/#expertise", locale)}>{t("expertise")}</Link>
          {showProjects ? <Link href={localizedPath("/projects", locale)}>{t("projects")}</Link> : null}
          {showJourney ? <Link href={localizedPath("/#parcours", locale)}>{t("journey")}</Link> : null}
          {showBlog ? <Link href={localizedPath("/blog", locale)}>{t("blog")}</Link> : null}
          <Link href={localizedPath("/#contact", locale)}>{t("contact")}</Link>
        </nav>
        <nav aria-label={t("linksAriaLabel")}>
          <span>{t("linksTitle")}</span>
          <a href={site.github} target="_blank" rel="noreferrer">
            {t("github")}
          </a>
          <a href={site.linkedin} target="_blank" rel="noreferrer">
            {t("linkedin")}
          </a>
          <a href={`mailto:${site.email}`}>{t("email")}</a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>
          {t("copyright", { year: new Date().getFullYear(), name: site.name })}
        </span>
        <div className="footer-bottom-actions">
          <CookiePreferencesButton />
          <ThemeToggle variant="icon" />
        </div>
        {/* <span>{site.location} · Disponible remote</span> */}
      </div>
    </footer>
  );
}
