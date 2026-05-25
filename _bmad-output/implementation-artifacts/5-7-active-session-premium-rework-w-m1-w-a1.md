# Story 5.7: Active-session premium rework (W-M1, W-A1)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user lifting,
I want a readable-from-the-bench instrument,
so that I can read my set without leaning in (UX-DR18 W-M1, UX-DR19 W-A1).

Third story of the **W-C2 Active Session** track. Builds on the tab-embedded runner from Story 5.6 (`components/session/ActiveSessionRunner.tsx`) — this is a **presentation rework of the runner body**, not a navigation or backend change. The takeover branch, Zustand `activeSession`/`restEndsAt` mirror, tab badge, cold-start, and the four entry points (all Story 5.6) are untouched.

## Design decisions (read first — the routine model has no target weight)

`RoutineExercise` carries target `sets`/`reps`/`rest_sec` but **no target weight** (`mobile/lib/api.ts:331`); weight only exists on the logged-set payload. So the 96pt hero shows the **weight the user is entering for the active set**, which:

- **Carries forward** the last logged weight **within the same exercise** (Strong behavior). It **resets to empty when the exercise changes** — never bleeds bench weight onto squats.
- Shows **`—`** when there is no value yet (first set, or a body-weight / cardio exercise with no weight).
- Renders in the user's **display units** (`profile.units`): `kg` (nearest 0.5) or `lb` (whole), converted to `weight_kg` only at the API boundary via `lbsToKg` (`lib/targets`).

Reps prefill from the exercise's target `reps` (carried forward within the exercise if no target). The hero is weight-centric per UX-DR18; for a no-weight exercise the hero shows `—` and the sub-line still carries reps. (A dedicated duration hero for cardio is out of scope — documented, not built.)

## Acceptance Criteria

