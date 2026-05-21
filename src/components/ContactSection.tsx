"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { site } from "@/lib/portfolio";
import { contactsApi } from "@/services/api/contacts.api";

const whatsappNumber = site.phone.replace(/\D/g, "");

export function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    budget: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const mailHref = useMemo(() => {
    const subject = encodeURIComponent(`Projet SaaS - ${form.company || form.name || "Premier échange"}`);
    const body = encodeURIComponent(
      `Bonjour David,\n\nNom: ${form.name}\nEmail: ${form.email}\nEntreprise: ${form.company}\nBudget / cadre: ${form.budget}\n\nContexte du projet:\n${form.message}\n\nMerci.`,
    );

    return `mailto:${site.email}?subject=${subject}&body=${body}`;
  }, [form]);

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Bonjour David, j'aimerais discuter d'un projet SaaS ou d'une mission technique.",
  )}`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      await contactsApi.create({
        name: form.name,
        email: form.email,
        subject: `Projet SaaS - ${form.company || form.name || "Premier échange"}`,
        message: [
          form.company ? `Entreprise: ${form.company}` : "",
          form.budget ? `Cadre: ${form.budget}` : "",
          form.message,
        ]
          .filter(Boolean)
          .join("\n\n"),
      });
      setStatus("success");
      setFeedback("Message envoyé. Je reviens vers vous rapidement.");
      setForm({ name: "", email: "", company: "", budget: "", message: "" });
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Impossible d'envoyer le message.");
    }
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="contact-copy">
        <p className="section-kicker">Contact</p>
        <h2>Discutons de votre prochaine étape produit.</h2>
        <p>
          Choisissez un canal direct ou préparez un brief structuré. Le formulaire ouvre votre client email avec un
          message prêt à envoyer.
        </p>

        <div className="direct-actions" aria-label="Actions de contact direct">
          <a href={`mailto:${site.email}`} aria-label={`Envoyer un email à ${site.email}`} title="Email">
            <span className="contact-link-icon">
              <Image src="/icons/gmail.svg" alt="" width={24} height={24} aria-hidden="true" />
            </span>
          </a>
          <a href={`tel:${site.phone.replaceAll(" ", "")}`} aria-label={`Appeler ${site.phone}`} title="Téléphone">
            <span className="contact-link-icon">
              <Image src="/icons/telephone.svg" alt="" width={24} height={24} aria-hidden="true" />
            </span>
          </a>
          <a href={whatsappHref} target="_blank" rel="noreferrer" aria-label="Ouvrir WhatsApp" title="WhatsApp">
            <span className="contact-link-icon">
              <Image src="/icons/whatsapp.svg" alt="" width={24} height={24} aria-hidden="true" />
            </span>
          </a>
          <a href={site.linkedin} target="_blank" rel="noreferrer" aria-label="Ouvrir LinkedIn" title="LinkedIn">
            <span className="contact-link-icon">
              <Image src="/icons/linkedin.svg" alt="" width={24} height={24} aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-status">
          <span />
          Disponible pour CDI, freelance et missions longues
        </div>

        <div className="form-grid">
          <label>
            Nom
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Votre nom"
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="vous@entreprise.com"
            />
          </label>
        </div>

        <div className="form-grid">
          <label>
            Entreprise
            <input
              value={form.company}
              onChange={(event) => setForm({ ...form, company: event.target.value })}
              placeholder="Nom de l'entreprise"
            />
          </label>
          <label>
            Cadre
            <select value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })}>
              <option value="">Sélectionner</option>
              <option>Mission freelance</option>
              <option>CDI / équipe produit</option>
              <option>Audit technique</option>
              <option>Architecture SaaS</option>
              <option>Automatisation métier</option>
            </select>
          </label>
        </div>

        <label>
          Besoin
          <textarea
            required
            rows={6}
            value={form.message}
            onChange={(event) => setForm({ ...form, message: event.target.value })}
            placeholder="Contexte, objectif business, délai, stack existante, blocages..."
          />
        </label>

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Envoi..." : "Envoyer le brief"}
        </button>

        {feedback ? <p className={`form-feedback is-${status}`}>{feedback}</p> : null}

        <p className="form-note">
          Le message est transmis au backend. Pour une réponse immédiate, utilisez WhatsApp ou le téléphone.
          <br />
          <a href={mailHref}>Ouvrir plutôt mon application email</a>
        </p>
      </form>
    </section>
  );
}
