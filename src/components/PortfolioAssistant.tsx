"use client";

/**
 * Assistant chatbot du portfolio — point d'entrée unique.
 *
 * Ce composant est volontairement mince : il assemble le FAB et le panneau,
 * puis charge la logique complète seulement lorsque le visiteur ouvre
 * l'assistant. Le hook `useAssistant` reste dans le runtime lazy-loadé.
 *
 * Les anciennes props (projects, posts, experiences) ne sont plus utilisées :
 * les intents riches sont résolus côté backend. On garde la signature pour
 * éviter de casser les appels existants depuis page.tsx.
 */
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AssistantFab } from "@/components/assistant/AssistantFab";

const AssistantRuntime = dynamic(
  () => import("@/components/assistant/AssistantRuntime").then((mod) => mod.AssistantRuntime),
  { ssr: false },
);

interface PortfolioAssistantProps {
  /** Conservé pour rétro-compat avec page.tsx — les données sont fetchées via le backend. */
  projects?: unknown;
  posts?: unknown;
  experiences?: unknown;
}

export function PortfolioAssistant(_props: PortfolioAssistantProps = {}) {
  const t = useTranslations("Assistant");
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoadedRuntime, setHasLoadedRuntime] = useState(false);

  const toggleOpen = () => {
    setHasLoadedRuntime(true);
    setIsOpen((current) => !current);
  };

  return (
    <aside className="portfolio-assistant" aria-label={t("panelTitle")}>
      <AssistantFab isOpen={isOpen} onToggle={toggleOpen} />
      {hasLoadedRuntime ? (
        <AssistantRuntime isOpen={isOpen} onClose={() => setIsOpen(false)} />
      ) : null}
    </aside>
  );
}
