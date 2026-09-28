import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { getConfig } from "./config/index.js";
import { getPrismaClient, disconnectPrisma } from "./db/client.js";
import { AppError } from "./errors/index.js";

const app = express();
const config = getConfig();
const prisma = getPrismaClient();

// Middleware
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// CORS
const corsOrigins = config.CORS_ORIGIN.split(",").map((o) => o.trim());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && corsOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
  } else {
    next();
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// TODO: Auth routes (/auth/register, /auth/login)
// TODO: Track routes (/tracks, /tracks/:id, /tracks/:id/listen/*)
// TODO: Post routes (/posts, /posts/:id)
// TODO: Reward routes (/me/balance, /me/ledger)
// TODO: Admin routes (/admin/partners/*)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    code: "NOT_FOUND",
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
  });
});

// Error handler
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
        details: err.details,
      });
    }

    console.error("Unhandled error:", err);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      statusCode: 500,
    });
  },
);

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await disconnectPrisma();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await disconnectPrisma();
  process.exit(0);
});

// Start server
const port = config.PORT;
app.listen(port, () => {
  console.log(`✨ Bringin' It Home server running on port ${port}`);
  console.log(`   Environment: ${config.NODE_ENV}`);
  console.log(`   API Base: ${config.API_BASE_URL}`);
});
