/**
 * Wrapper axios des endpoints /chatbot (backend).
 *
 * Le sessionId est généré par tab (sessionStorage) pour permettre au backend
 * de garder un contexte minimal côté serveur (emails vérifiés notamment).
 */
import { apiClient } from "./client";
import type {
  AssistantHistoryEntry,
  AssistantMessage,
  AssistantQuickAction,
} from "@/types/assistant.types";

const SESSION_KEY = "dav.assistant.session-id";

const getSessionId = (): string => {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `${Date.now()}-fallback`;
  }
};

interface SendMessagePayload {
  content: string;
  history?: AssistantHistoryEntry[];
  lang?: "fr" | "en";
}

export const chatbotApi = {
  sendMessage: ({ content, history, lang = "fr" }: SendMessagePayload) =>
    apiClient.post<AssistantMessage>("/chatbot/message", {
      content,
      history,
      sessionId: getSessionId(),
      lang,
    }),

  getQuickActions: () =>
    apiClient.get<AssistantQuickAction[]>("/chatbot/quick-actions"),

  getInitialMessage: (lang: "fr" | "en" = "fr") =>
    apiClient.get<AssistantMessage>(`/chatbot/initial?lang=${lang}`),
};
