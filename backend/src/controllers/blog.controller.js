const mongoose = require("mongoose");
const blogModel = require("../models/blog.model");
const logger = require("../utils/logger");
const { getPagination } = require("../utils/pagination");
const { createNotification } = require("../services/notification.service");

function extractHashtags(text) {

    const matches = text.match(/#[a-zA-Z0-9_]+/g);

    if (!matches) {
        return [];
    }

    return [
        ...new Set(
            matches.map(tag =>
                tag.substring(1).toLowerCase()
            )
        )
    ];
}

function getUserId(req) {

    return (
        req.auth?._id ||
        req.auth?.id ||
        req.auth?.userId
    );
}

function requireAuth(req, res) {

    const userId = getUserId(req);

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Unauthorized user"
        });

        return null;
    }

    return userId;
}

function parseSocialLinks(socialLinks) {

    if (!socialLinks) {
        return [];
    }

    if (Array.isArray(socialLinks)) {
        return socialLinks;
    }

    let parsedLinks = [];

    if (typeof socialLinks === "string") {

        try {
            const parsed = JSON.parse(socialLinks);
            parsedLinks = Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }
    return parsedLinks.filter(
        (link) =>
            link &&
            typeof link.platform === "string" &&
            link.platform.trim() &&
            typeof link.platformId === "string" &&
            link.platformId.trim()
    );
}


async function create_post(req, res) {

    try {

        const userId = requireAuth(req, res);

        if (!userId) {
            return;
        }

        const {
            description,
            socialLinks
        } = req.body;


        const media = req.body.media;


        if (!media || media.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least one image or video"
            });
        }


        if (!description || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: "Blog description is required"
            });
        }


        const hashtags = extractHashtags(description);


        const blog = await blogModel.create({

            media: media,

            description: description.trim(),

            hashtags: hashtags,

            socialLinks: parseSocialLinks(socialLinks),

            createdBy: userId,

            likes: [],

            comments: [],

            shares: [],

            savedBy: []

        });


        return res.status(201).json({

            success: true,

            message: "Blog created successfully",

            data: blog

        });

    } catch (error) {

        console.error("Create Blog Error:", error);

        return res.status(500).json({

            success: false,

            message: "Internal server error"

        });
    }
}


// ======================================================
// DELETE BLOG
// ======================================================
async function delete_Post(req, res) {

    try {

        const userId = requireAuth(req, res);

        if (!userId) {
            return;
        }

        const { blogId } = req.body;


        if (!blogId) {
            return res.status(400).json({
                success: false,
                message: "Blog ID is required"
            });
        }


        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }


        const blog = await blogModel.findById(blogId);


        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }


        // Only owner can delete
        if (blog.createdBy.toString() !== userId.toString()) {

            return res.status(403).json({
                success: false,
                message: "You can only delete your own blog"
            });
        }


        await blogModel.findByIdAndDelete(blogId);


        return res.status(200).json({

            success: true,

            message: "Blog deleted successfully"
        });

    } catch (error) {

        console.error("Delete Blog Error:", error);

        return res.status(500).json({

            success: false,

            message: "Internal server error"
        });
    }
}


// ======================================================
// GET ALL BLOGS
// ======================================================
async function get_allPost(req, res) {

    try {

        const { page, limit, skip, paginate } = getPagination(req.validatedQuery || req.query);

        let query = blogModel
            .find()
            .populate("createdBy", "name username email")
            .populate("likes", "_id")
            .populate("comments.user", "name username")
            .populate("shares", "_id")
            .populate("savedBy", "_id")
            .sort({ createdAt: -1 })
            .lean();

        if (paginate) {
            query = query.skip(skip).limit(limit);
        }

        const blogs = await query;


        return res.status(200).json({

            success: true,

            count: blogs.length,

            data: blogs
        });

    } catch (error) {

        console.error("Get All Blog Error:", error);

        return res.status(500).json({

            success: false,

            message: "Internal server error"
        });
    }
}


// ======================================================
// ADD COMMENT
// ======================================================
async function addComment(req, res) {

    try {

        const userId = requireAuth(req, res);

        if (!userId) {
            return;
        }

        const {
            blogId,
            text
        } = req.body;


        if (!blogId || !text) {
            return res.status(400).json({
                success: false,
                message: "Blog ID and comment text are required"
            });
        }


        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }


        const blog = await blogModel.findById(blogId);


        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }


        blog.comments.push({
            user: userId,
            text: text.trim()
        });


        await blog.save();


        const newComment =
            blog.comments[blog.comments.length - 1];


        return res.status(201).json({

            success: true,

            message: "Comment added successfully",

            data: newComment
        });

    } catch (error) {

        console.error("Add Comment Error:", error);

        return res.status(500).json({

            success: false,

            message: "Internal server error"
        });
    }
}


// ======================================================
// GET COMMENTS
// ======================================================
async function get_Comment(req, res) {

    try {

        const { blogId } = req.query;


        if (!blogId) {
            return res.status(400).json({
                success: false,
                message: "Blog ID is required"
            });
        }


        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }


        const blog = await blogModel
            .findById(blogId)
            .populate(
                "comments.user",
                "name username"
            );


        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }


        return res.status(200).json({

            success: true,

            count: blog.comments.length,

            data: blog.comments
        });

    } catch (error) {

        console.error("Get Comment Error:", error);

        return res.status(500).json({

            success: false,

            message: "Internal server error"
        });
    }
}


