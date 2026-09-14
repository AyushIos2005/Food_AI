import api from "./api";

// Every function here maps exactly to a documented endpoint in
// API_DOCUMENTATION.md — including the backend's real (typo'd) route
// spellings, which are NOT renamed on the frontend side.

export const register = (data) => api.post("/api/auth/register", data);

// NOTE: the backend route is spelled "vefiyOtp" (not "verifyOtp") —
// this is the actual endpoint in src/routes/user.route.js.
export const verifyOtp = (data) => api.post("/api/auth/vefiyOtp", data);

export const login = (data) => api.post("/api/auth/login", data);

export const logout = () => api.post("/api/auth/logout");

export const changePassword = (data) =>
  api.post("/api/auth/change-password", data);

export const forgotPassword = (data) =>
  api.post("/api/auth/forget-password", data);

export const resetPassword = (data) =>
  api.post("/api/auth/reset-password", data);
