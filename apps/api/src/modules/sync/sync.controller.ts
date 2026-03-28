import { Request, Response } from "express"
import { syncService } from "./sync.service"
import { PullSyncQuery } from "./sync.types"

export async function pullSyncController(
  req: Request<{}, {}, {}, PullSyncQuery>,
  res: Response
) {
  try {

    const workspaceSlug = req.query.workspaceSlug as string
    const since = Number(req.query.since)
    const limit = Number(req.query.limit)

    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        code: "AUTH_REQUIRED"
      })
    }

    const result = await syncService.pullChanges({
      workspaceSlug,
      since,
      limit,
      userId
    })

    return res.json(result)

  } catch (err) {

    console.error(err)

    return res.status(500).json({
      code: "SYNC_PULL_FAILED"
    })
  }
}