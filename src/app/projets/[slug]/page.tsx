import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/lib/portfolio";
import { listStaticProjectSlugs, loadProjectBySlug } from "@/services/portfolio/projectsLoader";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listStaticProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProjectBySlug(slug);

  if (!project) {
    return {};
  }

  const description = [project.headline, project.result].filter(Boolean).join(" ").trim();

  return {
    title: `${project.name} - Étude de cas`,
    description,
    alternates: {
      canonical: `${site.url}/projets/${project.slug}`,
    },
    openGraph: {
      title: `${project.name} - Étude de cas`,
      description: project.result ?? description,
      url: `${site.url}/projets/${project.slug}`,
      type: "article",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: project.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} - Étude de cas`,
      description: project.result ?? description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await loadProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main>
      <section className="case-hero section">
        <Link href="/#projets" className="text-link">
          Retour aux projets
        </Link>
        <p className="section-kicker">{project.category}</p>
        <h1>{project.name}</h1>
        <p>{project.headline}</p>
      </section>

      <section className="case-layout section">
        <aside className="case-sidebar">
          <div>
            <span>Résultat</span>
            <strong>{project.metric}</strong>
          </div>
          <div>
            <span>Rôle</span>
            <p>{project.role}</p>
          </div>
          <div>
            <span>Stack</span>
            <div className="tag-list">
              {project.tech.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
          </div>
        </aside>

        <article className="case-content">
          <h2>Contexte</h2>
          <p>{project.description}</p>
          <h2>Valeur livrée</h2>
          <p>{project.result}</p>
          <h2>Liens</h2>
          <div className="case-links">
            {project.links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
