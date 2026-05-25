# Story 5.8: Workouts list premium pass (W-S1, W-S2, W-C1)

Status: review

## Story

As a user choosing a workout,
I want a compact week-at-a-glance list,
so that picking and starting is one gesture (UX-DR16 W-S1, UX-DR17 W-S2, UX-DR20 W-C1).

Reworks the **Workouts routine list** (the screen shown when no session is active). The 5.6 takeover branch + 5.7 runner are untouched — this only changes the list above them.

## Acceptance Criteria

1. **DayChip strip (W-S1).** A horizontal day-of-week chip strip sits on top, ordered from today, **today highlighted**; tapping a chip **scrolls** the list to that day's group. It replaces the heavy dot+uppercase day-section headers.
2. **Single-line row + swipe (W-S2).** Each routine is a single-line row (name · exercise count). **Swipe-left → start** (reveals the start affordance / opens the effort strip), **swipe-right → delete** (with confirm). Tapping the row opens the routine. Horizontal swipe must not fight vertical list scroll.
3. **Inline RPE (W-C1).** Starting expands an **inline 1–10 effort strip in-row with a LAW-3 spring** — **no modal**. Picking an effort (or "skip") starts the session via the existing `startSession` → `setActiveSession` (5.6) wiring.
4. **Premium + theme.** Tokens only, no raw hex; the row reveal/labels read clean; swipe + spring run on the UI thread (Reanimated worklets, mirroring `ExerciseSwipePicker`). Accessibility: the row exposes Start/Delete `accessibilityActions` so the actions aren't swipe-only.
5. **No backend/contract change.** `listRoutines`/`startSession`/`deleteRoutine` unchanged; the RPE value still flows to `startSession(routineId, rpe)`.
6. **Verification.** `npx tsc --noEmit` clean. **On-device/preview (Brady):** chip highlight + tap-scroll, swipe-left→effort strip→start, swipe-right→delete confirm, tap→open, vertical scroll still works, no-exercise routine can't start.

## Design decisions (judgment calls — documented for review)

- **DayChip "replaces headers" = removes the heavy dot+uppercase headers**, but each day group keeps a **quiet 11pt day caption** as the scroll anchor and day context (otherwise scrolling to a day, or an empty "Rest day" line, has no label). Chips are the primary day nav + today indicator.
- **Routine "duration" (W-S2 lists "name · duration · count")** is **omitted** — the list payload (`listRoutines`) has only `exercise_count`/`scheduled_days`, no stored or derivable duration. Faking a number would mislead; the row shows `name · N exercises`.
- **Swipe = full-swipe-to-trigger** (drag past ~80px + release): swipe-left snaps back and opens the inline effort strip; swipe-right snaps back and confirms delete. Colored reveal (success/error) + icon shows what will fire. `accessibilityActions` give a non-swipe path.
- **Modal removed (W-C1):** the RPE bottom-sheet `Modal` in `workouts.tsx` is deleted; effort selection is the in-row strip.

## Tasks / Subtasks

