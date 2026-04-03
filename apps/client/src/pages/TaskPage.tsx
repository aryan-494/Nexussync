import { useParams, Navigate } from "react-router-dom";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { TaskForm } from "../modules/tasks/TaskForm";
import { TaskList } from "../modules/tasks/TaskList";
import { useTasks } from "../modules/tasks/useTasks";
import type { AppError } from "../api/http";

import { hydrateWorkspace } from "../local/hydration/hydrateWorkspace";
import { useSyncStatus } from "../local/sync/syncState";

import { updateTaskLocal} from "../local/repositories/taskRepository"

import { useEffect } from "react";
import { getSocket } from "../realtime/socket";

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

  const syncStatus = useSyncStatus();

  if (!slug) {
    return <Navigate to="/workspaces" replace />;
  }


useEffect(() => {
  if (!slug) return;

  // existing logic
  hydrateWorkspace(slug);

  const socket = getSocket();

  // ✅ join workspace
  socket.emit("JOIN_WORKSPACE", slug);

  console.log("[socket] joined workspace:", slug);

  // ✅ temporary test trigger function (for console)
  (window as any).testSocket = () => {
    socket.emit("TEST_EVENT", slug);
  };

}, [slug]);

  if (workspaceLoading) {
    return <div>Loading workspace...</div>;
  }

  const workspace = getWorkspaceBySlug(slug);

  if (!workspace) {
    return <Navigate to="/workspaces" replace />;
  }

  const totalPages = Math.ceil(total / limit);



  // Now removed api call and  UI will update automatically because of Dexie liveQuery.

  async function handleStatusChange(
  id: string,
  status: string
) {

  if (!slug) return

  await updateTaskLocal(slug, id, {
    status
  })

}

  return (
    <div>

      <h2>
        Tasks for {workspace.name}
      </h2>

      <p>
        Your role: {workspace.role}
      </p>

      <p>
        Sync status: {syncStatus}
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
          workspaceSlug={slug}
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