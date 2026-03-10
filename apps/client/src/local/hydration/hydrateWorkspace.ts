import { db } from "../db"
import { getTasks } from "../../api/task.api"


/* =================================
   Hydrate workspace tasks
================================ */

export async function hydrateWorkspace(
  workspaceSlug: string
) {

  try {

    const response = await getTasks(workspaceSlug, 1, 100)

    const tasks = response.tasks

    if (!tasks.length) return


    await db.transaction("rw", db.tasks, async () => {

      for (const task of tasks) {

        await db.tasks.put({
          id: task.id,
          workspaceSlug,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          createdBy: "server",
          assignedTo: task.assignedTo ?? undefined,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          synced: true
        })

      }

    })

  } catch (err) {

    console.error("Workspace hydration failed", err)

  }

}