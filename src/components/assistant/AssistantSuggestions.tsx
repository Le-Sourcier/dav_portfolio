"use client";

import { useTranslations } from "next-intl";
import type { AssistantQuickAction } from "@/types/assistant.types";

interface AssistantSuggestionsProps {
  actions: AssistantQuickAction[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function AssistantSuggestions({ actions, onSelect, disabled }: AssistantSuggestionsProps) {
  const t = useTranslations("Assistant");
  if (actions.length === 0) return null;

  return (
    <div className="assistant-suggestions" role="group" aria-label={t("suggestionsAriaLabel")}>
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className="assistant-suggestion-pill"
          onClick={() => onSelect(action.prompt)}
          disabled={disabled}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
