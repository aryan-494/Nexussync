import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import { socketAuthMiddleware } from "./socket.auth";

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