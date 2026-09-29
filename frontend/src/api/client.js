import axios from "axios";

// ---------------------------------------------------------------------------
// The ONE Axios client for the whole app.
//
// VITE_API_URL must include the "/api" prefix, e.g. http://localhost:3000/api
// (the backend mounts every router under /api). All request paths in
// src/api/*.js are therefore relative to that, e.g. "/auth/login".
// ---------------------------------------------------------------------------
export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/+$/, "");

// Socket.IO lives on the same HTTP server, at the origin (no /api).
export const SOCKET_URL = API_URL.replace(/\/api$/, "");

// Broadcast when the backend says the session cookie is missing/expired.
// AuthContext listens for this, clears local auth state, and the route guards
// send the user to /login.
export const UNAUTHORIZED_EVENT = "auth:unauthorized";

// Endpoints where a 401 means "wrong credentials", not "session expired".
const AUTH_ENTRY_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/vefiyOtp",
  "/auth/forget-password",
  "/auth/reset-password",
];

export const FRIENDLY = {
  network: "Can't reach FOODAI right now. Check your connection and try again.",
  timeout: "That's taking longer than expected. Please try again.",
  server: "Something went wrong on our side. Please try again in a moment.",
  generic: "Something went wrong. Please try again.",
};

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true, // backend auth is an httpOnly "token" cookie
  // NOTE: no default Content-Type. Axios sets application/json for plain
  // objects and lets the browser set the multipart boundary for FormData.
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    // Aborted requests (component unmounted / newer request started).
    if (axios.isCancel(err)) {
      err.canceled = true;
      return Promise.reject(err);
    }

    const status = err?.response?.status;

    if (status === 401) {
      const url = err?.config?.url || "";
      if (!AUTH_ENTRY_PATHS.some((p) => url.startsWith(p))) {
        window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
      }
    }

    // Backend error shape is always { message } (sometimes + success/details).
    // 4xx messages are written for people ("Invalid credentials"), so we keep
    // them. Network problems, timeouts and 5xx are replaced with friendly
    // text so raw server / stack messages never reach the screen.
    let message = err?.response?.data?.message;
    if (err?.code === "ECONNABORTED") {
      message = FRIENDLY.timeout;
    } else if (!err?.response) {
      message = FRIENDLY.network;
    } else if (status >= 500 || typeof message !== "string" || !message.trim()) {
      message = status >= 500 ? FRIENDLY.server : FRIENDLY.generic;
    }

    const apiError = new Error(message);
    apiError.isApi = true; // safe to show to users
    apiError.status = status;
    apiError.data = err?.response?.data;
    return Promise.reject(apiError);
  }
);

// Use this in every catch block that shows an error to a person: API errors
// are already human-readable, anything else (a JS TypeError, say) is not.
export const getErrorMessage = (err, fallback = FRIENDLY.generic) =>
  err?.isApi && err.message ? err.message : fallback;

export const isCanceled = (err) => Boolean(err?.canceled) || axios.isCancel(err);

export default client;
