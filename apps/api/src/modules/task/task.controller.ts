// contextMiddleware
// → authMiddleware
// → workspaceMiddleware
// → controller (narrow context)
// → service (enforce business rules)

import { Request, Response, NextFunction } from "express";
import * as taskService from "../../services/task/task.service.js";
import { HttpError } from "../../errors.js";
import { CreateTaskDTO, UpdateTaskDTO } from "./task.dto.js";
import { validateDTO } from "../../utils/validate.js";
import { PaginationDTO } from "../../utils/pagination.dto.js";
import { idempotencyService } from "../../modules/idempotency/idempotency.service.js";

/**
 * Utility to safely extract fully-built context
 */
function requireFullContext(req: Request) {
  const { user, workspace, role } = req.context;

  if (!user || !workspace || !role) {
    throw new HttpError("Invalid request context", 500, "INTERNAL_ERROR");
  }

  return { user, workspace, role };
}

/**
 * ✅ FIX: normalize query param (string | string[] → string)
 */
function getSingleQueryParam(param: string | string[] | undefined, name: string): string {
  if (!param) {
    throw new HttpError(`${name} is required`, 400, "INVALID_QUERY_PARAM");
  }

  return Array.isArray(param) ? param[0] : param;
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

    const body = validateDTO(CreateTaskDTO, req.body);

    if (!body.id) {
      throw new HttpError("Task ID is required", 400, "INVALID_TASK_ID");
    }

    const opId = body.opId;

    if (!opId) {
      throw new HttpError("opId is required", 400, "INVALID_OPERATION_ID");
    }

    const isNew = await idempotencyService.ensureIdempotent(
      opId,
      user.id,
      workspace.id
    );

    if (!isNew) {
      return res.status(200).json({ status: "duplicate_ignored" });
    }

    const task = await taskService.createTask({
      id: body.id,
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

    const pagination = validateDTO(PaginationDTO, req.query);

    const page = pagination.page;
    const limit = Math.min(pagination.limit, 100);

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

    // ✅ Ensure strict string
    const id = req.params.id as string;

    if (!id) {
      throw new HttpError("Task ID is required", 400, "INVALID_TASK_ID");
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

    // ✅ Ensure strict string
    const id = req.params.id as string;

    if (!id) {
      throw new HttpError("Task ID is required", 400, "INVALID_TASK_ID");
    }

    const updates = validateDTO(UpdateTaskDTO, req.body);

    const opId = updates.opId;

    if (!opId) {
      throw new HttpError("opId is required", 400, "INVALID_OPERATION_ID");
    }

    const isNew = await idempotencyService.ensureIdempotent(
      opId,
      user.id,
      workspace.id
    );

    if (!isNew) {
      return res.status(200).json({ status: "duplicate_ignored" });
    }

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
    const { user, workspace, role } = requireFullContext(req);

    // ✅ Ensure strict string
    const id = req.params.id as string;

    if (!id) {
      throw new HttpError("Task ID is required", 400, "INVALID_TASK_ID");
    }

    const { opId } = req.body;

    if (!opId) {
      throw new HttpError("opId is required", 400, "INVALID_OPERATION_ID");
    }

    const isNew = await idempotencyService.ensureIdempotent(
      opId,
      user.id,
      workspace.id
    );

    if (!isNew) {
      return res.status(200).json({ status: "duplicate_ignored" });
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
