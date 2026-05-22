# YourStrat — Build Spec

> **This file is the contract.** Drop it at the root of a new Cursor workspace and point an agent at it. The agent's job is to build v1 — **nothing more**. Read the "Scope Guard" section before you write a single line.

---

## 1. Mission

**YourStrat is a focused fitness coach.** Three things, done well:

1. **Snap a photo of food → get its nutrients.** Calories, macros, key micros.
2. **Build your own workout routines and run them with a timer.** Sets, reps, time per exercise. Calories burned auto-estimated.
3. **See the day at a glance.** Net calories (in − out), what nutrients you're short on, what you're over on.

The metaphor is the **North Star**. Every meal and workout aligns you with your goal. The logo is a compass star. The voice is calm, direct, navigational. No gamification, no shaming, no noise.

---

## 2. Scope Guard (NON-NEGOTIABLE)

The agent must **not** build any of the following, even if "it would only take a minute":

- ❌ Streaks, prestige, ascension, tiers, ranks, badges
- ❌ Leaderboards, friends, social, sharing
- ❌ Push notifications / nudges / nutrient reminders
- ❌ AI commentary on meals, weekly insights, coach lines
- ❌ Tips / Learn / Study / Library / discovery feeds
- ❌ Body avatars, achievements, celebrations, confetti
- ❌ Onboarding gamification (progress bars beyond the 1 onboarding flow are fine; everything else, no)
- ❌ Multiple AI models, agent pipelines, "smart" anything beyond the food-photo call
- ❌ Subscription / paywall plumbing
- ❌ Admin panels, internal dashboards, mint-code scripts
- ❌ Stat graphs more than a 7-day sparkline
- ❌ Anything not explicitly listed in §4 "v1 Scope IN"

If the agent thinks something is missing, it must stop and ask. **It must not invent features.**

---

## 3. Brand

### 3.1 Logo

The brand mark is a **white 8-point compass star** on near-black. Four long rays (N, S, E, W) and four short rays on the diagonals, with subtle light/shadow halves so it reads as 3D.

- **Reference image (PNG, do not modify):** copy this into `mobile/assets/logo/yourstrat-star.png` from
  the compass-star PNG in `mobile/assets/logo/yourstrat-star.png` (source asset may still be named `Xaeryx_Star-*.png` in EmberPath Cursor assets)
- **In-app SVG (use this for the icon system, not the PNG):**

```svg
<!-- mobile/components/icons/Star.tsx — base shape -->
<svg viewBox="-50 -50 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Long rays (N, E, S, W) — pure white -->
  <polygon points="0,-50 -3,0 0,0" fill="#FFFFFF"/>
  <polygon points="0,-50  3,0 0,0" fill="#D1D5DB"/>
  <polygon points="50,0  0,-3 0,0" fill="#D1D5DB"/>
  <polygon points="50,0  0, 3 0,0" fill="#FFFFFF"/>
  <polygon points="0, 50 -3,0 0,0" fill="#D1D5DB"/>
  <polygon points="0, 50  3,0 0,0" fill="#FFFFFF"/>
  <polygon points="-50,0 0,-3 0,0" fill="#FFFFFF"/>
  <polygon points="-50,0 0, 3 0,0" fill="#D1D5DB"/>
  <!-- Short diagonal rays — silver -->
  <polygon points="25,-25 -2,-2 0,0" fill="#9CA3AF"/>
  <polygon points="25,-25  2, 2 0,0" fill="#6B7280"/>
  <polygon points="25, 25 -2, 2 0,0" fill="#6B7280"/>
  <polygon points="25, 25  2,-2 0,0" fill="#9CA3AF"/>
  <polygon points="-25, 25  2, 2 0,0" fill="#9CA3AF"/>
  <polygon points="-25, 25 -2,-2 0,0" fill="#6B7280"/>
  <polygon points="-25,-25  2,-2 0,0" fill="#6B7280"/>
  <polygon points="-25,-25 -2, 2 0,0" fill="#9CA3AF"/>
</svg>
```

### 3.2 Color Tokens (`mobile/theme/colors.ts`)

```ts
export const colors = {
  // Surfaces — deep, slightly cool black
  bg: '#08080B',
  surface: '#121217',
  surfaceElevated: '#1B1B22',
  border: '#26262F',

  // Brand — the star is the accent. Pure monochrome with a single cool spark.
  star: '#FFFFFF',
  starDim: '#C9CCD6',
  spark: '#7DD3FC',   // cool sky-blue, used sparingly for "active" states

  // Text
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',

  // Status
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',

  // Macros (calm cool palette, not the EmberPath warm one)
  protein: '#60A5FA',
  carbs: '#FBBF24',
  fat: '#F472B6',
};
```

