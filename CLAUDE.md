# CLAUDE.md — YourStrat Operating Contract

> **Read this entire file before you touch a single line.** It is loaded automatically every session. If you break a rule here you have broken the build. There is no "good enough" — every change ships to a real user on a real device.

> **⚠ SESSION HANDOFF (2026-05-26, desktop→laptop):** Read [SESSION_HANDOFF.md](SESSION_HANDOFF.md) **first** — it carries the prior session's state (local APK build fix + release-checklist status, and which parts are desktop-specific). Trim or delete that file and this banner once you've absorbed it.

YourStrat is a **premium, polished, production fitness app**. Not a prototype, not a demo, not a vibe-coded weekend project. Every screen, every press, every transition must feel like a finished, App-Store-grade product. If a change you are about to make would not survive a side-by-side comparison with Apple Health, Linear, or Strong — do not make it.

---

## 0. The Five Non-Negotiables

1. **Premium feel, always.** Spacing, type weight, alignment, and motion must look intentional. No misaligned padding, no orphan labels, no debug strings, no Lorem, no "TODO" copy shipped.
2. **60 FPS, always.** Lists virtualize. Animations run on the UI thread (Reanimated worklets). Images are sized. No JS-thread `setInterval` for animation. No layout thrash inside scroll.
3. **One theme, end to end.** Every color from [mobile/theme/colors.ts](mobile/theme/colors.ts). Every spacing from [mobile/theme/spacing.ts](mobile/theme/spacing.ts). No inline hex codes. No magic numbers for padding/radius outside the spacing/radius tokens.
4. **Every UI is wired to the backend it claims to use.** No mocked screens shipped. No "this will hook up later" buttons. If a button exists, pressing it does the real thing through [mobile/lib/api.ts](mobile/lib/api.ts) → the matching FastAPI route in [backend/app/routers/](backend/app/routers/).
5. **No mistakes.** Type-check before you say done. Run the screen on web preview before you say done. Verify the request hits the backend before you say done. "I think it works" is not done.

If any of these five would be violated by what you're about to commit, **stop, fix it, then commit**.

---

## 1. Required Pre-Flight (every task, every session)

Before writing code:

1. Read [AGENTS.md](AGENTS.md) and [YOURSTRAT_BUILD.md](YOURSTRAT_BUILD.md). The Scope Guard in §2 of `YOURSTRAT_BUILD.md` is binding — forbidden features stay forbidden.
2. Check if the screen, component, or endpoint already exists. **Edit existing files; do not duplicate.**
   - UI primitives live in [mobile/components/ui/](mobile/components/ui/). Use them. Never inline a one-off pill button, card, or input.
   - Helpers live in [mobile/lib/](mobile/lib/). Reuse before adding.
   - Backend routes live in [backend/app/routers/](backend/app/routers/). Do **not** add routes outside the table in §7 of the build spec.
3. Decide where the change belongs. If you cannot point to the exact file you'll edit, you haven't planned enough.

Before saying "done":