1. **WeightHero (UX-DR18).** The active set's weight renders at **96pt, tabular-nums, `allowFontScaling={false}`**, readable from ~6 ft, with the reps below it (`WeightHero`). It mirrors the live weight entry and shows `—` when empty. Unit suffix (`kg`/`lb`) follows `profile.units`.
2. **Spreadsheet (UX-DR19).** The session reads as a Strong-style table — **exercises as rows, sets as columns** — with the **active cell marked by a 2pt left border**. Logged cells show the logged weight; pending cells are a faint marker; the active exercise's row is emphasized.
3. **Peripheral rest.** When a rest is running it sits in a **fixed peripheral strip** (not a full-screen takeover); the hero + entry + Log stay on screen so the screen's only job is "log the next set." Skipping rest and the auto-finish-on-rest behavior are preserved.
4. **No behavior/contract regression.** Set logging still calls `appendSet`; finishing still calls `finishSession` and routes to the summary via `onFinished`; the final-set auto-finish still works; pause overlay still works; `restEndsAt` is still mirrored to Zustand for the tab badge (and is **not** cleared on unmount — the 5.6 blur fix). No new backend route, no schema change.
5. **Premium + 60fps + theme.** All color from `colors`, all spacing/radius from tokens, no raw hex, no magic numbers. The big number never causes layout jank (`tabular-nums`, fixed unit slot). The spreadsheet is a bounded grid (a routine's exercises), rendered with `.map` — not a feed (CLAUDE §3 FlatList rule targets long scroll lists).
6. **Verification.** `npx tsc --noEmit` clean. **On-device/preview (Brady):** hero readability + live mirror + carry-forward/exercise-reset, spreadsheet fill + active-cell border, peripheral rest (log during rest restarts the countdown), finish + auto-finish, pause. (No headless runtime here — runtime is a Brady checklist, mirroring 4.5/4.6/5.6.)

## Tasks / Subtasks

- [x] **Task 1 — `WeightHero` component** (AC: #1, #5)
  - [x] New `components/session/WeightHero.tsx` (spec-named UX-DR18): 96pt tabular weight + unit + reps sub-line, `allowFontScaling={false}`, theme tokens only. Pure presentational (props: big text, unit, sub-line, a11y label).
- [x] **Task 2 — `SetSpreadsheet` component** (AC: #2, #5)
  - [x] New `components/session/SetSpreadsheet.tsx` (spec-named UX-DR19): exercise-name column + per-set cells; logged → weight value, active → 2pt `spark` left border + elevated cell, pending → faint dot. `.map` over the routine's (bounded) exercises.
- [x] **Task 3 — Peripheral `RestTimer` variant** (AC: #3, #4)
  - [x] Add `compact?: boolean` to `components/RestTimer.tsx`: slim strip (label + m:ss countdown + thin progress line + Skip) reusing the existing 1Hz tick + `onDone`/`onSkip`. Default `false` keeps the full layout intact. (RestTimer is only used by the runner — verified.)
- [x] **Task 4 — Recompose `ActiveSessionRunner`** (AC: #1–#5)
  - [x] Header (exercise name + progress dots + Pause) → peripheral rest strip (when resting) → `WeightHero` → compact weight/reps editors → `SetSpreadsheet` → Log / Finish. `<Screen scroll>` so many exercises don't clip; Log sits with the hero (top), Finish below the table.
  - [x] Per-set log state for the spreadsheet; carry-forward weight within the exercise (reset on exercise change); units conversion at the `appendSet` boundary; logging during rest restarts the countdown (keyed RestTimer).
- [x] **Task 5 — Verify** (AC: #6)
  - [x] `tsc --noEmit` clean. Runtime checklist for Brady below.

## Dev Notes

### Reuse / theme / scope
- Reuse `Screen`, `Button`, `Input`, `RestTimer` (compact variant), icons. New components are **spec-named** (UX-DR18 `WeightHero`, UX-DR19 spreadsheet) — same precedent as 5.6's two new files. **No new color token** (active-cell border = existing `colors.spark`; cells use `surface`/`surfaceElevated`/`border`/`textSecondary`/`textMuted`). **No new dep, no backend change, no schema change.**
- Honors §2 Scope Guard: no streaks/notifications/insights; this is the existing log-a-set flow, re-skinned for readability.

### v1 limitations (document, don't fix here)
- **Weight carry-forward is within-session + within-exercise only** (no per-exercise history) — there is no stored target/last weight in the model. First set of each exercise starts empty.
- **No per-set tap-to-edit** in the spreadsheet (it is a read-only progress/log view). Editing is via the active-set hero + editors. Strong-style cell editing of prior sets is out of scope.
- **Weight-centric hero**: cardio/duration exercises show `—` for weight; a dedicated duration hero is a later refinement.

### Testing standards
- No JS test runner (`jest-expo` deferred). `tsc` is the automated bar; runtime is Brady's device checklist. Any pure helper gets a throwaway `tsx` smoke (deleted after) and reuses `lib/format`/`lib/targets` if a formatter/converter already exists.

### References
- [epics.md → Epic 5 / Story 5.7](../planning-artifacts/epics.md) (lines 1108–1126), UX-DR18 (W-M1), UX-DR19 (W-A1).
- `components/session/ActiveSessionRunner.tsx` (rework target, from 5.6), `components/RestTimer.tsx`, `mobile/lib/api.ts` (`RoutineExercise`/`appendSet`/`finishSession`), `lib/format.ts` (`formatWeight`), `lib/targets.ts` (`lbsToKg`/`kgToLbs`), `lib/store.ts` (`profile.units`, `setRestEndsAt`).
- CLAUDE §2 (premium checklist), §3 (60fps; bounded grid not a feed), §4 (one theme), §5 (wired to real backend — `appendSet`/`finishSession` unchanged).

## Dev Agent Record
### Agent Model Used
Claude Opus 4.7 (1M context)

### Debug Log References
- `tsc --noEmit` (mobile): clean — after impl, after the 2 review fixes, and after the pause→Modal conversion.

### Completion Notes List
- **Reworked the runner body into a readable instrument** (UX-DR18/UX-DR19). The 5.6 takeover/badge/cold-start mechanics are untouched (`activeSession`/`restEndsAt` slice, host branch, entry points). `WeightHero` = 96pt tabular weight (`allowFontScaling={false}`) + unit + reps sub-line, mirroring the live weight entry, `—` when empty. `SetSpreadsheet` = exercises × sets grid with a 2pt `spark` left border on the active cell, logged cells showing the lifted weight (or a `Check` icon for a logged no-weight set), pending cells a faint dot, active row elevated.
- **Units honored end-to-end.** Display + entry in `profile.units` (kg nearest-0.5 / lb whole); converted to `weight_kg` only at the `appendSet` boundary via `lbsToKg`. Carry-forward uses kg as the canonical store, re-displayed via `kgToLbs`.
- **Carry-forward is within-exercise.** The last logged weight pre-fills the next set; it resets to empty when the exercise changes (no bench→squat bleed). Reps pre-fill from the exercise's target.
- **Peripheral rest.** Added a `compact` variant to `RestTimer` (slim pill: label + m:ss + thin bar + Skip) reusing the same 1Hz tick; the hero/editors/Log stay on screen. Keyed by a `restNonce` so logging *during* a rest restarts the countdown cleanly.
- **Three issues found + fixed during self-review (3-layer):**
  1. **Memoized `endRest` (`useCallback`).** It is a dependency of `RestTimer`'s tick effect; a fresh closure each render — e.g. while typing in the weight field *during* a rest — would clear+reset the 1s timeout and stall the countdown. (The old design hid the inputs during rest, so this never surfaced.)
  2. **Memoized `rows` (off `routine`) + `React.memo` on `SetSpreadsheet`.** Otherwise the grid re-rendered on every keystroke (CLAUDE §3 — avoid per-keystroke re-renders of non-input surfaces). The hero intentionally still updates per keystroke (it's the live instrument).
  3. **Pause overlay → `Modal`.** With `<Screen scroll>`, an `position:absolute; bottom:0` overlay anchors to the (taller) scroll content, so "Resume" could land off-screen. A transparent `Modal` is viewport-fixed (same pattern as the RPE sheet).
- **Wired to the real backend** — `appendSet`/`finishSession` calls + payload shape unchanged (no schema/route change). Theme tokens only (the one `rgba(8,8,11,0.94)` pause scrim is carried over verbatim from the prior runner; no scrim token exists — left as-is, consistent with the RPE-sheet scrim).

### ⚠️ Brady on-device/preview checklist (gates flip to `done`)
1. **Hero readability + live mirror.** Start a session; the active weight shows huge (96pt) and updates as you type in the Weight field; unit reads `kg`/`lb` per your profile. Empty weight shows `—`.
2. **Carry-forward.** Log set 1 with a weight → set 2 pre-fills the same weight; advancing to the **next exercise** clears the weight (reps pre-fill from the new exercise's target).
3. **Spreadsheet.** Logged cells fill with the weight; the active cell has a 2pt cyan left border; the active exercise row is highlighted; a logged body-weight set shows a check.
4. **Peripheral rest.** After logging, the slim REST pill appears (countdown + Skip) without hiding the hero/Log; Skip ends it; logging again mid-rest restarts the countdown. Tabbing away still shows the tab badge (5.6).
5. **Finish paths.** "Log set & finish" on the final set finishes + shows the summary; "Finish workout" confirms then finishes. Pause overlay covers the screen and Resume works (incl. after scrolling on a long routine).
6. **Units sanity (imperial).** Switch profile to imperial: hero/entry read `lb`, and the saved burn/summary still computes (weight stored as kg).

### File List
- `mobile/components/session/WeightHero.tsx` (**new**)
- `mobile/components/session/SetSpreadsheet.tsx` (**new**)
- `mobile/components/RestTimer.tsx` (modified — `compact` variant)
- `mobile/components/session/ActiveSessionRunner.tsx` (modified — recompose + per-set log + carry-forward + units)

## Code Review (2026-05-24, self / 3-layer adversarial)
Reviewer: Claude Opus 4.7 (1M). Verdict: **code-complete + reviewed → `review`** (awaiting Brady's device pass before `done` — visual readability/units are the kind of thing only a device confirms, mirroring 4.5/4.6/5.6).
- **Blind Hunter:** carry-forward resets correctly on exercise change; `setLog` is an immutable nested update; units round-trip kg↔display; final-set auto-finish + `appendSet`/`finishSession` contract preserved; keyed RestTimer resets per rest; **fixed** the `endRest` identity / tick-stall bug.
- **Edge Case Hunter:** routine still loading → hero `—`, Log toasts "still loading", no crash; empty routine → existing empty-state; null `routineId` → same limitation as before (not a regression); long exercise names truncate; pause freezes the in-screen tick (the badge's wall-clock deadline does not pause — **pre-existing** divergence, noted, not in scope); many sets → cells narrow but functional (bounded).
- **Acceptance Auditor:** AC1✓ AC2✓ AC3✓ AC4✓ AC5(tokens/`.map`-bounded/memoized)✓ AC6(tsc)✓ at the code level; **readability from 6 ft, the live mirror, and units rendering depend on a real device → Brady checklist #1–#6.**

## Change Log
- **2026-05-24** — Story 5.7 drafted (create-story) + implemented (dev-story) + 3-layer self-review with 3 fixes (memo `endRest`, memo `rows`+`React.memo` grid, pause→Modal) in one autonomous pass per Brady's "build it all now, I verify." tsc clean. Status → review (device checklist gates `done`).
