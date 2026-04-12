import { useParams, Navigate } from "react-router-dom";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { TaskForm } from "../modules/tasks/TaskForm";
import { TaskList } from "../modules/tasks/TaskList";
import { useTasks } from "../modules/tasks/useTasks";
import type { AppError } from "../api/http";

import { hydrateWorkspace } from "../local/hydration/hydrateWorkspace";
import { useSyncStatus } from "../local/sync/syncState";

import { updateTaskLocal } from "../local/repositories/taskRepository";

import { useEffect, useState } from "react";
import { getSocket } from "../realtime/socket";
import { triggerPullSync } from "../local/sync/syncEngine";

export function TaskPage() {
 const { slug } = useParams<{ slug: string }>();

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

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
  } = useTasks(slug!);

  const syncStatus = useSyncStatus();

  /* =================================
     HYDRATION + SOCKET SETUP
  ================================= */

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;

    async function init() {
      try {
        await hydrateWorkspace(slug!);
      } catch (err) {
        console.error("Hydration failed:", err);
      }
    }

    init();
    const socket = getSocket();

    
    socket.emit("JOIN_WORKSPACE", slug);
    console.log("[socket] joined workspace:", slug);

    // ✅ reconnect handler
    const handleReconnect = () => {
      console.log("[socket] reconnected");

      socket.emit("JOIN_WORKSPACE", slug);

      // 🔥 trigger sync after reconnect
      triggerPullSync(slug);
    };

    socket.on("connect", handleReconnect);

    // presence handler
    const handlePresence = (data: any) => {
      if (!isMounted) return;

      if (data.workspaceSlug === slug) {
        setOnlineUsers(data.users);
      }
    };

    socket.on("PRESENCE_UPDATE", handlePresence);

    return () => {
      isMounted = false;

      socket.off("PRESENCE_UPDATE", handlePresence);
      socket.off("connect", handleReconnect); // ✅ FIX

      socket.emit("LEAVE_WORKSPACE", slug);
    };
  }, [slug]);

  /* =================================
     GUARDS
  ================================= */

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

  /* =================================
     DERIVED VALUES
  ================================= */

  const totalPages = Math.ceil(total / limit);

  const readableStatus =
    syncStatus === "idle"
      ? "Synced"
      : syncStatus === "syncing"
      ? "Syncing..."
      : syncStatus === "offline"
      ? "Offline"
      : "Error";

  /* =================================
     HANDLERS
  ================================= */

  async function handleStatusChange(id: string, status: string) {
    if (!slug) return;

    await updateTaskLocal(slug, id, { status });
  }

  /* =================================
     UI
  ================================= */

  return (
    <div>
      <h2>Tasks for {workspace.name}</h2>

      <p>Your role: {workspace.role}</p>

      <p>
        Sync status: <strong>{readableStatus}</strong>
      </p>

      <p>Online users: {onlineUsers.length}</p>

      <TaskForm onCreate={handleCreate} />

      {error && <p>Error: {(error as AppError).message}</p>}

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