import { db } from "../db"

import {
  createTask,
  updateTask,
  deleteTask
} from "../../api/task.api"

import { setSyncStatus } from "./syncState"
import * as taskRepository from "../repositories/taskRepository"
import { syncMetaRepo } from "./syncMetaRepo"
const API_BASE = "/api/v1"




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

      await new Promise(resolve =>
        setTimeout(resolve, delay)
      )

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
   Fetch pending operations
================================ */

async function getPendingOperations(limit = 10) {

  const ops = await db.opLog.toArray()

  const pending = ops
    .filter(op => !op.synced && !op.failed)
    .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))

  return pending.slice(0, limit)

}



/* =================================
   Send operation to backend
================================ */

async function processOperation(op: any) {

  switch (op.type) {

    case "TASK_CREATE": {

      const serverTask = await retryWithBackoff(() =>
        createTask(op.workspaceSlug, op.payload)
      )

      await db.tasks.put({
        id: serverTask.id,
        workspaceSlug: op.workspaceSlug,
        title: serverTask.title,
        description: serverTask.description,
        status: serverTask.status,
        priority: serverTask.priority,
        createdBy: "server",
        assignedTo: serverTask.assignedTo ?? undefined,
        createdAt: Number(serverTask.createdAt),
        updatedAt: Number(serverTask.updatedAt),
        synced: true
      })

      break
    }


    case "TASK_UPDATE": {

      const serverTask = await retryWithBackoff(() =>
        updateTask(op.workspaceSlug, op.entityId, op.payload)
      )

      await db.tasks.put({
        id: serverTask.id,
        workspaceSlug: op.workspaceSlug,
        title: serverTask.title,
        description: serverTask.description,
        status: serverTask.status,
        priority: serverTask.priority,
        createdBy: "server",
        assignedTo: serverTask.assignedTo ?? undefined,
        createdAt: Number(serverTask.createdAt),
        updatedAt: Number(serverTask.updatedAt),
        synced: true
      })

      break
    }


    case "TASK_DELETE": {

      await retryWithBackoff(() =>
        deleteTask(op.workspaceSlug, op.entityId)
      )

      await db.tasks.delete(op.entityId)

      break
    }

  }

}
/* =================================
   Mark operation synced
================================ */

async function markSynced(op: any) {

  await db.opLog.update(op.seq!, {
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

      // process one operation per cycle
      break

    } catch (err: any) {

      console.error("Sync failed", err)

      const status =
        err?.status ??
        err?.response?.status

      if (status === 404 && op.type === "TASK_DELETE") {

  await db.tasks.delete(op.entityId)

  await db.opLog.update(op.seq!, {
    synced: true
  })

  continue
}

      break
    }

  }

}



/* =================================
   Cleanup old operations
================================ */

async function cleanupOperations() {

  const ops = await db.opLog.toArray()

  const oldOps = ops.filter(op => op.synced === true)

  if (oldOps.length < 100) return

  const ids: number[] = oldOps
    .slice(0, oldOps.length - 50)
    .map(op => op.seq!)
    .filter((id): id is number => id !== undefined)

  await db.opLog.bulkDelete(ids)

}



export async function pullServerChanges(workspaceSlug: string) {
  try {
    let hasMore = true
    const limit = 50

    while (hasMore) {
      // 1️⃣ Get cursor
      const since = await syncMetaRepo.getLastPulledAt()

      // 2️⃣ Call API
      const res = await fetch(
        `${API_BASE}/sync/pull?workspaceSlug=${workspaceSlug}&since=${since}&limit=${limit}`,
        {
          credentials: "include"
        }
      )

      if (!res.ok) {
        throw new Error("SYNC_PULL_FAILED")
      }

      const data = await res.json()

      const { tasks, serverTime } = data

      // 3️⃣ Merge changes
      await taskRepository.applyServerChanges(tasks)

      // 4️⃣ Update cursor
      await syncMetaRepo.setLastPulledAt(serverTime)

      // 5️⃣ Pagination check
      hasMore = tasks.length === limit
    }

  } catch (error) {
    console.error("Pull sync failed:", error)
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

    await cleanupOperations()

    setSyncStatus("idle")

  } catch (err) {

    console.error("Sync engine crashed", err)

    setSyncStatus("error")

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

  window.addEventListener(
    "online",
    runSyncEngine
  )

}