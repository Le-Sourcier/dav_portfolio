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
    email: process.env.ADMIN_EMAIL || "admin@logan.dev",
    password: requireEnv("ADMIN_PASSWORD"),
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
    from: process.env.EMAIL_FROM || "Portfolio <noreply@logan.dev>",
  },

  // CORS
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

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
      "admin@portfolio.dev",
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

export default config;
