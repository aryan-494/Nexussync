import { Router } from "express";
import mongoose from "mongoose";
import { authMiddleware } from "../../middleware/auth.middleware";
import { workspaceContextMiddleware } from "../../middleware/workspaceContext.middleware";
import { createWorkspace } from "../../services/workspace/createWorkspace";

const router = Router();

/**
 * CREATE workspace
 * POST /api/v1/workspaces
 */
router.post(
  "/",
  authMiddleware,
  async (req, res) => {
    const workspace = await createWorkspace({
      name: req.body.name,
     createdBy: new mongoose.Types.ObjectId(req.auth!.userId),
    });

    res.status(201).json(workspace);
  }
);

/**
 * Workspace-scoped routes
 */
router.use(
  "/:slug",
  authMiddleware,
  workspaceContextMiddleware
);

// test route
router.get("/:slug/me", (req, res) => {
  res.json({
    user: req.context?.user,
    workspace: req.context?.workspace,
    role: req.context?.role,
  });
});

export default router;

