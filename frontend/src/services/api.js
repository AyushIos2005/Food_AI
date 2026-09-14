import axios from "axios";

// Base URL comes from an env var so nothing is hardcoded per-environment.
// Create a .env file (see .env.example) with:
//   VITE_API_URL=http://localhost:3000
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL,
  // The backend issues an httpOnly JWT cookie named `token` (see
  // src/controllers/user.controller.js on the backend). Every request must
  // carry cookies for auth to work — there is no bearer-token flow, so this
  // must stay true across the whole app.
  withCredentials: true,
});

// Normalizes backend error shapes into a single readable string.
// Different controllers use slightly different error keys
// (`message` almost everywhere, occasionally `error`), so this
// covers both without assuming a fixed shape.
export function getErrorMessage(err, fallback = "Something went wrong") {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
}

// When any request comes back 401, the httpOnly cookie is missing/expired.
// Broadcast a DOM event instead of importing AuthContext here (would create
// a circular import) — AuthContext listens for this to clear local state.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(err);
  }
);

export default api;
