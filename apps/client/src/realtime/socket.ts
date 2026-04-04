import { io, Socket } from "socket.io-client";
import { runSyncEngine } from "../local/sync/syncEngine";

let socket: Socket | null = null;

// 🔒 sync protection + debounce
let isSyncing = false;
let timeout: ReturnType<typeof setTimeout> | null = null;

export function connectSocket() {
  if (socket) return socket;

  socket = io("http://localhost:3000", {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("[socket] connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("[socket] disconnected");
  });

  // ===============================
  // TASK SYNC (REALTIME)
  // ===============================

  socket.off("TASK_CHANGED");

  socket.on("TASK_CHANGED", (data) => {
    console.log("[socket] TASK_CHANGED received:", data);

    const { workspaceSlug } = data;

    // debounce
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(async () => {
      if (isSyncing) return;

      isSyncing = true;

      try {
        await runSyncEngine(workspaceSlug);
      } catch (err) {
        console.error("[socket] sync failed:", err);
      } finally {
        isSyncing = false;
      }
    }, 300);
  });

  // ===============================
  // PRESENCE (NEW)
  // ===============================

  socket.off("PRESENCE_UPDATE");

  socket.on("PRESENCE_UPDATE", (data) => {
    console.log("[presence] update:", data);
    // ⚠️ DO NOT update UI here
    // UI handles this in TaskPage
  });

  return socket;
}

export function getSocket(): Socket {
  if (!socket) {
    throw new Error("Socket not connected. Call connectSocket first.");
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}