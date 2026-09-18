import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let socket = null;

// The backend authenticates the socket from the same httpOnly `token`
// cookie the REST API uses, so we only need withCredentials.
export function connectSocket() {
  if (socket?.connected) return socket;
  socket = io(BASE_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    autoConnect: true,
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
