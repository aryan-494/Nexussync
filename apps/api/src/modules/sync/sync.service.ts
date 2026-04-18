import { PullSyncParams, PullTasksResponse } from "./sync.types.js"
import { TaskModel } from "../../db/models/task.model.js"
import { WorkspaceModel } from "../../db/models/workspace.model.js"
import { WorkspaceMemberModel } from "../../db/models/workspaceMember.model.js"
import { HttpError } from "../../errors.js"

class SyncService {

  async pullChanges(params: PullSyncParams): Promise<PullTasksResponse<any>> {
    try {
      const { workspaceSlug, since, limit, userId } = params

      const workspace = await WorkspaceModel.findOne({
        slug: workspaceSlug
      })

      if (!workspace) {
        throw new HttpError(
          "Workspace not found",
          404,
          "WORKSPACE_NOT_FOUND"
        )
      }

      // ✅ correct (no conversion needed)
      const workspaceId = workspace._id

      const membership = await WorkspaceMemberModel.findOne({
        workspaceId: workspaceId,
        userId: String(userId)
      })

      if (!membership) {
        throw new HttpError(
          "Access denied to workspace",
          403,
          "WORKSPACE_ACCESS_DENIED"
        )
      }

      const tasks = await TaskModel.find({
        workspaceId: workspaceId, // ✅ now perfectly typed
        updatedAt: { $gte: new Date(since) }
      })
        .sort({ updatedAt: 1 })
        .limit(limit)
        .lean()

      return {
        tasks,
        serverTime: Date.now()
      }

    } catch (err) {
      throw err
    }
  }
}

export const syncService = new SyncService()