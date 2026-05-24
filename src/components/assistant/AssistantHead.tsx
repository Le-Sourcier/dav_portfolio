"use client";

/**
 * En-tête de l'assistant — pattern Intercom Fin :
 * avatar à gauche, nom + statut au milieu, actions à droite (toujours en ligne).
 */
import Image from "next/image";
import { useTranslations } from "next-intl";

interface AssistantHeadProps {
  isOffline: boolean;
  onClose: () => void;
  onReset: () => void;
}

export function AssistantHead({ isOffline, onClose, onReset }: AssistantHeadProps) {
  const t = useTranslations("Assistant");
  const statusLabel = isOffline ? t("statusOffline") : t("statusOnline");

  return (
    <header className={`assistant-head${isOffline ? " is-offline-ctx" : ""}`}>
      <div className="assistant-head-avatar">
        <Image
          src="/brand/assistant-avatar-small.png"
          alt=""
          width={30}
          height={30}
          aria-hidden="true"
        />
        <span
          className={`assistant-head-presence is-${isOffline ? "offline" : "online"}`}
          aria-hidden="true"
        />
      </div>

      <div className="assistant-head-id">
        <strong className="assistant-head-name">{t("panelSubtitle")}</strong>
        <span className="assistant-head-kicker">{statusLabel}</span>
      </div>

      <div className="assistant-head-actions">
        <button
          type="button"
          className="assistant-head-iconbtn"
          onClick={onReset}
          title={t("resetTitle")}
          aria-label={t("resetTitle")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 5V2L7 6l5 4V7a5 5 0 1 1-4.9 6h-2A7 7 0 1 0 12 5Z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button
          type="button"
          className="assistant-head-iconbtn"
          onClick={onClose}
          aria-label={t("closeAriaLabel")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="m12 10.6 5.3-5.3 1.4 1.4L13.4 12l5.3 5.3-1.4 1.4L12 13.4l-5.3 5.3-1.4-1.4L10.6 12 5.3 6.7l1.4-1.4Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
