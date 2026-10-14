# FoodAI – Backend API Map & Mobile Compatibility Report (Phase 1)

Source: backend zip (src/ folder, routes, controllers, validators, models). Every path and payload below was read from source.
Base: `https://<host>/api`. Health check is at root: `GET /health` (200 ok / 503 degraded).
Errors: most handlers return `{ message }`; AI handlers return `{ success:false, message }`. Validation errors return 400 `{ message }` (first Zod issue).

## 1. Authentication (critical)

The backend authenticates ONLY via an httpOnly cookie named `token` (JWT, 1 day, blacklisted on logout). `verifyToken` reads `req.cookies.token` and nothing else. Login/register return the user in the body but NOT the token.

**Blocker for React Native:** cookie jars are not reliable in RN fetch/axios on Android, and the cookie is `SameSite=strict` in production. The mobile app cannot keep a session as the backend is written today.

Proposed minimal change (not applied):
- In `auth.middleware.js`, accept `Authorization: Bearer <jwt>` when the cookie is absent. Same JWT, same blacklist, same user lookup.
- In `LoginUser` and `RegisterUser`, also return `token` in the JSON body. Web keeps the cookie unchanged.
- Mobile stores the token in Expo SecureStore.

## 2. Endpoint map

### Auth `/api/auth`
| Method | Path | Auth | Body / params | Success | Notes |
|---|---|---|---|---|---|
| POST | /register | – | `{username, name, email, password, role?: "user"\|"chef"}` | 201 `{message, user}` | Sends OTP email. **Issues the session cookie before OTP is verified.** Limit 8/15 min |
| POST | /login | – | `{username? \| email?, password}` | 200 `{message, user}` | Cookie only. Limit 10/15 min |
| POST | /vefiyOtp | – | `{email, otp: 6 digits}` | 200 `{message}` | Route name is misspelled in source; must be used as is. Limit 5/15 min |
| POST | /logout | Yes | – | 200 `{message}` | Blacklists token, clears cookie |
| POST | /forget-password | – | `{email}` | 200 (generic) | 429 on resend |
| POST | /reset-password | – | `{email, otp (4–8), newPassword, confirmNewPassword}` | 200 | |
| POST | /change-password | Yes | `{oldPassword, newPassword, confirmNewPassword}` | 201 | |
| POST | /follow/:id | Yes | – | 200 | |
| POST | /unfollow/:id | Yes | – | 200 | |
| GET | /followers/:id | – | – | 200 | |
| GET | /following/:id | – | – | 200 | |

### Profile `/api/profile` (all auth)
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | /create-profile | `{fullName?, contactNumber?, dateOfBirth?, SocialMedia?: string[], profession?, hobbies?: string[], bio?}` | 409 if exists |
| PATCH | /upadate_profile/:id | same as above | Path misspelled in source; ownership checked (403) |
| DELETE or POST | /delete_profile/:id | – | Deletes profile only, not the user account |
| GET | /get_detail | – | |

### Recipe catalog (chef-authored posts) `/api/food`
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /get-all?page&limit(≤100)&search | Yes | 200 `{message, foods[]}`. `foods[]` = `{_id, chef{username}, foodName, ingredients[], precautions, description, foodImage, createdAt}`. `search` = name regex only. Paginated only when page or limit is sent |
| GET | /get | chef | Admin list (same filters) |
| POST | /upload | chef | multipart: field `foodImage` (file) + `foodName, ingredients (array or string), precautions, description` |
| DELETE | /deletefood/:id | chef | Owner check |

There is **no** catalog edit endpoint and **no** categories, cuisine, cooking-time, diet, or ingredient search.

### AI generation `/api/ai-service` (all auth)
| Method | Path | Body | Success | Notes |
|---|---|---|---|---|
| POST | /amzingFood | `{ingredient: string[1–30], numberofperson: int 1–50, anyMedical?: string ≤500}` | 201 `{success, message, data}` | `data` = saved record with `recipe{recipeName, description, ingredients[], servings, preparationTime, instructions[], proteinSources[], proteinPerServing, caloriesPerServing, medicalConsiderations[]}`. AI-generated values, not verified. Limit **20 per hour per IP** |
| GET | /getamzefood | – | 200 `{success, count, data[]}` | Current user's protein recipes, newest first |
| POST | /amzeFood/recreate | `{existingFoodname, AddOnIngredient: string[1–30]}` | 201 `{success, data}` | `data.recipe{newFoodName, description, originalFood, addedIngredients[], ingredients[], preparationTime, instructions[], proteinSources[], proteinPerServing, caloriesPerServing}`. Limit 20/hour/IP. No image input |
| GET | /amzeFood/getrecreate | – | 200 `{success, count, data[]}` | |
| GET | /amzeFood/history | – | 200 `{success, count, data[]}` | Merged list, each item has `historyType: "protein_recipe" \| "recreated_food"`. **No pagination** |
| GET | /amzeFood/history/:id | – | 200 `{success, data}` | id = 24-hex ObjectId |
| DELETE | /amze/history/:id | – | 200 `{success, message, data:{id, historyType, deletedAt}}` | Soft delete (`isDeleted`), keeps a copy for undo |
| DELETE | /amze/history | – | 200 `{success, message, deletedCount}` | Soft delete all |
| PATCH | /amze/history/:id/undo | – | 200 `{success, message, data}` | Restores from the saved copy |

