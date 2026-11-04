import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/index.js";
import { verifyIdToken } from "../firebase/index.js";

export interface AuthUser {
  uid: string;
  email?: string;
  name?: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export type TokenVerifier = typeof verifyIdToken;

export function requireAuth(verify: TokenVerifier = verifyIdToken) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) return next(new UnauthorizedError("Missing bearer token"));
    try {
      const decoded = await verify(token);
      req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name };
      next();
    } catch {
      next(new UnauthorizedError("Invalid or expired token"));
    }
  };
}
