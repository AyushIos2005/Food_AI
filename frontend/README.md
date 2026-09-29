# DishFinder — Frontend

A React (Vite + Tailwind v4) frontend built to match the DishFinder UI mockups,
wired end-to-end to the `food-ai` Express/Mongo backend in `backend.zip`.

## Setup

```bash
npm install
cp .env.example .env      # set VITE_API_URL to your backend, e.g. http://localhost:3000/api
npm run dev
```

Run the backend separately (`node server.js` in the backend folder, default port 3000).

## Backend notes / requirements

The backend authenticates with an **httpOnly cookie** (`token`), so:

- `src/api/client.js` sets `withCredentials: true` on every request — your backend must
  enable CORS with a specific origin + `credentials: true` for this to work:
  ```js
  const cors = require("cors");
  app.use(cors({ origin: "http://localhost:5173", credentials: true }));
  ```
  (`cors` is already in the backend's `package.json` but isn't wired into `app.js` yet.)
- In production, serve the frontend and backend from the same site (or same parent domain)
  since the auth cookie is `sameSite: "strict"`.

## Pages ↔ API mapping

| Screen | Route | Backend endpoints used |
|---|---|---|
| Splash | `/` | — |
| Onboarding | `/onboarding` | — (local flag only) |
| Login | `/login` | `POST /api/auth/login` |
| Register | `/register` | `POST /api/auth/register` |
| OTP Verify | `/verify-otp` | `POST /api/auth/vefiyOtp` |
| Forgot/Reset Password | `/forgot-password` | `POST /api/auth/forget-password`, `POST /api/auth/reset-password` |
| Preference Setup | `/preferences` | local only (no backend route exists yet) |
| Home | `/home` | `GET /api/food/get-all`, `GET /api/blog/get-all` |
| Explore / Search | `/explore` | `GET /api/food/get-all` |
| Random Dish | `/random` | `GET /api/food/get-all` (random pick client-side) |
| Dish Detail | `/dish/:id` | `GET /api/food/get-all` (backend has no single-dish route) |
| Food Community (blog feed) | `/community` | `GET /api/blog/get-all`, like/save/share/comment endpoints |
| Create Blog/Post | `/create` | `POST /api/blog/create-blog` (multipart, field name `media`) |
| Profile | `/profile` | `GET /api/profile/get_detail`, `GET /api/blog/get-all`, `GET /api/blog/saved` |
| Edit Profile | `/profile/edit` | `POST /api/profile/create-profile`, `PATCH /api/profile/upadate_profile/:id` |
| Notifications | `/notifications` | no backend route yet — static placeholder, clearly marked in code |
| Settings | `/settings` | `POST /api/auth/change-password`, `POST /api/feedback/feedback`, `POST /api/feedback/complain` |
| AI Recipe Chef (bonus) | `/ai-chef` | `POST /api/ai-service/amzingFood`, `POST /api/ai-service/amzeFood/recreate` |

All wrapper functions live in `src/api/*.js`, one file per backend route file, so it's easy
to see exactly which endpoint each screen calls.

## Known backend quirks worth fixing

- `app.js` mounts the same `feedback` router three times (`/api/feedback`, `/api/complaint`,
  `/api/contactDeveloper`), but the router's own sub-paths never change — so the only
  reachable routes are `/api/feedback/feedback`, `/api/feedback/complain`,
  `/api/feedback/contact-developer`. The frontend already targets those.
- `profile.controller.js` reads `dateOfBirth` from the request body, but `profile.model.js`
  defines the field as `dateOfBrith` (typo) — so date of birth currently never persists.
- `food.controller.js`'s `deleteFood` compares `food.user` (field doesn't exist on the model —
  it's `food.chef`) — deleting a dish as a chef will currently always fail with a 500/403.
- There's no "get one food by id" or "get notifications" route — the frontend works around
  this by fetching the full list and filtering client-side, and by stubbing notifications.
