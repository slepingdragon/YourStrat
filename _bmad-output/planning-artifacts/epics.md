---
stepsCompleted: [1, 2, 3, 4]
workflow_completed: true
completed_at: 2026-05-24
inputDocuments:
  - YOURSTRAT_BUILD.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/brainstorming/brainstorming-session-2026-05-24-1301.md
  - _bmad-output/planning-artifacts/today-tab-ux-design-2026-05-20.md
  - _bmad-output/planning-artifacts/today-tab-brainstorm-2026-05-20.md
  - _bmad-output/planning-artifacts/today-tab-correct-course-2026-05-20.md
  - docs/AI_ACCURACY.md
  - docs/PREMIUM_PRICING.md
  - docs/TRIAL_AND_COSTS.md
  - docs/PRIVACY_POLICY.md
  - CLAUDE.md
  - AGENTS.md
project_name: YourStrat
scope: Full v1 build + UX-rework roadmap (Tier 0–6)
---

# YourStrat - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for YourStrat, decomposing requirements from the build spec (which serves as the de-facto PRD + Architecture), the app-wide UX Design Specification, the visual-language brainstorm (5 DNA Laws, Tier 0–6 roadmap), the Today-tab pacing-instrument precedent, and the business/operational docs (trial, pricing, AI accuracy, privacy) into implementable stories.

**Scope (per Brady, 2026-05-24):** Both the **full v1 feature build** (per `YOURSTRAT_BUILD.md` §4.1, plus the trial/scan-limit/ai-stats/nutrition surfaces the real codebase has grown beyond §7) **and** the **UX-rework roadmap** (Tier 0–6 from the brainstorm + UX spec) layered on top.

> **Reconciliation note:** The Today-tab **Correct Course** doc already resolved several UX-spec "open questions" — NextActionButton "Move" label is **cut**, workout-card quiet state is **not added**, the `|remaining| ≤ 5` hero label is **"at target"**, and `pace_position` **is added** to the `/today/` response (server wins when present, client computes when offline). Those resolutions are treated as decided, not open.

---

## Requirements Inventory

### Functional Requirements

**Auth & account**

FR1: A new user can sign up with email + password (Supabase Auth). No social login, no magic links.
FR2: An existing user can log in with email + password.
FR3: A user can reset their password via an email deep link (`yourstrat://reset-confirm`).
FR4: A user can sign out.
FR5: A user can delete their account and all associated data (profile, meals, photos, sessions). Privacy policy commits to deletion within 30 days of a verified request.

**Onboarding & targets**

FR6: A single onboarding flow captures units (metric/imperial), weight, height, age, sex, activity level, and goal (lose/maintain/gain). One question per screen, ≤ ~90 seconds, no tutorial overlays.
FR7: Goal defaults to "maintain" if skipped; macro split auto-computes to 30/40/30 with no v1 UI to override (defaults-over-decisions).
FR8: On onboarding submit, the backend computes BMR (Mifflin-St Jeor) → daily calorie target → macro targets and persists them on the profile.
FR9: Onboarding submission starts the 7-day trial (`trial_started_at`, `trial_ends_at` on `profiles`).

**Food scan & meal logging**

FR10: A user can capture a meal photo via camera or pick one from the photo library.
FR11: A captured photo uploads to `POST /meals/scan` → Gemini Flash vision → returns JSON items (name, portion, calories, protein, carbs, fat, fiber, sugar, sodium, confidence). The scan result is NOT yet saved.
FR12: The scan-result screen lets the user review and edit portions/items before saving.
FR13: A user can save a confirmed meal (`POST /meals/`) with its photo, per-item nutrients, and totals.
FR14: Each `POST /meals/scan` increments the user's `daily_scan_counts` for their local calendar date and enforces `DAILY_SCAN_LIMIT` (default 10) — returns **429** at the daily limit and **403** after trial end. Today/Workouts/Profile/history remain fully functional after trial end.
FR15: The backend post-processes Gemini output — clamp absurd values (≤2500 cal/item, ≤250 g/macro, ≤6000 mg sodium), cross-check `calories` vs `4P+4C+9F` within ±20% (prefer lower when they disagree), and penalize confidence on adjustments. Items with confidence < 0.7 surface a warning in the app.

**Today / daily snapshot**

FR16: The Today screen loads today's meals, totals, and remaining-vs-target via `GET /today/` (and supporting calls).
FR17: The Today screen shows net calories (target + burned − consumed), macro rings, and a lagging-nutrient callout (e.g. "38g protein short", "12g over saturated fat").
FR18: A user can tap a meal to view, edit, or delete it.
FR19: The meals list is sorted reverse-chronological (most recent on top).

**Nutrition history**

FR20: A nutrition view shows per-day totals, a 7-day trend (sparkline/strip), and day-detail pages. (Nutrition lives in its own surface today; the brainstorm/UX spec keep "nutrition" as a first-class surface alongside the Today hero.)

**Workouts**

FR21: A user can create and manage user-owned exercises (name, type strength/cardio/mobility, MET value, default sets×reps or duration).
FR22: A user can build a routine = ordered list of exercises with per-exercise defaults, and reorder exercises.
FR23: A user can pick a routine and start a workout session (`POST /sessions/start`).
FR24: During a session, the user can track sets/reps per exercise, with a per-set rest timer (90s default, editable) and per-exercise timing.
FR25: On finish (`POST /sessions/{id}/finish`), the session is saved with an estimated calories-burned (MET formula: `MET × weight_kg × duration_min/60`).
FR26: An active session can be resumed after tabbing away or after an app cold-start (active-session continuity).

**Profile & transparency**

FR27: A user can edit their goals/profile; targets recompute on update (`PUT /profile/`).
FR28: Profile shows trial status (days left, scans used today) and lifetime stats.
FR29: `GET /profile/ai-stats` exposes AI-accuracy transparency: `total_scans`, `avg_confidence`, `low_confidence_count`, `scans_this_week`.

**Trial UX**

FR30: Today shows a dismissible, calm trial-ending notice when the trial is near its end (never a full-screen takeover). Trial state also surfaces on Profile.

### NonFunctional Requirements

NFR1 — **60 FPS always.** Lists ≥10 items virtualize (`FlatList`/`FlashList`, `keyExtractor`, `getItemLayout`, `React.memo` rows). Animations run on the UI thread (Reanimated worklets); no JS-thread `setInterval` animation (RestTimer 1Hz label tick is the one exception, but its progress ring is a worklet). Images sized; no layout thrash inside scroll.

NFR2 — **Premium feel.** App-Store-grade polish: intentional spacing, type weight, alignment, motion. Must survive side-by-side with Apple Health / Linear / Strong. No debug strings, no Lorem, no orphan labels, no misaligned padding.

NFR3 — **One theme end-to-end.** Every color from `mobile/theme/colors.ts`; every spacing/radius from `mobile/theme/spacing.ts`. No inline hex, no magic padding/radius numbers. Adding a token requires asking first.

NFR4 — **Every UI wired to a real backend.** No mocked screens shipped, no "hook up later" buttons. All calls go through `mobile/lib/api.ts` (never raw `fetch` from a screen). Schema is the contract: a Pydantic change in `schemas.py` updates the matching TS type in `api.ts` in the same PR.

NFR5 — **Auth & data security.** All routes require `Authorization: Bearer <jwt>`, verified server-side via `supabase.auth.get_user`. RLS on every table (`user_id = auth.uid()`), service-role bypass for the backend only. Meal photos in a private bucket with per-user policy; signed URLs only.

NFR6 — **No raw errors.** Errors surface via `Toast` with calm copy; status-specific messages (403 trial ended, 429 daily limit, 5xx "our end", timeout "couldn't reach the scanner"). Never `[object Object]`, status codes, or stack traces. No `Alert.alert()` except destructive-action confirms (the single exception).

NFR7 — **Accessibility (WCAG 2.1 AA + platform a11y).** Text contrast ≥ AA (hero ≥ AAA). Color is never the sole signal (gap-arc presence, positional cues, copy back it up). Touch targets ≥ 44×44pt (hitSlop). Reduced-motion honored; screen-reader labels + roles on all interactive elements; dynamic type respected; VoiceOver/TalkBack tested before release.

NFR8 — **Platform.** iOS + Android via Expo; phone-only, portrait-locked. Max content width 480; 24px screen padding on every screen (via the `Screen` primitive). Web preview is dev-only (Metro proxy).

NFR9 — **Offline / resilience.** Today renders last-known-good snapshot offline (subtle offline indicator, no error toast). Photos are retained through scan failures. Mutations are optimistic-with-retry (save meal, log set, finish session); failed mutations persist locally and retry.

