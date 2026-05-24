"use client";

/**
 * Assistant chatbot du portfolio — point d'entrée unique.
 *
 * Ce composant est volontairement mince : il assemble le FAB et le panneau,
 * branche le hook `useAssistant` qui orchestre toute la logique (messages,
 * streaming, persistance, intégration backend).
 *
 * Les anciennes props (projects, posts, experiences) ne sont plus utilisées :
 * les intents riches sont résolus côté backend. On garde la signature pour
 * éviter de casser les appels existants depuis page.tsx.
 */
import { useTranslations } from "next-intl";
import { useAssistant } from "@/hooks/useAssistant";
import { AssistantFab } from "@/components/assistant/AssistantFab";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";

interface PortfolioAssistantProps {
  /** Conservé pour rétro-compat avec page.tsx — les données sont fetchées via le backend. */
  projects?: unknown;
  posts?: unknown;
  experiences?: unknown;
}

export function PortfolioAssistant(_props: PortfolioAssistantProps = {}) {
  const t = useTranslations("Assistant");
  const {
    isOpen,
    isOffline,
    isTyping,
    messages,
    quickActions,
    setOpen,
    toggleOpen,
    sendMessage,
    resetConversation,
  } = useAssistant();

  return (
    <aside className="portfolio-assistant" aria-label={t("panelTitle")}>
      <AssistantFab isOpen={isOpen} onToggle={toggleOpen} />
      <AssistantPanel
        isOpen={isOpen}
        isOffline={isOffline}
        isTyping={isTyping}
        messages={messages}
        quickActions={quickActions}
        onClose={() => setOpen(false)}
        onReset={resetConversation}
        onSend={sendMessage}
      />
    </aside>
  );
}
