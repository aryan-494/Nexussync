import type { RequestContext } from "../context";

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
      auth?: {
        userId: string;
        email: string;
      };
    }
  }
}

export {};

