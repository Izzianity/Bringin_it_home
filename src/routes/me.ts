import { Router, type RequestHandler } from "express";
import type { PrismaClient } from "@prisma/client";
import { UnauthorizedError } from "../errors/index.js";

export function meRouter(auth: RequestHandler, prisma: PrismaClient) {
  const router = Router();

  // Returns the local profile for the Firebase user, creating it on first sign-in.
  router.get("/", auth, async (req, res, next) => {
    try {
      const u = req.user;
      if (!u?.email) throw new UnauthorizedError("Token has no email");
      const user = await prisma.user.upsert({
        where: { firebaseUid: u.uid },
        update: {},
        create: { firebaseUid: u.uid, email: u.email, name: u.name },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      res.json(user);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
