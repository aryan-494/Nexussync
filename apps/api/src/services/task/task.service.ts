import mongoose from "mongoose";
import { TaskModel, TaskStatus, TaskPriority } from "../../db/models/task.model";
import { NotFoundError, HttpError } from "../../errors";
import { WorkspaceMemberModel } from "../../db/models/workspaceMember.model";

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

  if (!mongoose.Types.ObjectId.isValid(input.taskId)) {
    throw new HttpError("Task not found", 404);
  }

  const { workspaceId, taskId } = input;

  const task = await TaskModel.findOne({
    _id: new mongoose.Types.ObjectId(taskId),
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  });

  if (!task) {
    throw new HttpError("Task not found", 404);
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

  // Fix 2 — TaskId validation
  if (!mongoose.Types.ObjectId.isValid(input.taskId)) {
    throw new HttpError("Task not found", 404);
  }

  const { workspaceId, taskId, role, updates } = input;

  const task = await TaskModel.findOne({
    _id: new mongoose.Types.ObjectId(taskId),
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  });

  if (!task) {
    throw new HttpError("Task not found", 404);
  }


  // Fix 3 — Whitelist

  const allowedFields = [
    "title",
    "description",
    "status",
    "priority",
    "assignedTo"
  ];

  const filteredUpdates: Record<string, any> = {};

  for (const key of allowedFields) {
    if (key in updates) {
      filteredUpdates[key] = updates[key];
    }
  }


  // Fix 4 — Assigned User Validation

  if (filteredUpdates.assignedTo) {

    if (!mongoose.Types.ObjectId.isValid(filteredUpdates.assignedTo)) {
      throw new HttpError("Invalid assigned user", 400);
    }

    const member = await WorkspaceMemberModel.findOne({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
      userId: new mongoose.Types.ObjectId(filteredUpdates.assignedTo),
    });

    if (!member) {
      throw new HttpError(
        "Assigned user must belong to workspace",
        400
      );
    }
  }


  task.set(filteredUpdates);

  await task.save();

  return task;
}











interface DeleteTaskInput {
  workspaceId: string;
  role: "OWNER" | "MEMBER";
  taskId: string;
}

export async function deleteTask(input: DeleteTaskInput) {

  if (!mongoose.Types.ObjectId.isValid(input.taskId)) {
    throw new HttpError("Task not found", 404);
  }

  const { workspaceId, taskId, role } = input;

  if (role !== "OWNER") {
    throw new HttpError(
      "You do not have permission to delete this task",
      403
    );
  }

  const task = await TaskModel.findOne({
    _id: new mongoose.Types.ObjectId(taskId),
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  });

  if (!task) {
    throw new HttpError("Task not found", 404);
  }

  await task.deleteOne();
}