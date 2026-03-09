import { db } from "../db"
import { OperationType } from "../types/operations"


// fetch all the operation which are not synced and fetch in order

async function getNextOperation(){

    return db.opLog
    .where("synced").equals(false).sortBy("seq").then(list=>list[0]);

}

async function sendOperation(op: any) {

  switch (op.type) {

    case OperationType.TASK_CREATE:

      await fetch(`/api/v1/tasks/${op.workspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(op.payload)
      })

      break


    case OperationType.TASK_UPDATE:

      await fetch(`/api/v1/tasks/${op.workspaceId}/${op.entityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(op.payload)
      })

      break


    case OperationType.TASK_DELETE:

      await fetch(`/api/v1/tasks/${op.workspaceId}/${op.entityId}`, {
        method: "DELETE"
      })

      break

  }

}


// after successfull sending mark the operation synced 
async function markSynced(op: any) {

  await db.opLog.update(op.seq, {
    synced: true
  })

  await db.tasks.update(op.entityId, {
    synced: true
  })

}


// Now create Sync loop 

export async function runSyncEngine() {

  const op = await getNextOperation()

  if (!op) return

  try {

    await sendOperation(op)

    await markSynced(op)

  } catch (err) {

    console.error("Sync failed", err)

  }

}

// Run sync Engine in every few second

export function startSyncEngine() {

  setInterval(() => {

    runSyncEngine()

  }, 5000)

}