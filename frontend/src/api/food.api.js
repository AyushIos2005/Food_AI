import api from "./axios";

export const uploadFood = (formData) =>
  api.post("/api/food/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteFood = (id) => api.delete(`/api/food/deletefood/${id}`);

// Both endpoints hit the same controller; /get requires role "chef".
export const getMyFood = (params) => api.get("/api/food/get", { params });
export const getAllFood = (params) => api.get("/api/food/get-all", { params });
