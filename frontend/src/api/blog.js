import client from "./client";

// Backend: src/routes/blog.route.js, mounted at /api/blog.
// List/detail responses: { success, count, data }
//   get-all / saved / hashtag => data: Blog[]  (createdBy, likes[], savedBy[],
//                                   shares[], comments[] are populated)
//   get-comment               => data: Comment[]
//   create-blog               => data: Blog
//   addComment                => data: Comment
// Toggle responses:
//   like  => { liked, likeCount }
//   share => { shared, shareCount }
//   save  => { saved, saveCount }

export const getAllBlogs = (params, config = {}) =>
  client.get("/blog/get-all", { params, ...config }).then((r) => r.data);

// multipart/form-data. Fields: description, media (1..10 files).
export const createBlog = (formData, config = {}) =>
  client.post("/blog/create-blog", formData, config).then((r) => r.data);

export const deleteBlog = (blogId, config = {}) =>
  client.delete("/blog/delete-blog", { data: { blogId }, ...config }).then((r) => r.data);

export const addComment = (blogId, text, config = {}) =>
  client.post("/blog/addComment", { blogId, text }, config).then((r) => r.data);

export const getComments = (blogId, config = {}) =>
  client.get("/blog/get-comment", { params: { blogId }, ...config }).then((r) => r.data);

export const deleteComment = (blogId, commentId, config = {}) =>
  client
    .delete("/blog/delete-comment", { data: { blogId, commentId }, ...config })
    .then((r) => r.data);

export const toggleLike = (blogId, config = {}) =>
  client.post("/blog/like", { blogId }, config).then((r) => r.data);

export const toggleShare = (blogId, config = {}) =>
  client.post("/blog/share", { blogId }, config).then((r) => r.data);

export const toggleSave = (blogId, config = {}) =>
  client.post("/blog/save", { blogId }, config).then((r) => r.data);

export const getSavedBlogs = (config = {}) =>
  client.get("/blog/saved", config).then((r) => r.data);

export const getBlogsByHashtag = (hashtag, config = {}) =>
  client.get(`/blog/hashtag/${encodeURIComponent(hashtag)}`, config).then((r) => r.data);
