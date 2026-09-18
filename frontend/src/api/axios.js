import axios from "axios";

// Backend base URL — override with VITE_API_URL in a .env file if needed.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // JWT lives in an httpOnly cookie
});

// Broadcast expired/invalid sessions so AuthContext can clear local state
// and routes can bounce to /login, without the api layer needing React.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("foodai:unauthorized"));
    }
    return Promise.reject(err);
  }
);

export default api;
