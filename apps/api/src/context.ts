import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export type RequestContext = {
  requestId: string;

  user?: {
    id: string;
    email: string;
  };

  workspace?: {
    id: string;
    name: string;
    slug: string;
  };

  role?: "OWNER" | "MEMBER";
};

export function createRequestContext(): RequestContext {
  return {
    requestId: crypto.randomUUID(),
  };
}

/**
 * Attach context to every request
 */
export function contextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  req.context = createRequestContext();
  next();
}

