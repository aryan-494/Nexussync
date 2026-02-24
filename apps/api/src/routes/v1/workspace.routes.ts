import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { workspaceContextMiddleware } from "../../middleware/workspaceContext.middleware";
import { requireWorkspaceRole } from "../../middleware/authorization.middleware";

import { createWorkspaceController } from "../../modules/workspace/workspace.controller";
import { listUserWorkspacesController } from "../../modules/workspace/listUserWorkspaces.controller";
import { addWorkspaceMemberController } from "../../modules/workspace/addWorkspaceMember.controller";
import { removeWorkspaceMemberController } from "../../modules/workspace/removeWorkspaceMember.controller";

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