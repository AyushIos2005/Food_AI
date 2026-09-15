# 🍽️ FoodMenu (DishFinder) — AI-Powered Food Social Platform

A full-stack food discovery & recipe-generation app: browse chef-uploaded dishes, get
AI-generated protein-smart recipes from whatever ingredients you have on hand, and share
your own cooking in a community feed — all in one responsive React app.

**Frontend:** React 19 · Vite · Tailwind CSS v4 · React Router v7 · Axios
**Backend:** Node.js · Express · MongoDB (Mongoose) · Google Gemini (`@google/genai`) · Socket.IO

---

## ✨ Highlights

- **AI Recipe Generation** — describe the ingredients you have, get a full protein-smart
  recipe back from Gemini, with an editable history (create, recreate, soft-delete, undo).
- **Chef-uploaded dish catalog** — browse, search and view detailed dish pages with
  ingredients and precautions.
- **Community feed** — image/video blog posts with likes, comments, shares and saves.
- **Auth with OTP verification** — register → email OTP → login, plus forgot/reset password,
  all backed by httpOnly cookie sessions.
- **Real-time notifications** via Socket.IO, with a REST fallback for read/unread state.
- **Fully responsive shell** — a collapsible desktop sidebar on `lg+` screens, a bottom tab
  bar on mobile, and per-page responsive grids (2 → 3 → 4 columns depending on viewport).

## 🖥️ Responsive by design

| Breakpoint | Layout |
|---|---|
| Mobile (< 1024px) | Bottom tab navigation, single/2-column grids, full-bleed hero imagery |
| Laptop / Desktop (≥ 1024px) | Persistent left sidebar nav, 3–4 column grids, two-column detail pages |

## 🗂️ Project structure

```
src/
  api/          one file per backend route module (auth, food, blog, ai, profile, ...)
  components/   shared UI: AppLayout (sidebar+bottombar shell), cards, states, toasts
  context/      AuthContext, ToastContext
  pages/        one screen per route
```

Each `src/api/*.js` file maps 1:1 to a backend route file, so it's easy to trace exactly
which endpoint powers which screen — see the table below.

## 🔌 API integration map

| Screen | Route | Backend endpoints used |
|---|---|---|
| Splash / Onboarding | `/`, `/onboarding` | — (local only) |
| Login / Register / OTP | `/login`, `/register`, `/verify-otp` | `POST /api/auth/{login,register,vefiyOtp}` |
| Forgot / Reset Password | `/forgot-password` | `POST /api/auth/{forget-password,reset-password}` |
| Home | `/home` | `GET /api/food/get-all`, `GET /api/blog/get-all` |
| Explore / Random Dish | `/recipes`, `/random` | `GET /api/food/get-all` |
| Dish Detail | `/dish/:id` | `GET /api/food/:id` |
| AI Hub (generate / history) | `/ai`, `/ai/create`, `/ai/result` | `POST /api/ai-service/amzingFood`, `POST /api/ai-service/amzeFood/recreate`, `GET /api/ai-service/amzeFood/history`, `DELETE /api/ai-service/amze/history/:id` |
| Community feed | `/community` | `GET /api/blog/get-all`, like/save/share/comment endpoints |
| Create Post | `/community/create` | `POST /api/blog/create-blog` (multipart) |
| Profile / Edit Profile | `/profile`, `/profile/edit` | `GET /api/profile/get_detail`, `POST /api/profile/create-profile`, `PATCH /api/profile/upadate_profile/:id` |
| Notifications | `/notifications` | `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `DELETE /api/notifications/:id` |
| Settings | `/settings` | `POST /api/auth/change-password`, `POST /api/feedback/feedback`, `POST /api/feedback/complain` |

## 🚀 Getting started

```bash
npm install
cp .env.example .env      # set VITE_API_URL, e.g. http://localhost:3000/api
npm run dev
```

Run the backend separately (see `/backend`), then open `http://localhost:5173`.

### Backend auth requirement

The backend authenticates with an **httpOnly cookie** (`token`), so `src/api/client.js`
sets `withCredentials: true` on every request. Your backend must enable CORS with a
specific origin + `credentials: true`:

```js
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
```

In production, serve the frontend and backend from the same site (or same parent domain),
since the auth cookie is `sameSite: "strict"`.

## 🛠️ Scripts

```bash
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview the production build
npm run lint       # oxlint
```
