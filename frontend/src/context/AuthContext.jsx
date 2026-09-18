import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loginUser, logoutUser, registerUser } from "../api/auth.api";
import { disconnectSocket } from "../lib/socket";

const AuthContext = createContext(null);
const STORAGE_KEY = "foodai_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The backend has no "current session" endpoint (JWT lives in an
    // httpOnly cookie), so we mirror the last-known user in localStorage
    // purely for instant UI state on refresh. The cookie is the real
    // source of truth — any 401 from the API clears this again.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      persist(null);
      disconnectSocket();
    };
    window.addEventListener("foodai:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("foodai:unauthorized", handleUnauthorized);
  }, []);

  const persist = (u) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = useCallback(async (payload) => {
    const { data } = await loginUser(payload);
    persist(data.user);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await registerUser(payload);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      persist(null);
      disconnectSocket();
    }
  }, []);

  const clearSession = useCallback(() => persist(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isChef: user?.role === "chef",
        login,
        register,
        logout,
        clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
