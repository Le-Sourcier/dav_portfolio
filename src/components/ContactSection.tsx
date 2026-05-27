"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { site } from "@/lib/portfolio";
import { useContactForm } from "@/hooks/useContactForm";
import { FloatingField } from "@/components/contact/FloatingField";

const whatsappNumber = site.phone.replace(/\D/g, "");

export function ContactSection() {
  const t = useTranslations("Contact");
  const locale = useLocale();

  const validationMessages = useMemo(
    () => ({
      required: t("errorRequired"),
      nameTooShort: t("errorNameTooShort"),
      nameTooLong: t("errorNameTooLong"),
      emailInvalid: t("errorEmailInvalid"),
      emailTooLong: t("errorEmailTooLong"),
      companyTooLong: t("errorCompanyTooLong"),
      messageTooShort: t("errorMessageTooShort"),
      messageTooLong: t("errorMessageTooLong"),
    }),
    [t],
  );

  const {
    values,
    errors,
    touched,
    status,
    feedback,
    cooldownLeft,
    limits,
    honeypotRef,
    setField,
    handleBlur,
    handleSubmit,
  } = useContactForm({
    validationMessages,
    successMessage: t("successFeedback"),
    cooldownMessage: t("cooldownMessage", { seconds: 30 }),
    genericErrorMessage: t("errorGeneric"),
    locale: locale === "en" ? "en" : "fr",
  });

  const mailHref = useMemo(() => {
    const subject = encodeURIComponent(`Projet SaaS - ${values.company || values.name || "Premier échange"}`);
    const body = encodeURIComponent(
      `Bonjour David,\n\nNom: ${values.name}\nEmail: ${values.email}\nEntreprise: ${values.company}\nBudget / cadre: ${values.budget}\n\nContexte du projet:\n${values.message}\n\nMerci.`,
    );
    return `mailto:${site.email}?subject=${subject}&body=${body}`;
  }, [values]);

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Bonjour David, j'aimerais discuter d'un projet SaaS ou d'une mission technique.",
  )}`;

  const isCooldown = cooldownLeft > 0;
  const isLoading = status === "loading";
  const messageLength = values.message.length;
  const messageNearLimit = messageLength > limits.messageMax * 0.9;

  return (
    <section id="contact" className="section contact-section">
      <div className="contact-copy">
        <p className="section-kicker">{t("kicker")}</p>
        <h2>{t("title")}</h2>
        <p>{t("description")}</p>

        <div className="direct-actions" role="group" aria-label={t("directAriaLabel")}>
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

      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <div className="contact-form-glow" aria-hidden="true" />
        <div className="contact-form-inner">
          <div className="form-status-pill">
            <span className="form-status-dot" aria-hidden="true" />
            <span className="form-status-label">{t("statusMetric")}</span>
          </div>

          {/* Honeypot anti-bot — hors flux visuel, non focusable */}
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="form-honeypot"
            defaultValue=""
          />

          <div className="form-grid">
            <FloatingField
              id="contact-name"
              label={t("nameLabel")}
              hasValue={values.name.length > 0}
              error={touched.name ? errors.name : undefined}
            >
              <input
                id="contact-name"
                type="text"
                required
                value={values.name}
                maxLength={limits.nameMax}
                onChange={(event) => setField("name", event.target.value)}
                onBlur={() => handleBlur("name")}
                placeholder=" "
                autoComplete="name"
              />
            </FloatingField>

            <FloatingField
              id="contact-email"
              label={t("emailLabel")}
              hasValue={values.email.length > 0}
              error={touched.email ? errors.email : undefined}
            >
              <input
                id="contact-email"
                type="email"
                required
                value={values.email}
                maxLength={limits.emailMax}
                onChange={(event) => setField("email", event.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder=" "
                autoComplete="email"
              />
            </FloatingField>
          </div>

          <div className="form-grid">
            <FloatingField
              id="contact-company"
              label={t("companyLabel")}
              hasValue={values.company.length > 0}
              error={touched.company ? errors.company : undefined}
            >
              <input
                id="contact-company"
                type="text"
                value={values.company}
                maxLength={limits.companyMax}
                onChange={(event) => setField("company", event.target.value)}
                onBlur={() => handleBlur("company")}
                placeholder=" "
                autoComplete="organization"
              />
            </FloatingField>

            <FloatingField
              id="contact-budget"
              label={t("budgetLabel")}
              hasValue={values.budget.length > 0}
            >
              <select
                id="contact-budget"
                value={values.budget}
                onChange={(event) => setField("budget", event.target.value)}
              >
                <option value="">{t("budgetDefault")}</option>
                <option>{t("budgetFreelance")}</option>
                <option>{t("budgetCdi")}</option>
                <option>{t("budgetAudit")}</option>
                <option>{t("budgetArchitecture")}</option>
                <option>{t("budgetAutomation")}</option>
              </select>
            </FloatingField>
          </div>

          <FloatingField
            id="contact-message"
            label={t("messageLabel")}
            hasValue={values.message.length > 0}
            error={touched.message ? errors.message : undefined}
            hint={
              <span className={`form-counter${messageNearLimit ? " is-warn" : ""}`}>
                {t("messageCounter", { current: messageLength, max: limits.messageMax })}
              </span>
            }
          >
            <textarea
              id="contact-message"
              required
              rows={6}
              value={values.message}
              maxLength={limits.messageMax}
              onChange={(event) => setField("message", event.target.value)}
              onBlur={() => handleBlur("message")}
              placeholder=" "
            />
          </FloatingField>

          <button
            type="submit"
            className="form-cta"
            disabled={isLoading || isCooldown}
            aria-busy={isLoading}
          >
            <span className="form-cta-label">
              {isLoading
                ? t("sendLoading")
                : isCooldown
                  ? t("cooldownMessage", { seconds: Math.ceil(cooldownLeft / 1000) })
                  : t("sendDefault")}
            </span>
            <span className="form-cta-arrow" aria-hidden="true">→</span>
          </button>

          {feedback ? <p className={`form-feedback is-${status}`}>{feedback}</p> : null}

          <p className="form-note">
            {t("formNote")}
            <br />
            <a href={mailHref}>{t("openMailApp")}</a>
          </p>
        </div>
      </form>
    </section>
  );
}