### Blog / social `/api/blog` (all auth)
POST /create-blog (multipart media, limit 30/15 min) · DELETE /delete-blog `{blogId}` · GET /get-all?page&limit · POST /addComment `{blogId, text}` · GET /get-comment?blogId · DELETE /delete-comment `{blogId, commentId}` · POST /like `{blogId}` · POST /share `{blogId}` · POST /save `{blogId}` · GET /saved · GET /hashtag/:hashtag

### Notifications `/api/notifications` (all auth)
GET / (page, limit; default 20) → `{data[], unreadCount}` · PATCH /:id/read → `{data}` · PATCH /read-all

### Feedback
POST /api/feedback/feedback `{rating 1–5}` (auth) · POST /api/feedback/complain `{complainMessage}` (**role user only**) · POST /api/feedback/contact-developer `{fullname, address, contactno, email, reason}` (auth)

### Realtime
Socket.IO (`src/socket.io/socket.js`) reads the `token` cookie from the handshake header. It cannot authenticate a bearer-only mobile client without a change.

## 3. Feature compatibility

| Feature from master prompt | Status | Detail |
|---|---|---|
| Login / register / OTP | Partial | Works, but needs Bearer token support (blocker) |
| Logout | Yes | Server-side token blacklist |
| Session restore | Blocked | Needs token in SecureStore plus Bearer support |
| Forgot / reset password | Yes | |
| Account deletion (Play requirement) | **Missing** | No endpoint deletes the user. Profile delete does not remove the account |
| Recipe discovery list + name search | Yes | Chef-authored catalog only; search by name only |
| Ingredient search, cuisine/time/diet/meal filters, categories | **Missing** | Client-side filtering can only work on the loaded page |
| Recipe detail (catalog) | Partial | Catalog recipes have no instructions, servings, time, or nutrition |
| Featured / popular / recent recipes | Partial | Recent is possible from `get-all` sorted by `createdAt`. No popularity data |
| AI generator: ingredients, servings, allergies/medical notes | Yes | `ingredient`, `numberofperson`, `anyMedical` |
| AI generator: cuisine, meal type, diet, cooking time, extra instructions | **Missing** | Would need optional schema fields and prompt changes in `ai.service.js` |
| AI generation results | Yes | Nutrition values are AI estimates and must be labelled as such |
| Recreate recipe | Yes | Name plus added ingredients only. Cannot load an existing recipe by id |
| History list / view / delete / clear / undo | Yes | No pagination on list |
| Save / regenerate AI recipe | **Missing** | No endpoint |
| Chef: create / upload image / delete | Yes | |
| Chef: edit recipe | **Missing** | No PATCH endpoint for catalog food |
| Profile view / edit | Yes | |
| Followers / following | Yes | |
| Blog posts, comments, likes, shares, saves | Yes | Blog only. Recipes have no likes, comments, or saved list |
| Notifications | Yes | |
| Feedback, contact developer | Yes | |
| Health check | Yes | Root `/health` |

## 4. Backend issues to fix or decide

1. **Bearer auth** (blocker). See section 1.
2. **Account deletion** endpoint required for Play Store, e.g. `DELETE /api/auth/account` with password confirmation. It should remove the user and related profile, AI history, and blog data according to a policy you choose.
3. **Session before OTP:** `RegisterUser` sets the cookie before OTP verification, so an unverified account can call protected routes. Recommend issuing the session only after `/vefiyOtp`.
4. **`CLIENT_URL` is hardcoded** in `src/config/env.js` line 15 as `"http://localhost:5173"`, ignoring the env var. In production the CORS allowlist is therefore wrong for the web app. Native mobile requests send no `Origin` and are unaffected. Suggested fix: `process.env.CLIENT_URL || "http://localhost:5173"`.
5. **AI rate limit is per IP** (default key), 20/hour. Users on shared mobile NAT or carrier IPs will hit it together. Consider keying by user id and enabling `TRUST_PROXY` behind Render.
6. **Route typos are part of the contract** (`/vefiyOtp`, `/upadate_profile/:id`). Keep them, or add correctly spelled aliases.
7. **Upload size:** `BODY_LIMIT` is 256kb for JSON, and food/blog uploads go through multer. Check limits before enabling image uploads.
8. **AI latency:** `AI_TIMEOUT_MS` defaults to 45 s and retries add more. The app's HTTP timeout for generation must be at least 60 s.
9. **Secrets in the upload (urgent):** the backend zip contains `.env` with live-looking values for MongoDB, JWT, Google OAuth client secret and refresh token, ImageKit private key, and Gemini API key. Values were not printed here. Rotate all of them, remove `.env` and `src.zip` from any shared archive, and never bundle any of them into the mobile app.
10. `src.zip` is a second copy of `src/`. I used the extracted `src/` folder and did not diff the two.

## 5. Decisions needed before Phase 2

- Approve backend changes for items 1, 2, and 4 (recommended). Item 3 is recommended, but changes existing web behaviour.
- Confirm the production API host. The `.env` comment points to `https://food-ai-1-333t.onrender.com`.
- Confirm the Android application ID. The frontend source is not in this upload, so existing identifiers could not be checked.
- Decide whether AI recipe customization fields (cuisine, meal type, diet, time, instructions) should be added to the backend now or shipped later.
- Decide whether to implement the chef "edit recipe" endpoint.
