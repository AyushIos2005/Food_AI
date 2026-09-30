import api from "./axios";

export const followUser = (id) => api.post(`/auth/follow/${id}`);
export const unfollowUser = (id) => api.post(`/auth/unfollow/${id}`);
export const getFollowers = (id) => api.get(`/auth/followers/${id}`);
export const getFollowing = (id) => api.get(`/auth/following/${id}`);