NFR10 — **Motion discipline.** Exactly three approved animations — state-flip spring (300ms), completion micro-tap (200ms strike/lock), digit-cycle tally — on one easing curve `cubic-bezier(.32, .72, 0, 1)`. Motion fires only on state change; no decorative/ambient/idle-drift motion; steady state is dead-still.

NFR11 — **Numeric integrity.** Tabular-nums weight 600 for all numerics; never weight 500; no italic. All numbers route through single `formatKcal()`/`formatWeight()`/`formatMacroGrams()` helpers. Calories nearest 5, macros nearest gram, weight nearest 0.5 (metric)/whole lb (imperial).

NFR12 — **AI-accuracy honesty.** Target ~85–90% usefulness on clear single-plate home meals; copy stays honest (no "90% accurate" claims without caveats). Confidence is encoded visually (whiskers), not via disclaimer copy.

NFR13 — **Privacy.** No selling/sharing data with advertisers; collect only the listed data; account+data deletion within 30 days; not directed at children under 13; all transit encrypted (HTTPS/TLS).

NFR14 — **"No mistakes" verification gate.** Before "done": `cd mobile && npx tsc --noEmit` passes (no `any`/`@ts-ignore` to dodge), screen renders end-to-end on web preview (happy path + one edge case), the backend call is observed firing in the uvicorn log, and there are zero console errors/warnings. Backend services get one happy-path + one edge-case test.

NFR15 — **Cost control.** Trial scan rate-limits exist to cap Gemini spend; a single Flash model, single call per scan — no multi-model pipelines, no fallbacks.

### Additional Requirements

*(Technical/architecture requirements from the build spec and operational docs that shape implementation.)*

**Stack & infrastructure**
- AR1 — Mobile: Expo (managed) + EAS, `expo-router` (file-based), `expo-camera`, `expo-image-picker`, NativeWind 4, Zustand (single store), `@supabase/supabase-js`, `react-native-svg`, `react-native-reanimated`, `react-native-gesture-handler` (swipe), `expo-image` (cached images).
- AR2 — Backend: FastAPI (Python 3.11+), Supabase Postgres + Storage, Supabase Auth, hosted on Railway. AI: Gemini Flash (`GEMINI_MODEL` default `gemini-2.0-flash`).
- AR3 — `babel.config.js` must set `unstable_transformImportMeta: true` under `babel-preset-expo` (zustand uses `import.meta`; web preview white-screens otherwise). Config files are ask-before-edit.

