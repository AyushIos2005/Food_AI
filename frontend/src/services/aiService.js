import api from "./api";

// Generate a protein-rich recipe from a list of ingredients.
export const generateFood = (data) =>
  api.post("/ai-service/amzingFood", data);

export const getGeneratedFood = () => api.get("/ai-service/getamzefood");

// Recreate an existing dish with add-on ingredients.
export const recreateFood = (data) =>
  api.post("/ai-service/amzeFood/recreate", data);

export const getRecreatedFood = () =>
  api.get("/ai-service/amzeFood/getrecreate");
