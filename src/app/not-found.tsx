import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site } from "@/lib/portfolio";

export default function NotFound() {
  return (
    <>
      <Header showProjects={false} />
      <main className="not-found-page">
        <section className="not-found-shell" aria-labelledby="not-found-title">
          <div className="not-found-copy">
            <p className="section-kicker">404</p>
            <h1 id="not-found-title">Cette page n&apos;existe pas ou a changé d&apos;adresse.</h1>
            <p>
              Le contenu demandé n&apos;est pas disponible. Vous pouvez revenir à l&apos;accueil,
              consulter les articles ou me contacter directement si vous cherchiez une ressource précise.
            </p>
            <div className="not-found-actions">
              <Link className="primary-button liquid-cta" href="/">
                Retour à l&apos;accueil
              </Link>
              <Link className="secondary-button" href="/blog">
                Voir le blog
              </Link>
              <a className="secondary-button" href={`mailto:${site.email}?subject=Page%20introuvable`}>
                Me contacter
              </a>
            </div>
          </div>

          <div className="not-found-panel" aria-label="Diagnostic de navigation">
            <span>Route introuvable</span>
            <strong>404</strong>
            <div>
              <p>URL absente</p>
              <i aria-hidden="true" />
            </div>
            <div>
              <p>Contenu déplacé</p>
              <i aria-hidden="true" />
            </div>
            <div>
              <p>Retour possible</p>
              <i aria-hidden="true" />
            </div>
          </div>
        </section>
      </main>
      <Footer showProjects={false} />
    </>
  );
}
