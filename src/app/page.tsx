import Link from "next/link";
import Image from "next/image";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Newsletter } from "@/components/Newsletter";
import { blogPosts, experience, proofStats, projects, services, site, stack, testimonials } from "@/lib/portfolio";

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
              <a className="primary-button" href={`mailto:${site.email}?subject=Projet%20SaaS%20ou%20mission`}>
                Me confier un projet
              </a>
              <a className="secondary-button" href="#projets">
                Voir les cas concrets
              </a>
            </div>

            <div className="trust-row" aria-label="Preuves principales">
              <span>Node.js</span>
              <span>Next.js</span>
              <span>PostgreSQL</span>
              <span>Automatisation</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Aperçu produit et indicateurs clés">
            <div className="visual-header">
              <div>
                <span>YDL Operating Console</span>
                <strong>SaaS readiness</strong>
              </div>
              <p>Live</p>
            </div>
            <div className="visual-kpis">
              {proofStats.slice(0, 3).map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
            <div className="visual-grid">
              <div className="visual-score">
                <span>API health</span>
                <strong>99.98%</strong>
                <p>Latency stable · errors monitored</p>
              </div>
              <div className="visual-activity" aria-hidden="true">
                <span className="bar-a" />
                <span className="bar-b" />
                <span className="bar-c" />
                <span className="bar-d" />
              </div>
            </div>
            <div className="visual-status-list">
              {["Paiements sécurisés", "RBAC & permissions", "Dashboards temps réel"].map((item) => (
                <span key={item}>
                  <i />
                  {item}
                </span>
              ))}
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

      <section id="expertise" className="section split-section">
        <div>
          <p className="section-kicker">Expertise</p>
          <h2>Un profil produit, architecture et exécution.</h2>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <article key={service.title} className="service-card">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </section>

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

      <section id="parcours" className="section split-section">
        <div>
          <p className="section-kicker">Parcours</p>
          <h2>Expérience récente sur produits SaaS, automatisation et plateformes métier.</h2>
        </div>
        <div className="timeline">
          {experience.map((item) => (
            <article key={`${item.company}-${item.period}`}>
              <span>{item.period}</span>
              <h3>{item.role}</h3>
              <p className="company">{item.company}</p>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section stack-section">
        <div>
          <p className="section-kicker">Stack</p>
          <h2>Technologies utilisées pour livrer des produits fiables.</h2>
        </div>
        <div className="stack-list">
          {stack.map((item) => (
            <article key={item.name} className="stack-brand-card">
              <div className="stack-logo">
                <Image src={item.icon} alt="" width={34} height={34} aria-hidden="true" />
              </div>
              <div>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </div>
              <small>{item.category}</small>
            </article>
          ))}
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
    </>
  );
}
