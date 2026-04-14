import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { workspaceContextMiddleware } from "../../middleware/workspaceContext.middleware.js";
import { requireWorkspaceRole } from "../../middleware/authorization.middleware.js";

import { createWorkspaceController } from "../../modules/workspace/workspace.controller.js";
import { listUserWorkspacesController } from "../../modules/workspace/listUserWorkspaces.controller.js";
import { addWorkspaceMemberController } from "../../modules/workspace/addWorkspaceMember.controller.js";
import { removeWorkspaceMemberController } from "../../modules/workspace/removeWorkspaceMember.controller.js";

const router = Router();

/**
 * Create workspace
 */
router.post(
  "/",
  authMiddleware,
  createWorkspaceController
);

/**
 * List workspaces
 */
router.get(
  "/",
  authMiddleware,
  listUserWorkspacesController
);

/**
 * Add member (OWNER only)
 */
router.post(
  "/:slug/members",
  authMiddleware,
  workspaceContextMiddleware,
  requireWorkspaceRole("OWNER"),
  addWorkspaceMemberController
);

/**
 * Remove member (OWNER only)
 */
router.delete(
  "/:slug/members/:userId",
  authMiddleware,
  workspaceContextMiddleware,
  requireWorkspaceRole("OWNER"),
  removeWorkspaceMemberController
);

export default router;