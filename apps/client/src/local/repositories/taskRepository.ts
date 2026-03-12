import { db } from "../db"
import { v4 as uuid } from "uuid"

import {
  createTaskOperation,
  updateTaskOperation,
  deleteTaskOperation
} from "../types/operationBuilders"

import type { TaskCreatePayload, TaskUpdatePayload } from "../types/operations"



/* =================================
   HELPER: find pending update
================================= */

async function findPendingUpdate(taskId: string) {

  return db.opLog
    .where("entityId")
    .equals(taskId)
    .and(op => op.type === "TASK_UPDATE" && !op.synced)
    .first()

}



/* =================================
   CREATE TASK LOCAL
================================= */

export async function createTaskLocal(
  workspaceSlug: string,
  payload: Omit<TaskCreatePayload, "id">
) {

  const taskId = uuid()

  const now = new Date().toISOString()

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

  const now = new Date().toISOString()

  await db.transaction("rw", db.tasks, db.opLog, async () => {

    await db.tasks.update(taskId, {
      ...payload,
      updatedAt: now,
      synced: false
    })

    const existingOp = await findPendingUpdate(taskId)

    if (existingOp) {

      const mergedPayload = {
        ...existingOp.payload,
        ...payload
      }

      await db.opLog.update(existingOp.seq!, {
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