### 3.3 Typography

System font stack. Headings 700, body 400, numerics tabular-nums 600.

### 3.4 Voice

- "Find your North."
- "1,420 cal left. 38g protein to hit your target."
- "Workout logged. 287 cal burned."

No exclamation marks. No emojis in copy. Calm, factual, navigational.

---

## 4. v1 Scope

### 4.1 IN

| Area | Feature |
|------|---------|
| **Auth** | Email + password (Supabase). No social, no magic links. Password reset via email deep link. |
| **Onboarding** | One flow: units (metric/imperial), weight, height, age, sex, activity level, goal (lose / maintain / gain). Calculate BMR (Mifflin-St Jeor) → daily calorie target → macro split. |
| **Food scan** | Camera or photo library → upload → Gemini Flash vision → JSON of items (name, portion, calories, protein, carbs, fat, fiber, sugar, sodium). Confirmation screen before saving. Edit portions if needed. |
| **Daily log** | Today's meals, totals, remaining vs target. Tap a meal to view/edit/delete. |
| **Workout builder** | Create a routine = ordered list of exercises. Per exercise: name, type (strength / cardio / mobility), defaults (sets × reps or duration). Saved per user. |
| **Workout session** | Pick a routine → run it. Per-exercise timer, set/rep tracking. Rest timer between sets (60s default, editable). On finish, save the session and an estimated calories-burned (MET-based, see §6.4). |
| **Today screen** | Net calories: target + burned − consumed. Macro rings. "You're 38g protein short." "You're 12g over on saturated fat." |
| **Profile** | Edit goals, sign out, delete account. |

### 4.2 OUT — see §2 Scope Guard

---

## 5. Tech Stack

### Mobile
- **Expo (managed)** + EAS for builds
- **expo-router** — file-based
- **expo-camera**, **expo-image-picker**
- **NativeWind 4** (Tailwind for RN)
- **Zustand** — single store
- **@supabase/supabase-js**
- **react-native-svg** — for the star + custom icons
- **react-native-reanimated** — only for press-scale + simple transitions

### Backend
- **FastAPI** (Python 3.11+)
- **Supabase Postgres** + **Supabase Storage** (private bucket for meal photos)
- **Supabase Auth** — JWT verified server-side via `supabase.auth.get_user(token)` (algorithm-agnostic; no JWT secret to manage)
- Hosted on **Railway**

### AI
- **Gemini 2.5 Flash** — single model, single call per scan. No fallbacks, no multi-model orchestration.

---

## 6. Data & Logic

### 6.1 Database Schema (Supabase Postgres, `supabase/migrations/001_init.sql`)

```sql
-- profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  units text not null check (units in ('metric','imperial')),
  weight_kg numeric not null,
  height_cm numeric not null,
  age int not null,
  sex text not null check (sex in ('male','female')),
  activity_level text not null check (activity_level in ('sedentary','light','moderate','active','very_active')),
  goal text not null check (goal in ('lose','maintain','gain')),
  daily_calorie_target int not null,
  daily_protein_target_g int not null,
  daily_carbs_target_g int not null,
  daily_fat_target_g int not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- meals
create table meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  photo_url text,
  scanned_at timestamptz not null default now(),
  total_calories int not null default 0,
  total_protein_g numeric not null default 0,
  total_carbs_g numeric not null default 0,
  total_fat_g numeric not null default 0,
  total_fiber_g numeric not null default 0,
  total_sugar_g numeric not null default 0,
  total_sodium_mg int not null default 0
);

create table meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meals(id) on delete cascade,
  name text not null,
  portion text,
  calories int not null,
  protein_g numeric not null,
  carbs_g numeric not null,
  fat_g numeric not null,
  fiber_g numeric not null default 0,
  sugar_g numeric not null default 0,
  sodium_mg int not null default 0,
  confidence numeric
);

-- exercises (user-owned)
create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  type text not null check (type in ('strength','cardio','mobility')),
  met_value numeric not null default 5.0,
  default_sets int,
  default_reps int,
  default_duration_sec int
);

-- routines
create table routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table routine_exercises (
  routine_id uuid references routines(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete cascade,
  position int not null,
  sets int,
  reps int,
  duration_sec int,
  primary key (routine_id, position)
);

-- workout sessions (a run of a routine)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  routine_id uuid references routines(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_sec int,
  calories_burned int not null default 0
);

create table session_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  exercise_id uuid references exercises(id),
  position int not null,
  reps int,
  weight_kg numeric,
  duration_sec int
);
```

