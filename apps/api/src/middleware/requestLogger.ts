import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export function requestContextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  // Initialize base context
  req.context = {
    requestId: randomUUID(),
    user: {
      id: "",        // will be filled by auth middleware
      email: "",
    },
    workspace: {
      id: "",        // will be filled by workspace middleware
      slug: "",
    },
    role: "MEMBER",  // temporary default, overwritten later
  };

  next();
}