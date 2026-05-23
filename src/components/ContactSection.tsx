"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { site } from "@/lib/portfolio";
import { contactsApi } from "@/services/api/contacts.api";

const whatsappNumber = site.phone.replace(/\D/g, "");

export function ContactSection() {
  const t = useTranslations("Contact");
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
      setFeedback(t("successFeedback"));
      setForm({ name: "", email: "", company: "", budget: "", message: "" });
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Impossible d'envoyer le message.");
    }
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="contact-copy">
        <p className="section-kicker">{t("kicker")}</p>
        <h2>{t("title")}</h2>
        <p>{t("description")}</p>

        <div className="direct-actions" aria-label={t("directAriaLabel")}>
          <a href={`mailto:${site.email}`} aria-label={t("emailAriaLabel", { email: site.email })} title={t("emailTitle")}>
            <span className="contact-link-icon">
              <Image src="/icons/gmail.svg" alt="" width={24} height={24} aria-hidden="true" />
            </span>
          </a>
          <a href={`tel:${site.phone.replaceAll(" ", "")}`} aria-label={t("phoneAriaLabel", { phone: site.phone })} title={t("phoneTitle")}>
            <span className="contact-link-icon">
              <Image src="/icons/telephone.svg" alt="" width={24} height={24} aria-hidden="true" />
            </span>
          </a>
          <a href={whatsappHref} target="_blank" rel="noreferrer" aria-label={t("whatsappAriaLabel")} title={t("whatsappTitle")}>
            <span className="contact-link-icon">
              <Image src="/icons/whatsapp.svg" alt="" width={24} height={24} aria-hidden="true" />
            </span>
          </a>
          <a href={site.linkedin} target="_blank" rel="noreferrer" aria-label={t("linkedinAriaLabel")} title={t("linkedinTitle")}>
            <span className="contact-link-icon">
              <Image src="/icons/linkedin.svg" alt="" width={24} height={24} aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-status">
          <span />
          {t("statusText")}
        </div>

        <div className="form-grid">
          <label>
            {t("nameLabel")}
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder={t("namePlaceholder")}
            />
          </label>
          <label>
            {t("emailLabel")}
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder={t("emailPlaceholder")}
            />
          </label>
        </div>

        <div className="form-grid">
          <label>
            {t("companyLabel")}
            <input
              value={form.company}
              onChange={(event) => setForm({ ...form, company: event.target.value })}
              placeholder={t("companyPlaceholder")}
            />
          </label>
          <label>
            {t("budgetLabel")}
            <select value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })}>
              <option value="">{t("budgetDefault")}</option>
              <option>{t("budgetFreelance")}</option>
              <option>{t("budgetCdi")}</option>
              <option>{t("budgetAudit")}</option>
              <option>{t("budgetArchitecture")}</option>
              <option>{t("budgetAutomation")}</option>
            </select>
          </label>
        </div>

        <label>
          {t("messageLabel")}
          <textarea
            required
            rows={6}
            value={form.message}
            onChange={(event) => setForm({ ...form, message: event.target.value })}
            placeholder={t("messagePlaceholder")}
          />
        </label>

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? t("sendLoading") : t("sendDefault")}
        </button>

        {feedback ? <p className={`form-feedback is-${status}`}>{feedback}</p> : null}

        <p className="form-note">
          {t("formNote")}
          <br />
          <a href={mailHref}>{t("openMailApp")}</a>
        </p>
      </form>
    </section>
  );
}
