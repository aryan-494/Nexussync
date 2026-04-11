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
   HELPERS
================================= */

// 🔥 ensure retry system works
function withDefaults(op: any) {
  return {
    ...op,
    synced: false,
    failed: false,
    retryCount: 0,
    lastTriedAt: 0,
  }
}

// 🔥 clean duplicate / redundant ops
async function clearPendingOps(taskId: string) {
  const existing = await db.opLog
    .where("entityId")
    .equals(taskId)
    .and(op => !op.synced)
    .toArray()

  if (existing.length > 0) {
    await db.opLog.bulkDelete(existing.map(op => op.seq!))
  }
}

// existing helper (kept)
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
  const now = Date.now()

  const task = {
    id: taskId,
    workspaceSlug,
    ...payload,
    status: "TODO",
    createdBy: "me",
    createdAt: now,
    updatedAt: now,
    synced: false
  }

  const operation = createTaskOperation(workspaceSlug, {
    id: taskId,
    ...payload
  })

  await db.transaction("rw", db.tasks, db.opLog, async () => {

    await db.tasks.add(task)

    await db.opLog.add(
      withDefaults(operation) // ✅ FIX
    )
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
  const now = Date.now()

  await db.transaction("rw", db.tasks, db.opLog, async () => {

    await db.tasks.update(taskId, {
      ...payload,
      updatedAt: now,
      synced: false
    })

    const existingOp = await findPendingUpdate(taskId)

    if (existingOp && existingOp.seq !== undefined) {

      const mergedPayload = {
        ...existingOp.payload,
        ...payload,
        updatedAt: now // 🔥 FIX
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

      await db.opLog.add(
        withDefaults(operation) // ✅ FIX
      )
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

    // 🔥 CRITICAL FIX — remove old ops
    await clearPendingOps(taskId)

    await db.opLog.add(
      withDefaults(operation) // ✅ FIX
    )
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
) {

  await db.transaction("rw", db.tasks, async () => {

    for (const raw of serverTasks) {

      const serverTask = {
        ...raw,
        id: raw._id.toString(),
      }

      const localTask = await db.tasks.get(serverTask.id)

      if (!localTask) {

        if (serverTask.status === "DELETED") continue

        await db.tasks.put({
          id: serverTask.id,
          workspaceSlug,
          title: serverTask.title,
          description: serverTask.description,
          status: serverTask.status,
          priority: serverTask.priority,
          createdBy: serverTask.createdBy ?? "server",
          assignedTo: serverTask.assignedTo ?? undefined,
          createdAt: new Date(serverTask.createdAt).getTime(),
          updatedAt: new Date(serverTask.updatedAt).getTime(),
          synced: true
        })

        continue
      }
    }
  })
}