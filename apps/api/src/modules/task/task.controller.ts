// contextMiddleware
// → authMiddleware
// → workspaceMiddleware
// → controller (narrow context)
// → service (enforce business rules)

import { Request, Response, NextFunction } from "express";
import * as taskService from "../../services/task/task.service";
import { HttpError } from "../../errors";
import { CreateTaskDTO , UpdateTaskDTO } from "./task.dto";
import { validateDTO } from "../../utils/validate";
import { PaginationDTO } from "../../utils/pagination.dto";

/**
 * Utility to safely extract fully-built context
 */
function requireFullContext(req: Request) {
  const { user, workspace, role } = req.context;

  if (!user || !workspace || !role) {
    throw new HttpError(
      "Invalid request context",
      500,
      "INTERNAL_ERROR"
    );
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

    const { user, workspace, role } = requireFullContext(req);

    // Validate request body
    const body = validateDTO(CreateTaskDTO, req.body);

    const task = await taskService.createTask({
      workspaceId: workspace.id,
      userId: user.id,
      role,
      title: body.title,
      description: body.description,
      priority: body.priority,
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

    // Validate and parse query params
    const pagination = validateDTO(PaginationDTO, req.query);

    const page = pagination.page;
    const limit = Math.min(pagination.limit, 100); // hard safety cap

    const result = await taskService.listTasks({
      workspaceId: workspace.id,
      role,
      page,
      limit,
    });

    res.json(result);
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
      throw new HttpError(
        "Task ID is required",
        400,
        "INVALID_TASK_ID"
      );
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
      throw new HttpError(
        "Task ID is required",
        400,
        "INVALID_TASK_ID"
      );
    }

    // ✅ Validate body using DTO
    const updates = validateDTO(UpdateTaskDTO, req.body);

    const task = await taskService.updateTask({
      workspaceId: workspace.id,
      userId: user.id,
      role,
      taskId: id,
      updates,
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

    if (!id) {
      throw new HttpError(
        "Task ID is required",
        400,
        "INVALID_TASK_ID"
      );
    }

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