import { Request, Response, NextFunction } from "express";
import * as taskService from "../../services/task/task.service";
import { HttpError } from "../../errors";

export async function createTaskController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { title, description, priority } = req.body;

    if (!title) {
      throw new HttpError( "Title is required",401);
    }

    const { workspace, user, role } = req.context;

    const task = await taskService.createTask({
      workspaceId: workspace.id,
      userId: user.id,
      role,
      title,
      description,
      priority,
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}


