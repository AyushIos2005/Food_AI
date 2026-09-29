import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getNotifications } from "../api/notifications";
import { connectSocket, disconnectSocket } from "../socket";
import { isCanceled } from "../api/client";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

// Owns the unread badge count and the single Socket.IO connection.
// Backend emits "notification:new" (payload: the saved Notification) to the
// room of the logged-in user.
export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const listeners = useRef(new Set());

  // Pages (e.g. the Notifications list) can react to live events.
  const subscribe = useCallback((fn) => {
    listeners.current.add(fn);
    return () => listeners.current.delete(fn);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return undefined;
    }

    const controller = new AbortController();

    // Initial unread count from the REST API.
    getNotifications({ limit: 1 }, { signal: controller.signal })
      .then((res) => setUnreadCount(Number(res?.unreadCount) || 0))
      .catch((err) => {
        if (!isCanceled(err)) console.warn("Could not load unread count:", err.message);
      });

    const socket = connectSocket();
    const onNew = (notification) => {
      if (!notification) return;
      setUnreadCount((c) => c + 1);
      listeners.current.forEach((fn) => fn(notification));
    };
    const onConnectError = (err) => {
      console.warn("Socket.IO connection error:", err?.message);
    };
    socket.on("notification:new", onNew);
    socket.on("connect_error", onConnectError);

    return () => {
      controller.abort();
      socket.off("notification:new", onNew);
      socket.off("connect_error", onConnectError);
      disconnectSocket(); // no duplicate connections on re-login / StrictMode
    };
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({ unreadCount, setUnreadCount, subscribe }),
    [unreadCount, subscribe]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => useContext(NotificationContext);
