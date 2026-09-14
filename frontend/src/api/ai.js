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
