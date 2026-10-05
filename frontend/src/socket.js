import { io } from "socket.io-client";
import { SOCKET_URL } from "./api/client";

// One shared Socket.IO connection for the whole app.
// SOCKET_URL comes from VITE_SOCKET_URL (falls back to VITE_API_URL sans /api).
// Auth is the same httpOnly "token" cookie used by the REST API, so we only
// need withCredentials. The backend never trusts a user id from the client.
let socket = null;

export function connectSocket() {
  if (socket) return socket; // never open a second connection
  socket = io("https://backend-64ey.onrender.com", {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
