import { db } from "../db"

import { v4 as uuid } from "uuid"

import {
  createTaskOperation,
  updateTaskOperation,
  deleteTaskOperation
} from "../types/operationBuilders"

import { TaskCreatePayload, TaskUpdatePayload } from "../types/operations"



export async function createTaskLocal(
    workspaceId: string,
    payload: Omit<TaskCreatePayload , "id">  // Omit = remove property from type  id is removed from the payload 

    
){
    const taskId = uuid()

    const now = new Date().toISOString()

    // create task locally 

    const task = {
        id:taskId,
        workspaceId,
        ...payload,
        status:"TODO",
        createdBy:"me",
        createdAt:now,
        upadtedAt:now,
        synced: false
    }

    const operation = createTaskOperation(workspaceId , {
        id:taskId,
        ...payload
    })


    // creaitng transction means -> This ensures both writes happen together. task table an doplog table
    await db.transaction("rw" , db.tasks, db.opLog , async ()=>{
        await db.tasks.add(task)
        await db.opLog.add(operation)
    })

    return task


}



export async function updateTaskLocal(
  workspaceId: string,
  taskId: string,
  payload: TaskUpdatePayload
) {

  const now = new Date().toISOString()

  const operation = updateTaskOperation(
    workspaceId,
    taskId,
    payload
  )

  await db.transaction("rw", db.tasks, db.opLog, async () => {

    await db.tasks.update(taskId, {
      ...payload,
      updatedAt: now,
      synced: false
    })

    await db.opLog.add(operation)

  })
}


export async function deleteTaskLocal(
  workspaceId: string,
  taskId: string
) {

  const operation = deleteTaskOperation(workspaceId, taskId)

  await db.transaction("rw", db.tasks, db.opLog, async () => {

    await db.tasks.update(taskId, {
      status: "DELETED",
      synced: false
    })

    await db.opLog.add(operation)

  })
}



// Ui will read the task from the indexdDb only 

export async function getTasksLocal(workspaceId: string) {

  return db.tasks
    .where("workspaceId")
    .equals(workspaceId)
    .toArray()

}