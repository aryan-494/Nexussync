import { Request, Response } from "express"
import { syncService } from "./sync.service"
import { PullSyncQuery } from "./sync.types"

export const pullSyncController = async (req: Request, res: Response) => {
  try {
    const { workspaceSlug, since, limit } = req.query as unknown as PullSyncQuery

    const userId = (req as any).user?.id

    const result = await syncService.pullChanges({
      workspaceSlug,
      since: Number(since),
      limit: Number(limit) || 50,
      userId
    })

    return res.json(result)

  } catch (error: any) {

    if (error.message === "WORKSPACE_NOT_FOUND") {
      return res.status(404).json({
        code: "WORKSPACE_NOT_FOUND"
      })
    }

    if (error.message === "WORKSPACE_ACCESS_DENIED") {
      return res.status(403).json({
        code: "WORKSPACE_ACCESS_DENIED"
      })
    }

    return res.status(500).json({
      code: "SYNC_PULL_FAILED"
    })
  }
}