"use client";

import { Suspense } from "react";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { CookieConsent } from "@/components/CookieConsent";

export function ClientAnalytics() {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      <CookieConsent />
    </>
  );
}
