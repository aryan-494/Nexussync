import type { RequestContext } from "../context";

declare global {
  namespace Express {
    interface Request {
      /**
       * Always initialized by requestContextMiddleware.
       * Contains requestId, user, workspace, role.
       */
      context: RequestContext;

      /**
       * Attached by auth middleware after token verification.
       */
      auth?: {
        userId: string;
        email: string;
      };
    }
  }
}

export {};