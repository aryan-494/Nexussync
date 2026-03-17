import { ObjectId } from "bson"

import {
  OperationType,
  type TaskCreateOperation,
  type TaskCreatePayload,
  type TaskUpdateOperation,
  type TaskUpdatePayload,
  type TaskDeleteOperation,
  type TaskDeletePayload
} from "./operations"

/* =================================
   CREATE TASK OPERATION
================================= */

export function createTaskOperation(
  workspaceSlug: string,
  payload: TaskCreatePayload
): TaskCreateOperation {

  return {
    opId: new ObjectId().toHexString(),

    type: OperationType.TASK_CREATE,

    entityId: payload.id,

    workspaceSlug,

    payload,

    createdAt: Date.now(), // ✅ FIXED

    synced: false,
  }
}


/* =================================
   UPDATE TASK OPERATION
================================= */

export function updateTaskOperation(
  workspaceSlug: string,
  taskId: string,
  payload: TaskUpdatePayload
): TaskUpdateOperation {

  return {
    opId: new ObjectId().toHexString(),

    type: OperationType.TASK_UPDATE,

    entityId: taskId,

    workspaceSlug,

    payload,

    createdAt: Date.now(), // ✅ FIXED

    synced: false,
  }
}


/* =================================
   DELETE TASK OPERATION
================================= */

export function deleteTaskOperation(
  workspaceSlug: string,
  taskId: string
): TaskDeleteOperation {

  const payload: TaskDeletePayload = {
    id: taskId
  }

  return {
    opId: new ObjectId().toHexString(),

    type: OperationType.TASK_DELETE,

    entityId: taskId,

    workspaceSlug,

    payload,

    createdAt: Date.now(), // ✅ FIXED (was wrong: new Date.now())

    synced: false,
  }
}