import client from "./client";

// Backend: src/routes/profile.route.js, mounted at /api/profile.
// All responses: { message, profile? }. 404 "Profile not found" means the
// user has not created a profile yet (not an error worth a toast).
// "upadate_profile" is the backend's real (misspelled) route.

export const getProfile = (config = {}) =>
  client.get("/profile/get_detail", config).then((r) => r.data);

export const createProfile = (data, config = {}) =>
  client.post("/profile/create-profile", data, config).then((r) => r.data);
// data: { fullName, contactNumber, dateOfBirth, SocialMedia[], profession, hobbies[], bio }

export const updateProfile = (id, data, config = {}) =>
  client.patch(`/profile/upadate_profile/${id}`, data, config).then((r) => r.data);

export const deleteProfile = (id, config = {}) =>
  client.delete(`/profile/delete_profile/${id}`, config).then((r) => r.data);
