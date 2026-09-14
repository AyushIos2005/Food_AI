const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },

        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        }
    },
    {
        timestamps: true
    }
);

const socialLinkSchema = new mongoose.Schema(
    {
        platform: {
            type: String,
            enum: [
                "instagram",
                "facebook",
                "twitter",
                "youtube",
                "linkedin",
                "other"
            ],
            required: true
        },

        platformId: {
            type: String,
            required: true,
            trim: true
        },

        url: {
            type: String,
            trim: true
        }
    },
    {
        _id: false
    }
);

const mediaSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: ["image", "video"],
            required: true
        }
    },
    {
        _id: false
    }
);

const blogSchema = new mongoose.Schema(
    {
        media: {
            type: [mediaSchema],
            default: []
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000
        },

        hashtags: {
            type: [String],
            default: []
        },

        socialLinks: {
            type: [socialLinkSchema],
            default: []
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        ],
        comments: {
            type: [commentSchema],
            default: []
        },

        shares: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        ],

        savedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        ]
    },
    {
        timestamps: true
    }
);

blogSchema.index({ createdBy: 1, createdAt: -1 });
blogSchema.index({ hashtags: 1, createdAt: -1 });
blogSchema.index({ savedBy: 1, createdAt: -1 });
blogSchema.index({ createdAt: -1 });

const blogModel = mongoose.model("Blog", blogSchema);


module.exports = blogModel;