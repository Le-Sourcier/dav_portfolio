"use client";

import { useCookieConsent } from "@/hooks/useCookieConsent";
import { useTranslations } from "next-intl";

export function CookiePreferencesButton() {
  const { reset } = useCookieConsent();
  const t = useTranslations("CookieButton");

  return (
    <button type="button" className="footer-cookie-button" onClick={reset}>
      {t("buttonText")}
    </button>
  );
}
