// src/api/task.api.ts

import { http } from "./http";

/**
 * Shared Task Types
 * These should ideally come from @nexussync/common
 * if already defined there.
 */

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskListResponse = {
  tasks: Task[];
  page: number;
  limit: number;
  total: number;
};

/**
 * Get paginated tasks for workspace
 */
export function getTasks(
  slug: string,
  page: number,
  limit: number
) {
  return http.get<TaskListResponse>(
    `/tasks/${slug}?page=${page}&limit=${limit}`
  );
}

/**
 * Create task in workspace
 */
export function createTask(
  slug: string,
  data: {
    title: string;
    description?: string;
    priority?: string;
  }
) {
  return http.post<Task>(
    `/tasks/${slug}`,
    data
  );
}

/**
 * Get single task
 */
export function getTask(
  slug: string,
  id: string
) {
  return http.get<Task>(
    `/tasks/${slug}/${id}`
  );
}

/**
 * Update task
 */
export function updateTask(
  slug: string,
  id: string,
  data: Partial<{
    title: string;
    description: string;
    status: string;
    priority: string;
    assignedTo: string | null;
  }>
) {
  return http.patch<Task>(
    `/tasks/${slug}/${id}`,
    data
  );
}

/**
 * Delete task (OWNER only)
 */
export function deleteTask(
  slug: string,
  id: string
) {
  return http.delete<void>(
    `/tasks/${slug}/${id}`
  );
}