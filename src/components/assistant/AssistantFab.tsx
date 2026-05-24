"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

interface AssistantFabProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AssistantFab({ isOpen, onToggle }: AssistantFabProps) {
  const t = useTranslations("Assistant");
  const ariaLabel = isOpen ? t("fabAriaLabel") : t("fabAriaLabelClosed");

  return (
    <button
      type="button"
      className={`assistant-fab${isOpen ? " is-open" : ""}`}
      onClick={onToggle}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
    >
      <span className="assistant-fab-avatar" aria-hidden="true">
        <Image
          src="/brand/assistant-avatar-small.png"
          alt=""
          width={28}
          height={28}
        />
        <span className="assistant-fab-pulse" />
      </span>
      <span className="assistant-fab-label">{t("fabLabel")}</span>
    </button>
  );
}
