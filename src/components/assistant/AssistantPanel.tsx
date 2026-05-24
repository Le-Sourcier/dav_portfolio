"use client";

/**
 * Panneau principal de l'assistant. Composé strictement des sous-composants
 * UI ; toute la logique vient via les props depuis useAssistant().
 */
import { AssistantHead } from "./AssistantHead";
import { AssistantSuggestions } from "./AssistantSuggestions";
import { AssistantMessages } from "./AssistantMessages";
import { AssistantComposer } from "./AssistantComposer";
import type { AssistantMessage, AssistantQuickAction } from "@/types/assistant.types";

interface AssistantPanelProps {
  isOpen: boolean;
  isOffline: boolean;
  isTyping: boolean;
  messages: AssistantMessage[];
  quickActions: AssistantQuickAction[];
  onClose: () => void;
  onReset: () => void;
  onSend: (content: string) => void;
}

export function AssistantPanel({
  isOpen,
  isOffline,
  isTyping,
  messages,
  quickActions,
  onClose,
  onReset,
  onSend,
}: AssistantPanelProps) {
  return (
    <div
      className={`assistant-panel${isOpen ? " is-open" : ""}`}
      role="dialog"
      aria-modal="false"
      hidden={!isOpen}
    >
      <div className="assistant-panel-glow" aria-hidden="true" />
      <div className="assistant-panel-inner">
        <AssistantHead isOffline={isOffline} onClose={onClose} onReset={onReset} />
        <AssistantMessages messages={messages} isTyping={isTyping} onOtpSubmit={onSend} />
        <AssistantSuggestions
          actions={quickActions}
          onSelect={onSend}
          disabled={isTyping}
        />
        <AssistantComposer onSend={onSend} disabled={isTyping} />
      </div>
    </div>
  );
}
