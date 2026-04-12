import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import { RateLimiterMemory } from "rate-limiter-flexible";

import { socketAuthMiddleware } from "./socket.auth";
import { initChangeStreams } from "./socket.events";

import {
  addUserToWorkspace,
  removeUserFromWorkspace,
  getUsersInWorkspace,
} from "./presence";

let io: IOServer | null = null;

/* =================================
   RATE LIMITER (SOCKET)
================================= */

const connectionLimiter = new RateLimiterMemory({
  points: 20,     // max 20 connections
  duration: 60,   // per 60 seconds
});

export function initSocketServer(server: HttpServer) {
  io = new IOServer(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  console.log("[socket] server initialized");

  /* =================================
     SOCKET RATE LIMITING (IMPORTANT)
  ================================= */

  io.use(async (socket, next) => {
    try {
      const ip = socket.handshake.address;

      await connectionLimiter.consume(ip);

      next();
    } catch {
      console.log("❌ Socket rate limit hit:", socket.handshake.address);
      next(new Error("Too many connections"));
    }
  });

  /* =================================
     AUTH MIDDLEWARE
  ================================= */

  io.use(socketAuthMiddleware);

  /* =================================
     CHANGE STREAMS INIT (ONCE)
  ================================= */

  initChangeStreams();

  /* =================================
     CONNECTION HANDLER
  ================================= */

  io.on("connection", (socket) => {

    console.log(`[socket] client connected: ${socket.id}`);

    // track workspaces per socket
    (socket as any).joinedWorkspaces = new Set<string>();

    /* ===============================
       JOIN WORKSPACE
    =============================== */

    socket.on("JOIN_WORKSPACE", async (workspaceSlug: string) => {

      const room = `workspace:${workspaceSlug}`;
      socket.join(room);

      const userId = (socket as any).user?.id;

      console.log(`[socket] user ${userId} joined ${room}`);

      (socket as any).joinedWorkspaces.add(workspaceSlug);

      await addUserToWorkspace(workspaceSlug, userId);

      const users = await getUsersInWorkspace(workspaceSlug);

      console.log("[presence] users in", workspaceSlug, users);

      io?.to(room).emit("PRESENCE_UPDATE", {
        workspaceSlug,
        users,
      });
    });

    /* ===============================
       TEST EVENT (DEBUG)
    =============================== */

    socket.on("TEST_EVENT", (workspaceSlug: string) => {
      const room = `workspace:${workspaceSlug}`;

      console.log("[socket] test emit to:", room);

      io?.to(room).emit("TASK_CHANGED", {
        workspaceSlug,
        type: "TASK_CHANGED",
      });
    });

    /* ===============================
       DISCONNECT
    =============================== */

    socket.on("disconnect", async () => {

      const userId = (socket as any).user?.id;
      const workspaces = (socket as any).joinedWorkspaces || [];

      for (const workspaceSlug of workspaces) {

        await removeUserFromWorkspace(workspaceSlug, userId);

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