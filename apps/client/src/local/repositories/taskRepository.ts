import { db } from "../db"
import { ObjectId } from "bson"

import {
  createTaskOperation,
  updateTaskOperation,
  deleteTaskOperation
} from "../types/operationBuilders"

import { OperationType } from "../types/operations"
import type {
  TaskCreatePayload,
  TaskUpdatePayload
} from "../types/operations"

/* =================================
   HELPER: find pending update
================================= */

async function findPendingUpdate(taskId: string) {
  return db.opLog
    .where("entityId")
    .equals(taskId)
    .and(op => op.type === OperationType.TASK_UPDATE && !op.synced)
    .first()
}

/* =================================
   CREATE TASK LOCAL
================================= */

export async function createTaskLocal(
  workspaceSlug: string,
  payload: Omit<TaskCreatePayload, "id">
) {
  const taskId = new ObjectId().toHexString()

  const now = Date.now() // ✅ FIXED

  const task = {
    id: taskId,
    workspaceSlug,
    ...payload,
    status: "TODO",
    createdBy: "me",
    createdAt: now,     // ✅ FIXED
    updatedAt: now,     // ✅ FIXED
    synced: false
  }

  const operation = createTaskOperation(workspaceSlug, {
    id: taskId,
    ...payload
  })

  await db.transaction("rw", db.tasks, db.opLog, async () => {
    await db.tasks.add(task)
    await db.opLog.add(operation)
  })

  return task
}

/* =================================
   UPDATE TASK LOCAL
================================= */

export async function updateTaskLocal(
  workspaceSlug: string,
  taskId: string,
  payload: TaskUpdatePayload
) {
  const now = Date.now() // ✅ FIXED

  await db.transaction("rw", db.tasks, db.opLog, async () => {

    await db.tasks.update(taskId, {
      ...payload,
      updatedAt: now,   // ✅ FIXED
      synced: false
    })

    const existingOp = await findPendingUpdate(taskId)

    if (existingOp && existingOp.seq !== undefined) {

      const mergedPayload = {
        ...existingOp.payload,
        ...payload
      }

      await db.opLog.update(existingOp.seq, {
        payload: mergedPayload
      })

    } else {

      const operation = updateTaskOperation(
        workspaceSlug,
        taskId,
        payload
      )

      await db.opLog.add(operation)
    }
  })
}

/* =================================
   DELETE TASK LOCAL
================================= */

export async function deleteTaskLocal(
  workspaceSlug: string,
  taskId: string
) {
  const operation = deleteTaskOperation(workspaceSlug, taskId)

  await db.transaction("rw", db.tasks, db.opLog, async () => {

    await db.tasks.update(taskId, {
      status: "DELETED",
      synced: false
    })

    await db.opLog.add(operation)

  })
}

/* =================================
   GET TASKS LOCAL
================================= */

export async function getTasksLocal(workspaceSlug: string) {
  return db.tasks
    .where("workspaceSlug")
    .equals(workspaceSlug)
    .toArray()
}


/* =================================
   APPLY SERVER CHANGES
================================= */

export async function applyServerChanges(
  serverTasks: any[],
  workspaceSlug: string
){

  await db.transaction("rw", db.tasks, async () => {

    for (const raw of serverTasks) {

  const serverTask = {
    ...raw,
    id: raw._id.toString(), // ✅ normalize
  };

  const localTask = await db.tasks.get(serverTask.id);

  if (!localTask) {

    if (serverTask.status === "DELETED") continue;

    await db.tasks.put({
      id: serverTask.id,
      workspaceSlug, // ✅ FIX
      title: serverTask.title,
      description: serverTask.description,
      status: serverTask.status,
      priority: serverTask.priority,
      createdBy: serverTask.createdBy ?? "server",
      assignedTo: serverTask.assignedTo ?? undefined,
      createdAt: new Date(serverTask.createdAt).getTime(),
      updatedAt: new Date(serverTask.updatedAt).getTime(),
      synced: true
    });

    continue;
  }
}
  })
}