import { Request, Response, NextFunction } from "express";
import { removeWorkspaceMember } from "../../services/workspace/removeWorkspaceMember.js";
import { HttpError } from "../../errors.js";

export async function removeWorkspaceMemberController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // ✅ ensure workspaceId is strictly string
    const workspaceId: string | undefined = req.context?.workspace?.id;

    if (!workspaceId) {
      throw new HttpError(
        "Workspace context missing",
        500,
        "INTERNAL_ERROR"
      );
    }

    // ✅ force TypeScript to treat as string
    const userId = req.params.userId as string;

    if (!userId) {
      throw new HttpError(
        "UserId is required",
        400,
        "VALIDATION_ERROR"
      );
    }

    const result = await removeWorkspaceMember({
      workspaceId,
      userId,
    });

    res.json(result);

  } catch (error) {
    next(error);
  }
}