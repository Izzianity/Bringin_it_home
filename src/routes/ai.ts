import { Router, type RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { ValidationError } from "../errors/index.js";
import type { TextGenerator } from "../gemini/index.js";

const captionSchema = z.object({
  description: z.string().trim().min(1).max(1000),
});

const SYSTEM =
  "You write short, friendly social media captions (max 200 characters). " +
  "Output only the caption text.";

export function aiRouter(auth: RequestHandler, generator: TextGenerator) {
  const router = Router();
  router.use(auth);
  router.use(rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: true, legacyHeaders: false }));

  router.post("/caption", async (req, res, next) => {
    try {
      const parsed = captionSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid request", { issues: parsed.error.issues });
      }
      const caption = await generator.generate(
        `Photo description: ${parsed.data.description}`,
        SYSTEM,
      );
      // Partners are credited: surface which AI produced the output.
      res.json({ caption, generatedBy: { partner: "gemini", kind: "ai" } });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
