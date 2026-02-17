import type { Request, Response, NextFunction } from "express";
import { WorkspaceModel } from "../db/models/workspace.model";
import { WorkspaceMemberModel } from "../db/models/workspaceMember.model";
import { HttpError } from "../errors";

export async function workspaceContextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    // 1️⃣ Workspace identifier (from route param)
    const slugParam = req.params.slug;

if (typeof slugParam !== "string" || !slugParam.trim()) {
  return next(new HttpError("Workspace slug is required", 400));
}

const slug = slugParam.toLowerCase();

    if (!slug) {
      return next(new HttpError("Workspace slug is required", 400));
    }

    // 2️⃣ Ensure request context exists
    if (!req.context) {
      return next(
        new HttpError("Request context not initialized", 500)
      );
    }

    // 3️⃣ Resolve active workspace
    const workspace = await WorkspaceModel.findOne({
      slug,
      status: "ACTIVE",
    }).lean();

    if (!workspace) {
      return next(new HttpError("Workspace not found", 404));
    }

    // 4️⃣ Ensure authenticated user exists
    if (!req.auth?.userId) {
      return next(new HttpError("Unauthorized", 401));
    }

    // 5️⃣ Resolve membership
    const membership = await WorkspaceMemberModel.findOne({
      workspaceId: workspace._id,
      userId: req.auth.userId,
    }).lean();

    if (!membership) {
      return next(
        new HttpError("You do not have access to this workspace", 403)
      );
    }

    // 6️⃣ Attach workspace + role to request context
    req.context.workspace = {
      id: workspace._id.toString(),
      name: workspace.name,
      slug: workspace.slug,
    };

    req.context.role = membership.role;

    next();
  } catch (error) {
    next(error);
  }
}
