import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import { socketAuthMiddleware } from "./socket.auth";
import { initChangeStreams } from "./socket.events";

import {
  addUserToWorkspace,
  removeUserFromWorkspace,
  getUsersInWorkspace,
} from "./presence";

let io: IOServer | null = null;

export function initSocketServer(server: HttpServer) {
  io = new IOServer(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  console.log("[socket] server initialized");

  io.use(socketAuthMiddleware);

  // ✅ INIT change streams ONCE (not inside event)
  initChangeStreams();

  io.on("connection", (socket) => {

    console.log(`[socket] client connected: ${socket.id}`);

    // 🔒 track workspaces per socket
    (socket as any).joinedWorkspaces = new Set<string>();

    // ===============================
    // JOIN WORKSPACE
    // ===============================
    socket.on("JOIN_WORKSPACE", async (workspaceSlug: string) => {

      const room = `workspace:${workspaceSlug}`;
      socket.join(room);

      const userId = (socket as any).user?.id;

      console.log(`[socket] user ${userId} joined ${room}`);

      // track for disconnect cleanup
      (socket as any).joinedWorkspaces.add(workspaceSlug);

      // ✅ Redis: add user
      await addUserToWorkspace(workspaceSlug, userId);

      // ✅ Redis: get users
      const users = await getUsersInWorkspace(workspaceSlug);

      console.log("[presence] users in", workspaceSlug, users);

      // ✅ FIXED event name
      io?.to(room).emit("PRESENCE_UPDATE", {
        workspaceSlug,
        users,
      });
    });

    // ===============================
    // TEST EVENT (keep for debug)
    // ===============================
    socket.on("TEST_EVENT", (workspaceSlug: string) => {
      const room = `workspace:${workspaceSlug}`;

      console.log("[socket] test emit to:", room);

      io?.to(room).emit("TASK_CHANGED", {
        workspaceSlug,
        type: "TASK_CHANGED",
      });
    });

    // ===============================
    // DISCONNECT
    // ===============================
    socket.on("disconnect", async () => {

      const userId = (socket as any).user?.id;
      const workspaces = (socket as any).joinedWorkspaces || [];

      for (const workspaceSlug of workspaces) {

        // ✅ Redis: remove user
        await removeUserFromWorkspace(workspaceSlug, userId);

        // ✅ Redis: get updated users
        const users = await getUsersInWorkspace(workspaceSlug);

        io?.to(`workspace:${workspaceSlug}`).emit("PRESENCE_UPDATE", {
          workspaceSlug,
          users,
        });
      }

      console.log(`[socket] client disconnected: ${socket.id}`);
    });

  });
}

export function getIO(): IOServer {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}