import { useEffect, useState } from "react";
import {
  getTasks,
  createTask,
  deleteTask,
  Task,
} from "../../api/task.api";
import type { AppError } from "../../api/http";

export function useTasks(slug: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const totalPages = Math.ceil(total / limit);

  async function loadTasks(currentPage = page) {
    try {
      setLoading(true);
      setError(null);

      const data = await getTasks(slug, currentPage, limit);

      setTasks(data.tasks);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      setError(err as AppError);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(title: string) {
    await createTask(slug, { title });
    await loadTasks(1);
  }

  async function handleDelete(taskId: string) {
    await deleteTask(slug, taskId);
    await loadTasks(page);
  }

  useEffect(() => {
    loadTasks(1);
  }, [slug]);

  return {
    tasks,
    page,
    totalPages,
    loading,
    error,
    setPage,
    loadTasks,
    handleCreate,
    handleDelete,
  };
}