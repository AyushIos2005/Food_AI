import api from "./axios";

// NOTE: backend returns { message, profile } — not { data }.
export const getProfile = () => api.get("/profile/get_detail");
export const createProfile = (payload) => api.post("/profile/create-profile", payload);
export const updateProfile = (id, payload) => api.patch(`/profile/upadate_profile/${id}`, payload);
export const deleteProfile = (id) => api.delete(`/profile/delete_profile/${id}`);
