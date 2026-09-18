import api from "./axios";

export const registerUser = (payload) => api.post("/api/auth/register", payload);
export const loginUser = (payload) => api.post("/api/auth/login", payload);
export const verifyOtp = (payload) => api.post("/api/auth/vefiyOtp", payload);
export const logoutUser = () => api.post("/api/auth/logout");
export const changePassword = (payload) => api.post("/api/auth/change-password", payload);
export const forgotPassword = (payload) => api.post("/api/auth/forget-password", payload);
export const resetPassword = (payload) => api.post("/api/auth/reset-password", payload);
