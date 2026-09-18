import api from "./axios";

export const followUser = (id) => api.post(`/api/auth/follow/${id}`);
export const unfollowUser = (id) => api.post(`/api/auth/unfollow/${id}`);
export const getFollowers = (id) => api.get(`/api/auth/followers/${id}`);
export const getFollowing = (id) => api.get(`/api/auth/following/${id}`);
