import api from "./axios";

export const registerUser = (payload) => api.post("/auth/register", payload);
export const loginUser = (payload) => api.post("/auth/login", payload);
export const verifyOtp = (payload) => api.post("/auth/vefiyOtp", payload);
export const logoutUser = () => api.post("/auth/logout");
export const changePassword = (payload) => api.post("/auth/change-password", payload);
export const forgotPassword = (payload) => api.post("/auth/forget-password", payload);
export const resetPassword = (payload) => api.post("/auth/reset-password", payload);
