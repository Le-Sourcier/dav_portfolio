import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NotFoundDiagnostic } from "@/components/not-found/NotFoundDiagnostic";
import { NotFoundReads } from "@/components/not-found/NotFoundReads";
import { NotFoundRoutes } from "@/components/not-found/NotFoundRoutes";
import { LATEST_READS_COUNT, notFoundCauses } from "@/lib/notFound";
import { blogPosts, site } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Page introuvable",
  description:
    "Cette page n'existe pas ou a été déplacée. Retrouvez l'expertise, les projets et les articles de Yao David Logan.",
  robots: {
    index: false,
    follow: true,
  },
};

const getLatestPosts = () =>
  [...blogPosts]
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, LATEST_READS_COUNT);

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="notfound-page">
        <section className="section notfound-hero">
          <div className="notfound-copy">
            <p className="section-kicker">Erreur 404</p>
            <p className="notfound-code" aria-hidden="true">
              404
            </p>
            <h1>Cette page n&apos;existe pas, ou plus.</h1>
            <p className="notfound-lead">
              Le lien suivi est peut-être obsolète, mal copié, ou la page a été déplacée lors d&apos;une mise à
              jour du site. Rien n&apos;est cassé: le reste de la plateforme fonctionne normalement.
            </p>
            <div className="hero-actions">
              <Link className="primary-button" href="/">
                Retour à l&apos;accueil
              </Link>
              <a className="secondary-button" href={`mailto:${site.email}`}>
                Signaler le lien
              </a>
            </div>
            <div className="trust-row">
              {notFoundCauses.map((cause) => (
                <span key={cause}>{cause}</span>
              ))}
            </div>
          </div>

          <NotFoundDiagnostic />
        </section>

        <NotFoundRoutes />
        <NotFoundReads posts={getLatestPosts()} />
        <Footer />
      </main>
    </>
  );
}
