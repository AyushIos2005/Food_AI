const { setupDB, teardownDB, clearDB, createTestUser } = require("./setup");

// Never send real email from tests.
jest.mock("../src/services/email.service", () => jest.fn().mockResolvedValue(undefined));

const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../src/app");
const userModel = require("../src/models/user.model");
const tokenBlacklistModel = require("../src/models/blacklist.model");
const sendEmail = require("../src/services/email.service");

/*
 * NOTE ON RATE LIMITS
 * The real limiters are mounted on these routes (register: 8 / 15 min,
 * login: 10 / 15 min, per IP, in-memory). Each Jest file gets a fresh module
 * registry, so counters start at zero here. Keep the number of register and
 * login requests in this file below those limits (currently 6 and 6).
 */

const validRegistration = {
    username: "newuser",
    name: "New User",
    email: "newuser@example.com",
    password: "Password123"
};

function tokenCookie(res) {
    const cookies = res.headers["set-cookie"] || [];
    return cookies.find((c) => c.startsWith("token="));
}

beforeAll(setupDB);
afterAll(teardownDB);
beforeEach(async () => {
    await clearDB();
    jest.clearAllMocks();
});

describe("POST /api/auth/register", () => {
    it("registers a user, sets an httpOnly auth cookie and never leaks the password", async () => {
        const res = await request(app).post("/api/auth/register").send(validRegistration);

        expect(res.status).toBe(201);
        expect(res.body.user).toMatchObject({
            username: "newuser",
            name: "New User",
            email: "newuser@example.com",
            role: "user"
        });
        expect(res.body.user.password).toBeUndefined();

        const cookie = tokenCookie(res);
        expect(cookie).toBeDefined();
        expect(cookie).toMatch(/HttpOnly/i);

        const stored = await userModel.findOne({ username: "newuser" });
        expect(stored.password).not.toBe(validRegistration.password);
        expect(await bcrypt.compare(validRegistration.password, stored.password)).toBe(true);
        expect(sendEmail).toHaveBeenCalledTimes(1);
    });

    it("ignores a client-supplied role (privilege escalation is not possible)", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ ...validRegistration, role: "chef" });

        expect(res.status).toBe(201);
        expect(res.body.user.role).toBe("user");

        const stored = await userModel.findOne({ username: "newuser" });
        expect(stored.role).toBe("user");
    });

    it("rejects a duplicate username or email with 409", async () => {
        await createTestUser({ username: "newuser", email: "newuser@example.com" });

        const res = await request(app).post("/api/auth/register").send(validRegistration);

        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(/already exists/i);
    });

    it("rejects an invalid email with 400", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ ...validRegistration, email: "not-an-email" });

        expect(res.status).toBe(400);
    });

    it("rejects a password shorter than 6 characters with 400", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ ...validRegistration, password: "123" });

        expect(res.status).toBe(400);
    });

    it("rejects a missing username with 400", async () => {
        const { username, ...withoutUsername } = validRegistration;
        const res = await request(app).post("/api/auth/register").send(withoutUsername);

        expect(res.status).toBe(400);
    });
});

describe("POST /api/auth/login", () => {
    it("logs in with username and sets the auth cookie", async () => {
        const { user, password } = await createTestUser({ username: "loginuser" });

        const res = await request(app)
            .post("/api/auth/login")
            .send({ username: "loginuser", password });

        expect(res.status).toBe(200);
        expect(res.body.user).toMatchObject({ id: user._id.toString(), username: "loginuser" });
        expect(res.body.user.password).toBeUndefined();
        expect(tokenCookie(res)).toBeDefined();
    });

    it("logs in with email", async () => {
        const { user, password } = await createTestUser({ email: "login@example.com" });

        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "login@example.com", password });

        expect(res.status).toBe(200);
        expect(res.body.user.id).toBe(user._id.toString());
    });

    it("rejects a wrong password with 401 and no cookie", async () => {
        const { user } = await createTestUser();

        const res = await request(app)
            .post("/api/auth/login")
            .send({ username: user.username, password: "WrongPassword1" });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid credentials");
        expect(tokenCookie(res)).toBeUndefined();
    });

    it("rejects an unknown user with the same generic 401", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ username: "ghost", password: "Password123" });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid credentials");
    });

    it("rejects a request with neither username nor email with 400", async () => {
        const res = await request(app).post("/api/auth/login").send({ password: "Password123" });

        expect(res.status).toBe(400);
    });

    it("rejects a request with no password with 400", async () => {
        const res = await request(app).post("/api/auth/login").send({ username: "someone" });

        expect(res.status).toBe(400);
    });
});

describe("POST /api/auth/logout", () => {
    it("blacklists the token, clears the cookie and invalidates later requests", async () => {
        const { token, cookie } = await createTestUser();

        const res = await request(app).post("/api/auth/logout").set("Cookie", cookie);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/logged out/i);

        const cleared = tokenCookie(res);
        expect(cleared).toMatch(/^token=;/);

        expect(await tokenBlacklistModel.findOne({ token })).not.toBeNull();

        const reuse = await request(app).post("/api/auth/logout").set("Cookie", cookie);
        expect(reuse.status).toBe(401);
    });

    it("returns 401 when no token is supplied", async () => {
        const res = await request(app).post("/api/auth/logout");

        expect(res.status).toBe(401);
    });
});

describe("POST /api/auth/change-password", () => {
    const url = "/api/auth/change-password";

    it("changes the password when the old password is correct", async () => {
        const { user, password, cookie } = await createTestUser();

        const res = await request(app)
            .post(url)
            .set("Cookie", cookie)
            .send({
                oldPassword: password,
                newPassword: "NewPassword456",
                confirmNewPassword: "NewPassword456"
            });

        expect(res.status).toBe(201);
        expect(res.body.message).toMatch(/updated successfully/i);

        const stored = await userModel.findById(user._id);
        expect(await bcrypt.compare("NewPassword456", stored.password)).toBe(true);
        expect(await bcrypt.compare(password, stored.password)).toBe(false);
    });

    it("rejects an incorrect old password with 400 and leaves the password unchanged", async () => {
        const { user, password, cookie } = await createTestUser();

        const res = await request(app)
            .post(url)
            .set("Cookie", cookie)
            .send({
                oldPassword: "NotMyPassword1",
                newPassword: "NewPassword456",
                confirmNewPassword: "NewPassword456"
            });

        expect(res.status).toBe(400);

        const stored = await userModel.findById(user._id);
        expect(await bcrypt.compare(password, stored.password)).toBe(true);
    });

    it("rejects mismatched new password and confirmation with 400", async () => {
        const { password, cookie } = await createTestUser();

        const res = await request(app)
            .post(url)
            .set("Cookie", cookie)
            .send({
                oldPassword: password,
                newPassword: "NewPassword456",
                confirmNewPassword: "SomethingElse789"
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/not Same/i);
    });

    it("rejects a new password shorter than 6 characters with 400", async () => {
        const { password, cookie } = await createTestUser();

        const res = await request(app)
            .post(url)
            .set("Cookie", cookie)
            .send({ oldPassword: password, newPassword: "abc", confirmNewPassword: "abc" });

        expect(res.status).toBe(400);
    });

    it("requires authentication", async () => {
        const res = await request(app)
            .post(url)
            .send({
                oldPassword: "Password123",
                newPassword: "NewPassword456",
                confirmNewPassword: "NewPassword456"
            });

        expect(res.status).toBe(401);
    });
});
