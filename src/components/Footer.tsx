import Image from "next/image";
import Link from "next/link";
import { CookiePreferencesButton } from "@/components/CookiePreferencesButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/lib/portfolio";
import { getTranslations } from "next-intl/server";

type FooterProps = {
  showProjects?: boolean;
  showJourney?: boolean;
  showBlog?: boolean;
};

export async function Footer({
  showProjects = true,
  showJourney = true,
  showBlog = true,
}: FooterProps) {
  const t = await getTranslations("Footer");

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Link href="/" className="footer-brand">
            <Image
              className="brand-logo-light"
              src="/brand/logo-horizontal-clean.png"
              alt=""
              width={220}
              height={81}
            />
            <Image
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
          <Link href="/#expertise">{t("expertise")}</Link>
          {showProjects ? <Link href="/projects">{t("projects")}</Link> : null}
          {showJourney ? <Link href="/#parcours">{t("journey")}</Link> : null}
          {showBlog ? <Link href="/blog">{t("blog")}</Link> : null}
          <Link href="/#contact">{t("contact")}</Link>
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
