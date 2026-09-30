import api from "./axios";

export const createBlog = (formData) =>
  api.post("/blog/create-blog", formData);

export const deleteBlog = (blogId) =>
  api.delete("/blog/delete-blog", { data: { blogId } });

export const getAllBlogs = () => api.get("/blog/get-all");

export const addComment = (payload) => api.post("/blog/addComment", payload);
export const getComments = (blogId) => api.get("/blog/get-comment", { params: { blogId } });
export const deleteComment = (payload) =>
  api.delete("/blog/delete-comment", { data: payload });

export const likeBlog = (blogId) => api.post("/blog/like", { blogId });
export const shareBlog = (blogId) => api.post("/blog/share", { blogId });
export const saveBlog = (blogId) => api.post("/blog/save", { blogId });
export const getSavedBlogs = () => api.get("/blog/saved");
export const getBlogsByHashtag = (hashtag) => api.get(`/blog/hashtag/${hashtag}`);
