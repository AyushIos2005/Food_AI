import api from "./axios";

// NOTE: backend returns { message, profile } — not { data }.
export const getProfile = () => api.get("/api/profile/get_detail");
export const createProfile = (payload) => api.post("/api/profile/create-profile", payload);
export const updateProfile = (id, payload) => api.patch(`/api/profile/upadate_profile/${id}`, payload);
export const deleteProfile = (id) => api.delete(`/api/profile/delete_profile/${id}`);
