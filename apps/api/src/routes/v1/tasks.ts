// POST   /api/v1/tasks
// GET    /api/v1/tasks
// GET    /api/v1/tasks/:id
// PATCH  /api/v1/tasks/:id
// DELETE /api/v1/tasks/:id

import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { workspaceContextMiddleware  } from "../../middleware/workspaceContext.middleware";
import { requireWorkspaceRole } from "../../middleware/authorization.middleware";

import {
  createTaskController,
  listTasksController,
  getTaskController,
  updateTaskController,
  deleteTaskController,
} from "../../modules/task/task.controller";

const router = Router();

/**
 * All task routes require:
 * - Auth
 * - Workspace context
 */
router.use(authMiddleware);
router.use(workspaceContextMiddleware);

/**
 * Create Task
 */
router.post("/", createTaskController);

/**
 * List Tasks
 */
router.get("/", listTasksController);

/**
 * Get Task By ID
 */
router.get("/:id", getTaskController);

/**
 * Update Task
 */
router.patch("/:id", updateTaskController);

/**
 * Delete Task (OWNER only)
 */
router.delete(
  "/:id",
  requireWorkspaceRole("OWNER"),
  deleteTaskController
);

export default router;