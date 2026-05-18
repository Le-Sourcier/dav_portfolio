import Link from "next/link";
import { site } from "@/lib/portfolio";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Link href="/" className="footer-brand">
            {site.initials}
          </Link>
          <h2>{site.name}</h2>
          <p>{site.title} spécialisé en SaaS, automatisation métier et plateformes web/mobile scalables.</p>
        </div>
        <nav aria-label="Navigation footer">
          <span>Navigation</span>
          <Link href="/#expertise">Expertise</Link>
          <Link href="/#projets">Projets</Link>
          <Link href="/#parcours">Parcours</Link>
          <Link href="/blog">Blog</Link>
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
