"use client";

import { useCookieConsent } from "@/hooks/useCookieConsent";

export function CookiePreferencesButton() {
  const { reset } = useCookieConsent();

  return (
    <button type="button" className="footer-cookie-button" onClick={reset}>
      Préférences cookies
    </button>
  );
}
