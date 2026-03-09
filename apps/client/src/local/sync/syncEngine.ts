import { db } from "../db"
import { OperationType } from "../types/operations"

import {
  createTask,
  updateTask,
  deleteTask
} from "../../api/task.api"

let isRunning = false


function isOnline() {
  return navigator.onLine
}


/* =================================
   Fetch unsynced operations
================================ */

async function getPendingOperations(limit = 10) {

  return db.opLog
    .where("synced")
    .equals(false)
    .limit(limit)
    .toArray()

}


/* =================================
   Send operation to backend
================================ */

async function processOperation(op: any) {

  switch (op.type) {

    case "TASK_CREATE":

      await createTask(
        op.workspaceSlug,
        op.payload
      )

      break


    case "TASK_UPDATE":

      await updateTask(
        op.workspaceSlug,
        op.entityId,
        op.payload
      )

      break


    case "TASK_DELETE":

      await deleteTask(
        op.workspaceSlug,
        op.entityId
      )

      break

  }

}


/* =================================
   Mark operation synced
================================ */

async function markSynced(op: any) {

  await db.opLog.update(op.seq, {
    synced: true
  })

  await db.tasks.update(op.entityId, {
    synced: true
  })

}


/* =================================
   Process queue
================================ */

async function processQueue() {

  const operations = await getPendingOperations()

  if (!operations.length) return

  for (const op of operations) {

    try {

      await processOperation(op)

      await markSynced(op)

    } catch (err) {

      console.error("Sync failed", err)

      break

    }

  }

}


/* =================================
   Sync engine runner
================================ */

export async function runSyncEngine() {

  if (isRunning) return

  if (!isOnline()) return

  isRunning = true

  try {

    await processQueue()

  } finally {

    isRunning = false

  }

}


/* =================================
   Start engine
================================ */

export function startSyncEngine() {

  setInterval(runSyncEngine, 5000)

  window.addEventListener("online", runSyncEngine)

}

