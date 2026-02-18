import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'portfolio_db',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    dialect: 'postgres' as const,
    logging: process.env.DB_LOGGING === 'true',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Admin
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@logan.dev',
    password: process.env.ADMIN_PASSWORD || 'admin2024',
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'Portfolio <noreply@logan.dev>',
  },

  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Owner / Profile (used as defaults in models and services)
  owner: {
    name: process.env.OWNER_NAME || 'Admin',
    email: process.env.OWNER_EMAIL || process.env.ADMIN_EMAIL || 'admin@portfolio.dev',
    phone: process.env.OWNER_PHONE || '',
    location: process.env.OWNER_LOCATION || '',
  },

  // Visitor OTP / JWT
  visitor: {
    jwtSecret: process.env.VISITOR_JWT_SECRET || 'visitor-secret-change-in-prod',
    jwtExpiresIn: process.env.VISITOR_JWT_EXPIRES_IN || '24h',
    jwtRememberExpiresIn: process.env.VISITOR_JWT_REMEMBER_EXPIRES_IN || '7d',
    otpExpiresMinutes: 10,
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'debug',
};

export const isProduction = config.nodeEnv === 'production';
export const isDevelopment = config.nodeEnv === 'development';

export default config;
