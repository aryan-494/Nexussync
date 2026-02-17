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


export async function createWorkspace(
    input:CreateWorkspaceInput,
) {
    const session = await mongoose.startSession();
    try{
        session.startTransaction();
        const slug = generateSlug(input.name);


        // create workspace 
        const workspace = await WorkspaceModel.create(
            [
                {
                    name : input.name,
                    slug,
                    createdBy:input.createdBy,
                },
            ],
            {session}
        )

       const workspaceId = workspace[0]._id;

         // Create OWNER membership
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

    // Commit everything
    await session.commitTransaction();

       // Return plain object (not mongoose doc)
    return workspace[0].toObject();

    }
   catch (error: any) {
    await session.abortTransaction();

    // Duplicate slug (unique index)
    if (error?.code === 11000) {
      throw new HttpError("Workspace slug already exists");
    }

    throw new HttpError("Failed to create workspace");
  } finally{
    session.endSession();
  }

}