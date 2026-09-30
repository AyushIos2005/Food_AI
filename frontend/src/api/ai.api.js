import api from "./axios";

export const createAiRecipe = (payload) => api.post("/ai-service/amzingFood", payload);
export const getAiRecipeHistory = () => api.get("/ai-service/getamzefood");
export const recreateFood = (payload) => api.post("/ai-service/amzeFood/recreate", payload);
export const getRecreatedHistory = () => api.get("/ai-service/amzeFood/getrecreate");

// Unified history across both AI models (each item carries historyType).
export const getUnifiedHistory = () => api.get("/ai-service/amzeFood/history");
export const getHistoryById = (id) => api.get(`/ai-service/amzeFood/history/${id}`);
export const deleteHistory = (id) => api.delete(`/ai-service/amze/history/${id}`);
export const deleteAllHistory = () => api.delete("/ai-service/amze/history");
export const undoHistory = (id) => api.patch(`/ai-service/amze/history/${id}/undo`);
