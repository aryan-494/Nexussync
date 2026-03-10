import { db } from "../db"
import {
  createTask,
  updateTask,
  deleteTask
} from "../../api/task.api"
import { setSyncStatus } from "./syncState"



/* =================================
   Retry with exponential backoff
================================ */

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {

  let attempt = 0

  while (true) {

    try {
      return await fn()
    } catch (err) {

      if (attempt >= maxRetries) {
        throw err
      }

      const delay = Math.pow(2, attempt) * 1000

      await new Promise(resolve => setTimeout(resolve, delay))

      attempt++
    }
  }
}



/* =================================
   Multi-tab sync protection
================================ */

const channel = new BroadcastChannel("nexussync-sync")

let isLeader = true
let isRunning = false

channel.onmessage = (event) => {

  if (event.data === "SYNC_LEADER") {
    isLeader = false
  }

}

function announceLeader() {
  channel.postMessage("SYNC_LEADER")
}



/* =================================
   Network state
================================ */

function isOnline() {
  return navigator.onLine
}



/* =================================
   Fetch unsynced operations
   (batch of 10 ordered by seq)
================================ */

async function getPendingOperations(limit = 10) {

  const ops = await db.opLog
    .where("synced")
    .equals(false)
    .sortBy("seq")

  return ops.slice(0, limit)

}



/* =================================
   Send operation to backend
================================ */

async function processOperation(op: any) {

  switch (op.type) {

    case "TASK_CREATE":

      await retryWithBackoff(() =>
        createTask(op.workspaceSlug, op.payload)
      )

      break


    case "TASK_UPDATE":

      await retryWithBackoff(() =>
        updateTask(op.workspaceSlug, op.entityId, op.payload)
      )

      break


    case "TASK_DELETE":

      await retryWithBackoff(() =>
        deleteTask(op.workspaceSlug, op.entityId)
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
   Process operation batch
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

  if (!isLeader) return

  if (isRunning) return

  if (!isOnline()) return

  isRunning = true
 setSyncStatus("syncing")

try {

  await processQueue()

  setSyncStatus("idle")

} catch (err) {

  setSyncStatus("error")
  throw err

} finally {

  isRunning = false

}

}



/* =================================
   Start sync engine
================================ */

export async function startSyncEngine() {

    await db.open()

  announceLeader()

  setInterval(runSyncEngine, 5000)

  window.addEventListener("online", runSyncEngine)

}