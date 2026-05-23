/**
 * Centralized environment configuration.
 * Every display value in the app falls back to these env vars.
 * Priority chain: API backend > settingsStore (localStorage) > envConfig (.env)
 */
export const envConfig = {
  // API
  apiUrl: import.meta.env.VITE_API_URL || "https://server.lesourcier.space/api",
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "30000", 10),

  // App
  appName: import.meta.env.VITE_APP_NAME || "Portfolio",
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || "",
  appBrand: import.meta.env.VITE_APP_BRAND || "PORTFOLIO",

  // Owner / Profile
  owner: {
    name: import.meta.env.VITE_OWNER_NAME || "",
    title: import.meta.env.VITE_OWNER_TITLE || "",
    email: import.meta.env.VITE_CONTACT_EMAIL || "",
    phone: import.meta.env.VITE_OWNER_PHONE || "",
    location: import.meta.env.VITE_OWNER_LOCATION || "",
    bio: import.meta.env.VITE_OWNER_BIO || "",
    avatar: import.meta.env.VITE_OWNER_AVATAR || "",
  },

  // Social
  social: {
    github: import.meta.env.VITE_GITHUB_URL || "",
    linkedin: import.meta.env.VITE_LINKEDIN_URL || "",
    twitter: import.meta.env.VITE_TWITTER_URL || "",
    website: import.meta.env.VITE_WEBSITE_URL || "",
  },

  // Chatbot
  chatbot: {
    avatar: import.meta.env.VITE_CHATBOT_AVATAR || "",
    welcomeMessage:
      import.meta.env.VITE_CHATBOT_WELCOME ||
      "Bonjour ! Comment puis-je vous aider ?",
  },

  // Feature flags
  features: {
    chatbot: import.meta.env.VITE_ENABLE_CHATBOT !== "false",
    newsletter: import.meta.env.VITE_ENABLE_NEWSLETTER !== "false",
    appointments: import.meta.env.VITE_ENABLE_APPOINTMENTS !== "false",
  },
} as const;
