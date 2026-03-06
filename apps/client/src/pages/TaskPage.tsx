import { useParams, Navigate } from "react-router-dom";
import { useWorkspace } from "../../src/contexts/WorkspaceContext";
import { useTasks } from "../modules/tasks/useTasks";
import {TaskForm}  from "./../modules/tasks/TaskForm";

import { TaskList } from "./../modules/tasks/TaskList";

export function TaskPage() {
  const { slug } = useParams<{ slug: string }>();
  const { loading: workspaceLoading, getWorkspaceBySlug } =
    useWorkspace();

if (!slug) {
  return <Navigate to="/workspaces" replace />;
}

if (workspaceLoading) {
  return <div>Loading workspace...</div>;
}

const workspace = getWorkspaceBySlug(slug);

if (!workspace && !workspaceLoading) {
  return <Navigate to="/workspaces" replace />;
}
  const {
    tasks,
    page,
    totalPages,
    loading,
    error,
    setPage,
    loadTasks,
    handleCreate,
    handleDelete,
  } = useTasks(slug);

  return (
  <div>
    <h2>Tasks for {workspace.name}</h2>
    <p>Your role: {workspace.role}</p>

    <TaskForm onCreate={handleCreate} />

    {loading ? (
      <p>Loading tasks...</p>
    ) : (
      <TaskList
        tasks={tasks}
        canDelete={workspace.role === "OWNER"}
        onDelete={handleDelete}
      />
    )}

    <div>
      <button
        disabled={page === 1}
        onClick={() => {
          setPage(page - 1);
          loadTasks(page - 1);
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
          setPage(page + 1);
          loadTasks(page + 1);
        }}
      >
        Next
      </button>
    </div>
  </div>
);
}