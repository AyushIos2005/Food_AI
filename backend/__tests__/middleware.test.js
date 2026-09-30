const { setupDB, teardownDB, clearDB, createTestUser } = require("./setup");

// Never send real email from tests.
jest.mock("../src/services/email.service", () => jest.fn().mockResolvedValue(undefined));

const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const request = require("supertest");

const app = require("../src/app");
const userModel = require("../src/models/user.model");
const tokenBlacklistModel = require("../src/models/blacklist.model");
const {
    verifyToken,
    verifyAdmin,
    verifyUser,
    requireRole
} = require("../src/middlewares/auth.middleware");

/*
 * A small app that mounts the auth middlewares directly, so each one can be
 * exercised in isolation. The final error handler lets us assert that errors
 * are forwarded with next(err) instead of being swallowed.
 */
function buildMiddlewareApp() {
    const testApp = express();
    testApp.use(cookieParser());

    const ok = (req, res) => res.status(200).json({ ok: true, auth: req.auth });

    testApp.get("/me", verifyToken, ok);
    testApp.get("/chef-only", verifyAdmin, ok);
    testApp.get("/user-only", verifyUser, ok);
    testApp.get("/any-of-user-chef", requireRole("user", "chef"), ok);
    testApp.get("/role-chef", requireRole("chef"), ok);

    // eslint-disable-next-line no-unused-vars
    testApp.use((err, req, res, next) => {
        res.status(500).json({ forwarded: true, message: err.message });
    });

    return testApp;
}

const mwApp = buildMiddlewareApp();

beforeAll(setupDB);
afterAll(teardownDB);
beforeEach(async () => {
    await clearDB();
});
afterEach(() => {
    jest.restoreAllMocks();
});

describe("verifyToken - token parsing", () => {
    it("returns 401 when no token is provided", async () => {
        const res = await request(mwApp).get("/me");

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Unauthorized");
    });

    it("accepts a token from the cookie", async () => {
        const { user, cookie } = await createTestUser();

        const res = await request(mwApp).get("/me").set("Cookie", cookie);

        expect(res.status).toBe(200);
        expect(res.body.auth).toMatchObject({ id: user._id.toString(), role: "user" });
    });

    it("accepts a token from the Authorization header, stripping the Bearer prefix", async () => {
        const { user, token } = await createTestUser();

        const res = await request(mwApp).get("/me").set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.auth.id).toBe(user._id.toString());
    });

    it("prefers the cookie over the Authorization header", async () => {
        const { user, cookie } = await createTestUser();

        const res = await request(mwApp)
            .get("/me")
            .set("Cookie", cookie)
            .set("Authorization", "Bearer garbage.token.value");

        expect(res.status).toBe(200);
        expect(res.body.auth.id).toBe(user._id.toString());
    });

    it("returns 401 for an empty Bearer header", async () => {
        const res = await request(mwApp).get("/me").set("Authorization", "Bearer ");

        expect(res.status).toBe(401);
    });

    it("returns 401 for a malformed token", async () => {
        const res = await request(mwApp).get("/me").set("Authorization", "Bearer not-a-jwt");

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid or expired token");
    });

    it("returns 401 for a token signed with a different key", async () => {
        const { user } = await createTestUser();
        const forged = jwt.sign({ id: user._id, role: "chef" }, "some-other-secret");

        const res = await request(mwApp).get("/me").set("Authorization", `Bearer ${forged}`);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid or expired token");
    });

    it("returns 401 for an expired token", async () => {
        const { user } = await createTestUser();
        const expired = jwt.sign(
            { id: user._id, exp: Math.floor(Date.now() / 1000) - 60 },
            process.env.JWT_KEY
        );

        const res = await request(mwApp).get("/me").set("Authorization", `Bearer ${expired}`);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid or expired token");
    });

    it("returns 401 for a blacklisted token", async () => {
        const { token } = await createTestUser();
        await tokenBlacklistModel.create({ token });

        const res = await request(mwApp).get("/me").set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid or expired token");
    });

    it("returns 401 when the user no longer exists", async () => {
        const { user, token } = await createTestUser();
        await userModel.deleteOne({ _id: user._id });

        const res = await request(mwApp).get("/me").set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid or expired token");
    });
});

