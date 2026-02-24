import { Schema, model, Types } from "mongoose";

export type WorkspaceRole = "OWNER" | "MEMBER";

export interface WorkspaceMember {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  userId: string;
  role: WorkspaceRole;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceMemberSchema = new Schema<WorkspaceMember>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    userId: {
      type: String, // ← FIXED
      required: true,
    },
    role: {
      type: String,
      enum: ["OWNER", "MEMBER"],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
export const WorkspaceMemberModel = model<WorkspaceMember>(
  "WorkspaceMember",
  workspaceMemberSchema,
  "workspace_members"
);

