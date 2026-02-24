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

    // 1️⃣ Find user
    const user = await UserModel.findOne({
      email: input.email.toLowerCase(),
    });
    console.log("USER DEBUG:", user);
console.log("USER ID DEBUG:", user?._id);

    if (!user) {
      throw new HttpError("User not found", 404);
    }

    // 2️⃣ Create membership
    const membership = await WorkspaceMemberModel.create({
  workspaceId: input.workspaceId,
  userId: user._id, // ✅ No error now
  role: "MEMBER",
});

    return membership; // ✅ No error

  } catch (error: any) {

    if (error?.code === 11000) {
      throw new HttpError(
        "User is already a member",
        409
      );
    }

    throw new HttpError(
      "Failed to add workspace member",
      500
    );
  }
}