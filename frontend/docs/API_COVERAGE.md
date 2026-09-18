# API Coverage Report — FoodAI

Audited against the uploaded `src.zip` backend on 18 Sep 2026.

**52 route entries registered · 49 unique endpoints · 100% connected in the frontend.**

The feedback router is mounted at three prefixes (`/api/feedback`, `/api/complaint`,
`/api/contactDeveloper`), so each of its 3 endpoints is reachable at 3 URLs (9 combinations).
The frontend calls each one at its canonical prefix; the other 6 are aliases, not gaps.

## Auth — `/api/auth`

| Method | Endpoint | Frontend caller | Screen |
|---|---|---|---|
| POST | `/register` | `auth.api.js → registerUser` | Register |
| POST | `/login` | `loginUser` | Login |
| POST | `/vefiyOtp` | `verifyOtp` | Verify OTP |
| POST | `/logout` | `logoutUser` | Navbar menu, Settings → Security |
| POST | `/change-password` | `changePassword` | Settings → Security |
| POST | `/forget-password` | `forgotPassword` | Forgot Password |
| POST | `/reset-password` | `resetPassword` | Reset Password |
| POST | `/follow/:id` | `user.api.js → followUser` | Profile |
| POST | `/unfollow/:id` | `unfollowUser` | Profile |
| GET | `/followers/:id` | `getFollowers` | Profile (follower count) |
| GET | `/following/:id` | `getFollowing` | Profile (following count) |

## Profile — `/api/profile`

| Method | Endpoint | Frontend caller | Screen |
|---|---|---|---|
| POST | `/create-profile` | `createProfile` | Create Profile |
| PATCH | `/upadate_profile/:id` | `updateProfile` | Edit Profile |
| DELETE / POST | `/delete_profile/:id` | `deleteProfile` | (available, no UI trigger) |
| GET | `/get_detail` | `getProfile` | Profile, Edit Profile |

## Food — `/api/food`

| Method | Endpoint | Auth | Frontend caller | Screen |
|---|---|---|---|---|
| POST | `/upload` | chef | `uploadFood` | Chef → Publish Recipe |
| DELETE | `/deletefood/:id` | chef | `deleteFood` | Chef → My Recipes |
| GET | `/get` | chef | `getMyFood` | Chef → My Recipes |
| GET | `/get-all` | any | `getAllFood` | Recipe Explorer, Home, Recipe Details |

## AI Service — `/api/ai-service`

| Method | Endpoint | Frontend caller | Screen |
|---|---|---|---|
| POST | `/amzingFood` | `createAiRecipe` | Create AI Recipe |
| GET | `/getamzefood` | `getAiRecipeHistory` | (available) |
| POST | `/amzeFood/recreate` | `recreateFood` | Recreate Food |
| GET | `/amzeFood/getrecreate` | `getRecreatedHistory` | Recreated History |
| GET | `/amzeFood/history` | `getUnifiedHistory` | My AI Recipes |
| GET | `/amzeFood/history/:id` | `getHistoryById` | (available) |
| DELETE | `/amze/history/:id` | `deleteHistory` | My AI Recipes → delete |
| DELETE | `/amze/history` | `deleteAllHistory` | My AI Recipes → Clear all |
| PATCH | `/amze/history/:id/undo` | `undoHistory` | My AI Recipes → Undo |

## Blog — `/api/blog`

| Method | Endpoint | Frontend caller | Screen |
|---|---|---|---|
| POST | `/create-blog` | `createBlog` | Create Post |
| DELETE | `/delete-blog` | `deleteBlog` | Community Feed |
| GET | `/get-all` | `getAllBlogs` | Community Feed, Home, Post Details |
| POST | `/addComment` | `addComment` | Comment modal |
| GET | `/get-comment` | `getComments` | Comment modal |
| DELETE | `/delete-comment` | `deleteComment` | Comment modal |
| POST | `/like` | `likeBlog` | Feed / Post / Hashtag / Saved |
| POST | `/share` | `shareBlog` | same |
| POST | `/save` | `saveBlog` | same |
| GET | `/saved` | `getSavedBlogs` | Saved Posts |
| GET | `/hashtag/:hashtag` | `getBlogsByHashtag` | Hashtag page |

