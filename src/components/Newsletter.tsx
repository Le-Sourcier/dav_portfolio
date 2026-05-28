"use client";

import { FormEvent, useState } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { newsletterApi } from "@/services/api/newsletter.api";

type NewsletterProps = {
  compact?: boolean;
};

export function Newsletter({ compact = false }: NewsletterProps) {
  const t = useTranslations("Newsletter");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      await newsletterApi.subscribe(email, locale === "en" ? "en" : "fr");
      setStatus("success");
      setMessage(t("successFeedback"));
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Impossible de valider l'inscription.");
    }
  };

  return (
    <section className={`newsletter-section ${compact ? "newsletter-compact" : ""}`}>
      <div>
        <p className="section-kicker">{t("kicker")}</p>
        <h2>{t("title")}</h2>
        <p>{t("description")}</p>
      </div>
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <label>
          {t("emailLabel")}
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("emailPlaceholder")}
          />
        </label>
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? t("subscribeLoading") : t("subscribeDefault")}
        </button>
        {message ? <p className={`form-feedback is-${status}`}>{message}</p> : null}
      </form>
    </section>
  );
}
