import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket() {
  if (socket) return socket; // prevent multiple connections

  socket = io("http://localhost:3000", {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("[socket] connected:", socket?.id);

  });


  socket.on("disconnect", () => {
    console.log("[socket] disconnected");
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