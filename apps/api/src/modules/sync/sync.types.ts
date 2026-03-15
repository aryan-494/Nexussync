export interface PullSyncQuery {
  workspaceSlug: string
  since: number
  limit: number
}

export interface PullSyncParams {
  workspaceSlug: string
  since: number
  limit: number
  userId: string
}

export interface PullTasksResponse<T> {
  tasks: T[]
  serverTime: number
}