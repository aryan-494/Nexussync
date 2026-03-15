import { PullSyncParams, PullTasksResponse } from "./sync.types"
import { TaskModel } from "../../db/models/task.model"
import { WorkspaceModel } from "../../db/models/workspace.model"

class SyncService {

  async pullChanges(
    params: PullSyncParams
  ): Promise<PullTasksResponse<any>> {

    const { workspaceSlug, since, limit, userId } = params

    const workspace = await WorkspaceModel.findOne({
      slug: workspaceSlug
    })

    if (!workspace) {
      throw new Error("WORKSPACE_NOT_FOUND")
    }

    if (!workspace.members.includes(userId)) {
      throw new Error("WORKSPACE_ACCESS_DENIED")
    }

    const tasks = await TaskModel
      .find({
        workspaceId: workspace._id,
        updatedAt: { $gt: new Date(since) }
      })
      .sort({ updatedAt: 1 })
      .limit(limit)
      .lean()

    const serverTime = Date.now()

    return {
      tasks,
      serverTime
    }
  }

}

export const syncService = new SyncService()