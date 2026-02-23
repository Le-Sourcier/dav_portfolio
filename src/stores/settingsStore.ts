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

export interface SkillsData {
  frontend: string[];
  backend: string[];
  tools: string[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  field: string;
  description: string;
}

export interface EducationData {
  items: EducationEntry[];
}

interface SettingsState {
  profile: ProfileData;
  socialLinks: SocialLinks;
  seo: SeoData;
  theme: ThemeMode;
  display: DisplayPreferences;
  chatbot: ChatbotSettings;
  skills: SkillsData;
  education: EducationData;
  lastSaved: string | null;
}

interface SettingsActions {
  updateProfile: (data: Partial<ProfileData>) => void;
  updateSocialLinks: (data: Partial<SocialLinks>) => void;
  updateSeo: (data: Partial<SeoData>) => void;
  setTheme: (theme: ThemeMode) => void;
  updateDisplay: (data: Partial<DisplayPreferences>) => void;
  updateChatbot: (data: Partial<ChatbotSettings>) => void;
  updateSkills: (data: Partial<SkillsData>) => void;
  updateEducation: (data: EducationData) => void;
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

const defaultSkills: SkillsData = {
  frontend: [],
  backend: [],
  tools: [],
};

const defaultEducation: EducationData = { items: [] };

const initialState: SettingsState = {
  profile: defaultProfile,
  socialLinks: defaultSocialLinks,
  seo: defaultSeo,
  theme: 'system',
  display: defaultDisplay,
  chatbot: defaultChatbot,
  skills: defaultSkills,
  education: defaultEducation,
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

      updateSkills: (data) =>
        set((state) => ({
          skills: { ...state.skills, ...data },
          lastSaved: new Date().toISOString(),
        })),

      updateEducation: (data) =>
        set({ education: { ...data }, lastSaved: new Date().toISOString() }),

      resetSettings: () => set(initialState),
    }),
    {
      name: 'admin-settings',
    }
  )
);

// Stored click coordinates for theme transition origin
let _themeClickX = 0;
let _themeClickY = 0;

/** Call this before setting the theme to capture the click origin point */
export function setThemeClickOrigin(x: number, y: number) {
  _themeClickX = x;
  _themeClickY = y;
}

// Resolve the effective theme class
function resolveThemeClass(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

// Apply theme to document with View Transition animation
export function applyTheme(mode: ThemeMode) {
  const root = window.document.documentElement;
  const oldResolved = root.classList.contains('dark') ? 'dark' : 'light';
  const newResolved = resolveThemeClass(mode);

  // No-op if same theme
  if (oldResolved === newResolved) {
    localStorage.setItem('theme', newResolved);
    return;
  }

  const x = _themeClickX || window.innerWidth / 2;
  const y = _themeClickY || window.innerHeight / 2;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );
  const isDarkening = newResolved === 'dark';

  const doSwitch = () => {
    root.classList.remove('light', 'dark');
    root.classList.add(newResolved);
    localStorage.setItem('theme', newResolved);
  };

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    doSwitch();
    return;
  }

  // Strategy A: View Transitions API (Chrome 111+)
  if (typeof (document as any).startViewTransition === 'function') {
    const transition = (document as any).startViewTransition(doSwitch);
    transition.ready.then(() => {
      root.animate(
        {
          clipPath: isDarkening
            ? [`circle(${endRadius}px at ${x}px ${y}px)`, `circle(0px at ${x}px ${y}px)`]
            : [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
        },
        {
          duration: 500,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: isDarkening
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        }
      );
    });
    return;
  }

  // Strategy B: Overlay fallback (Firefox, Safari)
  const oldBg = getComputedStyle(root).backgroundColor;
  doSwitch();
  const newBg = getComputedStyle(root).backgroundColor;

  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;z-index:99999;pointer-events:none;background-color:${newBg};clip-path:circle(0px at ${x}px ${y}px);`;
  document.body.appendChild(overlay);

  const anim = overlay.animate(
    [
      { clipPath: `circle(0px at ${x}px ${y}px)` },
      { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` },
    ],
    { duration: 500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
  );

  anim.onfinish = () => overlay.remove();
}
