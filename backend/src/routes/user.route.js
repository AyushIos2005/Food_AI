const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
    registerSchema,
    loginSchema,
    otpSchema,
    changePasswordSchema,
    resetPasswordSchema,
    forgetPasswordSchema,
    idParamSchema
} = require("../validators/schemas");
const {
    loginLimiter,
    registerLimiter,
    otpLimiter,
    passwordResetLimiter
} = require("../middlewares/rateLimit.middleware");

const user = express.Router();

user.post("/register", registerLimiter, validate(registerSchema), userController.RegisterUser);
user.post("/login", loginLimiter, validate(loginSchema), userController.LoginUser);
user.post("/vefiyOtp", otpLimiter, validate(otpSchema), userController.userotpVerfication);
user.post("/logout", authMiddleware.verifyToken, userController.Loggout);
user.post("/change-password", authMiddleware.verifyToken, validate(changePasswordSchema), userController.changePassword);
user.post("/reset-password", passwordResetLimiter, validate(resetPasswordSchema), userController.resetPassword);
user.post("/forget-password", otpLimiter, validate(forgetPasswordSchema), userController.forgetPassword);

user.post("/follow/:id", authMiddleware.verifyToken, validate(idParamSchema, "params"), userController.followUser);
user.post("/unfollow/:id", authMiddleware.verifyToken, validate(idParamSchema, "params"), userController.unfollowUser);
user.get("/followers/:id", validate(idParamSchema, "params"), userController.getFollowers);
user.get("/following/:id", validate(idParamSchema, "params"), userController.getFollowing);

module.exports = user;
