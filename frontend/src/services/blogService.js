import api from "./api";

export const getAllBlogs = () => api.get("/api/blog/get-all");

// POST /api/blog/create-blog — multipart/form-data.
// File field name must be "media" (multer .array("media", 10) on backend).
// socialLinks, if provided, must be sent as a JSON string in the FormData —
// the backend parses it with JSON.parse.
export const createBlog = (formData) =>
  api.post("/api/blog/create-blog", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteBlog = (blogId) =>
  api.delete("/api/blog/delete-blog", { data: { blogId } });

export const addComment = (blogId, text) =>
  api.post("/api/blog/addComment", { blogId, text });

export const getComments = (blogId) =>
  api.get("/api/blog/get-comment", { params: { blogId } });

export const deleteComment = (blogId, commentId) =>
  api.delete("/api/blog/delete-comment", { data: { blogId, commentId } });

export const toggleLike = (blogId) => api.post("/api/blog/like", { blogId });

export const toggleShare = (blogId) =>
  api.post("/api/blog/share", { blogId });

export const toggleSave = (blogId) => api.post("/api/blog/save", { blogId });

export const getSavedBlogs = () => api.get("/api/blog/saved");

export const getBlogsByHashtag = (hashtag) =>
  api.get(`/api/blog/hashtag/${encodeURIComponent(hashtag)}`);
