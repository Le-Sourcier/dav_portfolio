import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { config, corsOrigins, isProduction } from "./config/index.js";
import { connectDatabase } from "./config/database.js";
import { startCronJobs } from "./cron/appointmentCron.js";
import { swaggerSpec } from "./config/swagger.js";
import { logger } from "./utils/logger.js";
import { verifyEmailConnection } from "./helpers/mailer.js";
import routes from "./routes/index.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { apiLimiter } from "./middlewares/rateLimit.middleware.js";

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new SocketServer(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? undefined // Use helmet defaults in production
      : {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Swagger UI needs inline scripts
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
          },
        },
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS configuration — always use explicit origin list
app.use(
  cors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Visitor-Token"],
    credentials: true,
  }),
);

// Body parser
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use("/api", apiLimiter);

// Swagger documentation — only in non-production
if (!isProduction) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Portfolio API Documentation",
    }),
  );
}

// API routes
app.use("/api", routes);

// Socket.io events
io.on("connection", (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  // Chatbot real-time events (rate limited: 30 msgs/min per socket)
  const socketRateMap = new Map<string, number[]>();
  socket.on("chatbot:message", async (data) => {
    const now = Date.now();
    const key = socket.id;
    const timestamps = socketRateMap.get(key) || [];
    const recent = timestamps.filter((t) => now - t < 60_000);
    if (recent.length >= 30) {
      socket.emit("chatbot:error", {
        message: "Too many messages. Please slow down.",
      });
      return;
    }
    recent.push(now);
    socketRateMap.set(key, recent);

    try {
      const { chatbotService } = await import("./services/chatbot.service.js");
      const response = await chatbotService.processMessage(data.content);
      socket.emit("chatbot:response", response);
    } catch (error) {
      socket.emit("chatbot:error", { message: "Failed to process message" });
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Verify email connection (non-blocking)
    verifyEmailConnection().catch(() => {
      logger.warn(
        "Email service unavailable - email features will be disabled",
      );
    });

    // Start cron jobs
    startCronJobs();

    // Start listening
    server.listen(config.port, () => {
      logger.info(`
========================================
   Portfolio Backend API Server
========================================
   Environment: ${config.nodeEnv}
   Port: ${config.port}
   CORS: ${corsOrigins.join(", ")}
   API: http://localhost:${config.port}/api
   Docs: http://localhost:${config.port}/api-docs
   Health: http://localhost:${config.port}/api/health
========================================
      `);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled rejections
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
});

// Start the server
startServer();

export { app, server, io };
