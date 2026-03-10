import { useEffect, useState } from "react";
import { getTasks, createTask } from "../../api/task.api";
import type { Task } from "../../api/task.api";
import type { AppError } from "../../api/http";
import {deleteTaskLocal} from "../../local/repositories/taskRepository"

export function useTasks(slug: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
 const [error, setError] = useState<AppError | null>(null);
  const totalPages = Math.ceil(total / limit);

  async function loadTasks(pageNumber: number) {
  try {

    setLoading(true);
    setError(null);

    const data = await getTasks(slug, pageNumber, limit);

    setTasks(data.tasks);
    setPage(data.page);
    setTotal(data.total);

  } catch (err) {

    const e = err as AppError;
    setError(e);

  } finally {
    setLoading(false);
  }
}
async function handleCreate(
  title: string,
  description?: string,
  priority?: string
) {

  try {

    await createTask(slug, {
      title,
      description,
      priority
    });

    await loadTasks(page);

  } catch (err) {

    const error = err as AppError;
    setError(error);

  }
}
async function handleDelete(id: string) {

  if (!slug) return

  await deleteTaskLocal(slug, id)

}

  useEffect(() => {
    loadTasks(1);
  }, [slug]);

 return {
  tasks,
  page,
  setPage,
  total,
  limit,
  loading,
  error,
  loadTasks,
  handleCreate,
  handleDelete,
};
}