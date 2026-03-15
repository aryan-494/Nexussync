import { Request, Response } from "express"
import { syncService } from "./sync.service"

export const pullSyncController = async (req: Request, res: Response) => {
  try {
    const result = await syncService.pullChanges()

    return res.json(result)
  } catch (error) {
    return res.status(500).json({
      message: "SYNC_PULL_FAILED"
    })
  }
}