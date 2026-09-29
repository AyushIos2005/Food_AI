import client from "./client";

// Backend: src/routes/amze.route.js, mounted at /api/ai-service.
//
// CONTRACT (every AI endpoint returns { success, message?, data }):
//   generate / recreate  => data: HistoryDoc              (HTTP 201)
//   list endpoints       => data: HistoryDoc[], count
//   history by id        => data: HistoryDoc
//   delete one           => data: { ... , deletedAt }
//   delete all           => { deletedCount }
//   undo                 => data: { ... }
//
// HistoryDoc = { _id, userId, queuePosition, createdAt, recipe, ... } where
//   recipe = { recipeName | newFoodName, description, ingredients[],
//              instructions[], servings, preparationTime, proteinPerServing,
//              caloriesPerServing, medicalConsiderations[] ... }
//   plus historyType: "protein_recipe" | "recreated_food" on the unified
//   history endpoints.
//
// The recipe ALWAYS lives at  res.data.recipe.

// AI calls can be slow (backend retries Gemini), so allow a long timeout.
const AI_TIMEOUT = 120000;

export const generateProteinRecipe = (payload, config = {}) =>
  client
    .post("/ai-service/amzingFood", payload, { timeout: AI_TIMEOUT, ...config })
    .then((r) => r.data);
// payload: { ingredient: string[], numberofperson: number, anyMedical?: string }

export const recreateFood = (payload, config = {}) =>
  client
    .post("/ai-service/amzeFood/recreate", payload, { timeout: AI_TIMEOUT, ...config })
    .then((r) => r.data);
// payload: { existingFoodname: string, AddOnIngredient: string[] }

export const getGeneratedRecipes = (config = {}) =>
  client.get("/ai-service/getamzefood", config).then((r) => r.data);

export const getRecreatedFoods = (config = {}) =>
  client.get("/ai-service/amzeFood/getrecreate", config).then((r) => r.data);

// Unified history (protein + recreated), newest first.
export const getAiHistory = (config = {}) =>
  client.get("/ai-service/amzeFood/history", config).then((r) => r.data);

export const getAiHistoryById = (id, config = {}) =>
  client.get(`/ai-service/amzeFood/history/${id}`, config).then((r) => r.data);

// Soft delete (can be undone).
export const deleteAiHistory = (id, config = {}) =>
  client.delete(`/ai-service/amze/history/${id}`, config).then((r) => r.data);

export const deleteAllAiHistory = (config = {}) =>
  client.delete("/ai-service/amze/history", config).then((r) => r.data);

export const undoAiHistory = (id, config = {}) =>
  client.patch(`/ai-service/amze/history/${id}/undo`, null, config).then((r) => r.data);
