import client from "./client";

// Maps to backend/src/routes/blog.route.js -> mounted at /api/blog
export const createBlog = (formData) =>
  client
    .post("/blog/create-blog", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
// formData fields: description, socialLinks (JSON string), media files

export const deleteBlog = (blogId) =>
  client.delete("/blog/delete-blog", { data: { blogId } }).then((r) => r.data);

export const getAllBlogs = () => client.get("/blog/get-all").then((r) => r.data);

export const addComment = (blogId, text) =>
  client.post("/blog/addComment", { blogId, text }).then((r) => r.data);

export const getComments = (blogId) =>
  client.get("/blog/get-comment", { params: { blogId } }).then((r) => r.data);

export const deleteComment = (blogId, commentId) =>
  client
    .delete("/blog/delete-comment", { data: { blogId, commentId } })
    .then((r) => r.data);

export const toggleLike = (blogId) =>
  client.post("/blog/like", { blogId }).then((r) => r.data);

export const toggleShare = (blogId) =>
  client.post("/blog/share", { blogId }).then((r) => r.data);

export const toggleSave = (blogId) =>
  client.post("/blog/save", { blogId }).then((r) => r.data);

export const getSavedBlogs = () => client.get("/blog/saved").then((r) => r.data);

export const getBlogsByHashtag = (hashtag) =>
  client.get(`/blog/hashtag/${encodeURIComponent(hashtag)}`).then((r) => r.data);
