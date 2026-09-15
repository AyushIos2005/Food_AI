import client from "./client";

// Maps to backend/src/routes/amze.route.js -> mounted at /api/ai-service
export const generateProteinRecipe = (data) =>
  client.post("/ai-service/amzingFood", data).then((r) => r.data);
// data: { ingredient: string[], numberofperson: number, anyMedical?: string }

export const getGeneratedRecipes = () =>
  client.get("/ai-service/getamzefood").then((r) => r.data);

export const recreateFood = (data) =>
  client.post("/ai-service/amzeFood/recreate", data).then((r) => r.data);
// data: { existingFoodname: string, AddOnIngredient: string[] }

export const getRecreatedFoods = () =>
  client.get("/ai-service/amzeFood/getrecreate").then((r) => r.data);

// Unified history (protein recipes + recreated foods, merged & queue-ordered)
export const getAiHistory = () =>
  client.get("/ai-service/amzeFood/history").then((r) => r.data);
// -> { success, count, data: [{ ...item, historyType: "protein_recipe" | "recreated_food" }] }

export const getAiHistoryById = (id) =>
  client.get(`/ai-service/amzeFood/history/${id}`).then((r) => r.data);

export const deleteAiHistoryItem = (id) =>
  client.delete(`/ai-service/amze/history/${id}`).then((r) => r.data);
// soft delete — recoverable via undoAiHistoryItem

export const deleteAllAiHistory = () =>
  client.delete("/ai-service/amze/history").then((r) => r.data);
// soft delete — recoverable via undoAiHistoryItem

export const undoAiHistoryItem = (id) =>
  client.patch(`/ai-service/amze/history/${id}/undo`).then((r) => r.data);
