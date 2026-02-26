import type { Request, Response, NextFunction } from "express";
import { listUserWorkspaces } from "../../services/workspace/listUserWorkspaces";
import { HttpError } from "../../errors";

export async function listUserWorkspacesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.auth?.userId) {
      throw new HttpError(
        "Unauthorized",
        401,
        "AUTH_UNAUTHORIZED"
      );
    }

    const workspaces = await listUserWorkspaces({
      userId: req.auth.userId,
    });

    res.json(workspaces);

  } catch (error) {
    next(error);
  }
}