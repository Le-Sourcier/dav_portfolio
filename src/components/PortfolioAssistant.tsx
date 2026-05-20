"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { blogPosts, experience, services, site, stack } from "@/lib/portfolio";
import { projectsApi } from "@/services/api/projects.api";
import { normalizeProject } from "@/services/portfolio/projectMapper";
import type { Project } from "@/types/portfolio.types";

type AssistantAction = {
  label: string;
  href: string;
};

type AssistantMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  actions?: AssistantAction[];
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const phoneHref = site.phone.replace(/\s+/g, "");
const whatsappHref = `https://wa.me/${phoneHref.replace("+", "")}`;

function findProject(query: string, projects: Project[]) {
  return projects.find((project) => {
    const searchable = normalize(
      [project.name, project.category, project.headline, project.description, project.tech.join(" ")].join(" "),
    );
    return searchable.includes(query);
  });
}

function findPost(query: string) {
  return blogPosts.find((post) => {
    const searchable = normalize([post.title, post.excerpt, post.category, post.tags.join(" ")].join(" "));
    return searchable.includes(query);
  });
}

function buildAnswer(rawQuestion: string, projects: Project[]): Omit<AssistantMessage, "id" | "role"> {
  const question = normalize(rawQuestion);
  const matchedProject = findProject(question, projects);
  const matchedPost = findPost(question);

  if (question.length < 3) {
    return {
      text: "Pose-moi une question sur David, ses services, ses projets, ses articles ou la meilleure manière de le contacter.",
      actions: [{ label: "Voir les services", href: "/#expertise" }],
    };
  }

  if (question.includes("contact") || question.includes("email") || question.includes("mail") || question.includes("whatsapp") || question.includes("telephone") || question.includes("appel")) {
    return {
      text: `Le plus direct: email à ${site.email}, WhatsApp ou téléphone au ${site.phone}. Pour un projet SaaS, ajoute le contexte, le délai, le budget approximatif et les risques techniques déjà identifiés.`,
      actions: [
        { label: "Envoyer un email", href: `mailto:${site.email}?subject=Projet%20SaaS%20ou%20mission` },
        { label: "WhatsApp", href: whatsappHref },
        { label: "LinkedIn", href: site.linkedin },
      ],
    };
  }

  if (question.includes("cv") || question.includes("resume") || question.includes("embauch") || question.includes("recrut")) {
    return {
      text: `${site.name} est disponible pour CDI, freelance et missions longues. Son profil est orienté plateformes SaaS, backend Node.js, produit Next.js et automatisation métier.`,
      actions: [
        { label: "Télécharger le CV", href: "/cv/david-logan-cv.pdf" },
        { label: "Discuter d'une mission", href: `mailto:${site.email}?subject=Mission%20Fullstack%20SaaS` },
      ],
    };
  }

  if (question.includes("service") || question.includes("expertise") || question.includes("faire") || question.includes("construire") || question.includes("propose")) {
    const serviceList = services.map((service) => `${service.title}: ${service.headline}`).join(" ");
    return {
      text: `David intervient surtout sur quatre axes. ${serviceList} Il est particulièrement utile quand un produit doit devenir plus clair, plus stable et plus facile à vendre.`,
      actions: [
        { label: "Voir l'expertise", href: "/#expertise" },
        { label: "Parler d'un besoin", href: `mailto:${site.email}?subject=Besoin%20produit%20ou%20SaaS` },
      ],
    };
  }

  if (question.includes("projet") || question.includes("portfolio") || question.includes("realisation") || matchedProject) {
    if (projects.length === 0) {
      return {
        text: "Les projets ne sont pas encore disponibles depuis l'API. Pour parler d'un besoin concret, le plus direct est de contacter David avec le contexte, le délai et les contraintes déjà connues.",
        actions: [{ label: "Contact", href: `mailto:${site.email}?subject=Projet%20SaaS%20ou%20mission` }],
      };
    }

    if (matchedProject) {
      return {
        text: `${matchedProject.name}: ${matchedProject.headline} Résultat: ${matchedProject.result} Rôle: ${matchedProject.role}. Stack: ${matchedProject.tech.join(", ")}.`,
        actions: [
          { label: "Lire le cas", href: `/projets/${matchedProject.slug}` },
          ...matchedProject.links.slice(0, 1),
        ],
      };
    }

    const featured = projects
      .filter((project) => project.featured)
      .map((project) => `${project.name} (${project.category})`)
      .join(", ");
    return {
      text: `Les cas les plus représentatifs: ${featured}. Ils montrent surtout l'architecture SaaS, l'automatisation, les dashboards métier et les interfaces produit.`,
      actions: [{ label: "Voir les projets", href: "/#projets" }],
    };
  }

  if (question.includes("blog") || question.includes("article") || question.includes("lire") || matchedPost) {
    if (matchedPost) {
      return {
        text: `${matchedPost.title}. ${matchedPost.excerpt} Niveau: ${matchedPost.level}. Lecture: ${matchedPost.readTime}.`,
        actions: [{ label: "Lire l'article", href: `/blog/${matchedPost.slug}` }],
      };
    }

    const posts = blogPosts.map((post) => post.title).join(" ; ");
    return {
      text: `Le blog couvre l'architecture SaaS, l'automatisation métier et la conversion d'un portfolio premium. Articles disponibles: ${posts}.`,
      actions: [{ label: "Ouvrir le blog", href: "/blog" }],
    };
  }

  if (question.includes("parcours") || question.includes("experience") || question.includes("travail") || question.includes("poste")) {
    const current = experience[0];
    return {
      text: `Parcours orienté produit SaaS et automatisation. Actuellement: ${current.role} chez ${current.company}, focus ${current.focus}. Expériences aussi chez Ubuntu Consulting SARL et Groupe Drapeau.`,
      actions: [
        { label: "Voir le parcours", href: "/#parcours" },
        { label: "Télécharger le CV", href: "/cv/david-logan-cv.pdf" },
      ],
    };
  }

  if (question.includes("stack") || question.includes("tech") || question.includes("outil") || question.includes("technologie")) {
    const coreStack = stack.map((item) => item.name).join(", ");
    return {
      text: `Stack principale: ${coreStack}. Le positionnement est fullstack SaaS: Next.js/React côté produit, Node.js/Fastify côté API, PostgreSQL/Redis pour les données et n8n pour les automatisations utiles.`,
      actions: [{ label: "Voir la stack", href: "/#stack" }],
    };
  }

  if (question.includes("qui") || question.includes("david") || question.includes("yao") || question.includes("apropos") || question.includes("a propos")) {
    return {
      text: `${site.name} est Software Engineer fullstack basé à ${site.location}. Il conçoit des plateformes SaaS rapides, sécurisées et prêtes à scaler, avec une attention forte sur l'architecture, le produit et l'automatisation.`,
      actions: [
        { label: "À propos", href: "/#apropos" },
        { label: "LinkedIn", href: site.linkedin },
      ],
    };
  }

  return {
    text: "Je peux répondre sur David, ses services, ses projets, son parcours, sa stack, ses articles ou les meilleurs canaux pour le contacter. Reformule avec un mot-clé comme projet, service, blog, stack ou contact.",
    actions: [
      { label: "Voir l'expertise", href: "/#expertise" },
      { label: "Contact", href: "/#contact" },
    ],
  };
}

