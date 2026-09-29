import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";
import { UNAUTHORIZED_EVENT, isCanceled } from "../api/client";

const AuthContext = createContext(null);
const STORAGE_KEY = "dishfinder_user";

// localStorage only remembers WHO the user was, so the UI can show a name
// while we verify. It never decides whether the user is logged in: the
// backend cookie does, and we ask the backend on every app load.
function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// status: "checking" (verifying cookie with backend)
//       | "authenticated"
//       | "unauthenticated"
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [status, setStatus] = useState(() => (readStoredUser() ? "checking" : "unauthenticated"));

  const clearAuth = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const startSession = useCallback((u) => {
    setUser(u || null);
    setStatus(u ? "authenticated" : "unauthenticated");
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  // 1) Verify the stored session with the backend once on load.
  useEffect(() => {
    if (!readStoredUser()) return undefined;
    const controller = new AbortController();
    authApi
      .checkSession({ signal: controller.signal })
      .then(() => setStatus("authenticated"))
      .catch((err) => {
        if (isCanceled(err)) return;
        if (err.status === 401) clearAuth();
        // Backend unreachable / 5xx: we can't prove the session, so don't
        // treat the user as logged in. Keep the stored name for next time.
        else setStatus("unauthenticated");
      });
    return () => controller.abort();
  }, [clearAuth]);

  // 2) Any 401 from any API call clears auth; route guards redirect to /login.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, clearAuth);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, clearAuth);
  }, [clearAuth]);

  const register = useCallback(
    async (data) => {
      const res = await authApi.registerUser(data);
      // Backend sets the auth cookie at registration; OTP verification
      // happens next.
      startSession(res.user);
      return res;
    },
    [startSession]
  );

  const login = useCallback(
    async (data) => {
      const res = await authApi.loginUser(data);
      startSession(res.user);
      return res;
    },
    [startSession]
  );

  const verifyOtp = useCallback((data) => authApi.verifyOtp(data), []);

  const logout = useCallback(async () => {
    try {
      await authApi.logoutUser();
    } catch {
      /* even if the request fails, drop the local session */
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      isChecking: status === "checking",
      isChef: user?.role === "chef",
      register,
      login,
      verifyOtp,
      logout,
    }),
    [user, status, register, login, verifyOtp, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
