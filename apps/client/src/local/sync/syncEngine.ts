import { db } from "../db"

import {
  createTask,
  updateTask,
  deleteTask
} from "../../api/task.api"

import { setSyncStatus } from "./syncState"
import * as taskRepository from "../repositories/taskRepository"
import { syncMetaRepo } from "./syncMetaRepo"
const API_BASE = "http://localhost:3000/api/v1"

/* =================================
   Retry with exponential backoff
================================ */

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    shouldRetry?: (err: any) => boolean;
  }
): Promise<T> {

  const maxRetries = options?.maxRetries ?? 5;

  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (err: any) {

      const shouldRetry =
        options?.shouldRetry?.(err) ??
        (!err.response || err.response.status >= 500);

      if (!shouldRetry) {
        throw err; // ❌ permanent failure
      }

      if (attempt >= maxRetries) {
        throw err;
      }

      const delay = [1000, 2000, 5000, 10000, 30000][
        Math.min(attempt, 4)
      ];

      await new Promise((resolve) => setTimeout(resolve, delay));

      attempt++;
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

  const ops = await db.opLog
    .toArray()

  return ops
    .filter(op => !op.synced && !op.failed)
    .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
    .slice(0, limit)
}

/* =================================
   Send operation to backend
================================ */

async function processOperation(op: any) {
   console.log("PROCESSING OP:", op.opId)

  try {

    switch (op.type) {

      case "TASK_CREATE": {

        const serverTask = await createTask(
          op.workspaceSlug,
          op.payload
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
          createdAt: new Date(serverTask.createdAt).getTime(),
          updatedAt: new Date(serverTask.updatedAt).getTime(),
          synced: true
        })

        break
      }

      case "TASK_UPDATE": {

        const serverTask = await updateTask(
          op.workspaceSlug,
          op.entityId,
          op.payload
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
          createdAt: new Date(serverTask.createdAt).getTime(),
          updatedAt: new Date(serverTask.updatedAt).getTime(),
          synced: true
        })

        break
      }

      case "TASK_DELETE": {

        await deleteTask(
          op.workspaceSlug,
          op.entityId
        )

        await db.tasks.delete(op.entityId)

        break
      }
    }

  } catch (err: any) {

    // 🔥 CRITICAL FIX: normalize network errors
    if (!err || typeof err !== "object") {
      throw { status: 0, message: "Unknown error" }
    }

    if (!("status" in err)) {
      err.status = 0 // network / fetch error
    }

    console.log("processOperation error:", err)

    throw err
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

      break // process one per cycle (good for stability)

    } catch (err: any) {

  const status = 0

  const isRetryable = !status || status >= 500

  // ❌ permanent failure
  if (!isRetryable) {

    await db.opLog.update(op.seq!, {
      failed: true
    })

    return
  }

  const retryCount = (op.retryCount ?? 0) + 1

  if (retryCount > 5) {

    await db.opLog.update(op.seq!, {
      failed: true
    })

    return
  }

 await db.opLog.update(op.seq!, {
  retryCount,
  lastTriedAt: Date.now()
})

console.log("Retry:", op.opId, "count:", retryCount)

// 🔥 ADD THIS LINE (EXACT PLACE)
await new Promise(res => setTimeout(res, 1000))

return
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

/* =================================
   Pull sync
================================ */
let isPulling = false;
export async function pullServerChanges(workspaceSlug: string) {
  if (!workspaceSlug) return;

  if (isPulling) return; // ✅ prevent duplicate sync
  isPulling = true;

  try {
    let hasMore = true;
    const limit = 50;

    while (hasMore) {
      const since = await syncMetaRepo.getLastPulledAt();
      console.log("Pulling changes since:", since);

      const res = await fetch(
        `${API_BASE}/sync/pull?workspaceSlug=${workspaceSlug}&since=${since}&limit=${limit}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("SYNC_PULL_FAILED");

      const { tasks, serverTime } = await res.json();

      await taskRepository.applyServerChanges(tasks,workspaceSlug);

      await syncMetaRepo.setLastPulledAt(serverTime);
      console.log("Saving since:", serverTime);

      hasMore = tasks.length === limit;
    }

  } catch (error) {
    console.error("Pull sync failed:", error);
  } finally {
    isPulling = false; // ✅ release lock
  }
}
/* =================================
   Sync engine runner
================================ */

export async function runSyncEngine(workspaceSlug: string) {
     if (!workspaceSlug) return 
  if (!isLeader) return
  
  if (isRunning) return
  if (!isOnline()) return

  isRunning = true
  console.log("SYNC ENGINE RUNNING")
  setSyncStatus("syncing")

  try {

    await processQueue()

    await pullServerChanges(workspaceSlug) // ✅ FIX (VERY IMPORTANT)

    await cleanupOperations()

    setSyncStatus("idle")

  }catch (err) {

    console.error("Sync engine crashed", err)
    setSyncStatus("error")

  } finally {

    isRunning = false
  }
}

/* =================================
   Start sync engine
================================ */

let syncInterval: any = null

export async function startSyncEngine(workspaceSlug: string) {

  await db.open()

  announceLeader()

  if (syncInterval) return // ✅ prevent duplicate intervals

  syncInterval = setInterval(async () => {
    await runSyncEngine(workspaceSlug)
  }, 5000)

  window.addEventListener("online", () => {
    runSyncEngine(workspaceSlug)
  })
}

export function stopSyncEngine() {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}