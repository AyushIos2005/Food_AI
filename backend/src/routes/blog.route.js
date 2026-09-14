const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { blogMediaUpload } = require("../middlewares/blogUpload.middleware");
const blogController = require("../controllers/blog.controller");
const { validate } = require("../middlewares/validate.middleware");
const {
    blogIdSchema,
    commentSchema,
    deleteCommentSchema,
    hashtagParamSchema,
    paginationQuerySchema
} = require("../validators/schemas");
const { uploadLimiter } = require("../middlewares/rateLimit.middleware");

const blog = express.Router();

blog.post(
    "/create-blog",
    authMiddleware.verifyToken,
    uploadLimiter,
    blogMediaUpload,
    blogController.create_post
);

blog.delete(
    "/delete-blog",
    authMiddleware.verifyToken,
    validate(blogIdSchema),
    blogController.delete_Post
);

blog.get(
    "/get-all",
    authMiddleware.verifyToken,
    validate(paginationQuerySchema, "query"),
    blogController.get_allPost
);

blog.post(
    "/addComment",
    authMiddleware.verifyToken,
    validate(commentSchema),
    blogController.addComment
);

blog.get(
    "/get-comment",
    authMiddleware.verifyToken,
    blogController.get_Comment
);

blog.delete(
    "/delete-comment",
    authMiddleware.verifyToken,
    validate(deleteCommentSchema),
    blogController.delete_Comment
);

blog.post(
    "/like",
    authMiddleware.verifyToken,
    validate(blogIdSchema),
    blogController.like_post
);

blog.post(
    "/share",
    authMiddleware.verifyToken,
    validate(blogIdSchema),
    blogController.share_post
);

blog.post(
    "/save",
    authMiddleware.verifyToken,
    validate(blogIdSchema),
    blogController.save_post
);

blog.get(
    "/saved",
    authMiddleware.verifyToken,
    blogController.get_savedPost
);

blog.get(
    "/hashtag/:hashtag",
    authMiddleware.verifyToken,
    validate(hashtagParamSchema, "params"),
    blogController.get_byHashtag
);

module.exports = blog;
