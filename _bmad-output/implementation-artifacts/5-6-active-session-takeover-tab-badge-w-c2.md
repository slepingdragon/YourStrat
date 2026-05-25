# Story 5.6: Active Session Takeover & tab badge (W-C2)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user mid-workout who tabbed away,
I want the Workouts tab to resume my session exactly where I left off, with a live badge on the tab icon while I'm elsewhere,
so that I never lose the session and can always get back to it in one tap (FR26, UX-DR2, **Tier 1**).

Second story of the **W-C2 Active Session Takeover** track. Consumes Story 5.5's `GET /sessions/active`. This is a **navigation/architecture change to the core workout flow** — read the "Architecture decision" section before coding.

## Architecture decision (the crux — read first)

**Today:** the live session is a full-screen route `app/session/[id]/index.tsx` **pushed over the tabs** in the root Stack (`_layout.tsx:143`, `gestureEnabled:false`). Four call sites push it: `app/(tabs)/workouts.tsx`, `components/today/NextActionButton.tsx`, `components/today/WorkoutCard.tsx`, `app/routine/[id].tsx`.

**Problem:** AC2 requires the Workouts **tab icon** to show a rest badge **while on any tab**. When `/session/[id]` is pushed over the tab navigator, the tab bar is hidden — so the badge is impossible in the current model. UX-DR2 ("Workouts tab content **branches** to the live session view") is therefore structural, not cosmetic: the live session must render **inside** the Workouts tab so the tab bar (and badge) stay visible and the user can tab away and back.

**Chosen design (tab-embedded session, single source of truth in Zustand):**

1. **Zustand `activeSession` slice** (`lib/store.ts`) — the app-wide pointer + rest mirror for the badge:
   ```ts
   type ActiveSessionState = { id: string; routineId: string | null } | null;
   // + rest mirror for the cross-tab badge (1Hz):
   restEndsAt: number | null;   // epoch ms; null when not resting
   setActiveSession / clearActiveSession / setRestEndsAt
   ```
   The session's *detailed* progress (exerciseIndex/setIndex/inputs) stays **local** to the runner (ephemeral); only the pointer + rest-deadline are app-wide.
