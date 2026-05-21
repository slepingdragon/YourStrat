# CONTEXT.md

Session-spanning context for YourStrat. Loaded at the start of each new conversation by [CLAUDE.md](CLAUDE.md). Updated **only** when the user explicitly asks.

Last updated: 2026-05-20 (evening — Phase 1b planning complete, bmad-prd paused awaiting decision).

---

## Project at a glance

**YourStrat** — focused fitness coach: photo-scan a meal, build/run workout routines, see net calories at a glance. The build contract is [YOURSTRAT_BUILD.md](YOURSTRAT_BUILD.md) (§2 Scope Guard is non-negotiable until the user revises it).

**Stack:**
- Mobile: Expo SDK 54, expo-router, NativeWind, Zustand, react-native-svg, react-native-reanimated
- Backend: FastAPI (Python 3.12), Supabase (Postgres + Auth + Storage), Railway-hosted
- AI: Gemini 2.5 Flash for food-photo scan (one call, JSON-only)

**Repo layout:**
- `mobile/` — Expo app
- `backend/` — FastAPI app + tests
- `supabase/migrations/` — SQL migrations (4 so far: init, storage, routine_schedule, trial)

---

## Active work — Today screen redesign

**Plan file:** `C:\Users\Brady J Bania\.claude\plans\1-open-for-revision-jiggly-river.md`

**Goal:** make the Today screen "feel alive" without adding feature bloat — time-aware, state-aware, surfaces workouts as a peer of meals, 7-day sparkline, plus iOS+Android home-screen widgets.

**Phase 1 (in-app redesign) — COMPLETE.** Shipped and typechecks clean. Awaiting the user's device verification before proceeding to widget native work.

Backend changes:
- `/today/` response extended with `active_session`, `last_completed_session_today`, `scheduled_routine_today` ([backend/app/services/today.py](backend/app/services/today.py))
- New schemas: `ActiveSessionInfo`, `CompletedSessionInfo`, `ScheduledRoutineInfo` ([backend/app/models/schemas.py](backend/app/models/schemas.py))
- Tests: [backend/tests/test_today.py](backend/tests/test_today.py) — 6 new tests, all 27 backend tests pass

Frontend changes:
- Type + store extensions: [mobile/lib/api.ts](mobile/lib/api.ts), [mobile/lib/store.ts](mobile/lib/store.ts)
- New pure logic: [mobile/lib/nextAction.ts](mobile/lib/nextAction.ts) (`pickNextAction` state machine), `pickWatchlistMetric` added to [mobile/lib/todayInsights.ts](mobile/lib/todayInsights.ts)
- New components: [TodayHeader](mobile/components/today/TodayHeader.tsx), [NextActionButton](mobile/components/today/NextActionButton.tsx), [WorkoutCard](mobile/components/today/WorkoutCard.tsx), [TodayTrioCards](mobile/components/today/TodayTrioCards.tsx), [CalorieSparkline](mobile/components/today/CalorieSparkline.tsx)
- Modified: [IntakeRing.tsx](mobile/components/IntakeRing.tsx) gained `hideCenter` / `hideLabel` props
- Rewrote: [TodayDashboard.tsx](mobile/components/TodayDashboard.tsx) (hero rebuilt with ring behind big number + equation row; removed the old 6-card grid)
- Rewired: [(tabs)/index.tsx](mobile/app/(tabs)/index.tsx) — `Promise.allSettled` fan-out of `getToday()` + `listRoutines()` + `getNutritionJournal(7)`

**Phase 1b (Pacing Instrument) — PLANNED, NOT STARTED.** Inserted between Phase 1 and Phase 2 on 2026-05-20 after the user flagged the Today tab as "not pull-worthy enough" (target: 6+ pulls/day). Three BMad artifacts drive it:

- [_bmad-output/planning-artifacts/today-tab-brainstorm-2026-05-20.md](_bmad-output/planning-artifacts/today-tab-brainstorm-2026-05-20.md) — diagnosis: screen answers "how many calories left?" but not "am I tracking right *for this hour of the day*?"
- [_bmad-output/planning-artifacts/today-tab-ux-design-2026-05-20.md](_bmad-output/planning-artifacts/today-tab-ux-design-2026-05-20.md) — fully-geometric pacing instrument: ring fill + gap arc + ring tonal shift carry the pace signal; no pace-state words on screen.
- [_bmad-output/planning-artifacts/today-tab-correct-course-2026-05-20.md](_bmad-output/planning-artifacts/today-tab-correct-course-2026-05-20.md) — folds Phase 1b into the existing plan, resolves the four open UX questions, sequences items 9a-9g (~6.75 hr, recommended 2-PR split).

Lead deliverables (per CC §3.3):
- `mobile/lib/pace.ts` — `computePaceTick(now, target, burned) → { fraction, state }` + `PACE_CURVE` const
- `mobile/theme/colors.ts` — `paceWarmGap`, `paceCoolGap` tokens
- `IntakeRing.tsx` — `paceMark` prop, gap arc render, tonal shift, reanimated mount-settle + data-change animations
- `TodayHeader.tsx` strip pace copy; `TodayDashboard.tsx` wiring; `nextAction.ts` pace-aware labels; `CalorieSparkline.tsx` target line; `(tabs)/index.tsx` skeleton
- Backend: `pace_position: float | null` on `/today/` response + 1 new test in `test_today.py`
- Meals list reverse-chronological

