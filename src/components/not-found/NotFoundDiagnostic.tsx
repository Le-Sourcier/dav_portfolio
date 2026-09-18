import { Fragment } from "react";
import { notFoundChecks } from "@/lib/notFound";

const pipeline = ["Navigateur", "Edge", "Route"];

export function NotFoundDiagnostic() {
  return (
    <aside
      className="hero-visual saas-readiness-card notfound-diagnostic"
      aria-label="Diagnostic de la requête"
    >
      <div className="visual-header readiness-header">
        <div>
          <span>Diagnostic</span>
          <strong>Route introuvable</strong>
        </div>
        <p>HTTP 404</p>
      </div>

      <div className="notfound-status">
        <div>
          <span>Code retourné</span>
          <strong>
            404<span> / not found</span>
          </strong>
        </div>
        <p>La requête est arrivée jusqu&apos;au serveur: aucune ressource ne correspond à cette adresse.</p>
      </div>

      <div className="readiness-checks">
        {notFoundChecks.map((check) => (
          <div className={`readiness-check notfound-check is-${check.state}`} key={check.label}>
            <i />
            <div>
              <strong>{check.label}</strong>
              <span>{check.detail}</span>
            </div>
            <small>{check.stateLabel}</small>
          </div>
        ))}
      </div>

      <div className="readiness-architecture notfound-pipeline">
        {pipeline.map((step, position) => (
          <Fragment key={step}>
            {position > 0 ? <i /> : null}
            <span>{step}</span>
          </Fragment>
        ))}
      </div>
    </aside>
  );
}