2. **Extract the live-session UI** from `app/session/[id]/index.tsx` into `components/session/ActiveSessionRunner.tsx` (props: `sessionId: string; routineId: string | null; onFinished: (burned:number,duration:number)=>void`). Pure presentation+local-state move — **no behavior change** to set-logging, rest timer, pause, finish. It writes `restEndsAt` to Zustand when a rest starts/ends (for the badge) and clears it on unmount.
3. **Workouts tab branches** (`app/(tabs)/workouts.tsx`): `const active = useStore(s => s.activeSession)` → if `active`, render `<ActiveSessionRunner .../>`; else the existing routine list. On finish, `onFinished` clears `activeSession` and `router.push("/session/[id]/summary", { id, burned, duration })`, leaving the tab on the list.
4. **Entry points set state + switch tab** (the 4 push sites): replace `router.push({ pathname:"/session/[id]", params:{id,routineId} })` with `setActiveSession({ id, routineId })` + `router.push("/(tabs)/workouts")` (Today's WorkoutCard/NextActionButton) or just `setActiveSession` (already on the Workouts tab). `startSession` call is unchanged.
5. **Retire the full-screen route:** `app/session/[id]/index.tsx` becomes a thin **redirect shim** — on mount it reads `id`/`routineId`, calls `setActiveSession`, and `router.replace("/(tabs)/workouts")`. This keeps any lingering deep link / typed-route reference valid with zero risk, without deleting the Stack screen or chasing every caller. (Removing the screen entirely is a follow-up cleanup once device-verified.)
6. **`TabBadge`** (`components/TabBadge.tsx`) overlaid on the Workouts `tabBarIcon` in `app/(tabs)/_layout.tsx`: reads `activeSession`/`restEndsAt`; renders nothing when no active session; a small `colors.star` dot when active-but-not-resting; a 1Hz countdown pill (`mm:ss` or seconds) when `restEndsAt` is in the future. The 1Hz tick uses a `setInterval` reading the `restEndsAt` timestamp — **explicitly allowed** by CLAUDE §3 ("the RestTimer 1Hz tick is fine"); it drives only the tiny badge label, not layout.
7. **Cold-start restore** (`app/(tabs)/_layout.tsx`, gated on session+profile): once, on mount, if `activeSession == null`, call `getActiveSession()`; if it returns a session, `setActiveSession({ id, routineId })`. The runner re-fetches the routine and starts at exercise 1 (see v1 limitation). Guarded so it runs once and never clobbers an in-memory active session.

This is the spec-faithful design (UX-DR2/UX-DR40); the full-screen-route model cannot satisfy AC2.

## Acceptance Criteria

1. **Tab takeover.** With an active session, opening the Workouts tab shows the live session view (current exercise, reps/weight entry, rest timer) — **not** the routine list. With no active session, the routine list renders unchanged.
2. **Cross-tab badge.** While a session is active and I'm on any tab, the Workouts tab icon shows a rest badge: a calm dot when not resting, a **1Hz** countdown when a rest timer is running, sourced from Zustand (`activeSession`/`restEndsAt`). No badge when no session.
3. **Finish clears everything.** When `finishSession` resolves, `activeSession` + `restEndsAt` clear, the badge disappears, the Workouts tab reverts to the routine list, and the summary is shown (`/session/[id]/summary`). No orphaned badge, no stuck takeover.
4. **Cold-start restore.** After the app is killed mid-session and relaunched (authed), the tabs layout checks `GET /sessions/active`; if a session exists, `activeSession` is set so the Workouts tab restores the live view. If none, nothing happens.
5. **No regression to the four entry points.** Starting from Workouts (RPE sheet), Today's `WorkoutCard` (scheduled start + in-progress resume), Today's `NextActionButton`, and `routine/[id]` all land in the live session (now via the tab), and the RPE/start flows are unchanged. `startSession`/`appendSet`/`finishSession` API calls are unchanged.
6. **Premium + 60fps.** Tab branch swaps without a flash; badge tick never causes layout jank (fixed-width pill, `tabular-nums`); the rest-timer ring stays the existing Reanimated worklet; no `setInterval` drives anything but the 1Hz badge label. Theme tokens only; no raw hex.
7. **Verification.** `npx tsc --noEmit` clean. **On-device/preview (Brady):** takeover swap, badge dot↔countdown↔gone across all tabs, finish→revert, cold-start restore, and the four entry points. (No headless runtime here — runtime behavior is a Brady checklist, mirroring 4.5/4.6.)

## Tasks / Subtasks

- [x] **Task 1 — Zustand active-session slice** (AC: #1, #2, #3)
  - [x] Added `activeSession` (`{id,routineId}|null`), `restEndsAt` (epoch ms|null), `setActiveSession`, `clearActiveSession` (nulls both), `setRestEndsAt` to `lib/store.ts`. Narrow selectors at every call site.
- [x] **Task 2 — Extract `ActiveSessionRunner`** (AC: #1, #5, #6)
  - [x] Moved the body of the old `app/session/[id]/index.tsx` into `components/session/ActiveSessionRunner.tsx`, props `{ sessionId, routineId, onFinished }`. Set-logging, RestTimer (Reanimated), pause overlay, finish-confirm preserved. Dropped `BackHeader` (no back-target in a tab) — the "EXERCISE n OF m" + Pause row is the calm in-tab header.
  - [x] `beginRest()` → `setRestEndsAt(Date.now()+restSec*1000)` + `setResting(true)`; `endRest()` → `setRestEndsAt(null)` + `setResting(false)`. **No unmount cleanup of `restEndsAt`** (see Dev Agent Record fix #1).
- [x] **Task 3 — Workouts tab branch + finish** (AC: #1, #3)
  - [x] `workouts.tsx` branches on `activeSession` → `<ActiveSessionRunner key={id} …/>`. `onFinished` → `clearActiveSession()` + push `/session/[id]/summary`.
- [x] **Task 4 — Entry points + route shim** (AC: #5)
  - [x] Rewired all 4 push sites (`workouts.tsx`, `NextActionButton.tsx` ×2 paths, `WorkoutCard.tsx` ×2, `routine/[id].tsx`) to `setActiveSession` + (if off-tab) `router.push("/workouts")` / `router.replace("/workouts")`.
  - [x] `app/session/[id]/index.tsx` is now a redirect shim (sets the pointer + `router.replace("/workouts")`).
- [x] **Task 5 — TabBadge** (AC: #2, #6)
  - [x] `components/TabBadge.tsx` (null / `star` dot / 1Hz `m:ss` pill via one `setInterval`), overlaid on the Workouts `tabBarIcon` in `(tabs)/_layout.tsx`. `formatRestBadge` smoke-tested (throwaway `tsx`, 9 cases, deleted).
- [x] **Task 6 — Cold-start restore** (AC: #4)
  - [x] `(tabs)/_layout.tsx` effect: once authed with no in-memory active session, `getActiveSession()` → `setActiveSession`. `restored` ref guards against re-fetch loops.
- [x] **Task 7 — Verify** (AC: #7)
  - [x] `tsc --noEmit` clean (incl. `/workouts` Href). Runtime checklist for Brady in the Dev Agent Record.

## Dev Notes

### v1 limitations (document, don't fix here)
- **Mid-session progress is not restored on cold-start.** Logged sets persist server-side (burn is computed from them on finish), but the runner's local exerciseIndex/setIndex restart at the first exercise after a cold-start restore. Restoring exact position needs server set-state — out of scope (a later story). The AC only requires the live session to **resume/restore**, which it does.
- **`/session/[id]` summary route stays** as a pushed screen (it's a distinct post-finish surface, not a tab).

### Reuse / theme
- Reuse `RestTimer`, `RpePicker`, `Screen`, `Button`, `Input`, icons (`Pause`/`Play`/`Dumbbell`). Badge colors from `colors` (`star` dot, `surface`/`textPrimary` pill); spacing from `spacing`. No new deps, no new color tokens (confirm before adding a badge tint if needed). New files: `components/session/ActiveSessionRunner.tsx`, `components/TabBadge.tsx` — **ask before adding any others.**

### Scope boundaries
- **No 5.7 rework** (WeightHero 96pt, spreadsheet table) — that's the next story; keep the current runner UI. **No backend change** (5.5 shipped the endpoint). Honors §2 Scope Guard (no streaks/notifications; the badge is session-state, not a nudge).

### Testing standards
- No JS test runner (`jest-expo` deferred). `tsc` is the automated bar; runtime is Brady's device checklist. Any pure helper (e.g. a `formatRestBadge(msRemaining)` mm:ss formatter) can get a throwaway `tsx` smoke (deleted after) and should reuse `lib/format` if a formatter already exists there.

### References
- [epics.md → Epic 5 / Story 5.6](../planning-artifacts/epics.md), UX-DR2 (W-C2 Tier 1) + UX-DR40, FR26, AR12.
- `app/session/[id]/index.tsx` (runner source), `app/(tabs)/_layout.tsx` (tab icons), `app/(tabs)/workouts.tsx` (branch host), `lib/store.ts` (slice), the 4 entry points above, `mobile/lib/api.ts` `getActiveSession` (5.5).
- CLAUDE §3 (1Hz badge tick allowed; ring stays a worklet), §5 (wired to real backend — `getActiveSession`), §8 (navigation change — flagged; spec-mandated by UX-DR2).

## Dev Agent Record
### Agent Model Used
Claude Opus 4.7 (1M context)
### Debug Log References
- `tsc --noEmit` (mobile): clean (twice — after impl, and after the 3 review fixes). `/workouts` literal Href type-checks (matches `lib/nextAction.ts`'s existing `NavigateRoute`).
- `formatRestBadge` throwaway `tsx` smoke: 9/9 (`-5→"0"`, `0→"0"`, `5→"5"`, `59→"59"`, `60→"1:00"`, `90→"1:30"`, `125→"2:05"`, `600→"10:00"`), file deleted.

### Completion Notes List
- **Tab-embedded takeover shipped per the locked architecture.** Single source of truth in Zustand (`activeSession`+`restEndsAt`); the runner holds ephemeral set/exercise progress; the badge + cold-start read the store. All 4 entry points + a redirect shim funnel into the Workouts tab.
- **Three issues found + fixed during self-review (3-layer):**
  1. **Removed the `restEndsAt` unmount-cleanup** in `ActiveSessionRunner`. If the tab navigator unmounts the Workouts screen on blur, that cleanup would have killed the countdown the moment the user tabbed away to *see* the badge (defeating AC2). Finish already nulls `restEndsAt` (in `endSession` + `clearActiveSession`), so the cleanup was redundant on the finish path and harmful on the blur path. Now the deadline survives blur and the badge keeps counting.
  2. **Added `key={activeSession.id}`** to the runner so a changed session id (cold-start race / resuming a different session) remounts fresh rather than carrying stale `exerciseIndex`/`setIndex`.
  3. **Clear `activeSession` on logout** (root `_layout.tsx`, the `!session` branch) so one user's in-flight session can't leak into the next account on a shared device — the store already clears `profile` there.
- **Wired to the real backend** (`getActiveSession`, Story 5.5) — no mocks. Theme tokens only; no new deps; two new files (`ActiveSessionRunner`, `TabBadge`) as planned.

### ⚠️ Brady on-device/preview checklist (gates flip to `done`)
1. **Tab mount-on-blur (the #1 unknown).** Start a session, begin a rest, tab to Today: the Workouts icon should show a **counting-down pill**; tab back — the runner should still be on the **same set** with the rest timer running. If progress resets to exercise 1 (and only the badge survived), the tab navigator is unmounting on blur → set `unmountOnBlur:false`/`detachInactiveScreens={false}` on the Workouts screen, or lift set/exercise progress into the store (follow-up). *(Logged sets are server-side regardless; this is about in-memory position.)*
2. **Badge states:** none (no session) → `star` dot (active, not resting) → 1Hz `m:ss` pill (resting) → gone (finish). Nudge the pill offsets (`top:-9,right:-17`) if it clips the Dumbbell glyph.
3. **Takeover swap** list↔runner with no flash; **finish** → summary, then Workouts shows the list, no badge.
4. **Cold-start restore:** kill the app mid-session, relaunch (authed) → badge appears; opening Workouts shows the runner (at exercise 1 per the v1 limit below).
5. **All 4 entry points** land in the tab takeover: Workouts RPE sheet; Today `WorkoutCard` scheduled-start + in-progress-resume; Today `NextActionButton` resume + start; `routine/[id]` start.

### Known v1 limitation (documented, out of scope)
- **Mid-session position is not restored on cold-start** — logged sets persist server-side (burn is computed from them), but the runner restarts at the first exercise. Restoring exact position needs server set-state (later story). AC4 only requires the live session to *resume*, which it does.

### File List
- `mobile/lib/store.ts` (modified) — `activeSession`/`restEndsAt` slice + setters.
- `mobile/components/session/ActiveSessionRunner.tsx` (**new**) — extracted live runner; props + `onFinished`; rest mirror.
- `mobile/components/TabBadge.tsx` (**new**) — dot / 1Hz countdown pill + `formatRestBadge`.
- `mobile/app/(tabs)/_layout.tsx` (modified) — `TabBadge` overlay + cold-start restore.
- `mobile/app/(tabs)/workouts.tsx` (modified) — active-session branch; start sets the pointer.
- `mobile/app/session/[id]/index.tsx` (modified) — full-screen route → redirect shim.
- `mobile/components/today/NextActionButton.tsx`, `mobile/components/today/WorkoutCard.tsx`, `mobile/app/routine/[id].tsx` (modified) — entry points set the pointer + switch to the Workouts tab.
- `mobile/app/_layout.tsx` (modified) — clear active session on logout.

## Code Review (2026-05-24, self / 3-layer adversarial)
Reviewer: Claude Opus 4.7 (1M). Verdict: **code-complete + reviewed → `review`** (awaiting Brady's device pass before `done`, since a plausible runtime finding — tab unmount-on-blur — could need a real change; unlike 4.5/4.6 where only visual polish remained).
- **Blind Hunter:** finish nulls `restEndsAt` on both paths; cold-start `restored` ref prevents fetch loops and won't clobber an in-memory session; redirect shim sets state then replaces; badge interval clears on `restEndsAt→null`. Fixed the 3 issues above.
- **Edge Case Hunter:** `target`/routine null → runner shows "Workout" + finish; stale/past `restEndsAt` → dot; double-start prevented by UX (active tab shows runner, not the list); cross-user leak closed (fix #3).
- **Acceptance Auditor:** AC1✓ AC3✓ AC5✓ AC6(tokens/1Hz/worklet)✓ AC7(tsc)✓ at the code level; **AC2 (countdown-while-on-another-tab) and AC4 (cold-start) depend on tab mount behavior → Brady checklist #1/#4.**

## Change Log
- **2026-05-24** — Story 5.6 drafted (create-story). Locked the tab-embedded architecture (AC2 forces it — a full-screen-over-tabs session can't show a cross-tab badge).
- **2026-05-24** — Implemented (dev-story) + 3-layer self-review with 3 fixes (unmount-cleanup removal, `key`, logout-clear). tsc clean; `formatRestBadge` smoke green. Status → review (Brady device checklist gates `done`). Brady approved "build it all now, I verify."
