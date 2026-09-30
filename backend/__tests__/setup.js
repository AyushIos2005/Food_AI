/**
 * Shared Jest helpers: in-memory MongoDB lifecycle + test user factory.
 *
 * IMPORTANT: require this file BEFORE requiring "../src/app" in a test suite.
 * The env vars below must exist before src/config/env.js and the ImageKit
 * clients are loaded.
 */
const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Test-only configuration (never real secrets).
process.env.JWT_KEY = "test-jwt-secret-key";
process.env.JWT_EXPIRES_IN = "1d";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.IMAGE_PRIVATE_KEY = "private_test_key";
process.env.GOOGLE_GENAI_API_KEY = "test-genai-key";

let mongoServer;

async function setupDB() {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MON_URI = uri;
    await mongoose.connect(uri);
}

async function teardownDB() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }
    if (mongoServer) {
        await mongoServer.stop();
        mongoServer = undefined;
    }
}

async function clearDB() {
    const { collections } = mongoose.connection;
    await Promise.all(
        Object.values(collections).map((collection) => collection.deleteMany({}))
    );
}

/**
 * Inserts a user directly (no HTTP, so rate limiters are not consumed) and
 * returns the user document, a signed JWT and a ready-to-use Cookie header.
 */
async function createTestUser(overrides = {}) {
    const userModel = require("../src/models/user.model");

    const unique = crypto.randomBytes(4).toString("hex");
    const password = overrides.password || "Password123";
    const role = overrides.role || "user";

    const user = await userModel.create({
        username: overrides.username || `user_${unique}`,
        name: overrides.name || "Test User",
        email: overrides.email || `user_${unique}@example.com`,
        password: await bcrypt.hash(password, 4),
        role,
        status: overrides.status === undefined ? true : overrides.status
    });

    const token = jwt.sign(
        { id: user._id, email: user.email, username: user.username, role: user.role },
        process.env.JWT_KEY,
        { expiresIn: "1d" }
    );

    return { user, token, password, cookie: `token=${token}` };
}

module.exports = { setupDB, teardownDB, clearDB, createTestUser };
