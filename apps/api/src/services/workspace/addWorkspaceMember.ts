import mongoose from "mongoose";
import { WorkspaceMemberModel } from "../../db/models/workspaceMember.model";
import { UserModel } from "../../db/models/user.model";
import { HttpError } from "../../errors";

interface AddWorkspaceMemberInput {
  workspaceId: mongoose.Types.ObjectId;
  email: string;
}

export async function addWorkspaceMember(
  input: AddWorkspaceMemberInput
) {
  try {

    const user = await UserModel.findOne({
      email: input.email.toLowerCase(),
    });

    if (!user) {
      throw new HttpError(
        "User not found",
        404,
        "NOT_FOUND"
      );
    }

    const membership = await WorkspaceMemberModel.create({
      workspaceId: input.workspaceId,
      userId: user._id,
      role: "MEMBER",
    });

    return membership;

  } catch (error: any) {

    if (error?.code === 11000) {
      throw new HttpError(
        "User is already a member",
        409,
        "VALIDATION_ERROR"
      );
    }

    throw new HttpError(
      "Failed to add workspace member",
      500,
      "INTERNAL_ERROR"
    );
  }
}