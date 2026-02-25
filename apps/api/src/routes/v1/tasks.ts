// POST   /api/v1/tasks
// GET    /api/v1/tasks
// GET    /api/v1/tasks/:id
// PATCH  /api/v1/tasks/:id
// DELETE /api/v1/tasks/:id

import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { workspaceContextMiddleware } from "../../middleware/workspaceContext.middleware";
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
 * Middleware order:
 * Auth → Workspace Context → Controllers
 */
router.use(authMiddleware);

router.post(
  "/:slug",
  workspaceContextMiddleware,
  createTaskController
);

router.get(
  "/:slug",
  workspaceContextMiddleware,
  listTasksController
);

router.get(
  "/:slug/:id",
  workspaceContextMiddleware,
  getTaskController
);

router.patch(
  "/:slug/:id",
  workspaceContextMiddleware,
  updateTaskController
);

router.delete(
  "/:slug/:id",
  workspaceContextMiddleware,
  requireWorkspaceRole("OWNER"),
  deleteTaskController
);

export default router;