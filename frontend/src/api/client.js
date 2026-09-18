import axios from "axios";

// Base URL of the food-ai backend, e.g. http://localhost:3000/api
// Set VITE_API_URL in your .env file (see .env.example).
export const API_URL = "https://food-ai-1-333t.onrender.com/api";

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true, // backend uses an httpOnly cookie ("token") for auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Normalize error messages coming from the backend's { message } / { error } shape
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Something went wrong. Please try again.";
    return Promise.reject({ ...err, message });
  }
);

export default client;
