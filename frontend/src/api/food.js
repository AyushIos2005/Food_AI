import client from "./client";

// Maps to backend/src/routes/food.route.js -> mounted at /api/food
// Chef-only endpoints
export const uploadFood = (formData) =>
  client
    .post("/food/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
// formData fields: foodImage (file), foodName, ingredients, precautions, description

export const deleteFood = (id) =>
  client.delete(`/food/deletefood/${id}`).then((r) => r.data);

// Chef-only listing (backend: verifyChef middleware)
export const getFoodForChef = () => client.get("/food/get").then((r) => r.data);

// Any logged-in user/chef can browse all dishes
export const getAllFood = () => client.get("/food/get-all").then((r) => r.data);

// Single dish detail (added to support the /dish/:id page)
export const getFoodById = (id) => client.get(`/food/${id}`).then((r) => r.data);