**RLS:** every table — `user_id = auth.uid()` on select / insert / update / delete. Service-role bypasses for the backend.

**Storage:** private bucket `meal-photos`, per-user folder policy. Signed URLs only.

### 6.2 Daily Targets (Mifflin-St Jeor)

```python
# backend/app/services/targets.py
def bmr(sex, weight_kg, height_cm, age):
    base = 10*weight_kg + 6.25*height_cm - 5*age
    return base + (5 if sex == 'male' else -161)

ACTIVITY = {'sedentary':1.2,'light':1.375,'moderate':1.55,'active':1.725,'very_active':1.9}
GOAL_DELTA = {'lose':-500, 'maintain':0, 'gain':+300}

def daily_calories(profile):
    return round(bmr(profile.sex, profile.weight_kg, profile.height_cm, profile.age)
                 * ACTIVITY[profile.activity_level] + GOAL_DELTA[profile.goal])

# Macro split: 30% protein, 40% carbs, 30% fat (simple default for v1)
```

### 6.3 Food Scan Prompt (Gemini Flash)

One prompt, one call. JSON-only response, schema enforced.

```
You are a nutrition estimator. Given a photo of food, return STRICT JSON:
{
  "items": [
    { "name": string, "portion": string, "calories": int,
      "protein_g": number, "carbs_g": number, "fat_g": number,
      "fiber_g": number, "sugar_g": number, "sodium_mg": int,
      "confidence": number /* 0–1 */ }
  ]
}
No prose, no markdown, no commentary. If the image is not food, return {"items": []}.
```

### 6.4 Calories Burned (MET formula)

```
calories = MET * weight_kg * (duration_min / 60)
```

Default MET per exercise type: strength=5.0, cardio=8.0, mobility=2.5. Override per exercise.

---

## 7. API (FastAPI, all routes require `Authorization: Bearer <jwt>`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/profile/onboard` | Save profile, compute & store targets |
| GET / PUT | `/profile/` | Read / update profile (recomputes targets) |
| POST | `/meals/scan` | Upload photo → Gemini → return scan result (NOT saved) |
| POST | `/meals/` | Save a confirmed meal |
| GET | `/meals/today` | Today's meals + daily totals + remaining |
| GET / DELETE | `/meals/{id}` | Single meal |
| GET / POST | `/exercises/` | List / create user exercises |
| GET / POST | `/routines/` | List / create routines |
| GET | `/routines/{id}` | Routine with ordered exercises |
| POST | `/sessions/start` | Create session (returns id) |
| POST | `/sessions/{id}/finish` | Mark ended_at, compute calories_burned |
| POST | `/sessions/{id}/sets` | Append a set |
| GET | `/today/` | One-shot snapshot: targets, consumed, burned, remaining, lagging nutrients |

That's the whole API. Don't add more.

---

## 8. UI Rules

### 8.1 Bottom Nav (4 tabs only)

| # | Icon | Label | Route |
|---|------|-------|-------|
| 1 | `StarIcon` (filled) | Today | `/` |
| 2 | `DumbbellIcon` | Workouts | `/workouts` |
| 3 | `CameraIcon` (FAB, raised, white on dark) | (Scan) | `/scan` |
| 4 | `ProfileIcon` | Profile | `/profile` |

No "Nutrition" tab — the Today screen *is* the nutrition view. No "Learn", no "Goals" tab. Goals live in Profile.

### 8.2 Components (`mobile/components/ui/`)

Build exactly these, nothing else, in this order:

1. `Screen` — `SafeAreaView` + `KeyboardAvoidingView` + `StatusBar style="light"` + 24px padding + max-width 480.
2. `Button` — variants `primary` (white fill, black text) / `secondary` (white outline) / `ghost`. Pill, 56px min height, full width, press scale 0.95.
3. `Input` — dark surface, 2px border, white focus ring, centered text by default.
4. `OptionCard` — for onboarding selects. White border when selected, otherwise white/20.
5. `Card` — surface bg, 1px border, 16px radius.
6. `Toast` — friendly copy, auto-dismiss. Never show raw error codes.
7. `ProgressBar` — for onboarding only.
8. `MacroRing` — single ring, value/target, used on Today.
9. `MealCard` — thumbnail, top items, totals.
10. `ExerciseRow` — name, sets×reps or duration, drag handle for reorder.

