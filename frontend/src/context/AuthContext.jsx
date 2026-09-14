import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);
const STORAGE_KEY = "dishfinder_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const persist = (u) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.registerUser(data);
      persist(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.loginUser(data);
      persist(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = (data) => authApi.verifyOtp(data);

  const logout = async () => {
    try {
      await authApi.logoutUser();
    } finally {
      persist(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, verifyOtp, logout, setUser: persist }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
