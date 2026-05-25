# Story 4.4: Pace computation & color tokens (client)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the Today Pace Ring,
I want a pure client-side pace function plus the two pace color tokens,
so that the ring can compute its pace signal offline (when the server omits `pace_position`) and render it on-brand — without each consumer re-deriving the math.

Second story of the Pace Ring track. Builds directly on Story 4.3 (backend `pace_position`). This story ships **no UI** — only `mobile/lib/pace.ts` and the `colors.ts` tokens that Story 4.5 (ring render) and 4.6 (wiring) consume.

## Acceptance Criteria

1. **`mobile/lib/pace.ts` exists with a pure pace API.** No I/O, no React, no Zustand, no `Date.now()` hidden inside (callers pass `now`). It exports `PACE_CURVE`, `computePaceFraction`, `computePaceState`, `resolvePace`, the `PaceState` type, and the `PACE_ON_THRESHOLD` constant.
2. **`PACE_CURVE` mirrors the backend** anchor table exactly (`backend/app/services/today.py`), so client-fallback and server values agree: `[0,0],[6,0],[7,0],[8,.10],[9,.15],[10,.20],[11,.30],[12,.40],[13,.50],[14,.58],[15,.64],[16,.68],[17,.72],[18,.75],[19,.80],[20,.88],[21,.94],[22,.98],[23,1.0]`.
3. **`computePaceFraction(now: Date): number`** returns the pace position `p` (0.0–1.0) for the device-local hour (`now.getHours() + now.getMinutes()/60`), via piecewise-linear interpolation of `PACE_CURVE`. `≤ 0` → `0.0`; `≥ 23` → `1.0`; clamped to `[0,1]`. (No `tz_offset` here — `now` is already device-local, unlike the backend which receives UTC + an offset.)
4. **`computePaceState(...)`** derives the pace state from consumed vs. effective target and the pace fraction, per the Today-tab precedent §3:
   - `effectiveTarget = target + burnedCalories`; `f = consumedCalories / effectiveTarget`.
   - Returns `null` when `target` is falsy/0 OR `paceFraction` is `null` (no meaningful signal).
   - `f > 1.0` → `'over'`; else `δ = f − paceFraction`: `|δ| ≤ 0.05` → `'on'`; `δ < −0.05` → `'behind'`; `δ > 0.05` → `'ahead'`.
   - The `0.05` band is exported as `PACE_ON_THRESHOLD` (single source; prevents jitter near the mark).
