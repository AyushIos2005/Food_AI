# FoodAI — Admin / Chef Manual

FoodAI has two roles, decided at registration and stored on the user record:

| Role | Value | What it unlocks |
|---|---|---|
| User | `user` | Everything in the User Manual, plus filing complaints |
| Chef (admin) | `chef` | All of the above **except complaints**, plus publishing and managing recipes |

In the codebase the chef role *is* the admin role — `verifyAdmin` middleware checks for
`role === "chef"` and returns `403 Admins only` otherwise. There is no separate super-admin.

---

## 1. Becoming a chef

Select **Chef** on the registration screen before submitting. The role is set at creation
time and there is no in-app screen to change it afterwards — to promote an existing account,
update the document directly:

```js
db.users.updateOne({ username: "someone" }, { $set: { role: "chef" } })
```

The change takes effect on the user's next request, since `verifyToken` re-reads the user on
every call.

---

## 2. What a chef sees

Once logged in as a chef, a **Chef Tools** group appears in the sidebar:

- **Chef Recipes** — manage everything you've published
- **Create Recipe** — publish a new one

A green **Chef** badge appears next to your name on your profile.

---

## 3. Publishing a recipe

Go to **Chef Tools → Create Recipe**.

| Field | Rules |
|---|---|
| **Food image** | Required. One image file. Uploaded to cloud storage; the URL is stored. |
| **Food name** | Required, 1–120 characters |
| **Ingredients** | Required, at least one. Added one at a time (Enter or comma). |
| **Precautions** | Required, 1–2000 characters — allergens, spice level, dietary warnings |
| **Description** | Required, 1–5000 characters |

Press **Publish Recipe**. On success you land back on **Chef Recipes**.

### Writing good precautions
This field is what users read before cooking, so be specific:

- Name allergens plainly — *contains peanuts, dairy and gluten*
- Flag heat — *very spicy; reduce chilli for children*
- Note dietary fit — *not suitable for diabetics — high sugar*
- Mention risky steps — *deep frying; keep water away from the oil*

### Upload limits
Recipe uploads pass through a rate limiter. If you publish several in quick succession you
may get a **429 Too Many Requests** — wait a minute and retry.

---

## 4. Managing your recipes

**Chef Tools → Chef Recipes** lists your published recipes as cards.

- **View Recipe** opens the public page exactly as users see it.
- The **bin icon** opens a confirmation dialog. Confirming removes the recipe permanently.

You can only delete recipes you created — the backend checks ownership and returns
`403 You are not allowed to delete this food` otherwise.

> **Known backend behaviour:** `GET /api/food/get` currently returns *every* chef's recipes,
> not just yours, because the controller applies no `chef` filter. The frontend filters
> client-side by your user id so the screen is correct. To fix it properly, add
> `filter.chef = req.auth.id` in `getFood` when the route is the chef-scoped one.

There is no edit screen — the backend exposes no update endpoint for food. To change a
recipe, delete it and publish a corrected version.

---

## 5. Moderation powers

Chefs are not global moderators. Deletion rights are ownership-based across the app:

| Content | Who can delete |
|---|---|
| A recipe | The chef who published it |
| A community post | The user who created it |
| A comment | The comment's author **or** the owner of the post it sits on |
| A profile | Its owner |

So on your own community posts you can remove anyone's comment, but you cannot remove
another chef's recipe or another user's post from inside the app. Removing those requires a
direct database operation.

---

## 6. Things a chef cannot do

- **File a complaint.** `/api/complaint/complain` is guarded by `verifyUser`, which requires
  `role === "user"`. A chef account gets `403 Users only`. The Complaint screen shows a
  warning about this. Use **Contact Developer** instead, which accepts any logged-in role.
- **Edit a published recipe** — no update endpoint exists.
- **View other users' complaints, feedback or contact submissions** — these are stored but
  no read endpoint exists. Query the collections directly.

---

## 7. Reviewing submitted data

Feedback, complaints and contact requests are written to MongoDB with no admin UI.

