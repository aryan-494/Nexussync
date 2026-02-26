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
      userId: input.userId,
    });

  if (!membership) {
    throw new HttpError(
      "Membership not found",
      404,
      "NOT_WORKSPACE_MEMBER"
    );
  }

  return {
    success: true,
  };
}