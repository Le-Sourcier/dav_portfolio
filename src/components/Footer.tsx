import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/portfolio";

type FooterProps = {
  showProjects?: boolean;
  showJourney?: boolean;
  showBlog?: boolean;
};

export function Footer({ showProjects = true, showJourney = true, showBlog = true }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Link href="/" className="footer-brand">
            <Image className="brand-logo-light" src="/brand/logo-horizontal-clean.png" alt="" width={220} height={81} />
            <Image className="brand-logo-dark" src="/brand/logo-horizontal-clean-dark.png" alt="" width={220} height={81} />
          </Link>
          <h2>{site.name}</h2>
          <p>{site.title} spécialisé en SaaS, automatisation métier et plateformes web/mobile scalables.</p>
        </div>
        <nav aria-label="Navigation footer">
          <span>Navigation</span>
          <Link href="/#expertise">Expertise</Link>
          {showProjects ? <Link href="/#projets">Projets</Link> : null}
          {showJourney ? <Link href="/#parcours">Parcours</Link> : null}
          {showBlog ? <Link href="/blog">Blog</Link> : null}
          <Link href="/#contact">Contact</Link>
        </nav>
        <nav aria-label="Liens professionnels">
          <span>Liens</span>
          <a href={site.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={`mailto:${site.email}`}>Email</a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {site.name}. Tous droits réservés.</span>
        <span>{site.location} · Disponible remote</span>
      </div>
    </footer>
  );
}
