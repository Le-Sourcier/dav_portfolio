import Link from "next/link";
import Image from "next/image";
import { ContactSection } from "@/components/ContactSection";
import { ExpertiseCarousel } from "@/components/ExpertiseCarousel";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Newsletter } from "@/components/Newsletter";
import { BackToTop } from "@/components/blog/BackToTop";
import { blogPosts, experience, proofStats, projects, site, stack, testimonials } from "@/lib/portfolio";

const featuredProjects = projects.filter((project) => project.featured);

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <section className="hero-section">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{site.availability}</p>
            <h1>Des plateformes SaaS plus rapides, plus fiables, plus simples à vendre.</h1>
            <p className="hero-lead">{site.promise}</p>

            <div className="hero-actions">
              <a className="primary-button liquid-cta" href={`mailto:${site.email}?subject=Projet%20SaaS%20ou%20mission`}>
                Me confier un projet
              </a>
              <a className="secondary-button" href="#projets">
                Voir les cas concrets
              </a>
            </div>

            <div className="trust-row" aria-label="Preuves principales">
              <span>Multi-tenant</span>
              <span>RBAC</span>
              <span>Paiements</span>
              <span>Back-office</span>
            </div>
          </div>

          <div className="hero-visual saas-readiness-card" aria-label="Audit de préparation SaaS">
            <div className="visual-header readiness-header">
              <div>
                <span>YDL Product Audit</span>
                <strong>SaaS readiness</strong>
              </div>
              <p>Avant build</p>
            </div>

            <div className="readiness-score-panel">
              <div>
                <span>MVP readiness</span>
                <strong>4 piliers</strong>
              </div>
              <p>Auth, billing, ops et data cadrés pour lancer un SaaS commercialisable.</p>
            </div>

            <div className="readiness-checks">
              {[
                ["Auth & rôles", "RBAC, sessions, invitations", "Prêt", "is-ready"],
                ["Billing", "Plans, paiements, quotas", "À cadrer", "is-planned"],
                ["Ops", "Logs, alertes, erreurs traçables", "À renforcer", "is-watch"],
                ["Data", "Dashboards, exports, événements", "Prêt", "is-ready"],
              ].map(([title, detail, status, maturity]) => (
                <div className="readiness-check" key={title}>
                  <i aria-hidden="true" />
                  <div>
                    <strong>{title}</strong>
                    <span>{detail}</span>
                  </div>
                  <div className={`readiness-maturity ${maturity}`} aria-label={`Maturité: ${status}`}>
                    <small>{status}</small>
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                  </div>
                </div>
              ))}
            </div>

            <div className="readiness-architecture" aria-label="Architecture cible">
              <span>Interface client</span>
              <i aria-hidden="true" />
              <span>API modulaire</span>
              <i aria-hidden="true" />
              <span>PostgreSQL + jobs</span>
            </div>
          </div>
        </div>
        </section>

      <section className="section proof-band" aria-label="Résultats mesurables">
        {proofStats.map((stat) => (
          <article key={stat.label}>
            <strong>{stat.value}</strong>
            <h2>{stat.label}</h2>
            <p>{stat.detail}</p>
          </article>
        ))}
      </section>

      <section id="apropos" className="section about-section">
        <div className="about-copy">
          <p className="section-kicker">À propos</p>
          <h2>Un profil fullstack orienté produit, pas seulement exécution technique.</h2>
          <p>
            Je conçois des plateformes web et SaaS avec une attention égale pour l&apos;architecture, la vitesse de
            livraison, l&apos;expérience utilisateur et les contraintes business. L&apos;objectif: transformer une idée
            ou un process fragile en produit clair, maintenable et prêt à vendre.
          </p>
          <div className="about-actions">
            <a
              className="primary-button liquid-cta"
              href={`mailto:${site.email}?subject=Mission%20fullstack%20SaaS&body=Bonjour%20David,%0A%0AJ'aimerais%20discuter%20d'une%20opportunit%C3%A9%20de%20collaboration.%0A`}
            >
              M&apos;embaucher
            </a>
            <a className="secondary-button" href="/cv/david-logan-cv.pdf" download>
              Télécharger le CV
            </a>
          </div>
        </div>

        <div className="about-panel about-brief" aria-label="Méthode de collaboration">
          <div className="about-brief-top">
            <span>Mission snapshot</span>
            <strong>Transformer un besoin flou en produit exploitable.</strong>
          </div>

          <div className="about-brief-flow" aria-label="Étapes de mission">
            {["Diagnostic", "Architecture", "Build", "Stabilisation"].map((item, index) => (
              <div key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>

          <blockquote className="about-brief-note">
            Je commence par cadrer les flux métier, les droits, les données et les risques de livraison. Ensuite je
            construis une base produit claire: API maintenable, interface lisible, automatisations utiles et déploiement
            prêt à être repris par l&apos;équipe.
          </blockquote>

          <div className="about-brief-bottom">
            <div>
              <span>Livrables</span>
              <p>API documentée · RBAC · paiements · dashboard admin · monitoring · déploiement</p>
            </div>
            <div>
              <span>Positionnement</span>
              <p>Assez technique pour sécuriser l&apos;architecture, assez produit pour garder l&apos;usage au centre.</p>
            </div>
          </div>
        </div>
      </section>

      <ExpertiseCarousel />

      <section id="projets" className="section projects-section">
        <div className="section-heading">
          <p className="section-kicker">Projets sélectionnés</p>
          <h2>Des preuves concrètes, pas seulement une stack.</h2>
          <p>
            Chaque projet met en avant le contexte, le résultat attendu et la valeur technique réellement livrée.
          </p>
        </div>

        <div className="project-grid">
          {featuredProjects.map((project, index) => (
            <article className="project-card" key={project.slug}>
              <div className="project-preview" aria-hidden="true">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{project.metric}</strong>
              </div>
              <div className="project-content">
                <p>{project.category}</p>
                <h3>{project.name}</h3>
                <h4>{project.headline}</h4>
                <p>{project.result}</p>
                <div className="tag-list">
                  {project.tech.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
                <Link href={`/projets/${project.slug}`} className="text-link">
                  Voir l&apos;étude de cas
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="parcours" className="section parcours-section">
        <div className="parcours-copy">
          <p className="section-kicker">Parcours</p>
          <h2>Un parcours construit autour du produit, de la performance et de l&apos;automatisation.</h2>
          <p>
            Chaque expérience renforce le même socle: transformer une contrainte métier en plateforme claire,
            maintenable et prête à évoluer.
          </p>
          <div className="parcours-proof">
            <span>Produit</span>
            <span>Backend</span>
            <span>Automatisation</span>
            <span>SEO</span>
          </div>
        </div>

        <div className="parcours-timeline">
          {experience.map((item, index) => (
            <article className="parcours-card" key={`${item.company}-${item.period}`}>
              <div className="parcours-marker" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <span>{item.period}</span>
                <p className="parcours-focus">{item.focus}</p>
                <h3>{item.role}</h3>
                <p className="company">{item.company}</p>
                <p>{item.summary}</p>
                <div className="parcours-tags">
                  {item.points.map((point) => (
                    <small key={point}>{point}</small>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section stack-section">
        <div className="stack-intro">
          <p className="section-kicker">Stack</p>
          <h2>Un écosystème technique calibré pour produire, scaler et maintenir.</h2>
          <p>
            Les outils ne sont pas une collection de logos. Ils forment une chaîne de production cohérente: interface,
            API, données, déploiement et automatisation.
          </p>
          <div className="stack-principles">
            <span>Produit</span>
            <span>Scalabilité</span>
            <span>Maintenance</span>
          </div>
        </div>
        <div className="stack-brand-showcase">
          <div className="stack-marquee" aria-label="Technologies principales">
            <div className="stack-marquee-track">
              {[...stack, ...stack].map((item, index) => (
                <div className="stack-logo-tile" key={`${item.name}-${index}`} tabIndex={0}>
                  <Image src={item.icon} alt={item.name} width={42} height={42} />
                  <span className="stack-tooltip">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section testimonials-section">
        <div className="section-heading">
          <p className="section-kicker">Témoignages</p>
          <h2>Une collaboration pensée pour la clarté et l&apos;exécution.</h2>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="testimonial-card">
              <p>“{testimonial.quote}”</p>
              <div>
                <strong>{testimonial.name}</strong>
                <span>{testimonial.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="blog" className="section blog-section">
        <div className="section-heading blog-heading">
          <div>
            <p className="section-kicker">Blog</p>
            <h2>Notes techniques pour construire mieux.</h2>
          </div>
          <Link href="/blog" className="secondary-button">
            Tous les articles
          </Link>
        </div>
        <div className="blog-card-grid">
          {blogPosts.slice(0, 3).map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug} className="blog-card">
              <span>{post.category} · {post.readTime}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      <Newsletter />

      <ContactSection />

      <Footer />
      </main>
      <BackToTop />
    </>
  );
}
