import { Request, Response, NextFunction } from "express";
import { removeWorkspaceMember } from "../../services/workspace/removeWorkspaceMember";
import { HttpError } from "../../errors";

export async function removeWorkspaceMemberController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const workspaceId = req.context?.workspace?.id;

    if (!workspaceId) {
      throw new HttpError(
        "Workspace context missing",
        500,
        "INTERNAL_ERROR"
      );
    }

    const userId = req.params.userId;

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