- [x] **Task 1 — `DayChipStrip`** (AC: #1) — new `components/DayChipStrip.tsx`: horizontal chips (today-ordered), active/today highlight, `onSelect(day)`. Spec-named (W-S1).
- [x] **Task 2 — Swipeable single-line row + inline RPE** (AC: #2, #3, #4) — rework `components/RoutineCard.tsx`: `Gesture.Pan` (activeOffsetX/failOffsetY so vertical scroll wins) + reveal layer + `withSpring` snap-back (mirrors `ExerciseSwipePicker`); inline `RpePicker` (compact) under the row via `Animated.View entering={FadeInDown.springify()}` (LAW-3); `accessibilityActions`.
- [x] **Task 3 — Wire `workouts.tsx`** (AC: #1, #3, #5) — DayChipStrip on top + per-day groups (quiet caption, no heavy header) measured via `onLayout` into a ref map; `ScrollView` ref + `scrollTo` on chip select (+ active chip follows scroll). Delete the RPE `Modal`; `onStart(rpe)` → `startSession` → `setActiveSession`. (Folds in 5.9 copy: remove subtitle, "Rest day" muted right-aligned line.)
- [x] **Task 4 — Verify** (AC: #6) — `tsc --noEmit` clean; device checklist below.

## Dev Notes

- Reuse `RpePicker` (`size="compact"`), `Button`, icons (`ChevronRight`/`Trash`/`Play`); gesture/anim idiom from `components/ExerciseSwipePicker.tsx`. New file `DayChipStrip.tsx` is spec-named (W-S1). No new dep, no new color token (start=`success`, delete=`error`, active chip=`star`), no backend change.
- **v1 limits:** no duration in the row (no data); swipe is full-swipe-to-trigger (not a sticky reveal-button drawer); scroll-spy highlights the topmost visible day group.
- **Testing:** no JS runner (`jest-expo` deferred); `tsc` is the bar; gesture/scroll feel is Brady's device checklist (precedent: 4.5/4.6/5.6/5.7). gesture-handler `Pan` works with mouse-drag on web preview.

### References
- [epics.md → Epic 5 / Story 5.8](../planning-artifacts/epics.md) (lines 1128–1146), UX-DR16/17/20.
- `app/(tabs)/workouts.tsx`, `components/RoutineCard.tsx`, `components/RpePicker.tsx`, `components/ExerciseSwipePicker.tsx` (gesture idiom), `lib/api.ts` (`startSession`/`deleteRoutine`), `lib/store.ts` (`setActiveSession`).

## Dev Agent Record
### Agent Model Used
Claude Opus 4.7 (1M context)

### Debug Log References
- `tsc --noEmit` (mobile): clean — after impl and after the 2 review fixes.

### Completion Notes List
- **`DayChipStrip`** (new): horizontal today-ordered chips; active chip filled (`star`), today carries a `spark` dot when not active so it stays findable. Selection haptic.
- **`RoutineCard` reworked** into a single-line swipe row mirroring `ExerciseSwipePicker`'s idiom: `Gesture.Pan().activeOffsetX([-15,15]).failOffsetY([-12,12])` (so vertical list scroll wins on vertical drags) + a reveal layer (Trash/`error` left, Play/`success` right) + `withSpring(0)` snap-back. Swipe-left past 80px → open the inline effort strip; swipe-right → delete confirm. Tap → open. `accessibilityActions` (start/delete) give a non-swipe path. Inline `RpePicker` (compact) animates in with `FadeInDown.springify().damping(18)` (LAW-3) — the **RPE modal is gone**.
- **`workouts.tsx`**: fixed `DayChipStrip` on top; the day groups live in a ref'd `ScrollView` — each group's `onLayout` y is stored in `offsetsRef`, a chip tap `scrollTo`s it, and `onScroll` scroll-spy lights the topmost visible day. Start flow is now `onStart(rpe)` → `startRoutine` → `startSession` → `setActiveSession` (5.6), guarded by `startingId` against double-fire. **5.9 folded in:** subtitle removed; empty days show a right-aligned 11pt `textMuted` "Rest day" beside the quiet day caption (heavy dot+uppercase headers gone).
- **Two review fixes:** (1) capture a plain `canDelete` boolean instead of the `onDelete` fn in the gesture worklet; (2) scroll-spy skips the `Anytime` group so a real day stays highlighted there.
- Wired to the real backend (`startSession`/`deleteRoutine`/`listRoutines`) — no mocks, no contract change. Tokens only; no new dep; one new spec-named file (`DayChipStrip`).

### ⚠️ Brady on-device/preview checklist (gates flip to `done`)
1. **Chips:** today highlighted (+ dot when you tap another day); tapping a chip scrolls to that day; scrolling lights the right chip.
2. **Swipe:** swipe-left a routine → green Start reveal → effort strip springs open → pick/skip → session starts (tab takeover). Swipe-right → red Delete reveal → confirm → row goes.
3. **No fights:** vertical list scroll still works (swipe only triggers on a deliberate horizontal drag); tap opens the routine.
4. **Edge:** a 0-exercise routine can't start (no green reveal, swipe-left no-ops); opening it still works.
5. **Copy (5.9):** no tagline under "Workouts"; empty days read "<day> … Rest day" quietly; no banners.
6. **Web preview:** gesture-handler `Pan` responds to mouse-drag — verify swipe there too.

## Code Review (2026-05-24, self / 3-layer adversarial)
Reviewer: Claude Opus 4.7 (1M). Verdict: **code-complete + reviewed → `review`** — gesture/scroll/spring *feel* only a device confirms (precedent 4.5/4.6/5.6/5.7).
- **Blind Hunter:** worklet captures only primitives + shared values (fixed `canDelete`); `runOnJS` for openRpe/askDelete; `startingId` blocks concurrent starts; `onLayout` offsets are content-relative (groups are direct ScrollView children) so `scrollTo` lands true.
- **Edge Case Hunter:** 0-exercise routine gated; tap vs swipe disambiguated by `activeOffsetX`/`failOffsetY`; all-Anytime shows 7 rest rows (same as prior, not a regression); failed start leaves the strip open to retry; web uses `window.confirm`.
- **Acceptance Auditor:** AC1–AC5 met at code level; AC6 = tsc clean + Brady's device/web checklist. 5.9 AC1/AC2 met.

### File List
- `mobile/components/DayChipStrip.tsx` (**new**)
- `mobile/components/RoutineCard.tsx` (modified — single-line swipe row + inline RPE)
- `mobile/app/(tabs)/workouts.tsx` (modified — DayChip strip, scroll-to-day, modal removed, 5.9 copy)

## Change Log
- **2026-05-24** — Drafted + implemented (one autonomous pass, "build it all now, I verify"). Status → review.
