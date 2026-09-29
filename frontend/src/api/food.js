import client from "./client";

// Backend: src/routes/food.route.js, mounted at /api/food.
// List responses:  { message, foods: Food[] }
// Upload response: { message, food }
// Delete response: { message }

// Any logged-in user. Optional params: { page, limit, search }.
export const getAllFood = (params, config = {}) =>
  client.get("/food/get-all", { params, ...config }).then((r) => r.data);

// Chef-only listing (verifyAdmin => role "chef").
export const getFoodAdmin = (params, config = {}) =>
  client.get("/food/get", { params, ...config }).then((r) => r.data);

// Chef-only. multipart/form-data. Fields: foodImage (file), foodName,
// ingredients (comma separated string or array), precautions, description.
// Do NOT set Content-Type manually: the browser must add the boundary.
export const uploadFood = (formData, config = {}) =>
  client.post("/food/upload", formData, config).then((r) => r.data);

export const deleteFood = (id, config = {}) =>
  client.delete(`/food/deletefood/${id}`, config).then((r) => r.data);
