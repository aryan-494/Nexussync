import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../db"

export function useTasksLocal(workspaceSlug: string) {

  const tasks = useLiveQuery(async () => {

    if (!workspaceSlug) return []

    const all = await db.tasks
      .where("workspaceSlug")
      .equals(workspaceSlug)
      .toArray()

    return all.filter(task => task.status !== "DELETED")

  }, [workspaceSlug])

  return tasks ?? []
}