import { Schema, model, Types } from "mongoose";

export type WorkspaceRole = "OWNER" | "MEMBER";

export interface WorkspaceMember {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  userId: Types.ObjectId;
  role: WorkspaceRole;
  joinedAt: Date;
}

const workspaceMemberSchema = new Schema<WorkspaceMember>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["OWNER", "MEMBER"],
      required: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

// 🔒 Prevent duplicate membership
workspaceMemberSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true }
);

// 🔍 Fast lookups
workspaceMemberSchema.index({ userId: 1 });
workspaceMemberSchema.index({ workspaceId: 1 });

export const WorkspaceMemberModel = model<WorkspaceMember>(
  "WorkspaceMember",
  workspaceMemberSchema
);
