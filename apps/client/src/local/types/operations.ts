export const OperationType = {
  TASK_CREATE: "TASK_CREATE",
  TASK_UPDATE: "TASK_UPDATE",
  TASK_DELETE: "TASK_DELETE",
} as const;

export type OperationTypeValue =
  (typeof OperationType)[keyof typeof OperationType];
export interface BaseOperation {
  opId: string
  type: OperationTypeValue
  entityId: string
 workspaceSlug: string
  payload: unknown
  createdAt: number
  synced: boolean
  failed: boolean
  

  retryCount: number
  lastTriedAt: number
}

export interface TaskCreatePayload {
  id: string
  title: string
  description?: string
  priority?: string
  status?: string
  assignedTo?: string
}

export interface TaskUpdatePayload {
  title?: string
  description?: string
  status?: string
  priority?: string
  assignedTo?: string
}

export interface TaskDeletePayload {
  id: string
}

export interface TaskCreateOperation extends BaseOperation {
  type: typeof OperationType.TASK_CREATE
  payload: TaskCreatePayload
}

export interface TaskUpdateOperation extends BaseOperation {
  type: typeof OperationType.TASK_UPDATE
  payload: TaskUpdatePayload
}

export interface TaskDeleteOperation extends BaseOperation {
  type: typeof OperationType.TASK_DELETE
  payload: TaskDeletePayload
}

export type Operation =
  | TaskCreateOperation
  | TaskUpdateOperation
  | TaskDeleteOperation