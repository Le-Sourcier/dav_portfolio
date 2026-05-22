"use client";

import { useState } from "react";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export function CookieConsent() {
  const { isReady, hasConsented, accept } = useCookieConsent();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  if (!isReady || hasConsented) return null;

  const savePreferences = () => {
    accept(analyticsEnabled ? "all" : "essential");
  };

  return (
    <div className="cookie-consent-shell" role="dialog" aria-label="Gestion du consentement cookies">
      <div className="cookie-consent-card">
        <div className="cookie-consent-grid">
          <div className="cookie-consent-mark" aria-hidden="true">
            <span />
          </div>
          <div className="cookie-consent-copy">
            <p className="eyebrow">Confidentialité</p>
            <h2>Mesure d’audience, seulement si vous l’acceptez.</h2>
            <p>
              Les cookies essentiels gardent le site stable. L’audience facultative m’aide à voir quelles pages servent
              vraiment aux visiteurs. Aucun cookie publicitaire, aucune revente.
            </p>
          </div>
          <div className="cookie-consent-actions">
            <button type="button" className="cookie-consent-ghost" onClick={() => setDetailsOpen((value) => !value)}>
              {detailsOpen ? "Masquer" : "Paramètres"}
            </button>
            <button type="button" className="cookie-consent-ghost" onClick={() => accept("essential")}>
              Essentiels
            </button>
            <button type="button" className="cookie-consent-ghost" onClick={savePreferences}>
              Enregistrer
            </button>
            <button type="button" className="cookie-consent-primary" onClick={() => accept("all")}>
              Tout accepter
            </button>
          </div>
        </div>

        <div className={`cookie-consent-details ${detailsOpen ? "is-open" : ""}`}>
          <div className="cookie-preferences">
            <div className="cookie-preference-row">
              <div className="cookie-preference-main">
                <span>Essentiels</span>
                <p>Consentement, langue, thème et session visiteur.</p>
              </div>
              <small>Obligatoire</small>
              <button
                type="button"
                className="cookie-consent-switch is-on is-locked"
                disabled
                aria-label="Cookies essentiels obligatoires"
              >
                <span />
              </button>
            </div>
            <div className="cookie-preference-meta">
              Nécessaires pour mémoriser vos préférences et faire fonctionner les formulaires. Durée maximale : 12 mois.
            </div>

            <div className="cookie-preference-row">
              <div className="cookie-preference-main">
                <span>Mesure d’audience</span>
                <p>Pages vues, langue, référent technique, identifiant anonyme.</p>
              </div>
              <small>Facultatif</small>
              <button
                type="button"
                className={`cookie-consent-switch ${analyticsEnabled ? "is-on" : ""}`}
                onClick={() => setAnalyticsEnabled((value) => !value)}
                aria-pressed={analyticsEnabled}
                aria-label="Activer ou désactiver la mesure d'audience"
              >
                <span />
              </button>
            </div>
            <div className="cookie-preference-meta">
              Sert uniquement à comprendre quelles pages sont utiles pour améliorer le portfolio. Pas de publicité, pas de tiers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
