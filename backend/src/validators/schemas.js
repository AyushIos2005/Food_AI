const { z } = require("zod");

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid id");

const email = z.string().trim().toLowerCase().email("Invalid email");

const password = z.string().min(6, "Password must be at least 6 characters").max(128);

const username = z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9._-]+$/, "Invalid username");

const registerSchema = z.object({
    username,
    name: z.string().trim().min(1).max(80),
    email,
    password,
    role: z.enum(["user", "chef"]).optional()
});

const loginSchema = z.object({
    username: z.string().trim().min(1).max(80).optional(),
    email: email.optional(),
    password: z.string().min(1).max(128)
}).refine((data) => data.username || data.email, {
    message: "Username or email is required"
});

const otpSchema = z.object({
    email,
    otp: z.string().trim().regex(/^\d{6}$/, "OTP must be 6 digits")
});

const changePasswordSchema = z.object({
    oldPassword: z.string().min(1).max(128),
    newPassword: password,
    confirmNewPassword: z.string().min(1).max(128)
});

const forgetPasswordSchema = z.object({
    email
});

const resetPasswordSchema = z.object({
    email,
    otp: z.string().trim().min(4).max(8),
    newPassword: password,
    confirmNewPassword: z.string().min(1).max(128)
});

const profileSchema = z.object({
    fullName: z.string().trim().min(1).max(80).optional(),
    contactNumber: z.string().trim().max(20).optional(),
    dateOfBirth: z.union([z.string(), z.coerce.date()]).optional(),
    SocialMedia: z.array(z.string().max(200)).optional(),
    profession: z.string().trim().max(80).optional(),
    hobbies: z.array(z.string().max(80)).optional(),
    bio: z.string().trim().max(1000).optional()
});

const foodBodySchema = z.object({
    foodName: z.string().trim().min(1).max(120),
    ingredients: z.union([z.array(z.string()), z.string()]),
    precautions: z.string().trim().min(1).max(2000),
    description: z.string().trim().min(1).max(5000)
});

const blogIdSchema = z.object({
    blogId: objectId
});

const commentSchema = z.object({
    blogId: objectId,
    text: z.string().trim().min(1).max(1000)
});

const deleteCommentSchema = z.object({
    blogId: objectId,
    commentId: objectId
});

const proteinSchema = z.object({
    ingredient: z.array(z.string().trim().min(1).max(80)).min(1).max(30),
    numberofperson: z.coerce.number().int().positive().max(50),
    anyMedical: z.string().trim().max(500).optional()
});

const recreateSchema = z.object({
    existingFoodname: z.string().trim().min(1).max(120),
    AddOnIngredient: z.array(z.string().trim().min(1).max(80)).min(1).max(30)
});

const feedbackSchema = z.object({
    rating: z.coerce.number().min(1).max(5)
});

const complainSchema = z.object({
    complainMessage: z.string().trim().min(1).max(2000)
});

const contactSchema = z.object({
    fullname: z.string().trim().min(1).max(80),
    address: z.string().trim().min(1).max(300),
    contactno: z.union([z.string(), z.number()]),
    email,
    reason: z.string().trim().min(1).max(2000)
});

const idParamSchema = z.object({
    id: objectId
});

const hashtagParamSchema = z.object({
    hashtag: z.string().trim().min(1).max(50)
});

const paginationQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().trim().max(100).optional()
}).passthrough();

module.exports = {
    objectId,
    registerSchema,
    loginSchema,
    otpSchema,
    changePasswordSchema,
    forgetPasswordSchema,
    resetPasswordSchema,
    profileSchema,
    foodBodySchema,
    blogIdSchema,
    commentSchema,
    deleteCommentSchema,
    proteinSchema,
    recreateSchema,
    feedbackSchema,
    complainSchema,
    contactSchema,
    idParamSchema,
    hashtagParamSchema,
    paginationQuerySchema
};
