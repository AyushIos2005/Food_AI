import api from "./api";

export const getAllBlogs = () => api.get("/blog/get-all");

// POST /api/blog/create-blog — multipart/form-data.
// File field name must be "media" (multer .array("media", 10) on backend).
// socialLinks, if provided, must be sent as a JSON string in the FormData —
// the backend parses it with JSON.parse.
export const createBlog = (formData) =>
  api.post("/blog/create-blog", formData);

export const deleteBlog = (blogId) =>
  api.delete("/blog/delete-blog", { data: { blogId } });

export const addComment = (blogId, text) =>
  api.post("/blog/addComment", { blogId, text });

export const getComments = (blogId) =>
  api.get("/blog/get-comment", { params: { blogId } });

export const deleteComment = (blogId, commentId) =>
  api.delete("/blog/delete-comment", { data: { blogId, commentId } });

export const toggleLike = (blogId) => api.post("/blog/like", { blogId });

export const toggleShare = (blogId) =>
  api.post("/blog/share", { blogId });

export const toggleSave = (blogId) => api.post("/blog/save", { blogId });

export const getSavedBlogs = () => api.get("/blog/saved");

export const getBlogsByHashtag = (hashtag) =>
  api.get(`/blog/hashtag/${encodeURIComponent(hashtag)}`);
