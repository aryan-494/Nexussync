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
      throw new HttpError("Title is required", 400);
    }

    const { workspace, user, role } = req.context;

    const task = await taskService.createTask({
      workspaceId:workspace.id,
      userId: user.id,     // ✅ correct
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


export async function listTasksController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { workspace, role } = req.context;

    const tasks = await taskService.listTasks({
      workspaceId: workspace.id,
      role,
    });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function getTaskController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { workspace } = req.context;
    const { id } = req.params;

    const task = await taskService.getTaskById({
      workspaceId: workspace.id,
      taskId: id,
    });

    res.json(task);
  } catch (err) {
    next(err);
  }
}


