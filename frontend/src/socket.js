import { io } from "socket.io-client";

// Socket.IO connects to the server ROOT (not /api).
// Set VITE_SOCKET_URL=https://your-backend.onrender.com in production.
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL || "https://backend-64ey.onrender.com").replace(/\/api\/?$/, "");

let socket = null;

export function connectSocket() {
  if (socket) return socket;
  socket = io(SOCKET_URL, {
    withCredentials: true, // sends the httpOnly "token" cookie in the handshake
    transports: ["websocket", "polling"],
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });
  socket.on("connect_error", (err) => console.warn("Socket error:", err.message));
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
