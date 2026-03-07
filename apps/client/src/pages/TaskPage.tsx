import { useParams, Navigate } from "react-router-dom";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { TaskForm } from "../modules/tasks/TaskForm";
import { TaskList } from "../modules/tasks/TaskList";
import { useTasks } from "../modules/tasks/useTasks";
import { updateTask } from "../api/task.api";
import type { AppError } from "../api/http";

export function TaskPage() {

  const { slug } = useParams();

  const {
    getWorkspaceBySlug,
    loading: workspaceLoading,
  } = useWorkspace();

  const {
    tasks,
    loading,
    error,
    page,
    setPage,
    total,
    limit,
    loadTasks,
    handleCreate,
    handleDelete,
  } = useTasks(slug);

  if (!slug) {
    return <Navigate to="/workspaces" replace />;
  }

  if (workspaceLoading) {
    return <div>Loading workspace...</div>;
  }

  const workspace = getWorkspaceBySlug(slug);

  if (!workspace) {
    return <Navigate to="/workspaces" replace />;
  }

  const totalPages = Math.ceil(total / limit);

  async function handleStatusChange(
    id: string,
    status: string
  ) {
    try {

      await updateTask(slug, id, { status });

      await loadTasks(page);

    } catch (err) {

      const error = err as AppError;

      console.error("Status update failed:", error);

      alert(error.message);
    }
  }

  return (
    <div>

      <h2>
        Tasks for {workspace.name}
      </h2>

      <p>
        Your role: {workspace.role}
      </p>

      <TaskForm onCreate={handleCreate} />

      {error && (
        <p>
          Error: {error.message}
        </p>
      )}

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <TaskList
          tasks={tasks}
          canDelete={workspace.role === "OWNER"}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}

      <div>

        <button
          disabled={page === 1}
          onClick={() => {
            const next = page - 1;
            setPage(next);
            loadTasks(next);
          }}
        >
          Prev
        </button>

        <span>
          Page {page} / {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => {
            const next = page + 1;
            setPage(next);
            loadTasks(next);
          }}
        >
          Next
        </button>

      </div>

    </div>
  );
}