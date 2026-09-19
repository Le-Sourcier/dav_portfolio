import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/config";

const checks = [["server", "ok"], ["route", "failed"], ["site", "ok"]] as const;

export async function NotFoundDiagnostic({ locale }: { locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: "NotFoundPremium" });
  return (
    <aside className="hero-visual saas-readiness-card notfound-diagnostic" aria-label={t("diagnosticAria")}>
      <div className="visual-header readiness-header">
        <div><span>{t("diagnostic")}</span><strong>{t("routeMissing")}</strong></div><p>HTTP 404</p>
      </div>
      <div className="notfound-status">
        <div><span>{t("responseCode")}</span><strong>404<span> / {t("notFound")}</span></strong></div>
        <p>{t("requestExplanation")}</p>
      </div>
      <div className="readiness-checks">
        {checks.map(([key, state]) => (
          <div className={`readiness-check notfound-check is-${state}`} key={key}>
            <i aria-hidden="true" />
            <div><strong>{t(`checks.${key}.label`)}</strong><span>{t(`checks.${key}.detail`)}</span></div>
            <small>{t(`checks.${key}.state`)}</small>
          </div>
        ))}
      </div>
      <div className="readiness-architecture notfound-pipeline">
        {["browser", "edge", "routeStep"].map((key, position) => (
          <Fragment key={key}>{position > 0 ? <i aria-hidden="true" /> : null}<span>{t(key)}</span></Fragment>
        ))}
      </div>
    </aside>
  );
}
