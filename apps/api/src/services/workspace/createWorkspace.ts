import mongoose from "mongoose";
import { WorkspaceModel } from "../../db/models/workspace.model";
import { WorkspaceMemberModel } from "../../db/models/workspaceMember.model";
import { HttpError } from "../../errors";

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

export async function createWorkspace(
  input: CreateWorkspaceInput
) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const slug = generateSlug(input.name);

    const workspace = await WorkspaceModel.create(
      [
        {
          name: input.name,
          slug,
          createdBy: input.createdBy,
        },
      ],
      { session }
    );

    const workspaceId = workspace[0]._id;

    await WorkspaceMemberModel.create(
      [
        {
          workspaceId,
          userId: input.createdBy,
          role: "OWNER",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return workspace[0].toObject();

  } catch (error: any) {

    await session.abortTransaction();

    if (error?.code === 11000) {
      throw new HttpError(
        "Workspace slug already exists",
        409,
        "VALIDATION_ERROR"
      );
    }

    throw new HttpError(
      "Failed to create workspace",
      500,
      "INTERNAL_ERROR"
    );
  }
}