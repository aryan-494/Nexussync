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

  return TaskModel.find({
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  }).sort({ createdAt: -1 });
}

interface GetTaskInput {
  workspaceId: string;
  taskId: string;
}

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