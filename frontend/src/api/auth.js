import client from "./client";

// Maps 1:1 to backend/src/routes/user.route.js -> mounted at /api/auth
export const registerUser = (data) =>
  client.post("/auth/register", data).then((r) => r.data);
// data: { username, name, email, password, role } role: "user" | "chef"

export const loginUser = (data) =>
  client.post("/auth/login", data).then((r) => r.data);
// data: { username OR email, password }

export const verifyOtp = (data) =>
  client.post("/auth/vefiyOtp", data).then((r) => r.data);
// data: { email, otp }

export const logoutUser = () =>
  client.post("/auth/logout").then((r) => r.data);

export const changePassword = (data) =>
  client.post("/auth/change-password", data).then((r) => r.data);
// data: { oldPassword, newPassword, confirmNewPassword }

export const forgetPassword = (data) =>
  client.post("/auth/forget-password", data).then((r) => r.data);
// data: { email }

export const resetPassword = (data) =>
  client.post("/auth/reset-password", data).then((r) => r.data);
// data: { email, otp, newPassword, confirmNewPassword }

export const followUser = (id) =>
  client.post(`/auth/follow/${id}`).then((r) => r.data);

export const unfollowUser = (id) =>
  client.post(`/auth/unfollow/${id}`).then((r) => r.data);

export const getFollowing = (id) =>
  client.get(`/auth/following/${id}`).then((r) => r.data);

export const getFollowers = (id) =>
  client.get(`/auth/followers/${id}`).then((r) => r.data);