// ======================================================
// DELETE COMMENT
// ======================================================
async function delete_Comment(req, res) {

    try {

        const userId = requireAuth(req, res);

        if (!userId) {
            return;
        }

        const {
            blogId,
            commentId
        } = req.body;


        if (!blogId || !commentId) {
            return res.status(400).json({
                success: false,
                message: "Blog ID and Comment ID are required"
            });
        }


        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }


        const blog = await blogModel.findById(blogId);


        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }


        const comment =
            blog.comments.id(commentId);


        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }


        // Comment owner OR blog owner
        if (
            comment.user.toString() !== userId.toString() &&
            blog.createdBy.toString() !== userId.toString()
        ) {

            return res.status(403).json({
                success: false,
                message: "You cannot delete this comment"
            });
        }


        comment.deleteOne();

        await blog.save();


        return res.status(200).json({

            success: true,

            message: "Comment deleted successfully"
        });

    } catch (error) {

        console.error("Delete Comment Error:", error);

        return res.status(500).json({

            success: false,

            message: "Internal server error"
        });
    }
}


// ======================================================
// LIKE / UNLIKE BLOG
// ======================================================
async function like_post(req, res) {

    try {

        const userId = requireAuth(req, res);

        if (!userId) {
            return;
        }

        const { blogId } = req.body;


        if (!blogId) {
            return res.status(400).json({
                success: false,
                message: "Blog ID is required"
            });
        }


        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }


        const blog = await blogModel.findById(blogId);


        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }


        const alreadyLiked =
            blog.likes.some(
                id => id.toString() === userId.toString()
            );


        if (alreadyLiked) {

            // Unlike
            blog.likes.pull(userId);

            await blog.save();


            return res.status(200).json({

                success: true,

                liked: false,

                likeCount: blog.likes.length,

                message: "Blog unliked successfully"
            });
        }


        // Like
        blog.likes.push(userId);

        await blog.save();


        return res.status(200).json({

            success: true,

            liked: true,

            likeCount: blog.likes.length,

            message: "Blog liked successfully"
        });

    } catch (error) {

        console.error("Like Blog Error:", error);

        return res.status(500).json({

            success: false,

            message: "Internal server error"
        });
    }
}

// ======================================================
// SHARE / UNSHARE
// ======================================================
async function share_post(req, res) {

    try {

        const userId = requireAuth(req, res);

        if (!userId) {
            return;
        }

        const { blogId } = req.body;


        if (!blogId) {
            return res.status(400).json({
                success: false,
                message: "Blog ID is required"
            });
        }


        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }


        const blog = await blogModel.findById(blogId);


        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }


        const alreadyShared =
            blog.shares.some(
                id => id.toString() === userId.toString()
            );


        if (alreadyShared) {

            blog.shares.pull(userId);

            await blog.save();


            return res.status(200).json({

                success: true,

                shared: false,

                shareCount: blog.shares.length,

                message: "Share removed"
            });
        }


        blog.shares.push(userId);

        await blog.save();


        return res.status(200).json({

            success: true,

            shared: true,

            shareCount: blog.shares.length,

            message: "Blog shared successfully"
        });

    } catch (error) {

        console.error("Share Blog Error:", error);

        return res.status(500).json({

            success: false,

            message: "Internal server error"
        });
    }
}

// ======================================================
// SAVE / UNSAVE BLOG
// ======================================================
async function save_post(req, res) {

    try {

        const userId = requireAuth(req, res);

        if (!userId) {
            return;
        }

        const { blogId } = req.body;


        if (!blogId) {
            return res.status(400).json({
                success: false,
                message: "Blog ID is required"
            });
        }


        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }


        const blog = await blogModel.findById(blogId);


        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }


        const alreadySaved =
            blog.savedBy.some(
                id => id.toString() === userId.toString()
            );


        if (alreadySaved) {

            blog.savedBy.pull(userId);

            await blog.save();


            return res.status(200).json({

                success: true,

                saved: false,

                saveCount: blog.savedBy.length,

                message: "Blog removed from saved"
            });
        }


        blog.savedBy.push(userId);

        await blog.save();


        return res.status(200).json({

            success: true,

            saved: true,

            saveCount: blog.savedBy.length,

            message: "Blog saved successfully"
        });

    } catch (error) {

        console.error("Save Blog Error:", error);

        return res.status(500).json({

            success: false,

            message: "Internal server error"
        });
    }
}

// ======================================================
// GET SAVED BLOGS
// ======================================================
async function get_savedPost(req, res) {

    try {

        const userId = requireAuth(req, res);

        if (!userId) {
            return;
        }

        const blogs = await blogModel
            .find({
                savedBy: userId
            })
            .populate("createdBy", "name username")
            .sort({ createdAt: -1 });


        return res.status(200).json({

            success: true,

            count: blogs.length,

            data: blogs
        });

    } catch (error) {

        console.error("Get Saved Blog Error:", error);

        return res.status(500).json({

            success: false,

            message: "Internal server error"
        });
    }
}

// ======================================================
// GET BLOGS BY HASHTAG
// ======================================================
async function get_byHashtag(req, res) {

    try {

        const { hashtag } = req.params;


        if (!hashtag) {
            return res.status(400).json({
                success: false,
                message: "Hashtag is required"
            });
        }


        const cleanHashtag =
            hashtag
                .replace("#", "")
                .toLowerCase();


        const blogs = await blogModel
            .find({
                hashtags: cleanHashtag
            })
            .populate("createdBy", "name username")
            .sort({ createdAt: -1 });


        return res.status(200).json({

            success: true,

            hashtag: cleanHashtag,

            count: blogs.length,

            data: blogs
        });

    } catch (error) {

        console.error("Hashtag Search Error:", error);

        return res.status(500).json({

            success: false,

            message: "Internal server error"
        });
    }
}

// ======================================================
// EXPORTS
// ======================================================
module.exports = {
    create_post,
    delete_Post,
    get_allPost,
    addComment,
    get_Comment,
    delete_Comment,
    like_post,
    share_post,
    save_post,
    get_savedPost,
    get_byHashtag
};