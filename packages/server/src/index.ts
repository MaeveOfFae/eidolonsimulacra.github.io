// Eidolon Character Generator Server
// Main entry point
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./env.js";
import { prisma } from "./db.js";

// Routes
import authRoutes from "./routes/auth.js";
import oauthRoutes from "./routes/oauth.js";
import draftsRoutes from "./routes/drafts.js";
import themesRoutes from "./routes/themes.js";
import templatesRoutes from "./routes/templates.js";
import configRoutes from "./routes/config.js";
import blueprintsRoutes from "./routes/blueprints.js";
import worldsRoutes from "./routes/worlds.js";
import timelinesRoutes from "./routes/timelines.js";

// =============================================================================
// Express App Setup
// =============================================================================

const app: Express = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: env.NODE_ENV === "production",
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Rate limiting (more lenient in development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === "production" ? 100 : 1000, // Higher limit in dev
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === "production" ? 20 : 100, // Higher limit in dev
  message: { error: "Too many authentication attempts, please try again later" },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Trust proxy (for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// =============================================================================
// API Routes
// =============================================================================

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/auth/oauth", oauthRoutes);

// Data sync routes (all require authentication)
app.use("/api/sync/drafts", draftsRoutes);
app.use("/api/sync/themes", themesRoutes);
app.use("/api/sync/templates", templatesRoutes);
app.use("/api/sync/config", configRoutes);
app.use("/api/sync/blueprints", blueprintsRoutes);
app.use("/api/sync/worlds", worldsRoutes);
app.use("/api/sync/timelines", timelinesRoutes);

// =============================================================================
// Error Handling
// =============================================================================

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  if (err.message.includes("Prisma")) {
    res.status(500).json({ error: "Database error" });
    return;
  }

  // Validation errors
  if (err.name === "ZodError") {
    res.status(400).json({ error: "Validation error", details: err.message });
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
});

// =============================================================================
// Server Startup
// =============================================================================

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("Database connected successfully");

    // Start server
    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`Health check: http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
