// contextMiddleware
// → authMiddleware
// → workspaceMiddleware
// → controller (narrow context)
// → service (enforce business rules)

import { Request, Response, NextFunction } from "express";
import * as taskService from "../../services/task/task.service";
import { HttpError } from "../../errors";

/**
 * Utility to safely extract fully-built context
 */
function requireFullContext(req: Request) {
  const { user, workspace, role } = req.context;

  if (!user || !workspace || !role) {
    throw new HttpError("Invalid request context", 500);
  }

  return { user, workspace, role };
}

/**
 * Create Task
 */
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

    const { user, workspace, role } = requireFullContext(req);

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

/**
 * List Tasks
 */
export async function listTasksController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { workspace, role } = requireFullContext(req);

    const tasks = await taskService.listTasks({
      workspaceId: workspace.id,
      role,
    });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

/**
 * Get Task By ID
 */
export async function getTaskController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { workspace } = requireFullContext(req);
    const { id } = req.params;
     if (!id) {
      throw new HttpError("Task ID is required", 400);
    }


    const task = await taskService.getTaskById({
      workspaceId: workspace.id,
      taskId: id,
    });

    res.json(task);
  } catch (err) {
    next(err);
  }
}

/**
 * Update Task
 */
export async function updateTaskController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { user, workspace, role } = requireFullContext(req);
    const { id } = req.params;
     if (!id) {
      throw new HttpError("Task ID is required", 400);
    }


    const task = await taskService.updateTask({
      workspaceId: workspace.id,
      userId: user.id,
      role,
      taskId: id,
      updates: req.body,
    });

    res.json(task);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete Task
 */
export async function deleteTaskController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { workspace, role } = requireFullContext(req);
    const { id } = req.params;

    await taskService.deleteTask({
      workspaceId: workspace.id,
      role,
      taskId: id,
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}