**Phase 2 (widgets) — NOT STARTED, RE-SPEC'D.** Pending Phase 1 device verification AND Phase 1b. The widget's lead visual is now the pace tick (gap arc), not "calories left." Snapshot shape gains `pace_position` (server already returns it). Plan:
- iOS: `expo-widgets` + App Group entitlement in `app.json`
- Android: `react-native-android-widget` + config plugin
- New file `mobile/lib/widgetSync.ts` writes a shared `widget_snapshot.json` on every `setToday` / `saveMeal` / `finishSession`
- Three widgets: Small (number + pace arc), Medium (left half: ring+arc+number, right half unchanged), Lock-screen circular (tick position is the only visual cue)

---

## In-flight — bmad-prd skill paused

**State (2026-05-20 evening):** `bmad-prd` was activated with `create` intent for the Phase 1b pacing instrument, but no PRD workspace was bound and no draft was authored. Paused at a decision gate.

**Open decision — pick one to resume:**
1. **Skip PRD → Sprint Planning** (recommended — matches CC §8's own recommendation; the three artifacts have the depth a solo-scope PRD would aim for).
2. **Fast-path PRD** — ~2-page solo-scope PRD distilled from the three artifacts, adds Success Metrics + Counter-Metrics (the one gap the artifacts have).
3. **Coaching-path PRD** — walk PRD sections together (low value given existing artifact depth).
4. **Validate-only** — run PRD reviewer gate against the three artifacts as a combined unit.

To resume: just say "continue today-tab PRD" with a chosen option, or jump directly to `bmad-sprint-planning` if going with option 1.

---

## User preferences and style (learned across sessions)

**Voice / brand:**
- "Find your North." Calm, direct, navigational.
- No emojis in UI copy. No exclamation marks. No shaming.
- No gamification mechanics — no streaks, no badges, no celebrations, no confetti.
- No "AI commentary" on individual meals (no "Great choice!" lines).
- Numbers rounded: calories nearest 5, macros nearest gram.

**Engineering preferences:**
- Allergic to feature bloat. §2 Scope Guard is "open for revision" but the bias is against adding.
- Wants the app "full of life" — meaning: useful, dynamic, time-aware. Not: gamified, nag-y.
- Target user: someone who would otherwise use Cal AI.
- "Active" = using the app multiple times a day, not just logging meals.
- Auto-deep-link from Today into scheduled workouts is approved (one-tap to start).
- State-aware Next Action button is approved (label shifts through the day).
- 7-day calorie sparkline is approved.
- Home-screen widgets are approved.

**Decisions made:**
- Phase 1 (in-app) and Phase 2 (widgets) bundled as one release in the plan, but Phase 1 was shipped first for the user to verify on device before widget native plumbing begins.
- Three NextActionButton edges that brush §2 (time-of-day eyebrow, `Start [Routine]` deep link, "Log a protein-heavy meal" state copy) — all confirmed by the user.
- **Phase 1b pacing instrument — four CC-resolved decisions (2026-05-20):**
  - `pace_position` computed on **both** server and client. Server adds `pace_position: float | null` to `/today/` for widget parity (Phase 2 widgets can't run RN code). Client computes locally for snappy reactivity. Server wins when present; client computes only when offline.
  - **No "Move" CTA** in ahead-of-pace + no-workout state. NextActionButton falls back to existing default. Ring + gap arc carry the "ease off" signal geometrically.
  - **No workout-card quiet state** ("Next: push day Wednesday"). Empty slot stays empty.
  - **"at target"** label when `|remaining| ≤ 5` cal. Avoids the alarming "0 calories left" reading on a perfect day.

---

## What's NOT in the project (deliberately, per §2 + user preference)

- Streaks, day counters, "X days in a row"
- Badges, milestones, achievements, tiers
- Push notifications, in-app nudges
- Celebration animations, confetti
- Per-meal AI commentary
- Social, sharing, leaderboards
- Tips / Learn / discovery feed
- Multi-week stats, monthly view, calendar heatmap (sparkline caps at 7 days)
- Weight or body-metric trends on Today
- Animated pulsing/breathing on the in-progress workout dot (static dot only)
- "Log from widget" (widgets are read-only)
- Per-macro pace ticks (protein-pace, carb-pace) — calorie-pace only for v1
- User-configurable eating-window curve — ship one sane default
- Pace-state copy on screen (no eyebrow sentence, no status word, no hero number tint for pace)
- Idle drift animation on the pace tick (tick is static after mount-settle)
- "Move" CTA when ahead of pace — geometry carries the signal
- Multi-day pace history ("on pace 3 days in a row" — that's a streak by another name)

---

## How to update this file

The user says one of: "update context," "save to context," "add to context," "refresh context," "remember in context."

Then: replace stale sections with current state. Skip ephemera. Keep this file scannable.
