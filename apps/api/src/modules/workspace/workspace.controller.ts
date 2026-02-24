import type { Request, Response, NextFunction } from "express";
import { createWorkspace } from "../../services/workspace/createWorkspace";

export async function createWorkspaceController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Workspace name is required",
      });
    }

    const workspace = await createWorkspace({
      name,
      createdBy: req.auth!.userId,
    });

    res.status(201).json(workspace);

  } catch (error) {
    next(error);
  }
}