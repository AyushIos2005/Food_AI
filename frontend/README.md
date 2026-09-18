# FoodAI — Frontend (React + Vite + Tailwind v4)

Cook • Create • Share — AI-powered food & recipe platform frontend, wired to your Node/Express + MongoDB backend.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

Backend URL is read from `.env`:

```
VITE_API_URL=http://localhost:3000
```

## IMPORTANT — enable CORS on the backend

Auth uses an **httpOnly cookie**, and the frontend sends `withCredentials: true`.
Your `src/app.js` has `cors` in package.json but never calls it. Add this **above your routes**:

```js
import cors from "cors";

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
```

Without this, every API call from the browser will fail with a CORS error.

## Tech

React 19 · Vite · Tailwind CSS v4 · React Router v7 · Axios · lucide-react · react-hot-toast

## Structure

```
src/
  api/           axios instance + one module per backend domain
  components/    shared UI (AppShell, Navbar, Sidebar, cards, modals)
  context/       AuthContext (login/register/logout, 401 auto-clear)
  hooks/         useBlogInteractions (like/save/share/delete, optimistic)
  lib/           errorMessage.js, utils.js
  pages/         auth · home · ai · food · blog · profile · settings
  routes/        AppRoutes.jsx
```

## Routes

| Route | Screen |
|---|---|
| `/` | Landing |
| `/register` `/verify-otp` `/login` | Auth |
| `/forgot-password` `/reset-password` | Password recovery |
| `/home` | Dashboard |
| `/ai` `/ai/create` `/ai/result` `/ai/history` | AI recipe creation |
| `/ai/recreate` `/ai/recreate/result` `/ai/recreated` | Recreate existing food |
| `/recipes` `/recipes/:id` | Recipe explorer + details |
| `/chef/recipes` `/chef/recipes/create` | Chef only |
| `/community` `/community/create` `/community/post/:id` | Community feed |
| `/hashtag/:tag` `/saved` | Hashtag + saved posts |
| `/profile` `/profile/create` `/profile/edit` | Profile |
| `/settings/security` `/feedback` `/complaint` `/contact-developer` | Settings |

## Documentation

| File | What's in it |
|---|---|
| `docs/USER_MANUAL.md` | End-user guide — every screen, every flow, troubleshooting |
| `docs/ADMIN_MANUAL.md` | Chef/admin guide — publishing, moderation, ops, deployment |
| `docs/API_COVERAGE.md` | Endpoint-by-endpoint audit: all 49 endpoints, payload shapes |
| `docs/ARCHITECTURE.html` | Backend architecture diagram — open in a browser |

## Backend quirks the frontend works around

- **No `GET /api/food/:id`** → recipe details falls back to `/get-all` and filters.
- **No "current user" endpoint** → last-known user mirrored in localStorage; any 401 clears it.
- **`/api/food/get`** returns *all* chefs' recipes → filtered client-side to the signed-in chef.
- **`profile.model.js` field is `dateOfBrith`** while the controller and zod schema use
  `dateOfBirth` → the date never persists. Rename the model field to fix it.
- **`/api/complaint/complain` is user-only** (`verifyUser`) → chefs get 403; the UI warns them.
- **`/api/feedback/feedback` accepts `{ rating }` only** — no message field.