**Data model**
- AR4 — Schema tables: `profiles`, `meals`, `meal_items`, `exercises`, `routines`, `routine_exercises`, `sessions`, `session_sets`, plus trial fields and `daily_scan_counts`. Migrations `001_init.sql` … `004_trial.sql`.
- AR5 — RLS on every table (`user_id = auth.uid()` on all CRUD); storage bucket `meal-photos` private, per-user folder, signed URLs only.
- AR6 — `safe_single()` helper guards PostgREST `maybe_single()` returning `None` on zero rows (schema-drift fix already landed — don't re-litigate).

**API surface**
- AR7 — Core routes per build §7: `/profile/onboard`, `GET|PUT /profile/`, `POST /meals/scan`, `POST /meals/`, `GET /meals/today`, `GET|DELETE /meals/{id}`, `GET|POST /exercises/`, `GET|POST /routines/`, `GET /routines/{id}`, `POST /sessions/start`, `POST /sessions/{id}/finish`, `POST /sessions/{id}/sets`, `GET /today/`.
- AR8 — Beyond-§7 routes the real codebase carries: trial enforcement on scan, `GET /profile/ai-stats`, nutrition history endpoints. New routes/screens/icons/colors/deps require asking first.

**New backend wiring needed by the UX rework (Tier 5)**
- AR9 — `today.py`: `pace_position` / `target_pace_kcal_now` (T-S1), `workout_completion_today` (T-C1, if adopted), `recovery_hours_since_last_session` (W-R1, Tier-6/deferred).
- AR10 — `meals.py` scan response: `confidence_range` per macro (SC-C1).
- AR11 — Nutrition API: `vs_avg_kcal` derived field (N-A1).
- AR12 — Sessions API: `GET /sessions/active` for W-C2 cold-start restoration (confirm/ add).

**Dev workflow & deep links**
- AR13 — One-click dev launcher `mobile/play.cmd` (LAN mode, port 8888); API on 18000, web preview on 18082. Deep-link scheme `yourstrat://` with `yourstrat://reset-confirm` redirect.

### UX Design Requirements

*(Each is specific enough to become a story. IDs trace to the brainstorm/UX spec. Tier order = implementation order.)*

**Tier 0 — DNA Compass (always-on; governs all UX work)**
- UX-DR0: The 5 DNA Laws bind every UX change — LAW-1 Hero (one dominant 56–72pt number per surface), LAW-2 Numeric (tabular-nums 600), LAW-3 Motion (3 approved animations only), LAW-4 Density (weight+whitespace, no nested cards/boxes, dividers only ≥4 rows), LAW-5 Sparkline (7-day quiet trend whisper). Captured operationally in NFR1–NFR11; no surface story may violate them.

**Tier 1 — Priority picks (Sprint 1)**
- UX-DR1 (T-S1 Pace Ring): Extend `IntakeRing` into a pacing instrument — fill (consumed) + gap arc (pace delta, `paceWarmGap`/`paceCoolGap` at 25% α) + tonal shift (`star`→`starDim` when ahead, `error` when over), z-order track→arc→fill. Four geometry-only states (on / behind / ahead / over) per the Today-tab precedent §3; 5% on-pace threshold; mount-settle (400ms) + data-change (300ms) Reanimated animations; "at target" label edge when `|remaining|≤5`; no pace-state copy on screen. Add `mobile/lib/pace.ts` (`computePaceTick` + `PACE_CURVE` const) and the two color tokens. Backend `pace_position` on `/today/` (server wins, client computes offline). Strip pace copy from `TodayHeader` (time-of-day greeting only). `CalorieSparkline` target-line overlay + today-bar fill variant.
- UX-DR2 (W-C2 Active Session Takeover): Workouts tab content branches to the live session view when `activeSessionId !== null`, else the routine list. `TabBadge` rest-timer dot/countdown on the Workouts tab icon (1Hz). Clear active state on finish → revert to list. Cold-start restore via `GET /sessions/active`.

**Tier 2 — Anti-pattern guardrails (Sprint 1, ship before reworks)**
- UX-DR3: `mobile/lib/format.ts` with `formatKcal()`/`formatWeight()`/`formatMacroGrams()`; route all numeric rendering through them (AP-11).
- UX-DR4: Pre-commit greps — raw hex `#[0-9a-fA-F]{3,6}` outside `theme/` (AP-1); off-grid `padding|margin: <number>` not via `spacing.` (AP-2); AI-whisper copy `"Based on"`/`"It looks like"` (AP-15).
- UX-DR5: PR-review/lint checks — any new animation justified against LAW-3's three (AP-3/AP-4); lists ≥10 items must be `FlatList`/`FlashList` (AP-17).
- UX-DR6: Audit `nutrition/CoachInsight.tsx` — if it ships AI-commentary copy ("Based on your recent meals…"), it violates §2/AP-15; remove or refactor. **(RESOLVED 2026-05-24 — REMOVED: dead-code "COACH" line, §2 violation.)**
- UX-DR7: Audit `nutrition/WaterRow.tsx` — water tracking is out of v1 scope (build §4.1); confirm whether accidental scope creep or intentional. **(RESOLVED 2026-05-24 — REMOVED: out-of-scope + backend-orphan; unmounted from NutritionDayView.)**

**Tier 3 — Surface quick wins (Sprint 1–2; subtractive, low risk)**
- UX-DR8 (T-E1/P-E1/W-E1): Kill section-header taglines + page subtitles across Today, Profile, Workouts.
- UX-DR9 (T-M2): `CalorieSparkline` minify-to-whisper variant (~24pt inline beside hero).
- UX-DR10 (W-M2): Minify "Rest day" copy to an 11pt `textMuted` right-aligned line.
- UX-DR11 (P-E2): Remove the duplicate daily-targets card on Profile (edit-form preview suffices).
- UX-DR12 (P-M2): Add a `PillRow` primitive; migrate Activity/Goal `OptionCard` stacks to horizontal pill rows. **(RESOLVED 2026-05-24 — build `PillRow`, not SegmentedControl.)**
- UX-DR13 (SC-M2): Minify the photo-library button to a 24pt top-right corner icon.
- UX-DR14 (WI-9): Audit every `Skeleton` usage; size/shape each to match its real counterpart (zero layout jump on hydrate).

**Tier 4 — Surface reworks (Sprint 2–4; each ships with its paired backend wiring)**
- UX-DR15 (T-M1): Today hero kcal as 96pt tabular below the ring (ring = progress, number = magnitude).
- UX-DR16 (W-S1): `DayChip` horizontal day-of-week strip atop Workouts (replaces day-section headers; today highlighted, tappable scroll).
- UX-DR17 (W-S2): `RoutineCard` → single-line row (name · duration · exercise count); swipe-left to start, swipe-right to delete.
- UX-DR18 (W-M1): `WeightHero` — 96pt tabular active-set weight (readable from 6 ft) in `session/[id]`.
- UX-DR19 (W-A1): Strong-style active-session spreadsheet table (exercises as rows, sets as columns, active cell 2pt left border).
- UX-DR20 (W-C1): RPE picker as inline row expansion (eliminate the modal).
- UX-DR21 (N-S1/N-S2): Nutrition weekly heatmap strip + month scroll-spy day rows (eliminate date picker / Today-Week-Month toggle).
- UX-DR22 (N-C1): Nutrition hero kcal sitting on the 7-day sparkline ("number on horizon").
- UX-DR23 (N-M1): Magnified macros as 32pt tabular columns at the top of Nutrition.
- UX-DR24 (N-A1): Apple-Health "today vs 7-day avg" pill under the hero (needs `vs_avg_kcal`).
- UX-DR25 (SC-C1): `ConfidenceWhisker` ticks on the scan-result macro tri-bar (needs `confidence_range` per macro).
- UX-DR26 (SC-A1): Cross-screen Scan→Today motion continuity (saved meal strikes in, screen dismisses, meal animates its Today entry).
- UX-DR27 (SC-S2): Hold-to-capture shutter (200ms hold; tap remains fallback) + `SC-M1` capture flash.
- UX-DR28 (SC-S1/SC-P1): Pre-shutter live-macro placeholder pill on the camera view; >3s-idle HUD overlay of today's running macros.
- UX-DR29 (SC-A2): Portion-edit bottom sheet with macros animating live as sliders drag (no form, no save-to-preview).
- UX-DR30 (SC-E1): First-visit camera permission as an inline sheet over camera-blackness (not a separate route).
- UX-DR31 (SC-C2): Recent-3-scans strip on the camera view; tap to re-log without re-scanning.
- UX-DR32 (T-C2): `MealCard` compact single-line variant (name · kcal · 8pt P/C/F tri-bar, tap to expand).
- UX-DR33 (T-A1): Linear-style issue-move animation when a meal lands on Today after logging.
- UX-DR34 (P-S1): Profile hero = lifetime kcal-burned at 72pt tabular (recommended over P-S2 targets-hero). **(RESOLVED 2026-05-24 — P-S1 confirmed; P-S2 would duplicate Today/Nutrition targets.)**
- UX-DR35 (P-A1): Apple-Settings grouped density for the Account section; add a `destructive` `Button` variant (`urgent` color) for Delete Account.
- UX-DR36 (P-C1): Trial status as a single line, no card chrome ("8 days · 3/10 scans today").

**Tier 5 — Backend wiring (parallel to Tier 4; see AR9–AR12)**
- UX-DR37: `today.py` derived fields — `target_pace_kcal_now`/`pace_position`, `workout_completion_today`, `recovery_hours_since_last_session`.
- UX-DR38: `meals.py` scan response — `confidence_range` per macro.
- UX-DR39: Nutrition API — `vs_avg_kcal` derived field.
- UX-DR40: Sessions API — `GET /sessions/active` (confirm/add).

**Tier 6 — Wild / validate-later (deferred; need user testing or §2 verification)**
- UX-DR41 (deferred): WI-2 unit-morph hero, WI-3 time-to-zero countdown hero, WI-6 pull-down "1-rep view", WI-7 meal-as-workout-equivalent, WI-12 volume-button set-advance, N-R1 adherence count, W-R1 recovery hero, SC-R1 result-first scan workflow, T-P1 ring-as-tomorrow's-plan.

**Cross-cutting consistency patterns (UX spec step 12; bind all surface stories)**
- UX-DR42: Button hierarchy (one primary per screen; pill primary/secondary, ghost tertiary; press-scale 0.95; loading = spinner replaces label). Feedback taxonomy (inline-change default > Toast > rationed haptics). Haptic taxonomy: selection on pill-select, light impact on pull-to-refresh success, error notification on hard errors — never per-tap. Empty states per surface (calm declarative copy, no apology, no illustration, no CTA pressure). Loading: skeleton-first, no spinner before 200ms, no branded loaders. Max one modal at a time; prefer inline expansion. Copy voice: calm/navigational, no "you're", no exclamation marks, no emojis.

> **Resolved (no longer open):** NextActionButton "Move" label — **cut**; workout-card "quiet/rest-day" state on Today — **not added**; `|remaining|≤5` hero label — **"at target"**; `pace_position` on `/today/` — **added**. (Per Today-tab Correct Course §2.)

### FR Coverage Map

- **FR1** (email/password sign-up): Epic 2 — Account, Onboarding & Profile
- **FR2** (login): Epic 2
- **FR3** (password reset deep link): Epic 2
- **FR4** (sign out): Epic 2
- **FR5** (delete account + data): Epic 2
- **FR6** (onboarding flow): Epic 2
- **FR7** (goal/macro defaults): Epic 2
- **FR8** (compute & persist targets): Epic 2
- **FR9** (start 7-day trial on onboard): Epic 2
- **FR10** (capture/pick meal photo): Epic 3 — Food Scan & Meal Logging
- **FR11** (scan → Gemini → items, unsaved): Epic 3
- **FR12** (scan-result review/edit): Epic 3
- **FR13** (save confirmed meal): Epic 3
- **FR14** (daily scan limit / 429 / 403 trial-end): Epic 3
- **FR15** (Gemini post-process + low-confidence warning): Epic 3
- **FR16** (Today load snapshot): Epic 4 — Today: Daily Pacing Instrument
- **FR17** (net calories, macro rings, lagging-nutrient callout): Epic 4
- **FR18** (tap meal view/edit/delete): Epic 4
- **FR19** (meals reverse-chronological): Epic 4
- **FR20** (nutrition history + 7-day trend + day pages): Epic 6 — Nutrition History & Trends
- **FR21** (exercises CRUD): Epic 5 — Workouts: Build, Run & Resume
- **FR22** (routine builder + reorder): Epic 5
- **FR23** (start session): Epic 5
- **FR24** (set/rep tracking + rest timer): Epic 5
- **FR25** (finish + calories burned): Epic 5
- **FR26** (active-session continuity): Epic 5
- **FR27** (edit profile, recompute targets): Epic 2
- **FR28** (profile trial + lifetime stats): Epic 2
- **FR29** (`/profile/ai-stats` transparency): Epic 2
- **FR30** (trial-ending notice): Epic 4 (Today dismissible notice) + Epic 2 (Profile trial status)

*All 30 FRs mapped. NFR1–NFR15 are cross-cutting and enforced via Epic 1 (guardrails) plus per-story acceptance criteria. UX-DR items map into the surface epic that owns the touched files (Tier 1 picks flagged as priority; Tier 5 wiring folded into the consuming epic; Tier 6 → Epic 7).*

## Epic List

### Epic 1: Premium Foundation & Quality Guardrails
Establish the shared primitives and automated guardrails that keep every later surface consistent, jank-free, and on-brand — so premium quality is enforced by tooling, not vigilance. Delivers the `formatKcal/formatWeight/formatMacroGrams` helpers, pre-commit greps (raw hex, off-grid spacing, AI-whisper copy), PR/lint checks (animation-vs-LAW-3, FlatList-for-lists), the frame-perfect `Skeleton` audit, the `Button` `destructive` variant, the `PillRow` primitive, and the two scope audits (`CoachInsight`, `WaterRow`). This epic is intentionally first because it is brownfield-appropriate: the v1 app already exists, and these are the rails that protect it during the UX rework.
**Covers:** NFR1, NFR3, NFR6, NFR10, NFR11 · UX-DR0, UX-DR3, UX-DR4, UX-DR5, UX-DR6, UX-DR7, UX-DR14 · seeds UX-DR12 (PillRow), UX-DR35 (destructive Button)

### Epic 2: Account, Onboarding & Profile
A new user can sign up, complete a sub-90-second onboarding flow that computes their calorie + macro targets and starts the 7-day trial, then manage their account — edit goals (recompute targets), view trial status, lifetime stats and AI-accuracy transparency, sign out, and delete their account. The Profile surface also receives its premium pass (Apple-Settings density, lifetime-kcal hero, pill-row Activity/Goal pickers, single-line trial status, killed taglines/duplicate cards).
**Covers:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR27, FR28, FR29, FR30 (Profile part) · UX-DR8 (P-E1), UX-DR11 (P-E2), UX-DR12 (P-M2 adopt), UX-DR34 (P-S1), UX-DR35 (P-A1), UX-DR36 (P-C1) · UX-DR42 (form/button/copy patterns)

### Epic 3: Food Scan & Meal Logging
The product's reason to exist (Loop B): a user points the camera at food (hold-to-capture, or pick from library), the photo is scanned by Gemini into believable macros with honest confidence, they review/edit portions, and save — at which point the meal strikes in and lands on Today. Includes the daily-scan-limit/trial-end handling (429/403 with calm copy), backend post-processing (clamp + macro-calorie cross-check + confidence penalty), and the camera-surface premium pass (inline permission sheet, recent-scans strip, capture flash, confidence whiskers, portion sheet).
**Covers:** FR10, FR11, FR12, FR13, FR14, FR15 · UX-DR13 (SC-M2), UX-DR25 (SC-C1 + UX-DR38 confidence_range), UX-DR26 (SC-A1), UX-DR27 (SC-S2/SC-M1), UX-DR28 (SC-S1/SC-P1), UX-DR29 (SC-A2), UX-DR30 (SC-E1), UX-DR31 (SC-C2) · NFR9 (photo retention), NFR12 (accuracy honesty)

### Epic 4: Today — Daily Pacing Instrument
The signature surface and most-frequent loop (Loop A): a user opens Today and reads "am I on track right now?" in under 500ms from geometry alone. Delivers the **T-S1 Pace Ring** (Tier-1 priority) — the gap-arc/tonal-shift instrument, `pace.ts`, the two pace color tokens, and the `pace_position` backend field — plus the Today snapshot (net calories, macro rings, lagging-nutrient callout), reverse-chronological editable meals, the dismissible trial notice, and the Today premium pass (96pt hero, compact meal cards, sparkline whisper + target line, killed section labels, meal-land animation).
**Covers:** FR16, FR17, FR18, FR19, FR30 (Today notice) · UX-DR1 (T-S1 Pace Ring — **Tier 1**), UX-DR8 (T-E1), UX-DR9 (T-M2), UX-DR15 (T-M1), UX-DR32 (T-C2), UX-DR33 (T-A1), UX-DR37 (pace_position, workout_completion_today)

### Epic 5: Workouts — Build, Run & Resume
The gym loop (Loop C): a user creates exercises, builds and reorders routines, starts a session, logs sets/reps with a rest timer, and finishes with an estimated calories-burned that flows back to Today. Delivers the **W-C2 Active Session Takeover** (Tier-1 priority) — the Workouts tab becomes the live session when one is active, with a rest-timer tab badge and cold-start restoration via `GET /sessions/active` — plus the Workouts premium pass (day-strip, single-line routine rows with swipe, 96pt active-set weight hero, Strong-style session table, inline RPE picker, minified rest-day copy, killed tagline).
**Covers:** FR21, FR22, FR23, FR24, FR25, FR26 · UX-DR2 (W-C2 Active Session Takeover — **Tier 1** + UX-DR40 `/sessions/active`), UX-DR16 (W-S1), UX-DR17 (W-S2), UX-DR18 (W-M1), UX-DR19 (W-A1), UX-DR20 (W-C1), UX-DR10 (W-M2), UX-DR8 (W-E1)

### Epic 6: Nutrition History & Trends
A user can review their day-by-day nutrition history and 7-day trends without leaving the calm, receipt-dense aesthetic. Delivers the nutrition surface rework: weekly heatmap strip + month scroll-spy day rows (eliminating the date picker and Today/Week/Month toggle), hero-on-sparkline composite, magnified 32pt macro columns, the Apple-Health "vs 7-day average" pill (with backend `vs_avg_kcal`), Stripe-receipt day-detail pages, and calm empty states.
**Covers:** FR20 · UX-DR21 (N-S1/N-S2), UX-DR22 (N-C1), UX-DR23 (N-M1), UX-DR24 (N-A1 + UX-DR39 vs_avg_kcal), plus N-A2/N-E1/N-E2 density+empty-state moves

### Epic 7: Experimental Hero Moments (validate-later)
Bold, higher-risk interactions deliberately deferred until prototype-validated or explicitly checked against the §2 scope guard. Not scheduled into a sprint; each story carries a validation gate before it may be picked up. Kept as an epic so the ideas aren't lost and so it's unambiguous they are *out* of the committed v1 + rework scope.
**Covers:** UX-DR41 (WI-2 unit-morph, WI-3 countdown hero, WI-6 pull-down 1-rep, WI-7 meal-as-workout-equivalent, WI-12 volume-button bindings, N-R1 adherence count, W-R1 recovery hero, SC-R1 result-first scan, T-P1 ring-as-tomorrow)

---

## Epic 1: Premium Foundation & Quality Guardrails

Establish the shared primitives and automated guardrails that keep every later surface consistent, jank-free, and on-brand — so premium quality is enforced by tooling, not vigilance. This epic ships first because the v1 app already exists and these rails protect it during the rework. *(Covers NFR1, NFR3, NFR6, NFR10, NFR11; UX-DR0, 3, 4, 5, 6, 7, 14; seeds UX-DR12, UX-DR35.)*

### Story 1.1: Single-source numeric formatting helpers

As a developer building any numeric surface,
I want one set of `formatKcal()` / `formatWeight()` / `formatMacroGrams()` helpers,
So that every number reads identically across the app and numeric cosmetic drift (AP-11) is impossible.

**Acceptance Criteria:**

**Given** a calorie value
**When** it is rendered through `formatKcal()`
**Then** it is rounded to the nearest 5 with a locale-aware thousands separator (e.g. `1,420`)
**And** no caller renders a raw calorie number without the helper.

**Given** a weight value and the user's unit preference
**When** rendered through `formatWeight()`
**Then** metric rounds to nearest 0.5 kg and imperial to the whole pound, with the correct unit suffix.

**Given** a macro gram value
**When** rendered through `formatMacroGrams()`
**Then** it is rounded to the nearest gram.

**Given** the helpers exist in `mobile/lib/format.ts`
**When** the test suite runs
**Then** unit tests cover at least one boundary case per helper (e.g. 1,422 → 1,420; 0; negative remaining).

### Story 1.2: Token-drift pre-commit guard (hex + spacing)

As the project maintainer,
I want a pre-commit hook that rejects raw hex colors and off-grid padding/margin,
So that the one-theme rule (NFR3, AP-1, AP-2) cannot be violated silently.

**Acceptance Criteria:**

**Given** a staged file outside `mobile/theme/` containing a literal `#[0-9a-fA-F]{3,6}`
**When** the developer commits
**Then** the commit is blocked with a message naming the file and line.

**Given** a staged style with `padding:`/`margin:` set to a numeric literal not sourced from `spacing.`
**When** the developer commits
**Then** the commit is blocked.

**Given** a legitimate value already lives in `theme/`
**When** that file is committed
**Then** the hook does not flag it (the `theme/` directory is the allowed source of truth).

### Story 1.3: Scope & motion review checks (AI-whisper, animation, lists)

As a reviewer,
I want automated/checklist guards against AI-commentary copy, unjustified animation, and non-virtualized lists,
So that scope-guard (§2) and 60-FPS (NFR1) violations are caught before merge.

**Acceptance Criteria:**

**Given** a staged file containing the strings `"Based on"` or `"It looks like"` in user-facing copy
**When** the developer commits
**Then** the commit is blocked pending review (AP-15).

**Given** a pull request introduces a new animation
**When** it is reviewed
**Then** the PR template requires it be justified against LAW-3's three approved animations, else it is not merged (AP-3, AP-4).

**Given** a list renders ≥10 items
**When** reviewed (lint rule or PR check)
**Then** it must use `FlatList`/`FlashList`, not `.map()` inside a `ScrollView` (AP-17).

### Story 1.4: Frame-perfect skeleton audit

As a user on a slow connection,
I want loading skeletons that exactly match the final layout,
So that screens never jump when data arrives (WI-9, NFR1).

**Acceptance Criteria:**

**Given** every screen that fetches data (Today, Workouts list, Nutrition, scan-result)
**When** its `Skeleton` usage is audited
**Then** each skeleton block is sized/shaped to its real counterpart's final dimensions (including the 0% ring and flat sparkline placeholders).

**Given** a skeleton is showing and data arrives
**When** the real content renders
**Then** there is zero layout shift (verified visually on web preview and on the S24 Ultra).

**Given** a response arrives in under 200ms
**When** the screen loads
**Then** no spinner strobes — the result renders directly (AP-5).

### Story 1.5: `Button` destructive variant

As a user performing a destructive action,
I want a clearly distinct destructive button,
So that delete actions read as dangerous without a one-off styled button (NFR3).

**Acceptance Criteria:**

**Given** the `Button` primitive
**When** a `destructive` variant is added
**Then** it renders with the `urgent` color token on text/border, keeps the pill shape and 56px min-height, and is added to `Button.tsx` (not a forked `DangerButton.tsx`).

**Given** the destructive variant
**When** rendered
**Then** it carries `accessibilityRole="button"` and a descriptive `accessibilityLabel`.

### Story 1.6: `PillRow` primitive

As a user making a few-choice selection,
I want a horizontal pill-row control,
So that onboarding and profile selects are compact (AP-10) and consistent.

**Acceptance Criteria:**

**Given** the abstraction decision is confirmed (PillRow vs SegmentedControl)
**When** the primitive is built
**Then** it renders a horizontal row of pills; the selected pill is `star`-filled with `bg` text and unselected pills are `border`-outlined with `textSecondary` text.

**Given** a pill is tapped
**When** selection changes
**Then** it animates via the LAW-3 state-flip spring and fires `Haptics.SelectionFeedback`.

**Given** the control
**When** inspected by a screen reader
**Then** the group is `radiogroup` and each pill is `radio` with `accessibilityState={{ selected }}`.

> **Resolved 2026-05-24 — build `PillRow`** (not `SegmentedControl`). Rationale: SegmentedControl carries iOS-native visual baggage (AP-18) and would clash with the monochrome brand; `PillRow` composes from existing primitives and matches the pill-button brand language.

### Story 1.7: `CoachInsight` scope audit

As the product owner protecting the scope guard,
I want `nutrition/CoachInsight.tsx` audited,
So that no AI-commentary copy ships (§2, AP-15).

**Acceptance Criteria:**

**Given** the component's current rendered copy
**When** audited
**Then** if it emits AI-commentary ("Based on your recent meals…"–style) it is removed or refactored to a non-commentary form; if it is already compliant, the finding is recorded.

> **Resolved 2026-05-24 — REMOVED.** Audit found `nutrition/CoachInsight.tsx` rendered a "COACH" insight-line card (a §2-forbidden "coach line" surface) and was imported nowhere (dead code). Deleted the file; zero blast radius; type-check clean. This story is effectively complete.

### Story 1.8: `WaterRow` scope audit

As the product owner protecting the scope guard,
I want `nutrition/WaterRow.tsx` audited,
So that out-of-scope water tracking (build §4.1) doesn't ship by accident.

**Acceptance Criteria:**

**Given** the component and its usages
**When** audited
**Then** a determination is recorded — accidental scope creep (remove) or intentional/approved (keep and document) — and acted on accordingly.

> **Resolved 2026-05-24 — REMOVED.** Audit found `nutrition/WaterRow.tsx` was a full water-tracking feature (out of v1 scope per build §4.1) persisting only to `AsyncStorage` — a backend-orphan UI violating NFR4. It was live in `NutritionDayView` (the "Hydration" section). Unmounted it (removed import + section) and deleted the file; type-check clean. This story is effectively complete. *(Reversible via git if Brady wants it back.)*

---

## Epic 2: Account, Onboarding & Profile

A new user can sign up, complete a sub-90-second onboarding that computes their targets and starts the trial, then manage their account on a premium Profile surface. *(Covers FR1–FR9, FR27, FR28, FR29, FR30-Profile; UX-DR8, 11, 12, 34, 35, 36, 42.)*

### Story 2.1: Sign up with email & password

As a new user,
I want to create an account with my email and password,
So that my data is tied to me (FR1).

**Acceptance Criteria:**

**Given** the sign-up screen
**When** I submit a valid email and password
**Then** a Supabase Auth account is created and I proceed to onboarding.

**Given** an email already in use
**When** I submit
**Then** an inline error appears on the email field (not a modal, not a raw error) per NFR6.

**Given** a network failure
**When** I submit
**Then** a calm `Toast` appears and my entered email is preserved.

### Story 2.2: Log in with email & password

As a returning user,
I want to log in,
So that I reach my Today screen with my data (FR2).

**Acceptance Criteria:**

**Given** valid credentials
**When** I log in
**Then** I receive a session and land on Today.

**Given** invalid credentials
**When** I log in
**Then** a calm inline/Toast error appears — never a raw status code (NFR6).

**Given** a completed profile already exists
**When** I log in
**Then** I skip onboarding and go straight to Today.

### Story 2.3: Reset password via email deep link

As a user who forgot my password,
I want to reset it through an email link,
So that I can regain access (FR3).

**Acceptance Criteria:**

**Given** I request a reset for my email
**When** I submit
**Then** `resetPasswordForEmail` is called with `redirectTo: 'yourstrat://reset-confirm'` and a calm confirmation is shown.

**Given** I open the `yourstrat://reset-confirm` deep link
**When** the app handles it
**Then** I reach the reset-confirm screen and can set a new password.

**Given** a new valid password is submitted
**When** it succeeds
**Then** I am signed in and routed appropriately.

### Story 2.4: Onboarding flow with smart defaults

As a new user,
I want a short guided setup,
So that the app knows enough to compute my targets without busywork (FR6, FR7).

**Acceptance Criteria:**

**Given** the onboarding flow
**When** I step through it
**Then** it captures units (metric/imperial), weight, height, age, sex, activity level, and goal — one question per screen, with a `ProgressBar` and pinned Continue button.

**Given** the Activity and Goal steps
**When** rendered
**Then** they use the `PillRow` primitive (UX-DR12), not stacked `OptionCard`s.

**Given** I skip the goal
**When** I continue
**Then** it defaults to "maintain" and macro split defaults to 30/40/30 with no override UI (FR7).

**Given** I complete the flow
**When** I finish
**Then** the whole flow took the form of ≤4 question screens with no tutorial overlays.

### Story 2.5: Compute targets & start trial on onboard

As a new user,
I want my daily targets calculated and my trial started when I finish onboarding,
So that Today is immediately meaningful (FR8, FR9).

**Acceptance Criteria:**

**Given** a completed onboarding payload
**When** `POST /profile/onboard` is called
**Then** the backend computes BMR (Mifflin-St Jeor) → daily calorie target → macro targets and persists them on `profiles`.

**Given** the same call
**When** it succeeds
**Then** `trial_started_at` and `trial_ends_at` (7 days) are set.

**Given** the call fails
**When** I see the result
**Then** a calm retry Toast appears and my form state is preserved (no data loss).

**Given** the backend service
**When** tests run
**Then** `targets.py` has a happy-path + edge-case test (e.g. sedentary/lose vs very_active/gain).

### Story 2.6: Edit profile & recompute targets

As a user whose body or goal changed,
I want to edit my profile,
So that my targets stay accurate (FR27).

**Acceptance Criteria:**

**Given** the profile edit form
**When** I change weight/activity/goal and save
**Then** `PUT /profile/` persists the change and recomputes targets server-side.

**Given** I am editing
**When** I adjust values
**Then** inputs go through the `Input`/`PillRow` primitives and validate on blur (not per keystroke).

**Given** a successful save
**When** I return to Today
**Then** the new targets are reflected.

### Story 2.7: Profile surface premium pass

As a user opening Profile,
I want a calm trophy-case, not an admin panel,
So that the surface reads premium and answers "who am I + my status" instantly (FR28, FR29, FR30-Profile).

**Acceptance Criteria:**

**Given** the Profile screen
**When** it renders
**Then** the hero is lifetime kcal-burned at 72pt tabular (P-S1), section taglines are removed (P-E1), and the duplicate daily-targets card is removed (P-E2).

**Given** the trial is active
**When** Profile renders
**Then** trial status shows as a single line with no card chrome — "N days · X/10 scans today" (P-C1), sourced from real trial state.

**Given** the Account section
**When** rendered
**Then** it uses Apple-Settings grouped text-row density (P-A1) with Delete Account as a destructive row.

**Given** AI transparency data
**When** Profile loads `GET /profile/ai-stats`
**Then** total scans, average confidence, low-confidence count, and scans-this-week are displayed honestly (no accuracy claim without caveat, NFR12).

> **Resolved 2026-05-24 — P-S1 (lifetime kcal-burned, 72pt tabular hero).** Rationale: makes Profile a trophy-case hero per LAW-1; P-S2 (targets-as-hero) would duplicate the targets already shown on Today/Nutrition.

### Story 2.8: Sign out

As a user,
I want to sign out,
So that my session ends on this device (FR4).

**Acceptance Criteria:**

**Given** I am signed in
**When** I tap Sign out
**Then** the Supabase session is cleared and I return to the login screen.

**Given** I sign out
**When** it completes
**Then** no authenticated data remains rendered.

### Story 2.9: Delete account & all data

As a user exercising my privacy rights,
I want to delete my account and data,
So that nothing of mine remains (FR5, NFR13).

**Acceptance Criteria:**

**Given** the Delete Account row
**When** I tap it
**Then** a system `Alert` destructive confirmation appears (the one allowed Alert exception, NFR6).

**Given** I confirm deletion
**When** it processes
**Then** my profile, meals, photos, and sessions are deleted (RLS-scoped to me) and I am signed out.

**Given** deletion succeeds
**When** complete
**Then** the behavior is consistent with the privacy commitment (data removed; email-based path documented in the policy).

---

## Epic 3: Food Scan & Meal Logging

The product's reason to exist (Loop B): snap → believable macros → edit → save → lands on Today, with honest confidence and trial-limit handling. *(Covers FR10–FR15; UX-DR13, 25, 26, 27, 28, 29, 30, 31, 38; NFR9, NFR12.)*

### Story 3.1: Camera capture & library pick

As a user about to log a meal,
I want to capture a photo or pick one from my library,
So that I can start a scan in one or two taps (FR10).

**Acceptance Criteria:**

**Given** the Scan tab is focused
**When** the camera mounts
**Then** it mounts only while focused (`useIsFocused`) so it never leaks a preview onto other tabs.

**Given** first-time camera use
**When** permission is needed
**Then** an inline sheet appears over camera-blackness (SC-E1), not a separate route; denying falls back to library-only mode.

**Given** the shutter
**When** I hold it ~200ms
**Then** the capture fires with an 80ms white flash (SC-S2, SC-M1); a quick tap still works as fallback.

**Given** the library option
**When** the camera view renders
**Then** the library affordance is a 24pt top-right corner icon (SC-M2), keeping the surface camera-first.

### Story 3.2: Scan photo through Gemini with post-processing

As a user who captured food,
I want accurate-enough macros back quickly,
So that I trust what I'm about to log (FR11, FR15).

**Acceptance Criteria:**

**Given** a captured photo
**When** `POST /meals/scan` runs
**Then** the photo is sent to Gemini Flash (single model, single call) and returns JSON items (name, portion, calories, protein, carbs, fat, fiber, sugar, sodium, confidence) — not yet saved.

**Given** Gemini's raw output
**When** the backend post-processes
**Then** absurd values are clamped (≤2500 cal/item, ≤250 g/macro, ≤6000 mg sodium), `calories` is cross-checked against `4P+4C+9F` within ±20% (prefer lower on disagreement), and confidence is penalized on adjustments.

**Given** the photo isn't food
**When** scanned
**Then** the response is `{"items": []}` and the UI shows a calm "Couldn't read the photo" state — not an error code.

**Given** the `gemini.py` service
**When** tests run
**Then** it has a happy-path + edge-case test (mocked Gemini) covering the macro-calorie clamp.

### Story 3.3: Review & edit the scan result

As a user reviewing a scan,
I want to adjust portions before saving,
So that the logged meal matches what I actually ate (FR12).

**Acceptance Criteria:**

**Given** the scan-result screen
**When** it renders
**Then** the hero is total kcal (72pt tabular) with a macro tri-bar and an itemized list.

**Given** I want to adjust a portion
**When** I open the edit sheet (SC-A2)
**Then** a bottom sheet with portion sliders appears and the macros animate live as I drag (no save-to-preview).

**Given** I change a portion
**When** I close the sheet
**Then** the hero and totals reflect the edit immediately.

### Story 3.4: Confidence whiskers on scan result

As a user evaluating an AI estimate,
I want to see the model's uncertainty visually,
So that I know which numbers to trust without reading a disclaimer (UX-DR25, UX-DR38, NFR12).

**Acceptance Criteria:**

**Given** the scan response includes `confidence_range` per macro
**When** the backend returns it
**Then** the schema in `schemas.py` and the TS type in `api.ts` are updated in the same change (NFR4).

**Given** confidence ranges exist
**When** the macro tri-bar renders
**Then** 1pt whisker ticks show above/below each macro proportional to its range (narrow=confident, wide=uncertain, hidden=no data).

**Given** a low-confidence item (<0.7)
**When** the result renders
**Then** a calm warning is surfaced (no alarm, no copy claiming precision).

**Given** a screen reader
**When** focused on the macro group
**Then** an `accessibilityHint` reads the confidence ranges aloud.

### Story 3.5: Save meal with Scan→Today continuity

As a user finishing a scan,
I want the saved meal to visibly land on Today,
So that logging feels complete and continuous (FR13, UX-DR26).

**Acceptance Criteria:**

**Given** a confirmed (possibly edited) meal
**When** I tap Save
**Then** `POST /meals/` persists the meal (photo, items, totals) and the save is observable in the uvicorn log.

**Given** the save succeeds
**When** the transition runs
**Then** the meal row strikes in toward the bottom, the screen dismisses, and the meal animates its entry on Today (SC-A1) — with no duplicate "Meal saved!" toast (AP-9).

**Given** reduce-motion is enabled
**When** the meal is saved
**Then** it appears at its final Today position without the cross-screen animation.

**Given** the save fails
**When** I see the result
**Then** a calm retry Toast appears and the meal data is retained.

### Story 3.6: Daily scan limit & trial-end handling

As a trial user,
I want clear, calm messaging when I hit a scan limit or my trial ends,
So that I understand what's happening without alarm (FR14, NFR6).

**Acceptance Criteria:**

**Given** I have used my daily scan allotment
**When** I attempt another scan
**Then** the backend returns 429 and the app shows "Daily scan limit reached. Resets at midnight." — never a raw 429.

**Given** my trial has ended
**When** I attempt a scan
**Then** the backend returns 403 and the app shows "Trial ended. Upgrade to keep scanning." while Today, Workouts, Profile, and history remain fully functional.

**Given** each successful scan
**When** it runs
**Then** `daily_scan_counts` increments for my local calendar date.

### Story 3.7: Camera live-context & recent scans

As a frequent logger,
I want context on the camera view and quick re-logging,
So that scanning is fast and informative (UX-DR28, UX-DR31).

**Acceptance Criteria:**

**Given** the camera view pre-shutter
**When** it renders
**Then** a placeholder pill shows "—— kcal · — P · — C · — F" (SC-S1) that teaches what to expect.

**Given** the Scan tab sits idle >3s
**When** no capture occurs
**Then** a translucent HUD overlays today's running macro totals on the camera view (SC-P1).

**Given** I have recent scans
**When** the camera view renders
**Then** a strip of the last 3 scanned meals (thumb + kcal) appears below the shutter; tapping one re-logs it without re-scanning (SC-C2).

---

## Epic 4: Today — Daily Pacing Instrument

The signature surface and most-frequent loop (Loop A): open Today, read "am I on track right now?" in <500ms from geometry alone. *(Covers FR16, FR17, FR18, FR19, FR30-Today; UX-DR1 [Tier 1], 8, 9, 15, 32, 33, 37.)*

### Story 4.1: Today snapshot

As a user opening the app,
I want to see my day's nutrition at a glance,
So that I know my remaining calories and where I'm short (FR16, FR17).

**Acceptance Criteria:**

**Given** I open Today
**When** `GET /today/` resolves
**Then** I see today's meals, totals, net calories (target + burned − consumed), macro rings, and a lagging-nutrient callout (e.g. "38g protein short", "12g over saturated fat").

**Given** the screen is loading
**When** data is in flight
**Then** a frame-perfect skeleton (Story 1.4) renders with zero layout jump on hydrate.

**Given** I am offline
**When** I open Today
**Then** the last-known-good snapshot renders with a subtle offline indicator and no error toast (NFR9).

### Story 4.2: View, edit & delete meals (reverse-chronological)

As a user reviewing my day,
I want my most recent meal on top and the ability to edit or delete,
So that correcting the log is fast (FR18, FR19).

**Acceptance Criteria:**

**Given** meals exist
**When** the list renders
**Then** they are sorted most-recent-first and (if ≥10) use `FlatList`/`FlashList` with `keyExtractor`.

**Given** I tap a meal
**When** the detail opens
**Then** I can view, edit, or delete it; deletion uses a destructive confirm.

**Given** I delete a meal
**When** it succeeds
**Then** the Today totals and rings update in place (inline feedback, no toast).

### Story 4.3: Backend pace position

As the Today surface (and future widgets),
I want a server-computed pace position,
So that pace state is consistent and widget-ready (UX-DR37, AR9).

**Acceptance Criteria:**

**Given** the `/today/` response
**When** the backend builds it
**Then** it includes `pace_position` (0.0–1.0, null when target=0 or outside the eating window) computed from `PACE_CURVE` against the local-timezone hour.

**Given** the schema change
**When** it lands
**Then** `schemas.py` and the `api.ts` TS type are updated together (NFR4).

**Given** the backend test suite
**When** it runs
**Then** `test_today.py` covers `pace_position` at pre-window (5am→null/0), mid-window (1pm→~0.50), and post-window (11pm→~1.0), and the existing tests still pass.

### Story 4.4: Pace computation & color tokens (client)

As the Today ring,
I want a pure pace function and the pace color tokens,
So that the ring can compute/render pace offline and on-brand (UX-DR1 part).

**Acceptance Criteria:**

**Given** `mobile/lib/pace.ts`
**When** built
**Then** `computePaceTick(now, target, burned)` returns `{ fraction, state: 'behind'|'on'|'ahead' }` using a `PACE_CURVE` const table with linear interpolation (pure function, no flags).

**Given** `mobile/theme/colors.ts`
**When** the tokens are added
**Then** `paceWarmGap: rgba(251,191,36,0.25)` and `paceCoolGap: rgba(201,204,214,0.25)` exist and are referenced by token only.

**Given** unit tests
**When** run
**Then** `pace.ts` is tested at representative hours and at the 5% on-pace threshold boundary.

### Story 4.5: Pace Ring rendering & animation (T-S1)

As a user glancing at Today,
I want the ring to show my pace geometrically,
So that I read ahead/behind/on-pace in under 500ms with no words (UX-DR1, Tier 1).

**Acceptance Criteria:**

**Given** `IntakeRing` receives `paceMark` (0.0–1.0) and pace state
**When** it renders
**Then** it draws three layers in z-order — track (`border`), gap arc (`paceWarmGap`/`paceCoolGap` at 25% α, only when |fill−pace|>5%), fill (`star` default / `starDim` ahead / `error` over).

**Given** the four states
**When** evaluated
**Then** on-pace shows no arc + `star` fill; behind shows a warm arc from fill→pace; ahead desaturates fill to `starDim` with a cool arc from pace→fill; over shows `error` fill + no arc.

**Given** screen mount or pull-to-refresh
**When** it settles
**Then** the fill strokes 0→f over ~400ms and the gap arc fades in from t=200ms, all on the UI thread (Reanimated); the hero number does not count up.

**Given** a meal is logged or a workout finishes
**When** `today` updates
**Then** the fill tweens prev→new (~300ms) and the arc length/color crossfades cleanly with no popping across the threshold.

**Given** a screen reader
**When** focused on the ring
**Then** it announces the full state in one sentence (e.g. "1,240 calories remaining of 2,400. Behind pace by 280 calories.").

### Story 4.6: Wire pace into Today & strip pace copy

As a user,
I want the Today header and labels to stay navigational while the ring carries pace,
So that the screen is calm and unambiguous (UX-DR1 part).

**Acceptance Criteria:**

**Given** `TodayHeader`
**When** it renders
**Then** it shows only a time-of-day greeting (or "Find your North." when profile is null) — never any pace-state words.

**Given** `TodayDashboard`
**When** it builds ring props
**Then** it passes `effective_target = target + burned` and the pace state, keeping the equation row all three cells ("in · burned · left", burned in `spark`).

**Given** `|remaining| ≤ 5`
**When** the hero label renders
**Then** it reads "at target" (not "0 calories left"); when `remaining < 0` the hero + ring go `error` with "calories over".

**Given** the mid-window empty state (2pm, no meals)
**When** Today renders
**Then** a 0% ring shows a warm gap arc curving toward ~50% pace, with no nag copy.

### Story 4.7: Today premium pass

As a user,
I want Today to read like a finished instrument,
So that hierarchy is obvious and nothing is noisy (UX-DR8, 9, 15, 32, 33).

**Acceptance Criteria:**

**Given** the Today layout
**When** reworked
**Then** the hero kcal renders at 96pt tabular below the ring (T-M1), section-header taglines are removed (T-E1), and the sparkline is a ~24pt inline whisper with a faint target line and a distinct today-bar fill (T-M2).

**Given** meal rows
**When** rendered
**Then** each is a compact single line — name · kcal · 8pt P/C/F tri-bar — expandable on tap (T-C2).

**Given** I return to Today after logging via Scan
**When** the new meal lands
**Then** it springs into the list with a Linear-style issue-move animation (T-A1, ~320ms, Headspace easing), respecting reduce-motion.

### Story 4.8: Dismissible trial-ending notice

As a trial user near day 7,
I want a respectful heads-up,
So that I'm informed without being hijacked (FR30-Today).

**Acceptance Criteria:**

**Given** the trial is ending soon
**When** Today renders
**Then** a dismissible inline notice appears at the top ("Trial ends today. Upgrade to keep scanning.") — never a full-screen takeover.

**Given** I dismiss it
**When** I continue
**Then** Today functions normally and the notice does not re-nag within the session.

**Given** I tap the notice
**When** it routes
**Then** it opens the Profile trial status section.

---

## Epic 5: Workouts — Build, Run & Resume

The gym loop (Loop C): create exercises, build routines, run a session with timers, resume after tabbing away, finish with calories burned that flow to Today. *(Covers FR21–FR26; UX-DR2 [Tier 1], 8, 10, 16, 17, 18, 19, 20, 40.)*

### Story 5.1: Manage exercises

As a user,
I want to create and manage my own exercises,
So that my routines use movements I actually do (FR21).

**Acceptance Criteria:**

**Given** the exercises surface
**When** I create an exercise
**Then** `POST /exercises/` saves name, type (strength/cardio/mobility), MET value (default by type: 5.0/8.0/2.5), and defaults (sets×reps or duration).

**Given** my exercises
**When** I list them
**Then** `GET /exercises/` returns only my own (RLS-scoped).

**Given** the inputs
**When** I enter them
**Then** they go through the `Input`/`PillRow` primitives, not raw native controls.

### Story 5.2: Build & reorder routines

As a user,
I want to build a routine as an ordered list of exercises,
So that I can run a structured workout (FR22).

**Acceptance Criteria:**

**Given** the routine builder
**When** I create a routine
**Then** `POST /routines/` saves the name and ordered exercises with per-exercise sets/reps/duration; routine name auto-defaults (e.g. first-exercise + "Day") if I skip it.

**Given** an existing routine
**When** I reorder exercises
**Then** the `position` values update and persist; `GET /routines/{id}` returns them in order.

**Given** the builder rows
**When** rendered
**Then** they use `ExerciseRow` with a drag handle (60-FPS via gesture-handler).

### Story 5.3: Start & run a session (sets, reps, rest timer)

As a user at the gym,
I want to run a routine with set tracking and a rest timer,
So that I can log my workout without thinking (FR23, FR24).

**Acceptance Criteria:**

**Given** a routine
**When** I start it
**Then** `POST /sessions/start` creates a session and returns its id.

**Given** an active set
**When** I log it
**Then** `POST /sessions/{id}/sets` appends reps/weight/duration and the set row strikes (completion micro-tap, 200ms).

**Given** a logged set
**When** rest begins
**Then** a rest timer counts down from 90s (editable); its progress ring is a Reanimated worklet (1Hz label tick allowed per CLAUDE §3).

**Given** a set-log network failure
**When** it fails
**Then** the set is queued locally with a pending indicator and retries on the next successful request (NFR9).

### Story 5.4: Finish session & reflect burn on Today

As a user finishing a workout,
I want a clean summary and my burn reflected,
So that my day's math is correct (FR25).

**Acceptance Criteria:**

**Given** an active session
**When** I finish
**Then** `POST /sessions/{id}/finish` sets `ended_at`, computes calories burned via `MET × weight_kg × duration_min/60`, and persists `duration_sec` + `calories_burned`.

**Given** the summary
**When** it renders
**Then** it shows duration + calories burned as math (no celebration, no confetti — §2).

**Given** the session finished
**When** I open Today
**Then** the burn is reflected in net calories within seconds, and the pace ring recomputes (effective target grows).

**Given** the `met.py` service
**When** tests run
**Then** it has a happy-path + edge-case test.

### Story 5.5: Active-session endpoint

As the app on cold start,
I want to query whether a session is active,
So that I can restore the live workout (UX-DR40, AR12).

**Acceptance Criteria:**

**Given** a user with an unfinished session
**When** `GET /sessions/active` is called
**Then** it returns that session (RLS-scoped); when none is active it returns null.

**Given** the endpoint
**When** added
**Then** its schema and the `api.ts` type are added together (NFR4) and it requires `Authorization: Bearer <jwt>`.

### Story 5.6: Active Session Takeover & tab badge (W-C2)

As a user mid-workout who tabbed away,
I want the Workouts tab to resume my session exactly where I left off,
So that I never lose state (FR26, UX-DR2, Tier 1).

**Acceptance Criteria:**

**Given** an active session
**When** I open the Workouts tab
**Then** its content is the live session view (current exercise, weight, rest timer), not the routine list.

**Given** a session is active
**When** I am on any tab
**Then** the Workouts tab icon shows a rest-timer badge (dot/countdown, 1Hz) sourced from Zustand active-session state.

**Given** I finish the session
**When** `finishSession` resolves
**Then** the active state clears, the badge disappears, and the Workouts tab reverts to the routine list.

**Given** the app was killed mid-session
**When** it cold-starts
**Then** `GET /sessions/active` is checked and the Workouts tab restores the live session if one exists.

### Story 5.7: Active-session premium rework (W-M1, W-A1)

As a user lifting,
I want a readable-from-the-bench instrument,
So that I can read my set without leaning in (UX-DR18, UX-DR19).

**Acceptance Criteria:**

**Given** the active set
**When** the session screen renders
**Then** the weight shows at 96pt tabular (readable from ~6 ft) with reps below (`WeightHero`), `allowFontScaling={false}`.

**Given** the session layout
**When** reworked
**Then** it reads as a Strong-style spreadsheet (exercises as rows, sets as columns) with the active cell marked by a 2pt left border.

**Given** the rest timer
**When** running
**Then** it sits in fixed peripheral position; the screen's only job is "log the next set."

### Story 5.8: Workouts list premium pass (W-S1, W-S2, W-C1)

As a user choosing a workout,
I want a compact week-at-a-glance list,
So that picking and starting is one gesture (UX-DR16, UX-DR17, UX-DR20).

**Acceptance Criteria:**

**Given** the Workouts list
**When** it renders
**Then** a horizontal day-of-week `DayChip` strip sits on top (today highlighted, tappable scroll), replacing day-section headers (W-S1).

**Given** a routine
**When** rendered
**Then** it is a single-line row (name · duration · exercise count); swipe-left starts it, swipe-right deletes (with confirm) (W-S2).

**Given** I start via the row gesture
**When** it expands
**Then** an inline 1–10 RPE strip appears in-row (LAW-3 spring) — no modal (W-C1).

### Story 5.9: Workouts copy polish (W-M2, W-E1)

As a user on a rest day,
I want the screen calm and unannounced,
So that rest is felt, not narrated (UX-DR10, UX-DR8).

**Acceptance Criteria:**

**Given** a day with no scheduled routine
**When** Workouts renders
**Then** "Rest day" is an 11pt `textMuted` right-aligned line (W-M2), not a banner.

**Given** the Workouts page
**When** it renders
**Then** the page subtitle/tagline is removed (W-E1).

---

## Epic 6: Nutrition History & Trends

Review day-by-day nutrition history and 7-day trends in the calm, receipt-dense aesthetic. *(Covers FR20; UX-DR21, 22, 23, 24, 39, plus N-A2/N-E1/N-E2.)*

### Story 6.1: Nutrition history & 7-day trend

As a user,
I want to see my nutrition history and recent trend,
So that I understand my week without analysis (FR20).

**Acceptance Criteria:**

**Given** logged days exist
**When** I open Nutrition
**Then** I see per-day totals and a 7-day trend, all RLS-scoped to me.

**Given** no history
**When** Nutrition renders
**Then** the hero shows tabular "0" with a calm caption ("of 2,400 — eat something."), no illustration, no apology copy (N-E2, AP-6).

**Given** day rows ≥10
**When** rendered
**Then** they virtualize (FlatList/FlashList).

### Story 6.2: vs-average derived field

As the Nutrition hero,
I want a "vs 7-day average" value,
So that today gets relative context without a chart (UX-DR39).

**Acceptance Criteria:**

**Given** the nutrition API
**When** it returns the snapshot
**Then** it includes a derived `vs_avg_kcal` (today minus 7-day average).

**Given** the schema change
**When** it lands
**Then** `schemas.py` and the `api.ts` type are updated together (NFR4).

### Story 6.3: Nutrition surface rework (heatmap + scroll-spy)

As a user,
I want the trends as one strip and history as one scroll,
So that I drop the date picker and view toggles (UX-DR21).

**Acceptance Criteria:**

**Given** weekly trends
**When** rendered
**Then** they appear as a single ~80pt heatmap strip (7 vertical bars, height = kcal vs target, color = macro adherence) (N-S1).

**Given** history
**When** rendered
**Then** it is a month-as-long-scroll of 64pt day rows (date · hero kcal · macro tri-bar) with a sticky header chip showing the visible date (N-S2), eliminating the Today/Week/Month toggle (N-E1).

### Story 6.4: Hero composite, magnified macros & vs-avg pill

As a user,
I want a strong hero with relative context,
So that the surface answers "how's today vs usual" instantly (UX-DR22, 23, 24).

**Acceptance Criteria:**

**Given** the Nutrition hero
**When** rendered
**Then** today's kcal (72pt) sits on the 7-day sparkline in its negative space (N-C1), with macros as 32pt tabular columns (N-M1).

**Given** `vs_avg_kcal` is available
**When** the hero renders
**Then** a small pill shows "+212 vs 7-day avg" (N-A1).

### Story 6.5: Day-detail receipt density

As a user drilling into a day,
I want a clean receipt-style breakdown,
So that the detail reads premium and scannable (N-A2).

**Acceptance Criteria:**

**Given** a day-detail page
**When** rendered
**Then** card backgrounds are dropped; the date is a large header, meals are table rows, and totals are bottom-anchored (Stripe-receipt density).

**Given** the page
**When** rendered
**Then** it has no redundant title bar; swipe-down dismisses.

---

## Epic 7: Experimental Hero Moments (validate-later)

Bold, higher-risk interactions deliberately deferred until prototype-validated or explicitly checked against §2. **Not scheduled into a sprint.** Each story carries a validation gate that must pass before it may be picked up. *(Covers UX-DR41.)*

### Story 7.1: Morphing / countdown hero experiments

As a power-curious user,
I want the hero number to offer alternate readings,
So that a single number can express concept or time-to-zero (WI-2, WI-3).

**Acceptance Criteria:**

**Given** this story
**When** considered for a sprint
**Then** it is gated behind a prototype + Brady sign-off; it is not implemented as part of committed v1 + rework scope.

**Given** approval to prototype
**When** built
**Then** tap-to-morph (WI-2) and time-to-zero countdown (WI-3) use only the three approved animations and remain calm (no alarm aesthetic).

### Story 7.2: Hands-free focus gestures

As a user mid-lift,
I want hands-free interaction,
So that I keep my hands on the bar (WI-6, WI-12).

**Acceptance Criteria:**

**Given** this story
**When** considered
**Then** it is gated behind a prototype + Brady sign-off and a §2 check.

**Given** approval
**When** built
**Then** pull-down "1-rep view" (WI-6) and volume-button set-advance (WI-12) are validated on Brady's S24 Ultra for reliability before adoption.

### Story 7.3: Derived-equivalence & projection displays

As a user,
I want the app to express derived equivalents,
So that numbers gain intuitive meaning (WI-7, T-P1).

**Acceptance Criteria:**

**Given** this story
**When** considered
**Then** it is gated behind a §2 verification that the output is pure arithmetic, not coaching commentary.

**Given** approval
**When** built
**Then** meal-as-workout-equivalent (WI-7) and ring-as-tomorrow's-plan (T-P1) render as math only, with no advice copy.

### Story 7.4: Adherence & recovery heroes (§2 check required)

As a user,
I want adherence/recovery context,
So that rest and consistency are visible (N-R1, W-R1).

**Acceptance Criteria:**

**Given** this story
**When** considered
**Then** it is gated behind explicit §2 verification that these are calculations, not streaks or commentary.

**Given** approval and the `recovery_hours_since_last_session` backend field
**When** built
**Then** "days under target this week" (N-R1) and recovery-hours hero (W-R1) render as counts/calculations only — never "X days in a row" streak framing.

### Story 7.5: Result-first scan workflow

As a user,
I want scanning to open result-first,
So that the camera is a tool, not a destination (SC-R1).

**Acceptance Criteria:**

**Given** this story
**When** considered
**Then** it is gated behind a tap-to-meal latency measurement (it adds a step) and Brady sign-off.

**Given** approval
**When** built
**Then** tapping Scan opens an empty scan-result with "—" macros and a "Tap to scan" hero CTA, only if latency stays acceptable.
