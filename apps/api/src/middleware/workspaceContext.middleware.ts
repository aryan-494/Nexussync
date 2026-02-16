
import mongoose from "mongoose";
import {Request , Response , NextFunction } from "express"
import { WorkspaceMemberModel } from "../db/models/workspaceMember.model";
import { WorkspaceModel } from "../db/models/workspace.model";
import { HttpError } from "../errors";

export async function workpspaceContextMiddleware(
    req : Request,
    _res:Response,
    next:NextFunction,
) {

    const slug = req.params.slug ;
    if(!slug){
        throw new HttpError("Workspace slug is required", 400);
    }

    // Resolve workspace 
    const workspace = await WorkspaceModel.findOne({
        slug ,
        status:"ACTIVE",
    }).lean();

      if (!workspace) {
    throw new HttpError("Workspace not found", 404);
  }

  // Resolve membership 
  const membership = await WorkspaceMemberModel.find({
    workspaceId : workspace._id,
    userId:req.auth?.userId,  // comes from the auth middleware 

  }).lean();

  if(!membership){
    throw new HttpError("You do not have the access to this workspace", 403);

  }

  // Attach to request context 
 req.context = req.context ?? {
  requestId: "unknown",
};

req.context.workspace = {
  id: workspace._id.toString(),
  name: workspace.name,
  slug: workspace.slug,
};

req.context.role = membership.role;

  next();
}