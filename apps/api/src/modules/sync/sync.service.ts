import { PullSyncParams, PullTasksResponse } from "./sync.types"
import { TaskModel } from "../../db/models/task.model"
import { WorkspaceModel } from "../../db/models/workspace.model"

class SyncService {

  async pullChanges(params: PullSyncParams) {
  try {

    const { workspaceSlug, since, limit, userId } = params

    console.log("SYNC INPUT:", { workspaceSlug, since, limit, userId })

    const workspace = await WorkspaceModel.findOne({
      slug: workspaceSlug
    })

    console.log("WORKSPACE:", workspace)

    if (!workspace) {
      throw new Error("WORKSPACE_NOT_FOUND")
    }

    const members = (workspace as any).members as any[]

const isMember = members.some((m) => {
  if (!m) return false

  if (typeof m === "string") return m === userId

  if (m.userId) return m.userId.toString() === userId

  return m.toString() === userId
})

if (!isMember) {
  throw new Error("WORKSPACE_ACCESS_DENIED")
}

    const tasks = await TaskModel.find({
      workspaceSlug: workspaceSlug,
      updatedAt: { $gt: since }
    })
      .sort({ updatedAt: 1 })
      .limit(limit)
      .lean()

    console.log("TASKS:", tasks)

    return {
      tasks,
      serverTime: Date.now()
    }

  } catch (err) {
    console.error("SYNC SERVICE ERROR:", err)
    throw err
  }
}
}
export const syncService = new SyncService()