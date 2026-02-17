import mongoose, { mongo } from "mongoose";
import { WorkspaceMemberModel, WorkspaceRole } from "../../db/models/workspaceMember.model";
import { WorkspaceModel } from "../../db/models/workspace.model";
import { HttpError } from "../../errors";


/**
 * Very small helper:
 * - lowercase
 * - replace spaces with -
 * - remove unsafe chars
 */

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}


interface CreateWorkspaceInput {
  name: string;
  createdBy: string;
}


export async function createWorkspace(input: CreateWorkspaceInput) {
  try {
    const slug = generateSlug(input.name);

    const workspace = await WorkspaceModel.create({
      name: input.name,
      slug,
      createdBy: input.createdBy,
    });

    await WorkspaceMemberModel.create({
      workspaceId: workspace._id,
      userId: input.createdBy,
      role: "OWNER",
    });

    return workspace.toObject();
  } catch (error: any) {
    if (error?.code === 11000) {
      throw new HttpError("Workspace slug already exists");
    }

    throw new HttpError("Failed to create workspace");
  }
}