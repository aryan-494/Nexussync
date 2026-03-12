import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../db"


export function useTasksLocal(workspaceSlug: string) {

  const tasks = useLiveQuery(async () => {

    if (!workspaceSlug) return []

    return db.tasks
      .where("workspaceSlug")
      .equals(workspaceSlug)
      .toArray()

  }, [workspaceSlug])


  return tasks ?? []

}