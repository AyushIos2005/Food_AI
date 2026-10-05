const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRoute = require("./routes/user.route");
const profileRoute = require("./routes/profile.route");
const foodRoute = require("./routes/food.route");
const amzeRoute = require("./routes/amze.route");
const blogRoute = require("./routes/blog.route");
const feedbackRoute = require("./routes/feedback.route");
const { sanitizeRequest } = require("./middlewares/sanitize.middleware");
const { apiLimiter } = require("./middlewares/rateLimit.middleware");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");
const { env } = require("./config/env");
const { isDbConnected } = require("./db/db");
const notificationRoutes = require("./routes/notification.route");


const app = express();

if (env.TRUST_PROXY) {
    app.set("trust proxy", 1);
}

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = env.CLIENT_URL.split(",").map((origin) => origin.trim()).filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    optionsSuccessStatus: 204
}));

app.use(express.json({ limit: env.BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.BODY_LIMIT }));
app.use(cookieParser());
app.use(sanitizeRequest);
app.use("/api", apiLimiter);
app.get("/",(req,res) => {
    res.send("API Working properly")
})
app.get("/health", (req, res) => {
    const database = isDbConnected() ? "connected" : "disconnected";
    const ok = database === "connected";
    return res.status(ok ? 200 : 503).json({
        status: ok ? "ok" : "degraded",
        uptime: process.uptime(),
        database
    });
});

app.use("/api/auth", userRoute);
app.use("/api/profile", profileRoute);
app.use("/api/food", foodRoute);
app.use("/api/ai-service", amzeRoute);
app.use("/api/blog", blogRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/complaint", feedbackRoute);
app.use("/api/contactDeveloper", feedbackRoute);
app.use("/api/notifications",notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
