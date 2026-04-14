import { PullSyncParams, PullTasksResponse } from "./sync.types.js"
import { TaskModel } from "../../db/models/task.model.js"
import { WorkspaceModel } from "../../db/models/workspace.model.js"
import { WorkspaceMemberModel } from "../../db/models/workspaceMember.model.js"
import { HttpError } from "../../errors.js"

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
      throw new HttpError(
        "Workspace not found",
        404,
        "WORKSPACE_NOT_FOUND"
      )
    }

    const membership = await WorkspaceMemberModel.findOne({
      workspaceId: workspace._id,
      userId: userId
    })

    if (!membership) {
      throw new HttpError(
        "Access denied to workspace",
        403,
        "WORKSPACE_ACCESS_DENIED"
      )
    }

    const tasks = await TaskModel.find({
      workspaceId: workspace._id,
      updatedAt: { $gte: new Date(since) }
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