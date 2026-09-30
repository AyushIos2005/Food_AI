import api from "./axios";

export const uploadFood = (formData) =>
  api.post("/food/upload", formData);

export const deleteFood = (id) => api.delete(`/food/deletefood/${id}`);

// Both endpoints hit the same controller; /get requires role "chef".
export const getMyFood = (params) => api.get("/food/get", { params });
export const getAllFood = (params) => api.get("/food/get-all", { params });