### 8.3 Rules

- **24px screen padding.** Always.
- **No emojis in UI copy.** Ever. Use the icon set.
- **No raw errors to the user.** Log to console, surface a Toast.
- **Round numbers.** Calories nearest 5, macros nearest gram.
- **Haptics:** option select = selection; primary button = light impact; success = notification success; error = notification error.
- **Animations:** 200ms ease-out. That's it. No spring physics, no parallax, no looping breath/pulse effects.
- **Camera mounts only when focused** (`useIsFocused()`), so it never leaks a preview onto other tabs.

### 8.4 Onboarding Template

```
[progress bar]   <- 24px from top
   Heading       <- centered, 32px bold
   Subtext       <- centered, secondary color

   [option 1]    <- pill, full width
   [option 2]
   ...

[Continue]       <- pinned to bottom safe area
[Back]
```

---

## 9. Icon System

Custom SVG via `react-native-svg`. 2px stroke, no fills (except the star, which is filled per §3.1). 24×24 viewBox. Inherits color from props.

**Build these icons and only these:**

`Star`, `Camera`, `Dumbbell`, `Profile`, `Plus`, `Check`, `X`, `ChevronLeft`, `ChevronRight`, `Edit`, `Trash`, `Play`, `Pause`, `Timer`, `Protein`, `Carbs`, `Fat`, `Settings`.

If a screen needs an icon not in this list, ask before adding it.

---

## 10. File Structure

```
yourstrat/
├── mobile/
│  ├── app/
│  │  ├── _layout.tsx           # root, auth gate
│  │  ├── (auth)/
│  │  │  ├── _layout.tsx
│  │  │  ├── login.tsx
│  │  │  ├── signup.tsx
│  │  │  ├── reset.tsx
│  │  │  ├── reset-confirm.tsx
│  │  │  └── onboarding.tsx
│  │  ├── (tabs)/
│  │  │  ├── _layout.tsx
│  │  │  ├── index.tsx          # Today
│  │  │  ├── workouts.tsx       # routine list
│  │  │  ├── scan.tsx           # camera
│  │  │  └── profile.tsx
│  │  ├── scan-result.tsx       # confirm-before-save modal
│  │  ├── meal/[id].tsx
│  │  ├── routine/[id].tsx      # routine detail / edit
│  │  ├── routine/new.tsx
│  │  ├── session/[id].tsx      # active workout
│  │  └── session/[id]/summary.tsx
│  ├── components/
│  │  ├── icons/                # one file per icon
│  │  ├── ui/                   # the 10 components from §8.2
│  │  ├── MealCard.tsx
│  │  ├── MacroRing.tsx
│  │  ├── ExerciseRow.tsx
│  │  └── RestTimer.tsx
│  ├── lib/
│  │  ├── supabase.ts
│  │  ├── api.ts                # typed fetch wrapper
│  │  ├── store.ts              # zustand
│  │  └── targets.ts            # client-side recompute mirror
│  ├── theme/colors.ts
│  ├── assets/logo/yourstrat-star.png
│  ├── app.json
│  ├── babel.config.js          # MUST include unstable_transformImportMeta:true
│  ├── metro.config.js          # nativewind metro
│  ├── global.css               # @tailwind base/components/utilities
│  └── package.json
│
├── backend/
│  ├── app/
│  │  ├── main.py
│  │  ├── config.py
│  │  ├── deps.py               # get_current_user via supabase.auth.get_user
│  │  ├── models/schemas.py
│  │  ├── routers/
│  │  │  ├── profile.py
│  │  │  ├── meals.py
│  │  │  ├── exercises.py
│  │  │  ├── routines.py
│  │  │  ├── sessions.py
│  │  │  └── today.py
│  │  ├── services/
│  │  │  ├── gemini.py          # one function: scan(photo_bytes) -> dict
│  │  │  ├── storage.py
│  │  │  ├── targets.py         # BMR / activity / goal delta
│  │  │  └── met.py             # calories burned
│  │  └── prompts/food_scan.py  # the one prompt
│  ├── requirements.txt
│  └── .env.example
│
├── supabase/migrations/001_init.sql
└── YOURSTRAT_BUILD.md         # this file
```

---

## 11. Build Roadmap (3 weeks max)

