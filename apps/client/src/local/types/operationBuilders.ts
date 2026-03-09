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
  workspaceSlug: string,
  payload: TaskCreatePayload
): TaskCreateOperation {

  return {
    opId: uuid(),

    type: OperationType.TASK_CREATE,

    entityId: payload.id,

    workspaceSlug,

    payload,

    createdAt: new Date().toISOString(),

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
    opId: uuid(),

    type: OperationType.TASK_UPDATE,

    entityId: taskId,

    workspaceSlug,

    payload,

    createdAt: new Date().toISOString(),

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
    opId: uuid(),

    type: OperationType.TASK_DELETE,

    entityId: taskId,

    workspaceSlug,

    payload,

    createdAt: new Date().toISOString(),

    synced: false,
  }
}