```js
// Ratings, newest first
db.feedbacks.find().sort({ _id: -1 })

// Complaints with the reporter joined in
db.complains.aggregate([
  { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
  { $sort: { _id: -1 } }
])

// Contact-developer submissions
db.contacts.find().sort({ _id: -1 })
```

> **Note:** `contact.model.js` bcrypt-hashes `contactno` and `email` before saving, so those
> two columns are unreadable in the database. The usable copy is the email the backend sends
> to `GOOGLE_USER` at submission time — keep that inbox.

---

## 8. Operating the backend

### Required environment
Validated in `config/env.js` at boot; the process refuses to start if something's missing.

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_KEY` | Signing secret for session tokens |
| `CLIENT_URL` | Allowed CORS origins, comma-separated |
| `FRONTEND_URL` | Socket.IO CORS origin — **must also be set**, `socket.js` reads it separately |
| `GOOGLE_USER` / mail credentials | Outbound email for OTP and contact forms |
| Cloud storage keys | Image and video uploads |
| `BODY_LIMIT` | Max request body size |
| `TRUST_PROXY` | Set when running behind nginx or a load balancer |

### Health check
`GET /health` returns:

```json
{ "status": "ok", "uptime": 1234.5, "database": "connected" }
```

It answers **200** when Mongo is connected and **503** when it isn't — point your uptime
monitor at it.

### Rate limits in force
- `apiLimiter` — every `/api` route
- `loginLimiter`, `registerLimiter`, `otpLimiter`, `passwordResetLimiter` — auth flows
- `aiLimiter` — AI generation
- `uploadLimiter` — recipe and post uploads

Users hitting these see **429**. Tune the values in `middlewares/rateLimit.middleware.js`.

### Security already in place
- `helmet` security headers
- CORS locked to an allow-list, with credentials enabled
- Request sanitisation against injection
- `zod` validation on body, params and query
- bcrypt password hashing at 12 rounds
- OTPs stored as SHA-256 hashes, compared in constant time
- Logout blacklists the token so it cannot be replayed
- Socket.IO authenticates from the same cookie and never trusts a client-supplied user id

---

## 9. Deployment checklist

1. Set every environment variable above — including **both** `CLIENT_URL` and `FRONTEND_URL`.
2. Point `CLIENT_URL` at your deployed frontend origin, not `localhost`.
3. Build the frontend with `VITE_API_URL` set to your public backend URL:
   ```bash
   VITE_API_URL=https://api.yourdomain.com npm run build
   ```
4. Serve the frontend `dist/` folder with SPA fallback — every unknown path must return
   `index.html`, or refreshing on `/community` will 404.
5. Run the backend over **HTTPS** so the session cookie can be `Secure` and `SameSite=None`
   if the two are on different domains.
6. Set `TRUST_PROXY` if you're behind nginx, so rate limiting sees real client IPs.
7. Verify `GET /health` returns 200 before sending traffic.
8. Apply the `dateOfBrith` → `dateOfBirth` model fix, or dates of birth will never save.

---

## 10. Known issues to fix

| # | Issue | Where | Impact |
|---|---|---|---|
| 1 | `dateOfBrith` in the model vs `dateOfBirth` everywhere else | `models/profile.model.js` | DOB silently never saves |
| 2 | `/api/food/get` returns all chefs' recipes | `controllers/food.controller.js` | Frontend has to filter client-side |
| 3 | No `GET /api/food/:id` | `routes/food.route.js` | Detail page must fetch the whole list |
| 4 | No `GET /api/auth/me` | `routes/user.route.js` | Session state mirrored in localStorage |
| 5 | Complaints blocked for chefs | `routes/feedback.route.js` | Chefs can't file complaints |
| 6 | Contact details bcrypt-hashed before storage | `controllers/feedback.controller.js` | Stored rows unreadable |
| 7 | Socket reads `FRONTEND_URL`, app reads `CLIENT_URL` | `socket.io/socket.js` | Live notifications break if only one is set |
| 8 | No update endpoint for food | `routes/food.route.js` | Recipes can only be deleted and reposted |
