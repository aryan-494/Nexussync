import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors";

export type WorkspaceRole = "OWNER" | "MEMBER";

/**
 * Ensures the user has the required role in the current workspace
 */
export function requireWorkspaceRole(requiredRole: WorkspaceRole) {
  return function (
    req: Request,
    _res: Response,
    next: NextFunction
  ) {
    // 1️⃣ Context must exist
    if (!req.context) {
      return next(
        new HttpError("Request context not initialized", 500)
      );
    }

    // 2️⃣ Workspace must exist
    if (!req.context.workspace) {
      return next(
        new HttpError("Workspace context missing", 500)
      );
    }

    // 3️⃣ Role must exist
    const userRole = req.context.role;
    if (!userRole) {
      return next(
        new HttpError("Workspace role missing", 500)
      );
    }

    // 4️⃣ Enforce role
    if (userRole !== requiredRole) {
      return next(
        new HttpError(
          "You do not have permission to perform this action",
          403
        )
      );
    }

    next();
  };
}
