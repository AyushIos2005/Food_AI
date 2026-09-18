import api from "./axios";

export const createBlog = (formData) =>
  api.post("/api/blog/create-blog", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteBlog = (blogId) =>
  api.delete("/api/blog/delete-blog", { data: { blogId } });

export const getAllBlogs = () => api.get("/api/blog/get-all");

export const addComment = (payload) => api.post("/api/blog/addComment", payload);
export const getComments = (blogId) => api.get("/api/blog/get-comment", { params: { blogId } });
export const deleteComment = (payload) =>
  api.delete("/api/blog/delete-comment", { data: payload });

export const likeBlog = (blogId) => api.post("/api/blog/like", { blogId });
export const shareBlog = (blogId) => api.post("/api/blog/share", { blogId });
export const saveBlog = (blogId) => api.post("/api/blog/save", { blogId });
export const getSavedBlogs = () => api.get("/api/blog/saved");
export const getBlogsByHashtag = (hashtag) => api.get(`/api/blog/hashtag/${hashtag}`);
