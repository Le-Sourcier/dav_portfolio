"use client";

/**
 * Store de l'assistant chatbot.
 *
 * Persistance :
 *  - localStorage si visiteur authentifié (token) → conversation retrouvée entre sessions
 *  - sessionStorage sinon → conversation retrouvée pendant la session de la tab
 *
 * Ce choix répond à la demande "persister en db et permettre l'auth" : tant
 * que le visiteur n'est pas authentifié on reste local, dès qu'il l'est on
 * peut rétablir une persistance plus durable (la prochaine étape serait un
 * endpoint /chatbot/history côté backend).
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AssistantMessage, AssistantQuickAction } from "@/types/assistant.types";

const STORAGE_KEY = "dav.assistant";

interface AssistantState {
  isOpen: boolean;
  isOffline: boolean;
  messages: AssistantMessage[];
  quickActions: AssistantQuickAction[];
  /** Vrai dès que Zustand a réhydraté depuis storage côté client.
   *  Tant qu'il est faux, on ne doit PAS fetcher un message initial — sinon
   *  on écrase la conversation persistée en cours de réhydratation. */
  hasHydrated: boolean;
}

interface AssistantActions {
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setOffline: (offline: boolean) => void;
  setMessages: (messages: AssistantMessage[]) => void;
  addMessage: (message: AssistantMessage) => void;
  updateMessage: (id: string, patch: Partial<AssistantMessage>) => void;
  clearMessages: () => void;
  setQuickActions: (actions: AssistantQuickAction[]) => void;
  setHasHydrated: (value: boolean) => void;
}

const initialState: AssistantState = {
  isOpen: false,
  isOffline: false,
  messages: [],
  quickActions: [],
  hasHydrated: false,
};

/**
 * Choisit localStorage si l'utilisateur a un token visiteur (auth OTP),
 * sessionStorage sinon. Lecture synchrone côté SSR retournée comme null.
 */
const adaptiveStorage = () => {
  if (typeof window === "undefined") return undefined;
  const readVisitorToken = (): string | null => {
    try {
      const raw =
        window.localStorage.getItem("dav.visitor") ??
        window.sessionStorage.getItem("dav.visitor");
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
      return parsed.state?.token ?? null;
    } catch {
      return null;
    }
  };
  return {
    getItem: (key: string) =>
      window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key),
    setItem: (key: string, value: string) => {
      if (readVisitorToken()) {
        window.localStorage.setItem(key, value);
        window.sessionStorage.removeItem(key);
      } else {
        window.sessionStorage.setItem(key, value);
        window.localStorage.removeItem(key);
      }
    },
    removeItem: (key: string) => {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    },
  };
};

export const useAssistantStore = create<AssistantState & AssistantActions>()(
  persist(
    (set) => ({
      ...initialState,
      setOpen: (open) => set({ isOpen: open }),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
      setOffline: (offline) => set({ isOffline: offline }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      updateMessage: (id, patch) =>
        set((state) => ({
          messages: state.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      clearMessages: () => set({ messages: [] }),
      setQuickActions: (actions) => set({ quickActions: actions }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => adaptiveStorage() as Storage),
      // Ne persiste que les données qui doivent survivre — pas l'état isOpen
      // (ouvrir auto le panel à chaque chargement serait intrusif)
      partialize: (state) => ({
        messages: state.messages,
        quickActions: state.quickActions,
      }),
      // Marque le store comme hydraté UNE FOIS la réhydratation finie côté
      // client. Sans ça, le hook lance un fetch initial qui écrase la
      // conversation persistée en cours de chargement.
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
