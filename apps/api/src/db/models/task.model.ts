import mongoose, { Schema, Document } from "mongoose";

export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface TaskDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<TaskDocument>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"],
      default: "BACKLOG",
      required: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Composite Indexes (MANDATORY)
 */
taskSchema.index({ workspaceId: 1, status: 1 });
taskSchema.index({ workspaceId: 1, assignedTo: 1 });

export const TaskModel =
  mongoose.models.Task || mongoose.model<TaskDocument>("Task", taskSchema);
