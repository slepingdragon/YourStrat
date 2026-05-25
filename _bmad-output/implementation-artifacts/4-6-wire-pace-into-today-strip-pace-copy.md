# Story 4.6: Wire pace into Today & strip pace copy

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user opening Today,
I want the calorie ring to show my real pace and the labels to stay navigational,
so that the Pace Ring (T-S1) is live end-to-end: glanceable pace from geometry, calm words.

Final story of the Pace Ring track. Wires Story 4.3 (`pace_position` on the snapshot) + Story 4.4 (`resolvePace`) + Story 4.5 (`IntakeRing` pace rendering) into the Today hero.

## Acceptance Criteria

1. **Hero ring shows pace.** In `TodayDashboard`, the hero `IntakeRing` receives `paceMark` and `paceState` from `resolvePace({ now: new Date(), serverPacePosition: today.pace_position, consumedCalories: today.consumed_calories, target: today.targets.daily_calorie_target, burnedCalories: today.burned_calories })`, and `animated={true}`.
2. **Effective target.** The hero ring's `target` prop becomes the **effective target** = `daily_calorie_target + burned_calories` (so the fill ratio is `consumed / effective_target`; finishing a workout grows headroom). `value` stays `consumed_calories`.
3. **Hero label edge.** Hero label = `remaining < 0` → `"calories over"`; `|remaining| ≤ 5` → `"at target"`; else `"calories left"`. Hero number color stays `error` only when `remaining < 0` (unchanged — no per-pace-state tint on the number, per precedent §7.2).
4. **Words stay navigational.** `TodayHeader` is unchanged (already a pure date + time-of-day tag — confirm, no pace words). The equation row keeps all three cells (`in · burned · left`, burned in `colors.spark`) — unchanged. No pace-state sentence is added to the screen body (geometry carries it).
5. **Accessibility.** The hero `Pressable`'s `accessibilityLabel` is enriched to include the pace state in words (e.g. `"1,240 calories left. Behind pace. Open nutrition details."`) so screen-reader users get what the geometry conveys. (`on`→"On pace", `behind`→"Behind pace", `ahead`→"Ahead of pace", `over`→omit/"Over target"; `null`→no pace phrase.)
6. **Mid-window empty state works for free.** With no meals mid-day, `consumed = 0`, `paceMark ≈ 0.5`, state `behind` → the ring shows a 0% fill with a warm gap arc curving toward pace. No nag copy is added (the existing "No meals yet today." stays).
7. **Verification.** `npx tsc --noEmit` clean. No change to the 3 non-hero `IntakeRing` consumers (they don't pass pace/animated props). Visual confirmation on web preview/device is a review-time step (animation + ahead z-order inherited from 4.5).

## Tasks / Subtasks

- [x] **Task 1 — Compute pace + wire ring props** (AC: #1, #2)
  - [x] In `TodayDashboard`, import `resolvePace` from `@/lib/pace`. When `today` is present, compute `const pace = resolvePace({ now: new Date(), serverPacePosition: today.pace_position, consumedCalories: today.consumed_calories, target: today.targets?.daily_calorie_target ?? 0, burnedCalories: today.burned_calories })`.
  - [x] Add `effectiveTarget = (today.targets?.daily_calorie_target ?? 0) + today.burned_calories` to the `hero` object (or compute inline).
  - [x] On the hero `IntakeRing`: change `target={hero.target}` → `target={hero.effectiveTarget}`; add `paceMark={pace.fraction ?? undefined}`, `paceState={pace.state ?? undefined}`, `animated`. Keep `value={hero.consumed}`, `color={colors.star}`, `unit="cal"`, `size`, `hideCenter`, `hideLabel`.
- [x] **Task 2 — Hero label "at target" edge** (AC: #3)
  - [x] Change `hero.label` logic to: `remaining < 0 ? "calories over" : Math.abs(remaining) <= 5 ? "at target" : "calories left"`. Leave `hero.over` (= `remaining < 0`) and the number color as-is.
- [x] **Task 3 — Accessibility phrase** (AC: #5)
  - [x] Build a pace phrase from `pace.state` (`on`→"On pace.", `behind`→"Behind pace.", `ahead`→"Ahead of pace.", else "") and splice it into the hero `Pressable` `accessibilityLabel` between the value/label and "Open nutrition details."
- [x] **Task 4 — Verify** (AC: #4, #6, #7)
  - [x] Confirm `TodayHeader` has no pace copy (it doesn't — leave it).
  - [x] `cd mobile; npx tsc --noEmit` clean.
  - [ ] **(Deferred — review/manual)** On web preview: morning (pace ahead/behind), evening, zero-meals-midday (warm arc), over-target — confirm geometry + the single mount-settle. Inherits 4.5's ahead-z-order confirmation. *Not runnable headlessly here; deferred to Brady / code-review.*

## Dev Notes

### File being modified

- **`mobile/components/TodayDashboard.tsx`** *(UPDATE — full current state read).* The hero block (≈ lines 59–129) renders an absolutely-positioned `IntakeRing` (value=`consumed`, target=`daily_calorie_target`, `color=star`, `hideCenter hideLabel`) behind a separately-rendered 52pt number + a 3-cell equation row. The `hero` object (lines 33–42) holds `value`/`label`/`over`/`consumed`/`burned`/`target`. The `Pressable` already has an `accessibilityLabel` (line 68). **Change only:** ring `target`→effective + pace props + animated; `hero.label` edge; the Pressable label. Leave the number, equation row, NextActionButton, trio cards, sparkline, meals list untouched.
- The Today snapshot already carries `pace_position` (Story 4.3) and flows in as the `today` prop — **no `(tabs)/index.tsx` change needed**; `getToday()` already sends `tz_offset_minutes` and returns `pace_position`.

### Why effective target (AC2)

The precedent (§3, §7) defines fill ratio `f = consumed / (target + burned)` and pace state off the same effective target — so a finished workout drops the fill and grows headroom in lockstep. `resolvePace` already computes state against `target + burned` internally (Story 4.4); passing the **same** effective target to the ring's `target` keeps the fill geometry and the state consistent. When `burned = 0` this is identical to today's behavior (no regression for the common case).

### Scope boundaries

- **No `IntakeRing` changes** (Story 4.5 delivered the rendering). **No `pace.ts` changes** (Story 4.4). **No backend changes** (Story 4.3).
- **No "Move" NextActionButton label, no workout quiet-state, no pace sentence on screen** — all resolved/forbidden (Today-tab Correct Course §2; epics "Resolved" note). Don't add them.
- Inherits the deferred timezone-unification limitation (`deferred-work.md`).
- `now = new Date()` at render is fine — no idle drift animation (precedent §6.3); pace recomputes on data change / refresh.

### Testing standards

- No JS test runner (Story 4.4 Task 0; `jest-expo` still deferred). `tsc` + review-time visual is the bar. The wiring is declarative prop-passing; the logic it depends on (`resolvePace`) is already smoke-covered.

### Project Structure Notes

- Single-file change (`TodayDashboard.tsx`). No new files, deps, tokens, or config.

### References

- [epics.md → Epic 4 / Story 4.6](../planning-artifacts/epics.md) — UX-DR1 wiring portion.
- [today-tab-ux-design-2026-05-20.md §7 (cascading hero changes, "at target", equation row), §8 (empty states), §10.1 (no "Move")](../planning-artifacts/today-tab-ux-design-2026-05-20.md); [today-tab-correct-course §2 (resolved decisions)](../planning-artifacts/today-tab-correct-course-2026-05-20.md).
- [4-4-...client.md](4-4-pace-computation-color-tokens-client.md) (`resolvePace`), [4-5-...t-s1.md](4-5-pace-ring-rendering-animation-t-s1.md) (`IntakeRing` pace props), [4-3-backend-pace-position.md](4-3-backend-pace-position.md) (`pace_position`).
- `mobile/components/TodayDashboard.tsx` (hero call-site), `mobile/components/today/TodayHeader.tsx` (already pure) — read for this story.

### Open questions / assumptions

1. **Accessibility phrasing** — using a short state phrase ("Behind pace.") rather than the precedent's full "behind by N calories" sentence; the magnitude is conveyed by the visible number. Upgrade later if desired.
2. **`pace.fraction ?? undefined`** — `resolvePace` returns `fraction: number | null`; the ring expects `number | undefined`. Coerce `null`→`undefined` so pace simply doesn't render when there's no target.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.7 (1M context)

### Debug Log References

- `tsc --noEmit` (mobile): clean.

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created.
- **Wired** the Today hero to live pace: `resolvePace({ now, serverPacePosition: today.pace_position, consumed, target, burned })` → hero `IntakeRing` `paceMark`/`paceState` + `animated`; ring `target` is now the **effective target** (`daily_calorie_target + burned_calories`); hero label gained the `"at target"` edge (`|remaining| ≤ 5`); `Pressable` `accessibilityLabel` now includes a pace phrase (`pacePhrase(state)`).
- **TodayHeader unchanged** — already a pure date + time-of-day tag (no pace copy to strip); confirmed.
- **Mid-window empty state works for free:** `consumed = 0` + mid-day `paceMark ≈ 0.5` → state `behind` → 0% fill + warm gap arc; no nag copy added.
- **No regressions:** only `TodayDashboard.tsx` changed; the 3 non-hero `IntakeRing` consumers pass no pace/animated props (untouched). No new deps/tokens/config. `(tabs)/index.tsx` needed no change — `pace_position` already flows through the snapshot.
- **Deferred to review/manual:** on-device/preview visual confirmation of the four states + mount-settle (inherits Story 4.5's ahead-z-order decision). No JS test runner; `tsc` is the automated bar.

### File List

- `mobile/components/TodayDashboard.tsx` (modified) — pace wiring, effective target, `"at target"` label edge, pace a11y phrase, `pacePhrase` helper.

## Code Review (2026-05-24)

**Method:** 3-layer adversarial (Blind Hunter · Edge Case Hunter · Acceptance Auditor). Reviewer: Claude Opus 4.7 (1M), fresh context. Verdict: **PASS → done** (visual confirmation inherited from 4.5's flagged items).

**Verified clean:**
- **AC1/AC2 wiring correct.** `resolvePace({ now, serverPacePosition: today.pace_position, consumed, target, burned })` → hero `paceMark`/`paceState` + `animated`; ring `target={hero.effectiveTarget}` (`daily_calorie_target + burned_calories`), `value={hero.consumed}`. `pace.fraction ?? undefined` / `pace.state ?? undefined` correctly coerce `null`→`undefined` so the ring simply doesn't render pace when there's no target.
- **Effective-target consistency (the key risk) is sound.** `resolvePace`→`computePaceState` computes `f = consumed/(target+burned)` against the **same** effective target the ring fills against, so fill geometry and pace state agree (behind ⟺ `inLen<paceLen` ⟺ warm; ahead ⟺ `inLen>paceLen` ⟺ cool). Cross-checked the backend (`today.py:178`): `remaining_calories = target + burned − consumed`, so the 52pt hero number and the ring fill stay in lockstep — no number/ring drift introduced by switching the ring to effectiveTarget.
- **AC3 label edge** matches AC literally: `remaining<0 → "calories over"` (checked first), `|remaining|≤5 → "at target"`, else `"calories left"`. Number color stays `error` only when `remaining<0` (precedent §7.2). *(Note: the ±5 "at target" band is asymmetric by design — `−5..0` reads "calories over" in red because `<0` is checked first; this is the AC's explicit ordering, not a defect.)*
- **AC4** `TodayHeader` untouched (pure date + time-of-day); 3-cell equation row unchanged; no pace sentence added to the body.
- **AC5** a11y phrase: `pacePhrase` switch is exhaustive over `PaceState` (tsc-verified), spliced only when `pace?.state` truthy → e.g. "1,240 calories left. Behind pace. Open nutrition details."
- **AC6** mid-window empty works for free: `consumed=0` → `inLen=0` + warm arc to `paceMark`; no nag copy.
- **Edge:** `today=null` → no hero render → `pace` unused; `target=0` → `pace.state` null → `paceActive` false → plain ring.

**No patch needed** (4.6 is declarative prop-passing on top of already-reviewed `pace.ts`/`IntakeRing`). `tsc --noEmit` clean.

**Flagged for Brady's on-device/preview pass:** inherits Story 4.5's two visual items (AC6 gap-arc crossfade partial; ahead z-order). Drive the four states on web preview — morning ahead/behind, evening, zero-meals-midday (warm arc), over-target — and confirm the single mount-settle plays without jank.

## Change Log

- **2026-05-24** — Implemented Story 4.6: wired `resolvePace` → Today hero `IntakeRing` (pace mark/state + animated), effective-target fill, `"at target"` label edge, pace accessibility phrase. tsc clean; single-file change; non-hero rings untouched. **Completes the T-S1 Pace Ring track (4.3→4.6).** Status → review.
- **2026-05-24** — Code review PASS (3-layer adversarial). Wiring + effective-target consistency verified against backend `remaining_calories`; no patch needed; tsc clean. Visual confirmation inherited from 4.5's flagged items. Status → done. **T-S1 Pace Ring track (4.3→4.6) complete end-to-end.**
