# FoodAI Mobile (Expo + React Native + TypeScript)

Android-first client for the existing FoodAI Node/Express + MongoDB backend. Built with Expo SDK 52, Expo Router, Expo SecureStore, and EAS.

- Backend API map and compatibility gaps: `docs/FoodAI_API_Map_and_Compatibility_Report.md`
- **Read the "Known limitations" section before testing login.**

## 1. Prerequisites (Windows PowerShell)

1. Install **Node.js 20 LTS or 22** from https://nodejs.org (check: `node -v`).
2. Install **Android Studio** and create an emulator (Device Manager). Start the emulator before running the app.
3. Run the backend locally (`backend/`) on port 3000, or point the app at a deployed API.

## 2. Setup

```powershell
cd frontend_app
npm install
Copy-Item .env.example .env
notepad .env        # set EXPO_PUBLIC_API_URL (see table below)
```

| Environment | `EXPO_PUBLIC_API_URL` |
|---|---|
| Android emulator → backend on your PC | `http://10.0.2.2:3000/api` |
| Physical phone on same Wi-Fi | `http://<your-PC-LAN-IP>:3000/api` (e.g. ` `) |
| Production | `https://food-ai-1-333t.onrender.com/api` (confirm this host) |

`EXPO_PUBLIC_*` values are compiled into the app and are public. **Never** put API keys, Mongo URIs, JWT secrets, Google or Gemini credentials here.

## 3. Run

```powershell
npm run android        # starts Metro and opens the emulator
```

If Metro reports a version mismatch, run `npx expo install --fix`.

## 4. Test and type-check

```powershell
npm run typecheck      # tsc --noEmit (strict)
npm test               # Jest: validation, error mapping, API client (auth headers, 401 handling)
npx expo export --platform android --output-dir .\export-check   # verifies the Android bundle builds
```

Test coverage now: validation rules, error mapping, token/401 behaviour of the API client.
**Not yet covered:** component/journey tests (register → verify → login, AI failure + retry, history undo) and an emulator run against the live backend. Add these before release.

## 5. Project layout

```
app/                 Expo Router screens
  index.tsx          routing only (no API calls)
  onboarding.tsx     skippable intro
  (auth)/            login, register, verify-otp, forgot-password
  (tabs)/            home, discover, ai, history, profile
  recipes/[id].tsx   catalog recipe detail
  history/[id].tsx   AI recipe detail (+ delete)
  settings.tsx       theme, legal links, contact, logout
src/
  api/               client.ts (central fetch), services.ts (typed endpoints), errors.ts
  config/env.ts      public configuration only
  store/session.tsx  session state; token in SecureStore
  theme/             tokens + light/dark provider
  components/        reusable UI, RecipeCard, RecipeView
  types/api.ts       models mirroring backend controllers/models
  utils/             validation (mirrors backend Zod), formatting
__tests__/           Jest unit tests
```

## 6. Known limitations (must read)

1. **Login needs a backend change.** The backend only issues an httpOnly cookie and never returns a token. The app sends `Authorization: Bearer <token>` when the login response includes `token`, and it also sends cookies natively (`credentials: 'include'`). Until the backend accepts Bearer tokens and returns `token`, a session lasts only while the app is running, and **it will not survive an app restart**. Proposed change: report section 1.
2. **No account deletion endpoint.** Google Play requires in-app account deletion when users can register. The Settings screen says so. Add `DELETE /api/auth/account` on the backend before release.
3. **Features not yet built (no backend support):** chef recipe create/edit/delete screens (`POST /food/upload` exists, edit does not); saved recipes; recipe likes/comments; blog and social feed; notifications screen (the endpoint exists and is used only for session checks); cuisine, meal-type, diet, cooking-time filters and extra AI instructions.
4. **Recipe catalog** entries have no cooking steps, servings, or nutrition. The detail screen says so instead of inventing them.
5. **AI nutrition values** are AI estimates and are labelled as such. The app shows medical notes as information only.
6. **Rate limits:** AI generation is limited to 20 requests/hour per IP on the server. The app shows the server message and does not retry automatically.
7. **OTP resend** is not available in-app. Users must wait for the code to expire and register again.

## 7. EAS build and Play Store release

```powershell
npm install -g eas-cli
eas login
eas init                                  # sets extra.eas.projectId in app.json
# Edit eas.json -> production.env.EXPO_PUBLIC_API_URL if the host differs
eas build --platform android --profile production
eas submit --platform android --profile production   # after the first upload via Play Console
```

`eas.json` uses `autoIncrement` for `versionCode` on production builds and produces an **Android App Bundle (.aab)**. Signing credentials are created and stored by EAS (`eas credentials`), not in this repo.

### Before submitting to Google Play

- [ ] Replace the placeholder logo and adaptive icon in `assets/` (current files are generated placeholders). Keep the 1024×1024 store icon.
- [ ] Set `android.package` and `ios.bundleIdentifier` in `app.json`. The current value `com.yourcompany.foodai` is a placeholder. Choose a unique ID and do not change it after the first upload.
- [ ] Set `EXPO_PUBLIC_PRIVACY_POLICY_URL`, `EXPO_PUBLIC_TERMS_URL`, `EXPO_PUBLIC_SUPPORT_EMAIL` (the in-app links show "not configured" until set).
- [ ] Publish a privacy policy URL and enter it in Play Console.
- [ ] Add an in-app or web account deletion path and declare it in Play Console (Data safety + Account deletion).
- [ ] Complete Data safety using what the app actually collects: account info (username, name, email, password for auth), profile data, AI prompts (ingredients, notes), AI history, and session data. Data is sent to the backend over HTTPS.
- [ ] Permissions: the app requests only `INTERNET`. No camera, location, or storage permissions are used.
- [ ] Target SDK: Expo SDK 52 targets Android 14 (API 34). Check the current Google Play target-API requirement when you submit and bump the Expo SDK if needed.
- [ ] Store listing text, screenshots (phone), feature graphic (1024×500), and content rating questionnaire.
- [ ] Test the production `.aab` on a physical Android device (sideload via internal testing track).

### Store listing draft

- **Title:** FoodAI – AI Recipes
- **Short description:** Turn your ingredients into recipes with AI, and discover dishes from chefs.
- **Full description:** FoodAI helps you cook with what you have. Enter the ingredients in your kitchen, choose how many people you are cooking for, add any allergy or health notes, and FoodAI generates a recipe with steps, ingredients, and estimated nutrition. Recreate a dish with new ingredients, browse recipes from FoodAI chefs by name, and keep your AI history. AI-generated nutrition values are estimates, not medical advice.

## 8. Assets you must provide

1. Final logo (vector or 1024×1024 PNG) and adaptive-icon foreground.
2. Splash artwork (current one is a placeholder).
3. Privacy policy URL, terms URL, and support email.
4. Google Play developer account and app signing (managed by EAS).
5. Screenshots and feature graphic for the store listing.
6. Production API host confirmed (see the "API host" question in the chat summary).
