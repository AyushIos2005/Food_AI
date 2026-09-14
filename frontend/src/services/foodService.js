import api from "./api";

// GET /api/food/get-all — available to any logged-in user (user or chef).
export const getAllFood = () => api.get("/api/food/get-all");

// GET /api/food/get — chef/admin-only listing (verifyAdmin on the backend).
export const getFoodAdmin = () => api.get("/api/food/get");

// POST /api/food/upload — chef only. Must be multipart/form-data with the
// exact field name "foodImage" for the file, matching multer's
// upload.single("foodImage") on the backend.
export const uploadFood = (formData) =>
  api.post("/api/food/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteFood = (id) => api.delete(`/api/food/deletefood/${id}`);
