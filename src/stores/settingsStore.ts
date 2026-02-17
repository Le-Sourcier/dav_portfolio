import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { envConfig } from '@/config/env';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ProfileData {
  name: string;
  email: string;
  title: string;
  location: string;
  bio: string;
  avatar: string;
  brand: string;
  phone: string;
  yearsExperience: string;
}

export interface SocialLinks {
  github: string;
  linkedin: string;
  twitter: string;
  website: string;
}

export interface SeoData {
  siteTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  ogTitle: string;
  ogType: string;
}

export interface DisplayPreferences {
  animations: boolean;
  sidebarCompact: boolean;
  denseMode: boolean;
}

export interface ChatbotQuickAction {
  id: string;
  label: string;
  prompt: string;
}

export interface ChatbotSettings {
  enabled: boolean;
  welcomeMessage: string;
  quickActions: ChatbotQuickAction[];
}

interface SettingsState {
  profile: ProfileData;
  socialLinks: SocialLinks;
  seo: SeoData;
  theme: ThemeMode;
  display: DisplayPreferences;
  chatbot: ChatbotSettings;
  lastSaved: string | null;
}

interface SettingsActions {
  updateProfile: (data: Partial<ProfileData>) => void;
  updateSocialLinks: (data: Partial<SocialLinks>) => void;
  updateSeo: (data: Partial<SeoData>) => void;
  setTheme: (theme: ThemeMode) => void;
  updateDisplay: (data: Partial<DisplayPreferences>) => void;
  updateChatbot: (data: Partial<ChatbotSettings>) => void;
  resetSettings: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

const defaultProfile: ProfileData = {
  name: envConfig.owner.name,
  email: envConfig.owner.email,
  title: envConfig.owner.title,
  location: envConfig.owner.location,
  bio: envConfig.owner.bio,
  avatar: envConfig.owner.avatar,
  brand: envConfig.appBrand,
  phone: envConfig.owner.phone,
  yearsExperience: '',
};

const defaultSocialLinks: SocialLinks = {
  github: envConfig.social.github,
  linkedin: envConfig.social.linkedin,
  twitter: envConfig.social.twitter,
  website: envConfig.social.website,
};

const defaultSeo: SeoData = {
  siteTitle: envConfig.appName,
  metaDescription: envConfig.appDescription,
  keywords: '',
  ogImage: '',
  ogTitle: envConfig.appName,
  ogType: 'website',
};

const defaultDisplay: DisplayPreferences = {
  animations: true,
  sidebarCompact: false,
  denseMode: false,
};

const defaultChatbot: ChatbotSettings = {
  enabled: envConfig.features.chatbot,
  welcomeMessage: envConfig.chatbot.welcomeMessage,
  quickActions: [
    { id: '1', label: 'Mes Projets', prompt: 'Montre-moi tes projets' },
    { id: '2', label: 'Rendez-vous', prompt: 'Je veux prendre rendez-vous' },
    { id: '3', label: 'Mon Profil', prompt: `Qui est ${envConfig.owner.name.split(' ').pop()} ?` },
    { id: '4', label: 'Competences', prompt: 'Quelles sont tes competences ?' },
    { id: '5', label: 'Lire le Blog', prompt: 'Montre-moi le blog' },
    { id: '6', label: 'Contact', prompt: 'Comment te contacter ?' },
  ],
};

const initialState: SettingsState = {
  profile: defaultProfile,
  socialLinks: defaultSocialLinks,
  seo: defaultSeo,
  theme: 'system',
  display: defaultDisplay,
  chatbot: defaultChatbot,
  lastSaved: null,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialState,

      updateProfile: (data) =>
        set((state) => ({
          profile: { ...state.profile, ...data },
          lastSaved: new Date().toISOString(),
        })),

      updateSocialLinks: (data) =>
        set((state) => ({
          socialLinks: { ...state.socialLinks, ...data },
          lastSaved: new Date().toISOString(),
        })),

      updateSeo: (data) =>
        set((state) => ({
          seo: { ...state.seo, ...data },
          lastSaved: new Date().toISOString(),
        })),

      setTheme: (theme) =>
        set({ theme, lastSaved: new Date().toISOString() }),

      updateDisplay: (data) =>
        set((state) => ({
          display: { ...state.display, ...data },
          lastSaved: new Date().toISOString(),
        })),

      updateChatbot: (data) =>
        set((state) => ({
          chatbot: { ...state.chatbot, ...data },
          lastSaved: new Date().toISOString(),
        })),

      resetSettings: () => set(initialState),
    }),
    {
      name: 'admin-settings',
    }
  )
);

// Apply theme to document
export function applyTheme(mode: ThemeMode) {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');

  if (mode === 'system') {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(systemDark ? 'dark' : 'light');
    localStorage.setItem('theme', systemDark ? 'dark' : 'light');
  } else {
    root.classList.add(mode);
    localStorage.setItem('theme', mode);
  }
}
