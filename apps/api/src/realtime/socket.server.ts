import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import { socketAuthMiddleware } from "./socket.auth";
import { initChangeStreams } from "./socket.events";

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

  io.on("connection", (socket) => {

   socket.on("JOIN_WORKSPACE", (workspaceSlug: string) => {

    const room = `workspace:${workspaceSlug}`;

    socket.join(room);
     console.log(
    `[socket] user ${(socket as any).user?.id} joined ${room}`
  );
    });

    
    socket.on("TEST_EVENT", (workspaceSlug: string) => {
    const room = `workspace:${workspaceSlug}`;

    console.log("[socket] test emit to:", room);
    initChangeStreams();

  io?.to(room).emit("TASK_CHANGED", {
      workspaceSlug,
      type: "TASK_CHANGED",
    });
  });

    console.log(`[socket] client connected: ${socket.id}`);

    socket.on("disconnect", () => {
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