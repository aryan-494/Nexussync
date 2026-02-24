import mongoose from "mongoose";
import { WorkspaceMemberModel } from "../../db/models/workspaceMember.model";
import { HttpError } from "../../errors";

interface RemoveWorkspaceMemberInput {
  workspaceId: string;
  userId: string;
}

export async function removeWorkspaceMember(
  input: RemoveWorkspaceMemberInput
) {
  const membership =
    await WorkspaceMemberModel.findOneAndDelete({
      workspaceId: new mongoose.Types.ObjectId(
        input.workspaceId
      ),

      // userId stored as STRING in DB
      userId: input.userId,
    });

  if (!membership) {
    throw new HttpError(
      "Membership not found",
      404
    );
  }

  return {
    success: true,
  };
}