### Week 1 — Skeleton + Auth + Onboarding
- [ ] Init Expo + FastAPI + Supabase project
- [ ] Migrations applied, RLS verified
- [ ] Auth: signup, login, reset (with deep link `yourstrat://reset-confirm`)
- [ ] Onboarding flow → POST `/profile/onboard` → targets stored
- [ ] Today screen (empty state)

### Week 2 — Food scan loop
- [ ] Camera screen (gated on `useIsFocused`)
- [ ] Photo upload → Supabase Storage (private)
- [ ] Backend `/meals/scan` calls Gemini, returns JSON
- [ ] Scan result confirmation screen (edit portions)
- [ ] Save → `/meals/`
- [ ] Today screen: meals list + macro rings + remaining

### Week 3 — Workouts + polish
- [ ] Exercise CRUD
- [ ] Routine builder (drag to reorder)
- [ ] Active session screen: timer, set logger, rest timer
- [ ] Session summary: duration + calories burned
- [ ] Today screen: net calories (consumed − burned vs target)
- [ ] Profile: edit goals, sign out, delete account
- [ ] TestFlight build

**If week 3 finishes early: write tests. Do NOT add features.**

---

## 12. Agent Instructions (read this every session)

1. **Read this whole file before writing code.**
2. **Build in the order of §11.** Do not jump ahead.
3. **One screen / one endpoint per task.** Verify it works end-to-end before moving on.
4. **If you finish a task and §11 has nothing left for the current week, STOP and ask** — do not invent the next thing.
5. **Anything in §2 Scope Guard is forbidden.** If a task seems to require one of those, you've misunderstood — ask.
6. **Write tests as you go** for backend services (`targets.py`, `met.py`, `gemini.py` mocked). One happy-path + one edge case per service is enough for v1.
7. **No code comments narrating what the code does.** Comments are for *why* / non-obvious trade-offs only.
8. **Use the shared `Button`, `Input`, `Screen`, etc.** Never style a one-off pill button inline.
9. **Errors → Toast, not Alert, not raw text.** Log the real error with `console.error`.
10. **When in doubt, copy the simplest pattern from EmberPath** (in the sibling repo at `../EmberPath/`) — but **only** the simple primitives (Screen, Button, Input, supabase client, get_current_user). Do **not** copy streak/leaderboard/tip/learn code, even as "inspiration".

### What "done" looks like for v1

A new user can:
1. Sign up, complete onboarding, see their daily calorie + macro targets.
2. Snap a photo of a meal, see estimated nutrients, edit portions, save it.
3. See Today: rings filling, remaining calories, lagging macro callout.
4. Build a routine with 3 exercises, run it, finish it.
5. See net calories on Today reflect the workout burn.
6. Sign out and back in, all data persists.

If all 6 work on a real device, ship it. Don't polish past that.

---

## 13. Commands

```bash
# Mobile
cd mobile
npm install
npx expo start              # device via Expo Go
npx expo start --web        # quick UI preview in browser

# Backend (PowerShell)
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 18000 --reload
```

---

## 14. Environment Variables

### `mobile/.env`
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
EXPO_PUBLIC_API_URL=http://<your-LAN-IP>:18000
```

### `backend/.env`
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=sb_secret_...
GEMINI_API_KEY=
```

### App scheme + deep links (Supabase Auth)
- `mobile/app.json` → `expo.scheme`: `yourstrat`
- Supabase → Authentication → URL Configuration:
  - Site URL: `yourstrat://`
  - Additional Redirect URLs: `yourstrat://reset-confirm`
- Mobile call: `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'yourstrat://reset-confirm' })`

### Babel quirk (do this on day 1)
`mobile/babel.config.js` must set `unstable_transformImportMeta: true` under `babel-preset-expo`, or the web preview white-screens with "Cannot use 'import.meta' outside a module" (zustand uses it).

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        jsxImportSource: 'nativewind',
        unstable_transformImportMeta: true,
      }],
      'nativewind/babel',
    ],
    plugins: ['react-native-worklets/plugin'],
  };
};
```

---

## 15. Final Word

YourStrat is not EmberPath v2. It's a **disciplined rewrite** of the original idea, with all the gamification and AI-coach-feature-creep stripped out. The win condition is "user logs a meal and a workout in under 60 seconds on day one, and the day's numbers make sense."

If the agent ever feels the urge to add a streak, a tip, a leaderboard, an insight card, a celebration animation, or a "smart" anything beyond the food scan — **stop, re-read §2, and move on to the next item in §11.**

Find your North. Ship the core. Done.
