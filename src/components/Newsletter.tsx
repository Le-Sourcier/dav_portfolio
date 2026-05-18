"use client";

import { FormEvent, useState } from "react";
import { site } from "@/lib/portfolio";

type NewsletterProps = {
  compact?: boolean;
};

export function Newsletter({ compact = false }: NewsletterProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent("Inscription newsletter");
    const body = encodeURIComponent(
      `Bonjour David,\n\nJe souhaite recevoir les prochaines notes techniques.\n\nEmail: ${email}\n\nMerci.`,
    );

    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
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
        <button type="submit">S&apos;abonner</button>
      </form>
    </section>
  );
}
