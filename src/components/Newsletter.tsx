"use client";

import { FormEvent, useState } from "react";
import { newsletterApi } from "@/services/api/newsletter.api";

type NewsletterProps = {
  compact?: boolean;
};

export function Newsletter({ compact = false }: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      await newsletterApi.subscribe(email);
      setStatus("success");
      setMessage("Inscription confirmée.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Impossible de valider l'inscription.");
    }
  };

  return (
    <section className={`newsletter-section ${compact ? "newsletter-compact" : ""}`}>
      <div>
        <p className="section-kicker">Newsletter</p>
        <h2>Recevoir les prochaines notes techniques.</h2>
        <p>
          Une sélection courte sur SaaS, architecture backend, automatisation métier et qualité produit. Pas de bruit,
          seulement des idées applicables.
        </p>
      </div>
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <label>
          Email professionnel
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="vous@entreprise.com"
          />
        </label>
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Envoi..." : "S'abonner"}
        </button>
        {message ? <p className={`form-feedback is-${status}`}>{message}</p> : null}
      </form>
    </section>
  );
}
