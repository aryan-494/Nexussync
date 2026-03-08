import { v4 as uuid } from "uuid"

import {
  OperationType,
  TaskCreateOperation,
  TaskCreatePayload,
  TaskUpdateOperation,
  TaskUpdatePayload,
  TaskDeleteOperation,
  TaskDeletePayload
} from "./operations"


/* =================================
   CREATE TASK OPERATION
================================= */

export function createTaskOperation(
  workspaceId: string,
  payload: TaskCreatePayload
): TaskCreateOperation {

  return {
    opId: uuid(),

    type: OperationType.TASK_CREATE,

    entityId: payload.id,

    workspaceId,

    payload,

    createdAt: new Date().toISOString(),

    synced: false,
  }
}


/* =================================
   UPDATE TASK OPERATION
================================= */

export function updateTaskOperation(
  workspaceId: string,
  taskId: string,
  payload: TaskUpdatePayload
): TaskUpdateOperation {

  return {
    opId: uuid(),

    type: OperationType.TASK_UPDATE,

    entityId: taskId,

    workspaceId,

    payload,

    createdAt: new Date().toISOString(),

    synced: false,
  }
}


/* =================================
   DELETE TASK OPERATION
================================= */

export function deleteTaskOperation(
  workspaceId: string,
  taskId: string
): TaskDeleteOperation {

  const payload: TaskDeletePayload = {
    id: taskId
  }

  return {
    opId: uuid(),

    type: OperationType.TASK_DELETE,

    entityId: taskId,

    workspaceId,

    payload,

    createdAt: new Date().toISOString(),

    synced: false,
  }
}