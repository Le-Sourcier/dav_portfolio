"use client";

/**
 * Hook d'orchestration de l'assistant chatbot.
 *
 *  - charge le message initial et les quick actions au premier montage
 *  - envoie un message au backend avec l'historique récent (16 derniers)
 *  - streame la réponse caractère par caractère pour un effet typewriter
 *  - bascule en mode "offline" si le backend n'est pas joignable (UI le signale)
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { chatbotApi } from "@/services/api/chatbot.api";
import { useAssistantStore } from "@/stores/assistantStore";
import { streamText } from "@/utils/streamText";
import type { AssistantHistoryEntry, AssistantMessage } from "@/types/assistant.types";

const HISTORY_WINDOW = 16;

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildHistory = (messages: AssistantMessage[]): AssistantHistoryEntry[] =>
  messages
    .slice(-HISTORY_WINDOW)
    .map(({ role, content }) => ({ role, content }));

export const useAssistant = () => {
  const rawLocale = useLocale();
  const lang: "fr" | "en" = rawLocale.startsWith("en") ? "en" : "fr";

  const {
    isOpen,
    isOffline,
    messages,
    quickActions,
    setOpen,
    toggleOpen,
    setOffline,
    setMessages,
    addMessage,
    updateMessage,
    clearMessages,
    setQuickActions,
  } = useAssistantStore();

  const [isTyping, setIsTyping] = useState(false);
  const cancelStreamRef = useRef<(() => void) | null>(null);

  // Charge message initial + quick actions si la conversation est vide
  useEffect(() => {
    if (messages.length > 0 && quickActions.length > 0) return;
    let cancelled = false;

    const init = async () => {
      try {
        const [initial, actions] = await Promise.all([
          messages.length === 0 ? chatbotApi.getInitialMessage(lang) : Promise.resolve(null),
          quickActions.length === 0 ? chatbotApi.getQuickActions(lang) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        if (initial) {
          const initialMessage: AssistantMessage = {
            ...initial,
            id: initial.id || makeId(),
            timestamp: initial.timestamp || new Date().toISOString(),
            displayContent: initial.content,
            isStreaming: false,
          };
          setMessages([initialMessage]);
        }
        if (actions) setQuickActions(actions);
        setOffline(false);
      } catch {
        if (cancelled) return;
        setOffline(true);
        if (messages.length === 0) {
          setMessages([
            {
              id: makeId(),
              role: "assistant",
              type: "text",
              content:
                lang === "fr"
                  ? "Je suis l'assistant du portfolio. Le service IA est temporairement injoignable, mais je peux te guider vers les sections du site."
                  : "I am the portfolio assistant. The AI service is temporarily unreachable, but I can still guide you through the site.",
              timestamp: new Date().toISOString(),
              isStreaming: false,
            },
          ]);
        }
      }
    };

    init();
    return () => {
      cancelled = true;
    };
    // On veut un init unique par langue ; pas de dep sur messages.length
    // sinon on relance à chaque ajout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      cancelStreamRef.current?.();

      const userMessage: AssistantMessage = {
        id: makeId(),
        role: "user",
        type: "text",
        content: trimmed,
        timestamp: new Date().toISOString(),
        displayContent: trimmed,
        isStreaming: false,
      };
      addMessage(userMessage);

      setIsTyping(true);
      const history = buildHistory([...messages, userMessage]);

      try {
        const response = await chatbotApi.sendMessage({ content: trimmed, history, lang });
        const assistantMessage: AssistantMessage = {
          id: response.id || makeId(),
          role: "assistant",
          type: response.type || "text",
          content: response.content,
          metadata: response.metadata,
          timestamp: response.timestamp || new Date().toISOString(),
          displayContent: "",
          isStreaming: true,
        };
        addMessage(assistantMessage);
        setIsTyping(false);
        setOffline(false);

        // Stream le texte de la réponse
        cancelStreamRef.current = streamText({
          text: response.content,
          onChunk: (partial) => updateMessage(assistantMessage.id, { displayContent: partial }),
          onDone: () => updateMessage(assistantMessage.id, { isStreaming: false }),
        });
      } catch (error) {
        setIsTyping(false);
        setOffline(true);
        const fallback: AssistantMessage = {
          id: makeId(),
          role: "assistant",
          type: "text",
          content:
            lang === "fr"
              ? "Le service IA n'est pas joignable. Pour un échange direct, utilisez le formulaire de contact ou WhatsApp."
              : "The AI service is unreachable right now. Use the contact form or WhatsApp for a direct exchange.",
          timestamp: new Date().toISOString(),
          isStreaming: false,
        };
        fallback.displayContent = fallback.content;
        addMessage(fallback);
        if (error instanceof Error) {
          // Erreur loggée pour le dev
        }
      }
    },
    [addMessage, lang, messages, setOffline, updateMessage],
  );

  const resetConversation = useCallback(async () => {
    cancelStreamRef.current?.();
    clearMessages();
    try {
      const initial = await chatbotApi.getInitialMessage(lang);
      setMessages([
        {
          ...initial,
          id: initial.id || makeId(),
          timestamp: initial.timestamp || new Date().toISOString(),
          displayContent: initial.content,
          isStreaming: false,
        },
      ]);
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, [clearMessages, lang, setMessages, setOffline]);

  // Nettoyage au démontage
  useEffect(
    () => () => {
      cancelStreamRef.current?.();
    },
    [],
  );

  return {
    isOpen,
    isOffline,
    isTyping,
    messages,
    quickActions,
    setOpen,
    toggleOpen,
    sendMessage,
    resetConversation,
  };
};