## Notifications — `/api/notifications`

| Method | Endpoint | Frontend caller | Screen |
|---|---|---|---|
| GET | `/` | `getNotifications` | Notifications, bell badge |
| PATCH | `/:id/read` | `markNotificationRead` | Notifications |
| PATCH | `/read-all` | `markAllNotificationsRead` | Notifications |

Socket event `notification:new` is consumed in `context/NotificationContext.jsx`.

## Feedback family

| Method | Endpoint | Auth | Frontend caller | Screen |
|---|---|---|---|---|
| POST | `/api/feedback/feedback` | any | `sendFeedback` | Settings → Feedback |
| POST | `/api/complaint/complain` | **user only** | `sendComplaint` | Settings → Complaint |
| POST | `/api/contactDeveloper/contact-developer` | any | `contactDeveloper` | Settings → Contact Dev |

## Utility

| Method | Endpoint | Frontend caller |
|---|---|---|
| GET | `/health` | `health.api.js → getHealth` |

---

## Payload shapes the frontend sends (matched to your zod schemas)

```
POST /api/auth/register            { username, name, email, password, role? }
POST /api/auth/login               { username?, email?, password }
POST /api/auth/vefiyOtp            { email, otp }           otp = 6 digits
POST /api/auth/change-password     { oldPassword, newPassword, confirmNewPassword }
POST /api/auth/reset-password      { email, otp, newPassword, confirmNewPassword }
POST /api/auth/forget-password     { email }

POST /api/profile/create-profile   { fullName, contactNumber, dateOfBirth,
                                     SocialMedia[], profession, hobbies[], bio }

POST /api/food/upload              multipart: foodImage (file) + foodName,
                                   ingredients (JSON string), precautions, description
GET  /api/food/get-all             ?page= &limit= &search=

POST /api/ai-service/amzingFood    { ingredient[], numberofperson, anyMedical? }
POST /api/ai-service/amzeFood/recreate  { existingFoodname, AddOnIngredient[] }

POST /api/blog/create-blog         multipart: media (files) + description,
                                   socialLinks (JSON string)
POST /api/blog/like|share|save     { blogId }
POST /api/blog/addComment          { blogId, text }
DELETE /api/blog/delete-comment    { blogId, commentId }

POST /api/feedback/feedback        { rating }                  1–5
POST /api/complaint/complain       { complainMessage }
POST /api/contactDeveloper/contact-developer
                                   { fullname, address, contactno, email, reason }
```

## Backend issues found during the audit

1. **`profile.model.js` still spells the field `dateOfBrith`** while the controller and zod
   schema both use `dateOfBirth`. Mongoose runs in strict mode, so the date is silently
   dropped on save and never persists. Rename the model field to `dateOfBirth`.
2. **`/api/food/get` returns every chef's recipes**, not just the caller's — the controller
   builds no `chef` filter. The frontend filters client-side; add
   `filter.chef = req.auth.id` to fix it properly.
3. **No `GET /api/food/:id`.** Recipe details falls back to `/get-all` and picks the match.
4. **No "current session" endpoint** (e.g. `GET /api/auth/me`). The frontend mirrors the last
   known user in localStorage and clears it on any 401. A `/me` endpoint would be cleaner.
5. **`/api/complaint/complain` uses `verifyUser`** so chef accounts get 403. Intentional?
   If chefs should be able to complain, switch to `verifyToken`.
6. **`contact.model.js` bcrypt-hashes `contactno` and `email`** before saving, so stored
   contact records are unreadable. The email that gets sent carries the plaintext, so this
   works, but the DB rows are effectively write-only.
7. **`socket.js` reads `process.env.FRONTEND_URL`** while `app.js` uses `env.CLIENT_URL`.
   Set both, or the socket CORS will block the browser.
