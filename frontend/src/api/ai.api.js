import api from "./axios";

export const createAiRecipe = (payload) => api.post("/api/ai-service/amzingFood", payload);
export const getAiRecipeHistory = () => api.get("/api/ai-service/getamzefood");
export const recreateFood = (payload) => api.post("/api/ai-service/amzeFood/recreate", payload);
export const getRecreatedHistory = () => api.get("/api/ai-service/amzeFood/getrecreate");

// Unified history across both AI models (each item carries historyType).
export const getUnifiedHistory = () => api.get("/api/ai-service/amzeFood/history");
export const getHistoryById = (id) => api.get(`/api/ai-service/amzeFood/history/${id}`);
export const deleteHistory = (id) => api.delete(`/api/ai-service/amze/history/${id}`);
export const deleteAllHistory = () => api.delete("/api/ai-service/amze/history");
export const undoHistory = (id) => api.patch(`/api/ai-service/amze/history/${id}/undo`);
