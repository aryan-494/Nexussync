import mongoose from "mongoose";
import { WorkspaceMemberModel } from "../../db/models/workspaceMember.model";
import { WorkspaceModel } from "../../db/models/workspace.model";

interface ListUserWorkspacesInput{
    userId:mongoose.Types.ObjectId;
}

interface UserWorkspace {
  id: string;
  name: string;
  slug: string;
  role: "OWNER" | "MEMBER";
}


export async function listUserWorkspaces(
  input: ListUserWorkspacesInput
): Promise<UserWorkspace[]> {

    // find memberships for user 

    const memberships = await WorkspaceMemberModel.find({
        userId:input.userId,
    }).lean(); // .lean() returns plain JS objects instead of Mongoose documents (better performance)

    if(memberships.length ===0){
        return [];
    }

  // Collect workspace IDs
  const workspaceIds = memberships.map(
    (m) => m.workspaceId
  );

    // fetch active workspace 
    const workspaces = await WorkspaceModel.find({
        _id:{$in:workspaceIds},
        status:"ACTIVE",
    }).select("_id name slug").lean();

    // Map workspaceId -> role 

    const roleByWorkspaceId = new Map<string , "OWNER"|"MEMBER">();
      for (const m of memberships) {
    roleByWorkspaceId.set(
      m.workspaceId.toString(),
      m.role
    );
  }

  // shape final response 
  return workspaces.map((w)=>({
    id:w._id.toString(),
    name:w.name,
    slug:w.slug,
    role: roleByWorkspaceId.get(w._id.toString())!,

  }));

}