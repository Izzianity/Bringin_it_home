import express from "express";
import helmet from "helmet";
import type { PrismaClient } from "@prisma/client";
import { getConfig } from "./config/index.js";
import { AppError } from "./errors/index.js";
import { requireAuth, type TokenVerifier } from "./middleware/auth.js";
import { aiRouter } from "./routes/ai.js";
import { meRouter } from "./routes/me.js";
import { gemini, type TextGenerator } from "./gemini/index.js";

export interface AppDeps {
  prisma: PrismaClient;
  verifyToken?: TokenVerifier;
  generator?: TextGenerator;
}

export function createApp({ prisma, verifyToken, generator = gemini }: AppDeps) {
  const config = getConfig();
  const app = express();
  const auth = requireAuth(verifyToken);

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  const corsOrigins = config.CORS_ORIGIN.split(",").map((o) => o.trim());
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    res.setHeader("Vary", "Origin");
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

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/me", meRouter(auth, prisma));
  app.use("/ai", aiRouter(auth, generator));

  // TODO: Track routes (/tracks, /tracks/:id, /tracks/:id/listen/*)
  // TODO: Post routes (/posts, /posts/:id)
  // TODO: Reward routes (/me/balance, /me/ledger)
  // TODO: Admin routes (/admin/partners/*)

  app.use((req, res) => {
    res.status(404).json({
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
      statusCode: 404,
    });
  });

  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      // Express identifies error handlers by arity; `next` must stay.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _next: express.NextFunction,
    ) => {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({
          code: err.code,
          message: err.message,
          statusCode: err.statusCode,
          details: err.details,
        });
        return;
      }
      console.error("Unhandled error:", err);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
        statusCode: 500,
      });
    },
  );

  return app;
}
