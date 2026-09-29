import client from "./client";

// Backend: src/routes/user.route.js, mounted at /api/auth.
// NOTE: "vefiyOtp" is the backend's real (misspelled) route. Do not "fix" it.

/** @returns {Promise<{message:string,user:{id,username,name,email,role}}>} */
export const registerUser = (data) =>
  client.post("/auth/register", data).then((r) => r.data);
// data: { username, name, email, password, role: "user" | "chef" }

/** @returns {Promise<{message:string,user:{id,username,name,email,role}}>} */
export const loginUser = (data) =>
  client.post("/auth/login", data).then((r) => r.data);
// data: { username OR email, password }

/** @returns {Promise<{message:string}>} */
export const verifyOtp = (data) =>
  client.post("/auth/vefiyOtp", data).then((r) => r.data);
// data: { email, otp (6 digits) }

export const logoutUser = () => client.post("/auth/logout").then((r) => r.data);

export const changePassword = (data) =>
  client.post("/auth/change-password", data).then((r) => r.data);
// data: { oldPassword, newPassword, confirmNewPassword }

export const forgetPassword = (data) =>
  client.post("/auth/forget-password", data).then((r) => r.data);
// data: { email }

export const resetPassword = (data) =>
  client.post("/auth/reset-password", data).then((r) => r.data);
// data: { email, otp, newPassword, confirmNewPassword }

// The backend has no "/me" endpoint. To find out whether the httpOnly cookie
// is still valid we call the cheapest authenticated route. 200 => valid
// session, 401 => not logged in (the client interceptor emits the event).
export const checkSession = (config = {}) =>
  client.get("/notifications", { params: { limit: 1 }, ...config }).then((r) => r.data);
