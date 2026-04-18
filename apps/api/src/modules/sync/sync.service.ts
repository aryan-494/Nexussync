import { PullSyncParams, PullTasksResponse } from "./sync.types.js"
import { TaskModel } from "../../db/models/task.model.js"
import { WorkspaceModel } from "../../db/models/workspace.model.js"
import { WorkspaceMemberModel } from "../../db/models/workspaceMember.model.js"
import { HttpError } from "../../errors.js"
import mongoose from "mongoose"

class SyncService {
  async pullChanges(
    params: PullSyncParams
  ): Promise<PullTasksResponse<any>> {
    try {
      const { workspaceSlug, since, limit, userId } = params

      const workspace = await WorkspaceModel.findOne({
        slug: workspaceSlug,
      })

      if (!workspace) {
        throw new HttpError(
          "Workspace not found",
          404,
          "WORKSPACE_NOT_FOUND"
        )
      }

      // 🔥 FORCE CLEAN OBJECTID (no inference issues)
      const workspaceId = new mongoose.Types.ObjectId(
        workspace._id.toString()
      )

      // 🔥 FORCE SIMPLE QUERY (NO TYPE GENERICS)
      const membership = await WorkspaceMemberModel.findOne({
        workspaceId: workspaceId,
        userId: userId,
      } as Record<string, unknown>)

      if (!membership) {
        throw new HttpError(
          "Access denied to workspace",
          403,
          "WORKSPACE_ACCESS_DENIED"
        )
      }

      // 🔥 SAME FIX HERE
      const tasks = await TaskModel.find({
        workspaceId: workspaceId,
        updatedAt: { $gte: new Date(since) },
      } as Record<string, unknown>)
        .sort({ updatedAt: 1 })
        .limit(limit)
        .lean()

      return {
        tasks,
        serverTime: Date.now(),
      }
    } catch (err) {
      throw err
    }
  }
}

export const syncService = new SyncService()