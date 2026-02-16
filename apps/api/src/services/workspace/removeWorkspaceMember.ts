import mongoose from "mongoose";
import { WorkspaceMemberModel } from "../../db/models/workspaceMember.model";
import { HttpError } from "../../errors";

interface RemoveWorkspaceMemberInput {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}

export async function removeWorkspaceMember(
  input: RemoveWorkspaceMemberInput
): Promise<void> {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1️⃣ Find the membership to remove
    const membership = await WorkspaceMemberModel.findOne(
      {
        workspaceId: input.workspaceId,
        userId: input.userId,
      },
      null,
      { session }
    );

    if (!membership) {
      throw new HttpError("Workspace member not found", 404);
    }

    // 2️⃣ If removing an OWNER, ensure another OWNER exists
    if (membership.role === "OWNER") {
      const ownerCount = await WorkspaceMemberModel.countDocuments(
        {
          workspaceId: input.workspaceId,
          role: "OWNER",
        },
        { session }
      );

      if (ownerCount <= 1) {
        throw new HttpError(
          "Cannot remove the last OWNER of a workspace",
          400
        );
      }
    }

    // 3️⃣ Remove membership
    await WorkspaceMemberModel.deleteOne(
      { _id: membership._id },
      { session }
    );

    // 4️⃣ Commit
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(
      "Failed to remove workspace member",
      500
    );
  } finally {
    session.endSession();
  }
}