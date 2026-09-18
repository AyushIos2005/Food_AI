import api from "./axios";

export const getHealth = () => api.get("/health");
