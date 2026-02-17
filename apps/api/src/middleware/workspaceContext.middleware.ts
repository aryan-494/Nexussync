import type { Request, Response, NextFunction } from "express";
import { WorkspaceModel } from "../db/models/workspace.model";
import { WorkspaceMemberModel } from ".././db/models/workspaceMember.model";
import { HttpError } from ".././errors";

export async function workspaceContextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  // 1️⃣ Workspace identifier
  const slug = req.params.slug;

  if (!slug) {
    throw new HttpError("Workspace slug is required", 400);
  }

  // 2️⃣ Ensure context exists (created by contextMiddleware)
  if (!req.context) {
    throw new HttpError("Request context not initialized", 500);
  }

  // 3️⃣ Resolve active workspace
  const workspace = await WorkspaceModel.findOne({
    slug,
    status: "ACTIVE",
  }).lean();

  if (!workspace) {
    throw new HttpError("Workspace not found", 404);
  }

  // 4️⃣ Ensure auth info exists (set by authMiddleware)
  if (!req.auth?.userId) {
    throw new HttpError("Unauthorized", 401);
  }

  // 5️⃣ Resolve membership
  const membership = await WorkspaceMemberModel.findOne({
    workspaceId: workspace._id,
    userId: req.auth.userId,
  }).lean();

  if (!membership) {
    throw new HttpError(
      "You do not have access to this workspace",
      403
    );
  }

  // 6️⃣ Attach workspace + role to context
  req.context.workspace = {
    id: workspace._id.toString(),
    name: workspace.name,
    slug: workspace.slug,
  };

  req.context.role = membership.role;

  next();
}
