import mongoose from "mongoose";
import { TaskModel, TaskStatus, TaskPriority } from "../../db/models/task.model";
import { NotFoundError, HttpError } from "../../errors";

interface CreateTaskInput {
  workspaceId: string;
  userId: string;
  role: "OWNER" | "MEMBER";
  title: string;
  description?: string;
  priority?: TaskPriority;
}

export async function createTask(input: CreateTaskInput) {
  const { workspaceId, userId, title, description, priority } = input;

  const task = await TaskModel.create({
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
    title,
    description: description ?? null,
    priority: priority ?? "MEDIUM",
    status: "BACKLOG",
    createdBy: new mongoose.Types.ObjectId(userId),
  });

  return task;
}

interface ListTasksInput {
  workspaceId: string;
  role: "OWNER" | "MEMBER";
}

export async function listTasks(input: ListTasksInput) {
  const { workspaceId } = input;

  const tasks = await TaskModel.find({
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  })
  .sort({ createdAt: -1 })
  .lean();

  return tasks;
};

export async function getTaskById(input: GetTaskInput) {
  const { workspaceId, taskId } = input;

  const task = await TaskModel.findOne({
    _id: taskId,
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  });

  if (!task) {
    throw new NotFoundError("Task not found");
  }

  return task;
}

interface UpdateTaskInput {
  workspaceId: string;
  userId: string;
  role: "OWNER" | "MEMBER";
  taskId: string;
  updates: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedTo?: string | null;
  };
}

export async function updateTask(input: UpdateTaskInput) {
  const { workspaceId, role, taskId, updates } = input;

  const task = await TaskModel.findOne({
    _id: taskId,
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  });

  if (!task) {
    throw new NotFoundError("Task not found");
  }

  // MEMBER cannot assign
  if (updates.assignedTo !== undefined && role !== "OWNER") {
    throw new HttpError( "You do not have permission to assign this task",403);
  }

  // Apply allowed updates only
  if (updates.title !== undefined) task.title = updates.title;
  if (updates.description !== undefined) task.description = updates.description;
  if (updates.status !== undefined) task.status = updates.status;
  if (updates.priority !== undefined) task.priority = updates.priority;
  if (updates.assignedTo !== undefined)
    task.assignedTo = updates.assignedTo
      ? new mongoose.Types.ObjectId(updates.assignedTo)
      : null;

  await task.save();

  return task;
}

interface DeleteTaskInput {
  workspaceId: string;
  role: "OWNER" | "MEMBER";
  taskId: string;
}

export async function deleteTask(input: DeleteTaskInput) {
  const { workspaceId, role, taskId } = input;

  if (role !== "OWNER") {
    throw new HttpError( "You do not have permission to delete this task",403);
  }

  const result = await TaskModel.findOneAndDelete({
    _id: taskId,
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  });

  if (!result) {
    throw new NotFoundError("Task not found");
  }

  return;
}