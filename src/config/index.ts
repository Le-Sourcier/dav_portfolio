import dotenv from "dotenv";
dotenv.config();

// Fail-safe: require critical secrets at startup
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[SECURITY] Missing required environment variable: ${name}`,
    );
  }
  return value;
}

export const config = {
  // Server — default to 'production' (fail-safe)
  nodeEnv: process.env.NODE_ENV || "production",
  port: parseInt(process.env.PORT || "3001", 10),

  // Database
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    name: process.env.DB_NAME || "portfolio_db",
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "",
    dialect: "postgres" as const,
    logging: process.env.DB_LOGGING === "true",
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  // JWT — no fallback secrets
  jwt: {
    secret: requireEnv("JWT_SECRET"),
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    refreshSecret: requireEnv("JWT_REFRESH_SECRET"),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // Admin — no fallback password
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@lesourcier.space",
    password: requireEnv("ADMIN_PASSWORD"),
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true",
    service:
      process.env.NODE_ENV !== "production"
        ? process.env.EMAIL_SERVICE
        : undefined,
    auth: {
      user: process.env.EMAIL_USER || "support@lesourcier.space",
      pass: process.env.EMAIL_PASS || "",
    },
    from: process.env.EMAIL_FROM || "Portfolio <noreply@lesourcier.space>",
  },

  // CORS
  // Compat héritée : un seul FRONTEND_URL accepté.
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  // Nouvelle config : liste comma-separated (FRONTEND_URLS) qui supplante FRONTEND_URL si fournie.
  // Exemple : FRONTEND_URLS=http://localhost:3000,https://admin.example.com,https://www.example.com
  // L'usage doit passer par `config.corsOrigins` (calculé plus bas) pour bénéficier du parsing.
  frontendUrls: process.env.FRONTEND_URLS || "",

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },

  // Owner / Profile (used as defaults in models and services)
  owner: {
    name: process.env.OWNER_NAME || "Admin",
    email:
      process.env.OWNER_EMAIL ||
      process.env.ADMIN_EMAIL ||
      "admin@lesourcier.space",
    phone: process.env.OWNER_PHONE || "",
    location: process.env.OWNER_LOCATION || "",
  },

  // Visitor OTP / JWT — no fallback secret
  visitor: {
    jwtSecret: requireEnv("VISITOR_JWT_SECRET"),
    jwtExpiresIn: process.env.VISITOR_JWT_EXPIRES_IN || "24h",
    jwtRememberExpiresIn: process.env.VISITOR_JWT_REMEMBER_EXPIRES_IN || "7d",
    otpExpiresMinutes: 10,
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPEN_KEY || "",
    orgId: process.env.OPEN_ORG || "",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    responseModel: process.env.OPENAI_RESPONSE_MODEL || "gpt-5-nano",
    routerApiKey: process.env.OPEN_ROUTER_API_KEY || "",
    routerModel: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001",
    routerEnabled: !!process.env.OPEN_ROUTER_API_KEY,
    enabled: !!process.env.OPEN_KEY,
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || "debug",
};

export const isProduction = config.nodeEnv === "production";
export const isDevelopment = config.nodeEnv === "development";

/**
 * Liste explicite et déduplique des origines CORS autorisées.
 *
 * Stratégie de résolution :
 *   1. `FRONTEND_URLS` (liste comma-separated) — source principale
 *   2. fallback `FRONTEND_URL` (string unique, compat)
 *   3. dernier recours `http://localhost:3000` pour le dev local
 *
 * Chaque entrée est trim, les blancs sont ignorés, les doublons supprimés,
 * et les slashs finaux sont retirés pour matcher le comportement du package `cors`.
 */
function parseCorsOrigins(): string[] {
  const raw = (
    config.frontendUrls ||
    config.frontendUrl ||
    "http://localhost:3000"
  )
    .split(",")
    .map((value) => value.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  return Array.from(new Set(raw));
}

export const corsOrigins = parseCorsOrigins();
Object.assign(config, { corsOrigins });

export default config;