describe("RBAC - verifyAdmin / verifyUser / requireRole", () => {
    it("blocks a regular user from chef-only routes (403) and allows a chef", async () => {
        const regular = await createTestUser({ role: "user" });
        const chef = await createTestUser({ role: "chef" });

        const blocked = await request(mwApp).get("/chef-only").set("Cookie", regular.cookie);
        expect(blocked.status).toBe(403);
        expect(blocked.body.message).toBe("Admins only");

        const allowed = await request(mwApp).get("/chef-only").set("Cookie", chef.cookie);
        expect(allowed.status).toBe(200);
    });

    it("blocks a chef from user-only routes (403) and allows a regular user", async () => {
        const regular = await createTestUser({ role: "user" });
        const chef = await createTestUser({ role: "chef" });

        const blocked = await request(mwApp).get("/user-only").set("Cookie", chef.cookie);
        expect(blocked.status).toBe(403);
        expect(blocked.body.message).toBe("Users only");

        const allowed = await request(mwApp).get("/user-only").set("Cookie", regular.cookie);
        expect(allowed.status).toBe(200);
    });

    it("requireRole allows any listed role and blocks others", async () => {
        const regular = await createTestUser({ role: "user" });
        const chef = await createTestUser({ role: "chef" });

        const userOk = await request(mwApp).get("/any-of-user-chef").set("Cookie", regular.cookie);
        const chefOk = await request(mwApp).get("/any-of-user-chef").set("Cookie", chef.cookie);
        expect(userOk.status).toBe(200);
        expect(chefOk.status).toBe(200);

        const blocked = await request(mwApp).get("/role-chef").set("Cookie", regular.cookie);
        expect(blocked.status).toBe(403);
        expect(blocked.body.message).toBe("Forbidden");
    });

    it("returns 401 (not 403) when unauthenticated", async () => {
        for (const path of ["/chef-only", "/user-only", "/any-of-user-chef", "/role-chef"]) {
            const res = await request(mwApp).get(path);
            expect(res.status).toBe(401);
        }
    });

    it("accepts Bearer tokens on role-protected routes", async () => {
        const chef = await createTestUser({ role: "chef" });

        const res = await request(mwApp)
            .get("/chef-only")
            .set("Authorization", `Bearer ${chef.token}`);

        expect(res.status).toBe(200);
    });

    it("blocks a chef from a user-only route on the real app (POST /api/feedback/complain)", async () => {
        const chef = await createTestUser({ role: "chef" });

        const res = await request(app)
            .post("/api/feedback/complain")
            .set("Cookie", chef.cookie)
            .send({ complainMessage: "Something is wrong" });

        expect(res.status).toBe(403);
    });

    it("allows a regular user on the same real-app route", async () => {
        const regular = await createTestUser({ role: "user" });

        const res = await request(app)
            .post("/api/feedback/complain")
            .set("Cookie", regular.cookie)
            .send({ complainMessage: "Something is wrong" });

        expect(res.status).toBe(201);
    });
});

describe("error forwarding from verifyToken", () => {
    // A non-JWT failure (e.g. a database error) must reach the error handler
    // via next(err), for every wrapper around verifyToken.
    const cases = [
        ["verifyAdmin", "/chef-only"],
        ["verifyUser", "/user-only"],
        ["requireRole", "/any-of-user-chef"]
    ];

    it.each(cases)("%s forwards unexpected errors to next(err)", async (_name, path) => {
        const { cookie } = await createTestUser();

        jest.spyOn(userModel, "findById").mockImplementationOnce(() => {
            throw new Error("db exploded");
        });

        const res = await request(mwApp).get(path).set("Cookie", cookie);

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ forwarded: true, message: "db exploded" });
    });
});

/*
 * Rate limiting runs last on purpose: the limiters are in-memory, per IP and
 * shared for the lifetime of this file, and these tests deliberately exhaust
 * the login and register limiters. No earlier test in this file calls those
 * endpoints.
 */
describe("rate limiting", () => {
    it("blocks the 11th login attempt within the window with 429", async () => {
        const attempt = () =>
            request(app).post("/api/auth/login").send({ username: "ghost", password: "Password123" });

        for (let i = 0; i < 10; i++) {
            const res = await attempt();
            expect(res.status).toBe(401);
        }

        const blocked = await attempt();
        expect(blocked.status).toBe(429);
        expect(blocked.body.message).toMatch(/too many login attempts/i);
    });

    it("blocks the 9th registration attempt within the window with 429", async () => {
        // An empty body fails validation (400) but still counts toward the limit.
        const attempt = () => request(app).post("/api/auth/register").send({});

        for (let i = 0; i < 8; i++) {
            const res = await attempt();
            expect(res.status).toBe(400);
        }

        const blocked = await attempt();
        expect(blocked.status).toBe(429);
        expect(blocked.body.message).toMatch(/too many registration attempts/i);
    });

    it("does not rate limit unrelated endpoints such as /health", async () => {
        const res = await request(app).get("/health");

        expect([200, 503]).toContain(res.status);
        expect(res.status).not.toBe(429);
    });
});
