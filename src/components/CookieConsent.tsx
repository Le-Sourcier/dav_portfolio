"use client";

import { useState } from "react";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { useTranslations } from "next-intl";

export function CookieConsent() {
  const { isReady, hasConsented, accept } = useCookieConsent();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const t = useTranslations("CookieConsent");

  if (!isReady || hasConsented) return null;

  const savePreferences = () => {
    accept(analyticsEnabled ? "all" : "essential");
  };

  return (
    <div className="cookie-consent-shell" role="dialog" aria-label={t("dialogAriaLabel")}>
      <div className="cookie-consent-card">
        <div className="cookie-consent-grid">
          <div className="cookie-consent-mark" aria-hidden="true">
            <span />
          </div>
          <div className="cookie-consent-copy">
<p className="eyebrow">{t("eyebrow")}</p>
            <h2>{t("title")}</h2>
            <p>{t("description")}</p>
          </div>
          <div className="cookie-consent-actions">
            <button type="button" className="cookie-consent-ghost" onClick={() => setDetailsOpen((value) => !value)}>
              {t(detailsOpen ? "hideDetails" : "showDetails")}
            </button>
            <button type="button" className="cookie-consent-ghost" onClick={() => accept("essential")}>
              {t("essentialBtn")}
            </button>
            <button type="button" className="cookie-consent-ghost" onClick={savePreferences}>
              {t("saveBtn")}
            </button>
            <button type="button" className="cookie-consent-primary" onClick={() => accept("all")}>
              {t("acceptAll")}
            </button>
          </div>
        </div>

        <div className={`cookie-consent-details ${detailsOpen ? "is-open" : ""}`}>
          <div className="cookie-preferences">
            <div className="cookie-preference-row">
              <div className="cookie-preference-main">
                <span>{t("essentialLabel")}</span>
                <p>{t("essentialDesc")}</p>
              </div>
              <small>{t("mandatory")}</small>
              <button
                type="button"
                className="cookie-consent-switch is-on is-locked"
                disabled
                aria-label={t("essentialAriaLabel")}
              >
                <span />
              </button>
            </div>
            <div className="cookie-preference-meta">
              {t("essentialMeta")}
            </div>

            <div className="cookie-preference-row">
              <div className="cookie-preference-main">
                <span>{t("analyticsLabel")}</span>
                <p>{t("analyticsDesc")}</p>
              </div>
              <small>{t("optional")}</small>
              <button
                type="button"
                className={`cookie-consent-switch ${analyticsEnabled ? "is-on" : ""}`}
                onClick={() => setAnalyticsEnabled((value) => !value)}
                aria-pressed={analyticsEnabled}
                aria-label={t("analyticsAriaLabel")}
              >
                <span />
              </button>
            </div>
            <div className="cookie-preference-meta">
              {t("analyticsMeta")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