type PortfolioAssistantProps = {
  projects?: Project[];
};

export function PortfolioAssistant({ projects = [] }: PortfolioAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [apiProjects, setApiProjects] = useState<Project[]>(projects);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "Je peux t'aider à comprendre le profil de David, ses services, ses projets, ses articles et le bon canal pour le contacter.",
      actions: [
        { label: "Voir les services", href: "/#expertise" },
        { label: "Contact direct", href: `mailto:${site.email}?subject=Projet%20SaaS%20ou%20mission` },
      ],
    },
  ]);
  const nextId = useRef(2);
  const panelTitle = useMemo(() => (isOpen ? "Fermer l'assistant" : "Ouvrir l'assistant"), [isOpen]);
  const assistantProjects = apiProjects.length > 0 ? apiProjects : projects;
  const quickQuestions = useMemo(
    () => [
      "Que peux-tu construire ?",
      ...(assistantProjects.length > 0 ? ["Montre-moi les projets"] : []),
      "Quels services proposes-tu ?",
      "Comment te contacter ?",
    ],
    [assistantProjects.length],
  );

  useEffect(() => {
    let mounted = true;

    projectsApi
      .getAll()
      .then((data) => {
        if (mounted) setApiProjects(Array.isArray(data) ? data.map(normalizeProject) : []);
      })
      .catch((error) => {
        console.error("[portfolio-assistant] Unable to load projects from API:", error);
        if (mounted) setApiProjects([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const ask = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const answer = buildAnswer(trimmed, assistantProjects);
    setMessages((current) => [
      ...current,
      { id: nextId.current++, role: "user", text: trimmed },
      { id: nextId.current++, role: "assistant", ...answer },
    ]);
    setInput("");
    setIsOpen(true);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ask(input);
  };

  return (
    <aside className={`portfolio-assistant ${isOpen ? "is-open" : ""}`} aria-label="Assistant portfolio">
      <button className="assistant-fab" type="button" aria-label={panelTitle} onClick={() => setIsOpen((value) => !value)}>
        <Image src="/brand/assistant-avatar-small.png" alt="" width={32} height={32} aria-hidden="true" />
        <strong>Assistant</strong>
      </button>

      <div className="assistant-panel" hidden={!isOpen}>
        <div className="assistant-head">
          <Image src="/brand/assistant-avatar-small.png" alt="" width={40} height={40} aria-hidden="true" />
          <div>
            <span>Assistant portfolio</span>
            <strong>Parle-moi de David</strong>
          </div>
          <button type="button" aria-label="Fermer l'assistant" onClick={() => setIsOpen(false)}>
            <span aria-hidden="true" />
          </button>
        </div>

        <div className="assistant-suggestions" aria-label="Questions rapides">
          {quickQuestions.map((question) => (
            <button type="button" key={question} onClick={() => ask(question)}>
              {question}
            </button>
          ))}
        </div>

        <div className="assistant-messages" aria-live="polite">
          {messages.map((message) => (
            <div className={`assistant-message is-${message.role}`} key={message.id}>
              <p>{message.text}</p>
              {message.actions ? (
                <div className="assistant-actions">
                  {message.actions.map((action) => (
                    <a href={action.href} key={`${message.id}-${action.href}`} target={action.href.startsWith("http") ? "_blank" : undefined} rel={action.href.startsWith("http") ? "noreferrer" : undefined}>
                      {action.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <form className="assistant-form" onSubmit={onSubmit}>
          <label htmlFor="assistant-question">Question</label>
          <div>
            <input
              id="assistant-question"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Pose une question sur le profil, les projets, le blog..."
              autoComplete="off"
            />
            <button type="submit">Envoyer</button>
          </div>
        </form>
      </div>
    </aside>
  );
}