5. **`resolvePace(...)`** is the "server wins, client falls back" convenience: if `serverPacePosition` is a number, use it as the fraction; otherwise use `computePaceFraction(now)`. Then derive `state` via `computePaceState`. Returns `{ fraction: number | null, state: PaceState | null }`. (This is what Story 4.6 wires into Today; it pairs with Story 4.3's `pace_position`.)
6. **Color tokens added to `mobile/theme/colors.ts`:** `paceWarmGap: "rgba(251, 191, 36, 0.25)"` (behind-pace, amber 25% α) and `paceCoolGap: "rgba(201, 204, 214, 0.25)"` (ahead-of-pace, `starDim` 25% α). Referenced by token only (never inline) downstream.
7. **Verification.** `npx tsc --noEmit` clean. Pace logic is unit-tested at the checkpoints in AC8 **OR**, if the test-runner decision (below) defers, verified via a temporary `tsx`/`node` smoke run documented in the Dev Agent Record — with the authoritative coverage already living in `backend/tests/test_today.py`.
8. **Test cases** (once a runner exists): `computePaceFraction` at 5am→0.0, 1pm→~0.50, 6pm→~0.75, 11pm→1.0, 12.5→~0.45; `computePaceState` for on (δ within 5%), behind (δ<−5%), ahead (δ>5%), over (f>1.0), null (target 0 / paceFraction null); the `PACE_ON_THRESHOLD` boundary (δ exactly ±0.05 → `'on'`).

## Tasks / Subtasks

- [x] **Task 0 — Test-runner decision** (AC: #7, #8) — **ask-before-add (CLAUDE.md §8)**
  - [x] The mobile app has **no JS test runner** (package.json: only `typecheck`, no jest). Decide with Brady: add `jest-expo` + `jest` + `@types/jest` (standard Expo testing; also unblocks Epic 1's `format.ts` tests) **or** defer.
  - [ ] **(Not taken — deferred per §8)** If **add**: install `jest-expo@~54` (match Expo SDK 54) + `jest` + `@types/jest` as devDeps; add `"test": "jest"` script + a minimal `jest.config.js` (`preset: "jest-expo"`, restrict `testMatch` to `**/*.test.ts(x)`). *Decision: did NOT add a dependency without approval; used the tsx-smoke fallback. `jest-expo` still recommended before Epic 1's `format.ts` tests — Brady's call.*
  - [x] If **defer**: skip the persistent test file; satisfy AC7 via a temporary `npx tsx mobile/lib/__pace_check.ts` (or `node` on a compiled file) that asserts the AC8 checkpoints, paste output into the Dev Agent Record, then delete the scratch file. Backend `test_today.py` remains the authoritative curve coverage.
- [x] **Task 1 — `mobile/lib/pace.ts`** (AC: #1, #2, #3, #4, #5)
  - [x] Create the file with `PACE_CURVE` (mirror backend), `PaceState` type, `PACE_ON_THRESHOLD = 0.05`.
  - [x] Implement `computePaceFraction(now)` — interpolate `PACE_CURVE` at `now.getHours() + now.getMinutes()/60`; clamp `[0,1]`; `≤0`→0, `≥23`→1.
  - [x] Implement `computePaceState({ consumedCalories, target, burnedCalories, paceFraction })` per AC4.
  - [x] Implement `resolvePace({ now, serverPacePosition, consumedCalories, target, burnedCalories })` per AC5.
  - [x] Keep everything pure and side-effect-free; no imports beyond types.
- [x] **Task 2 — Color tokens** (AC: #6)
  - [x] Add `paceWarmGap` and `paceCoolGap` to `mobile/theme/colors.ts` (exact rgba values in AC6). Do not reorder/alter existing tokens.
- [x] **Task 3 — Tests / smoke** (AC: #7, #8)
  - [x] Per Task 0 outcome: write `mobile/lib/pace.test.ts` (jest) covering AC8 **or** run+document the `tsx` smoke.
- [x] **Task 4 — Verify** (AC: #7)
  - [x] `cd mobile; npx tsc --noEmit` clean.
  - [x] If jest added: `npm test` green. Else: smoke output pasted into Dev Agent Record.

## Dev Notes

### Files

- **`mobile/lib/pace.ts`** *(NEW).* Pure module. Mirrors the backend pace logic from Story 4.3 ([backend/app/services/today.py](../../backend/app/services/today.py): `PACE_CURVE`, `compute_pace_position`). Keep the curve **identical** to the backend so server value and client fallback never disagree at a given hour. `lib/` siblings (`api.ts`, `store.ts`, `nextAction.ts`) are the established home for pure helpers.
- **`mobile/theme/colors.ts`** *(UPDATE — current state read).* Flat `export const colors = { ... }` of hex strings; **no rgba yet** and the two pace tokens are absent. Add the two rgba string tokens; RN accepts `rgba(...)` strings for color props. Additive only.

### Pace API design (reconciles the epics AC sketch)

The epics sketch named `computePaceTick(now, target, burned) → {fraction, state}`. That signature can't produce `state` (state needs *consumed* to compute `f = consumed/effective_target`). This story refines it into the function set in the ACs: `computePaceFraction` (pure time→p, the client fallback for the server's `pace_position`), `computePaceState` (the §3 four-state machine), and `resolvePace` (the server-wins-else-client convenience that 4.6 calls). This keeps the ring component (Story 4.5) render-only — it receives `{ fraction, state }` and maps to geometry/color.

### Server/client relationship (from Story 4.3)

- Story 4.3 added `pace_position` to `GET /today/`, computed server-side from a client-supplied `tz_offset_minutes`. `resolvePace` prefers that value; `computePaceFraction(now)` is the **offline fallback** only.
- The state thresholds and `effective_target = target + burned` come from [today-tab-ux-design-2026-05-20.md §3, §7](../planning-artifacts/today-tab-ux-design-2026-05-20.md). `'over'` (f>1.0) is included in `PaceState` (the precedent's 4th state) even though the epics sketch listed three — Story 4.5 maps `over` to the existing `IntakeRing` over-target color.
- **Known deferred limitation (from 4.3 review, see `deferred-work.md`):** server pace uses local-hour while consumed/meals use the UTC day. `resolvePace` inherits this; do not try to fix it here — it's an app-wide timezone-unification follow-up.

### Testing standards

- Backend already has authoritative curve tests (`backend/tests/test_today.py`, 16 passing). This story's tests guard the **client mirror + the state machine** (which is client-only).
- The state-machine tests are the high-value ones (the curve is a straight port). Cover the threshold boundary (`δ = ±0.05` → `'on'`) and the `null` guards explicitly.
- Reduced-motion / ring animation are **not** in this story (Story 4.5).

### Project Structure Notes

- New token rgba strings are the first non-hex entries in `colors.ts` — consistent with the UX spec's documented additions; no structural change.
- Adding a test runner (Task 0) is the one ask-before-add. It is foundational beyond this story (Epic 1 `format.ts`, future component tests), so the recommended default is **add `jest-expo`** now. Final call is Brady's.
- No new runtime dependency; `jest-expo` is a devDependency only. No config files touched beyond an additive `jest.config.js` (itself ask-before-add territory — covered by Task 0).

### References

- [epics.md → Epic 4 / Story 4.4](../planning-artifacts/epics.md) — UX-DR1 (T-S1) client portion.
- [today-tab-ux-design-2026-05-20.md §3 (four pace states + 5% threshold), §4 (tokens), §5 (curve), §7 (effective_target), §13 (hand-off)](../planning-artifacts/today-tab-ux-design-2026-05-20.md).
- [4-3-backend-pace-position.md](4-3-backend-pace-position.md) — completed backend half (PACE_CURVE source of truth, `tz_offset_minutes`, the deferred timezone-unification note).
- `mobile/theme/colors.ts`, `mobile/lib/api.ts` (`TodaySnapshot.pace_position`) — current state (read for this story).
- CLAUDE.md §3 (Reanimated/animation rules — for 4.5, not here), §4 (token-first), §8 (ask-before-add — Task 0).

### Open questions / assumptions

1. **Test runner (Task 0)** — the only real decision. Recommend adding `jest-expo`. If deferred, the `tsx` smoke + backend coverage is the interim safety net.
2. **`resolvePace` shape** — returns `{ fraction, state }`; if Story 4.5 prefers separate props it can destructure. Kept as one object for a single call-site in 4.6.
3. **`'over'` in `PaceState`** — included for completeness; confirm 4.5 maps it rather than relying solely on `IntakeRing`'s existing over-target rendering.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.7 (1M context)

### Debug Log References

- `npx tsx lib/__pace_check.ts` (temporary smoke; deleted after) — 18 assertions: curve checkpoints (5am=0.0, 1pm~0.50, 6pm~0.75, 11pm=1.0, 12:30~0.45), state machine (on/behind/ahead/over/null×2), threshold boundary (±0.05→on), burn-raises-effective-target, resolvePace server-wins + client-fallback. First run: 1 FAIL on the exact +0.05 boundary (float: `1100/2000 − 0.5 = 0.05000…04`). Added `PACE_EPSILON = 1e-9` to the threshold comparison → re-run **ALL PASS**.
- `tsc --noEmit` (mobile): clean.

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created.
- **Implemented** `mobile/lib/pace.ts` (pure, zero non-type imports): `PACE_CURVE` (mirrors backend exactly), `computePaceFraction(now)`, `computePaceState({consumed,target,burned,paceFraction})` (§3 four-state machine), `resolvePace(...)` (server-wins-else-client), `PaceState`, `PACE_ON_THRESHOLD`. Added `paceWarmGap`/`paceCoolGap` rgba tokens to `mobile/theme/colors.ts` (additive).
- **Float-boundary fix:** exact ±0.05 deltas now classify as `'on'` via a `1e-9` epsilon (smoke caught this; matches AC8's "±0.05 → on").
- **Test-runner decision (Task 0):** did NOT add `jest-expo` — that's an ask-before-add dependency (CLAUDE.md §8) Brady hadn't approved. Verified via the documented `tsx` smoke instead; backend `test_today.py` remains the authoritative curve coverage. **Follow-up flagged:** add `jest-expo` + a persistent `pace.test.ts` (and it unblocks Epic 1 `format.ts` tests) — Brady's call.
- **No regressions:** new file + additive tokens only; `tsc` clean. No runtime dependency added.

### File List

- `mobile/lib/pace.ts` (new) — pure pace API.
- `mobile/theme/colors.ts` (modified) — added `paceWarmGap`, `paceCoolGap` tokens.

## Change Log

- **2026-05-24** — Implemented Story 4.4: pure `pace.ts` (PACE_CURVE mirror + `computePaceFraction`/`computePaceState`/`resolvePace`) + two pace color tokens. Verified via tsx smoke (18 assertions, ALL PASS after a float-boundary epsilon fix) + tsc clean. `jest-expo` deferred (ask-before-add); persistent unit tests flagged as follow-up. Status → review.
- **2026-05-24** — Code review (3 adversarial layers). Applied 1 hardening patch (`resolvePace` now rejects non-finite server values + clamps to [0,1]; `computePaceState` returns null on non-finite `f`), re-verified via tsx smoke (9 assertions incl. NaN/Infinity/out-of-range, ALL PASS) + tsc clean. Status → done.

## Review Findings

Code review 2026-05-24 — three adversarial layers. **Acceptance Auditor: all ACs PASS.** 1 patch applied, rest dismissed.

- [x] **[Review][Patch]** Server `pace_position` was trusted via `typeof === "number"`, letting `NaN`/`Infinity`/out-of-range through unclamped (the local path is clamped) `[mobile/lib/pace.ts]` — a `NaN` server value silently produced a wrong `"ahead"` and corrupted the 0–1 ring geometry. Fixed: `resolvePace` only uses a `Number.isFinite` server value and `clamp01`s it, else falls back to `computePaceFraction`; added `if (!Number.isFinite(f)) return null` guard in `computePaceState`. (Blind Hunter Med + Edge Case Hunter High.)

Dismissed: `f === 1.0` not "over" (intentional — over = strictly exceeding); negative `consumedCalories` → "behind" (acceptable; inputs are app-controlled); `span === 0` dead branch (harmless, anchors strictly increasing); trailing `return 1` unreachable (harmless); device-local-time trust (intentional — pace is a local-hour signal); out-of-range hours impossible (clock is 0–23.99).
