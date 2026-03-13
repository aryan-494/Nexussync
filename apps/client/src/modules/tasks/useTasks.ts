import { useEffect, useState } from "react";
import { getTasks } from "../../api/task.api";
import type { Task } from "../../api/task.api";
import type { AppError } from "../../api/http";

import {
  createTaskLocal,
  deleteTaskLocal
} from "../../local/repositories/taskRepository";

export function useTasks(slug: string) {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const totalPages = Math.ceil(total / limit);

  /*
  ================================
  LOAD TASKS (Server → Hydration)
  ================================
  */

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

  /*
  ================================
  CREATE TASK (LOCAL-FIRST)
  ================================
  */

  async function handleCreate(
    title: string,
    description?: string,
    priority?: string
  ) {

    try {

      await createTaskLocal(slug, {
        title,
        description,
        priority
      });

      // ❗ No loadTasks here
      // UI updates automatically via IndexedDB + liveQuery

    } catch (err) {

      const error = err as AppError;
      setError(error);

    }

  }

  /*
  ================================
  DELETE TASK (LOCAL-FIRST)
  ================================
  */

  async function handleDelete(id: string) {

    if (!slug) return;

    await deleteTaskLocal(slug, id);

  }

  /*
  ================================
  INITIAL LOAD
  ================================
  */

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