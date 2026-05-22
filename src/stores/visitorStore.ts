"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STORAGE_KEY = "dav.visitor";

export interface VisitorState {
  name: string;
  email: string;
  token: string | null;
  remember: boolean;
}

interface VisitorActions {
  setIdentity: (input: { name: string; email: string }) => void;
  setToken: (token: string, remember: boolean) => void;
  reset: () => void;
}

const initialState: VisitorState = {
  name: "",
  email: "",
  token: null,
  remember: false,
};

// Persist when `remember=true`, otherwise mirror to sessionStorage so the
// session is forgotten when the tab closes.
const sessionAwareStorage = () => {
  if (typeof window === "undefined") return undefined;
  return {
    getItem: (key: string) =>
      window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key),
    setItem: (key: string, value: string) => {
      try {
        const parsed = JSON.parse(value) as { state?: VisitorState };
        if (parsed.state?.remember) {
          window.localStorage.setItem(key, value);
          window.sessionStorage.removeItem(key);
        } else {
          window.sessionStorage.setItem(key, value);
          window.localStorage.removeItem(key);
        }
      } catch {
        window.sessionStorage.setItem(key, value);
      }
    },
    removeItem: (key: string) => {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    },
  };
};

export const useVisitorStore = create<VisitorState & VisitorActions>()(
  persist(
    (set) => ({
      ...initialState,
      setIdentity: ({ name, email }) =>
        set((state) => ({ ...state, name, email, token: null })),
      setToken: (token, remember) =>
        set((state) => ({ ...state, token, remember })),
      reset: () => set({ ...initialState }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sessionAwareStorage() as Storage),
      partialize: (state) => ({
        name: state.name,
        email: state.email,
        token: state.token,
        remember: state.remember,
      }),
    },
  ),
);

export const getVisitorToken = (): string | null =>
  useVisitorStore.getState().token;
