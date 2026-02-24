import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { workspaceContextMiddleware } from "../../middleware/workspaceContext.middleware";
import { requireWorkspaceRole } from "../../middleware/authorization.middleware";
import { createWorkspaceController } from "../../modules/workspace/workspace.controller";
import { listUserWorkspacesController } from "../../modules/workspace/listUserWorkspaces.controller";
import { addWorkspaceMember } from "../../services/workspace/addWorkspaceMember";
import { removeWorkspaceMember } from "../../services/workspace/removeWorkspaceMember"; 

const router = Router();

/**
 * Create workspace
 * Auth only (no workspace context yet)
 */
router.post(
  "/",
  authMiddleware,
  createWorkspaceController
);;

/**
 * List my workspaces
 * Auth only
 */
router.get(
  "/",
  authMiddleware,
  listUserWorkspacesController
);

/**
 * Invite member (OWNER only)
 */
router.post(
  "/:slug/members",
  authMiddleware,
  workspaceContextMiddleware,
  requireWorkspaceRole("OWNER"),
  addWorkspaceMember
);

/**
 * Remove member (OWNER only)
 */
router.delete(
  "/:slug/members/:userId",
  authMiddleware,
  workspaceContextMiddleware,
  requireWorkspaceRole("OWNER"),
  removeWorkspaceMember
);

export default router;


