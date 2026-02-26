import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";
import { addWorkspaceMember } from "../../services/workspace/addWorkspaceMember";
import { HttpError } from "../../errors";

export async function addWorkspaceMemberController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const emailRaw = req.body.email;

    if (!emailRaw) {
      throw new HttpError(
        "Email is required",
        400,
        "VALIDATION_ERROR"
      );
    }

    if (!req.context?.workspace) {
      throw new HttpError(
        "Workspace context missing",
        500,
        "INTERNAL_ERROR"
      );
    }

    const workspaceId = new mongoose.Types.ObjectId(
      req.context.workspace.id
    );

    const email = emailRaw;

    const result = await addWorkspaceMember({
      workspaceId,
      email,
    });

    res.status(201).json(result);

  } catch (error) {
    next(error);
  }
}