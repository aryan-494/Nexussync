import mongoose from "mongoose";
import { WorkspaceMemberModel } from "../../db/models/workspaceMember.model";
import { HttpError } from "../../errors";

interface AddWorkspaceMemberInput {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}

export async function addWorkspaceMember(
  input: AddWorkspaceMemberInput
) {
  try {
    const membership = await WorkspaceMemberModel.create({
      workspaceId: input.workspaceId,
      userId: input.userId,
      role: "MEMBER",
    });

    return membership.toObject();
  } catch (error: any) {
    // Duplicate membership (unique index)
    if (error?.code === 11000) {
      throw new HttpError(
        "User is already a member of this workspace",
        409
      );
    }

    throw new HttpError("Failed to add workspace member", 500);
  }
}
