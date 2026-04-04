
import { syncService } from "./sync.service"
import { PullSyncQuery } from "./sync.types"
import { Request, Response, NextFunction } from "express";



export async function pullSyncController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {

    const { workspaceSlug, since, limit } =
      req.query as unknown as PullSyncQuery;

    const userId = (req as any).context?.user?.id;

    if (!userId) {
      return res.status(401).json({
        code: "AUTH_REQUIRED",
      });
    }

    const result = await syncService.pullChanges({
      workspaceSlug,
      since: Number(since),
      limit: Number(limit),
      userId,
    });

    return res.json(result);

  } catch (err) {
    console.error(err);
    next(err); 
  }
}