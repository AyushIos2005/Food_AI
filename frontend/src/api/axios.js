import axios from "axios";

// Backend base URL — override with VITE_API_URL in a .env file if needed.
const BASE_URL = "https://food-ai-1-333t.onrender.com";

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
