export enum OperationType {
  TASK_CREATE = "TASK_CREATE",
  TASK_UPDATE = "TASK_UPDATE",
  TASK_DELETE = "TASK_DELETE",
}

export interface BaseOperation {
  opId: string
  type: OperationType
  entityId: string
 workspaceSlug: string
  payload: unknown
  createdAt: string
  synced: boolean
  failed?: boolean
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
  type: OperationType.TASK_CREATE
  payload: TaskCreatePayload
}

export interface TaskUpdateOperation extends BaseOperation {
  type: OperationType.TASK_UPDATE
  payload: TaskUpdatePayload
}

export interface TaskDeleteOperation extends BaseOperation {
  type: OperationType.TASK_DELETE
  payload: TaskDeletePayload
}

export type Operation =
  | TaskCreateOperation
  | TaskUpdateOperation
  | TaskDeleteOperation