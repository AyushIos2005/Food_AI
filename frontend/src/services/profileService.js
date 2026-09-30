import api from "./api";

export const createProfile = (data) =>
  api.post("/profile/create-profile", data);

// NOTE: backend route is spelled "upadate_profile" (not "update_profile").
export const updateProfile = (profileId, data) =>
  api.patch(`/profile/upadate_profile/${profileId}`, data);

export const deleteProfile = (profileId) =>
  api.post(`/profile/delete_profile/${profileId}`);

export const getProfile = () => api.get("/profile/get_detail");
