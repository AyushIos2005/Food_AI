import client from "./client";

// Maps to backend/src/routes/profile.route.js -> mounted at /api/profile
export const createProfile = (data) =>
  client.post("/profile/create-profile", data).then((r) => r.data);
// data: { fullName, contactNumber, dateOfBirth, SocialMedia, profession, hobbies, bio }

export const updateProfile = (id, data) =>
  client.patch(`/profile/upadate_profile/${id}`, data).then((r) => r.data);

export const deleteProfile = (id) =>
  client.post(`/profile/delete_profile/${id}`).then((r) => r.data);

export const getProfile = () =>
  client.get("/profile/get_detail").then((r) => r.data);