1. **Type-check passes.** `cd mobile && npx tsc --noEmit`. Zero errors.
2. **Screen renders end-to-end.** Web preview (`scripts/start-dev.ps1` → http://127.0.0.1:18082/preview-frame.html), navigate to the screen, exercise the happy path **and** one edge case (empty, error, slow network).
3. **Backend call actually fires.** Check the uvicorn log for the request. A green UI with no network request is a bug.
4. **No console errors, no console warnings** in the browser devtools while exercising the flow.

If you cannot satisfy all four, say so explicitly — do not claim success.

---

## 2. Premium UI Rules (the anti-"vibe-coded" checklist)

A screen looks vibe-coded when any of these are true. Fix on sight:

- **Inconsistent spacing.** Vertical rhythm must use multiples from [spacing.ts](mobile/theme/spacing.ts) (`xs/sm/md/lg/xl/xxl/xxxl` = 4/8/12/16/24/32/48). Screen padding is always `xl` (24). Section gaps are `xl` or `xxl`. Inner card padding is `lg` (16).
- **Inconsistent radii.** Use `radius` tokens from [spacing.ts](mobile/theme/spacing.ts) (`sm/md/lg/xl/pill`). Buttons are `pill`. Cards are `xl` (16). Inputs are `lg` (12). Never write `borderRadius: 14`.
- **Inconsistent type.** Headings 700. Body 400. Numerics 600 with `fontVariant: ['tabular-nums']`. Never mix 500 and 600 on the same screen for the same role.
- **Inconsistent color.** Every color goes through [colors.ts](mobile/theme/colors.ts). If you need a new shade, add it as a token there first, then reference it. **No raw hex in components, ever.**
- **Off-grid alignment.** Icons and text must share a baseline. Use `alignItems: 'center'` on rows. Icons are 20–24px with matching line-height text.
- **No empty states.** Every list, every screen, every async slot has a designed empty state with calm copy in the YourStrat voice (§3.4 of the build spec). No "No data." Use the voice: "Nothing logged yet. Snap your first meal."
- **No loading flashes.** Use [Skeleton](mobile/components/ui/Skeleton.tsx) (or a 200ms delay before showing a spinner) so fast responses don't strobe.
- **No raw errors.** Errors go through [Toast](mobile/components/ui/Toast.tsx). Log the real error with `console.error`. Never show `[object Object]`, `undefined`, or HTTP status codes to the user.
- **No emojis in copy.** Use the icon set in [mobile/components/icons/](mobile/components/icons/).
- **No layout jump on data load.** Reserve space with skeletons matching final dimensions.

If the design intent is unclear, copy the pattern from an already-polished screen in the repo (Today, Onboarding, Scan Result). Do not invent.

---

## 3. 60 FPS Performance Rules

Every UI change is a performance change. Defaults that keep the app smooth:

- **Lists ≥ 10 items use `FlatList` / `FlashList`**, never `.map()` inside a `ScrollView`. Provide `keyExtractor` and `getItemLayout` where row height is known.
- **Memoize row components** with `React.memo`. Pass stable callbacks (`useCallback`) and stable data (`useMemo`).
- **Animations run on the UI thread.** Use `react-native-reanimated` `useSharedValue` + `useAnimatedStyle`. Never animate with `setState` in a `setInterval`. The `RestTimer` is the one exception (a 1Hz tick is fine) — but the visual progress ring must be a worklet.
- **No expensive work in render.** Move filters/sorts/aggregations into `useMemo` or a selector inside [store.ts](mobile/lib/store.ts).
- **Images:** always supply `width` and `height`. Use `expo-image` for caching when adding new image surfaces. Meal photo thumbnails must be downscaled, not full-res.
- **Avoid re-renders on every keystroke** for screens that aren't input-focused. Local input state stays local; Zustand selectors must be narrow (`useStore(s => s.profile)`, not `useStore(s => s)`).
- **No synchronous Storage reads in render.** Hydrate once in `_layout.tsx` and store in Zustand.
- **Reanimated worklets must be pure.** No `console.log`, no closure over non-shared values without `runOnJS`.

If a screen scrolls or animates, **run it on web preview and watch for jank** before claiming done. If it stutters, it isn't done.

---

## 4. One Theme — How to Stay Consistent

Source of truth:

- Colors → [mobile/theme/colors.ts](mobile/theme/colors.ts)
- Spacing & radius → [mobile/theme/spacing.ts](mobile/theme/spacing.ts)
- Components → [mobile/components/ui/](mobile/components/ui/) — `Button`, `Input`, `Card`, `OptionCard`, `Screen`, `Toast`, `ProgressBar`, `Skeleton`, `LinkButton`, `BackHeader`
- Icons → [mobile/components/icons/](mobile/components/icons/) — 24×24 viewBox, 2px stroke, inherits color from `color` prop

**Rules:**

1. **Adding a color?** Add a token to `colors.ts` first. Name it semantically (`textPrimary`, not `gray100`). Reference everywhere by token.
2. **Adding a button?** You aren't. Use [Button](mobile/components/ui/Button.tsx). If you need a new variant, add it to `Button.tsx` — do not fork.
3. **Adding an icon?** Build it as an SVG component in [mobile/components/icons/](mobile/components/icons/) and export from [index.ts](mobile/components/icons/index.ts). Match stroke width and viewBox of the existing set. Ask before adding an icon not listed in §9 of the build spec.
4. **Adding a screen wrapper?** Wrap in [Screen](mobile/components/ui/Screen.tsx). It handles SafeAreaView, KeyboardAvoidingView, StatusBar, and the 24px padding. Never reimplement.
5. **Bottom-sheet / modal?** There is no standard yet — ask before introducing a new pattern.

If you find yourself writing `style={{ backgroundColor: '#...' }}` or `style={{ padding: 17 }}`, stop. You are drifting from the theme.

---

## 5. UI ↔ Backend Wiring (no orphan UIs, no orphan routes)

Every interactive UI element must trace to a real backend operation. The contract:

| UI surface | Calls | Backend route | Router |
|---|---|---|---|
| Onboarding submit | `api.onboardProfile` | `POST /profile/onboard` | [profile.py](backend/app/routers/profile.py) |
| Profile edit | `api.updateProfile` | `PUT /profile/` | [profile.py](backend/app/routers/profile.py) |
| Scan camera/photo | `api.scanMeal` | `POST /meals/scan` | [meals.py](backend/app/routers/meals.py) |
| Scan result save | `api.saveMeal` | `POST /meals/` | [meals.py](backend/app/routers/meals.py) |
| Today screen load | `api.getToday` | `GET /today/` | [today.py](backend/app/routers/today.py) |
| Routine list/create | `api.listRoutines` / `api.createRoutine` | `GET/POST /routines/` | [routines.py](backend/app/routers/routines.py) |
| Active session | `api.startSession` / `api.logSet` / `api.finishSession` | `/sessions/...` | [sessions.py](backend/app/routers/sessions.py) |

**Rules:**

1. **No new route without a UI consumer in the same PR.** Dead endpoints rot.
2. **No new button without a working backend call in the same PR.** Dead UI lies to the user.
3. **All routes require `Authorization: Bearer <jwt>`.** The wrapper in [api.ts](mobile/lib/api.ts) does this — go through it. Never call `fetch` directly from a screen.
4. **Schema is the contract.** When you change a Pydantic model in [backend/app/models/schemas.py](backend/app/models/schemas.py), update the matching TS type in `mobile/lib/api.ts` in the same change. Type drift = bugs.
5. **Web preview proxies through Metro** (`/api/*` → `127.0.0.1:18000`). Native uses `EXPO_PUBLIC_API_URL` directly. Test both paths exist before claiming done — see [mobile/metro.config.js](mobile/metro.config.js).
6. **RLS is on.** When testing, you are a real user. If a query returns empty, check the auth token before assuming the data is missing.

---

## 6. "No Mistakes" Workflow

Mistakes happen when you skip verification. The verification is not optional:

1. **Plan in writing** what you'll change — exact file paths. If you can't, you don't understand the task yet.
2. **Edit the smallest set of files** that satisfies the task. Don't refactor in passing. Don't "clean up" adjacent code. Don't add abstractions for hypothetical futures.
3. **Type-check** — `cd mobile && npx tsc --noEmit`. Fix every error. Don't suppress with `any`, `// @ts-ignore`, or `// @ts-expect-error` unless you write a one-line comment explaining the irreducible reason.
4. **Lint clean** if a linter is configured — don't disable rules to make a commit go through.
5. **Run the actual feature.** Type-checks don't prove behavior. Open the screen, do the thing, watch the network tab, watch the uvicorn log.
6. **Edge cases to exercise every time:** empty state, error state (kill the backend, retry), slow network (Chrome devtools throttle), long text (50-char name), zero values (0 calories, 0 reps).
7. **Read the diff before committing.** Confirm every hunk is intentional. Delete debug logs, stray `console.log`, commented-out code.
8. **Commit message describes the why,** not the what. The diff is the what.

If something fails: **diagnose the root cause.** Do not patch the symptom. Do not delete the failing test. Do not `--no-verify` past a hook. Do not catch-and-swallow an exception.

---

## 7. Scope Guard (read §2 of YOURSTRAT_BUILD.md — it is binding)

These features are **forbidden**, no matter how easy they seem:

- Streaks, leaderboards, social, sharing, friends
- Push notifications, nudges, reminders
- AI commentary, weekly insights, coach lines, tips, learn/library
- Body avatars, achievements, confetti, celebrations
- Multi-model AI, agent pipelines, "smart" anything beyond the single Gemini food-scan call
- Subscription/paywall plumbing, admin panels
- Graphs beyond a 7-day sparkline
- Any feature not explicitly in §4.1 of the build spec

If a task seems to require any of the above, **you've misunderstood — stop and ask.** Do not invent features. Do not "round up" scope.

---

## 8. When to Stop and Ask

Ask before:

- Adding a new dependency (npm or pip).
- Adding a new route, screen, icon, or color token.
- Changing the database schema or an RLS policy.
- Modifying [babel.config.js](mobile/babel.config.js), [metro.config.js](mobile/metro.config.js), or any build config.
- Doing anything destructive: deleting files, dropping tables, force-pushing, resetting a branch, amending a published commit.
- Anything that touches the auth flow or token handling.

Asking costs 30 seconds. Guessing wrong costs hours.

---

## 9. Commands you'll actually use

```powershell
# Run everything (API on 18000, web preview on 18082)
.\scripts\start-dev.ps1

# Type-check the mobile app
cd mobile; npx tsc --noEmit

# Run the API alone
cd backend; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --host 0.0.0.0 --port 18000 --reload

# Sanity-check the API is up
# open http://127.0.0.1:18000/health  → expect {"ok":true,...}
# open http://127.0.0.1:18082/preview-frame.html  → phone frame preview
```

---

## 10. Running the dev server (one-click, phone-first)

For the **mobile dev-client + Metro tunnel** loop — the workflow Brady uses when iterating against the installed APK on his phone — there is a one-click launcher. No terminal needed.

**Launch:** double-click `YourStrat Dev` on the Windows desktop (or run [mobile/play.cmd](mobile/play.cmd) directly). It opens a terminal, checks the port, prints the LAN `exp://<your-IP>:8888` URL, and starts Metro with `--dev-client --port 8888`.

**LAN mode by default** — phone + desktop must be on the same WiFi. The tunnel (`--tunnel`) variant exists for cellular testing but is broken on Expo SDK 51+ unless you have your own `@expo/ngrok` account; Expo's bundled shared account was deprecated. Daily dev on the same network → LAN. If you need tunnel later, edit `MODE_FLAGS` in `play.cmd`.

**Port: 8888.** Picked because:
- **8081** is Etsy OAuth's registered callback and Metro's historical default — both cause callback collisions if Etsy work is ever in scope.
- **8082–8083** are Metro's auto-fallback range; using them defeats the purpose of pinning.
- **8088** is already used on Brady's desktop by another dev server.
- 8888 is memorable, in nobody's reserved range, and matches the "alternate web port" muscle memory.

**Hot reload** is assumed. JS/TS/asset edits trigger a Fast Refresh in the dev-client app in ~1–2 sec — no rebuild. You only need a new APK build (`eas build --profile development --platform android`) when a native dependency or `app.json` plugin changes.

**Connect** by either scanning the QR code Metro prints, or pasting the `exp://<LAN-IP>:8888` URL into the dev-client's "Enter URL manually" screen. The LAN IP is auto-detected from `ipconfig` and printed at startup.

**Firewall:** Windows Defender prompts on first run — click **Allow**. To pre-create the rule (elevated PowerShell):
```powershell
New-NetFirewallRule -DisplayName "YourStrat dev (Metro 8888)" -Direction Inbound -Protocol TCP -LocalPort 8888 -Action Allow -Profile Private,Domain
```

**Stop:** `Ctrl+C` twice in the launcher window, or just close it.

The script keeps the window open after exit so you can read errors (no vanishing on crash).

---

## 11. Final Word

YourStrat is a **disciplined, premium product**. The bar is: a stranger picks up the phone, opens the app, logs a meal and a workout in under 60 seconds, and walks away thinking "this is a real, finished app." Every commit either moves us closer to that bar or it doesn't ship.

When in doubt: **smaller change, more verification, one theme, real backend, 60 fps.** Find your North. Ship the core. Done.
