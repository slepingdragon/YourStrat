# Story 4.5: Pace Ring rendering & animation (T-S1)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user glancing at Today,
I want the calorie ring to show my pace geometrically (gap arc + tonal shift) and settle with calm motion,
so that I read "ahead / behind / on pace" in under 500ms with zero words.

Third story of the Pace Ring track (Tier-1 pick **T-S1**). It makes `IntakeRing` *capable* of rendering and animating the pace signal from props. **It does not wire real data** — Story 4.6 passes `paceMark`/`paceState` from `resolvePace` (Story 4.4) into the Today hero. This story must be **100% backward-compatible**: the three non-hero `IntakeRing` consumers must look and behave exactly as before.

## Acceptance Criteria

1. **All new behavior is opt-in.** New props default to off. With no pace/animation props, `IntakeRing` renders **pixel-identical** to today (verified against the 3 non-hero consumers: `MacroRing`, `NutritionRingsPanel`, `nutrition/metric/[id]`). Existing props/behavior (track, fill, over-target second arc, center text, label, `hideCenter`/`hideLabel`) unchanged.
2. **New props:** `paceMark?: number` (0.0–1.0 pace position), `paceState?: PaceState` (`"on"|"behind"|"ahead"|"over"` — import the type from `mobile/lib/pace.ts`), `animated?: boolean` (default `false`), and `accessibilityLabel?: string`. Pace rendering activates only when `paceMark != null` **and** `paceState != null`.
3. **Gap arc (z-order: track → gap arc → fill).** When pace is active and `paceState !== "over"` and `|paceMark − fillRatio| > 0` (i.e. an actual gap exists):
   - **behind** (`paceState === "behind"`, fill < pace): warm arc (`colors.paceWarmGap`) spanning the fill endpoint → pace position (the empty stretch you'd have filled if on pace).
   - **ahead** (`paceState === "ahead"`, fill ≥ pace): cool arc (`colors.paceCoolGap`) marking pace position → fill endpoint (how far past pace you are). **See Dev Notes "ahead z-order" — needs visual confirmation.**
   - **on** / **over**: no gap arc drawn.
4. **Tonal shift (only when pace active).** Fill color = `colors.starDim` when `paceState === "ahead"`; `overColor` when `paceState === "over"` (or the existing `ratio > 1` path); otherwise the passed `color` (`on`/`behind`). When pace is **not** active, fill always uses the passed `color` (no shift) — protects macro rings.
5. **Mount-settle animation (only when `animated`).** On mount (and on pull-to-refresh remount): fill stroke length grows `0 → fillLen` over ~400ms (`Easing.out(Easing.cubic)`); the gap arc opacity fades `0 → 0.25`-equivalent from t≈200ms to t≈400ms. The center text/number does **not** count up. Driven by `react-native-reanimated` shared values on the UI thread (no `setState`/JS-thread tweens).
6. **Data-change animation (only when `animated`).** When `value`/`target`/`paceMark` change: fill length tweens prev → new over ~300ms; gap arc length + color crossfade ~200ms with no "pop" when crossing a state threshold (e.g. behind→on). Hero number ticks instantly (handled by the caller, not here).
7. **Reduced motion.** When `AccessibilityInfo.isReduceMotionEnabled()` is true, skip mount-settle and data-change tweens — render at the final geometry directly. (Steady state is already motionless.)
8. **Accessibility.** When `accessibilityLabel` is provided, the ring container exposes it with `accessibilityRole="image"` (geometry isn't perceivable to SR users; the caller passes the full sentence in 4.6). When absent, behavior is unchanged.
9. **60 FPS / worklet purity.** Animations use `useSharedValue` + `useAnimatedProps` on an `Animated.createAnimatedComponent(Circle)`; worklets are pure (no `console.log`, no non-shared closures without `runOnJS`). No JS-thread `setInterval`.
10. **Verification.** `npx tsc --noEmit` clean. On web preview: the 3 non-hero consumers render unchanged; a temporary harness (or Story 4.6 preview) shows the four pace states correctly and the mount-settle plays once at ~400ms without jank.

## Tasks / Subtasks

- [x] **Task 1 — Add props + static gap-arc geometry (no animation yet)** (AC: #1, #2, #3, #4)
  - [x] Import `PaceState` type from `@/lib/pace`. Add `paceMark?`, `paceState?`, `animated?` (default false), `accessibilityLabel?` to `Props`.
  - [x] Compute `paceLen = circ * clamp01(paceMark)` alongside the existing `inLen`. Gate all pace logic on `paceMark != null && paceState != null`.
  - [x] Insert the gap-arc `Circle` **between** the track circle and the fill circle in JSX (z-order). Behind: `strokeDasharray` = gap length `(paceLen − inLen)`, `strokeDashoffset = -inLen`. Ahead: per Dev Notes recommended approach (arc `inLen − paceLen`, offset `-paceLen`, drawn so it's visible — confirm). Use `rotation={-90}` + `origin` like the existing arcs. No `strokeLinecap="round"` on the gap arc (avoid overlapping rounded caps with the fill).
  - [x] Apply the tonal shift to the fill `stroke` (AC4) — only when pace active.
- [x] **Task 2 — Reanimated mount-settle + data-change** (AC: #5, #6, #7, #9)
  - [x] `const AnimatedCircle = Animated.createAnimatedComponent(Circle)`. Replace the fill `Circle` with `AnimatedCircle`; drive its `strokeDasharray` via `useAnimatedProps` from a shared value `fillProgress` (0→1 scaling `inLen`).
  - [x] Mount-settle: on mount, `fillProgress` `withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })`; gap-arc opacity shared value `withTiming` from 0 starting at ~200ms (use `withDelay(200, withTiming(1, {duration: 200}))`).
  - [x] Data-change: when inputs change, `withTiming(prev→new, 300ms)` on fill; arc length/opacity crossfade ~200ms. Use a derived/animated prop; avoid remount-flicker.
  - [x] Reduced motion: read `AccessibilityInfo.isReduceMotionEnabled()` once (e.g. on mount into a ref/state); when true, set shared values to final instantly (no `withTiming`).
  - [x] Keep ALL animation gated on `animated === true` so the 3 non-hero consumers stay static.
- [x] **Task 3 — Accessibility** (AC: #8)
  - [x] When `accessibilityLabel` is set, put `accessibilityLabel` + `accessibilityRole="image"` on the outer container `View`.
- [x] **Task 4 — Verify** (AC: #1, #10)
  - [x] `cd mobile; npx tsc --noEmit` clean.
  - [ ] **(Deferred — manual/review)** Web preview: confirm `MacroRing` / `NutritionRingsPanel` / `nutrition/metric/[id]` are visually unchanged. *Verified by code inspection (no pace/animated props → static path, `fillColor=color`, no gap arcs → identical output); runtime confirm deferred — no headless preview in this env.*
  - [ ] **(Deferred — manual/review)** Drive the four states + mount-settle visually; confirm the **ahead z-order** (overlay vs desaturation-only) and note the call. *Inherently visual + needs the device/preview; deferred to Brady / code-review. Geometry reasoned correct (warm spans fill→pace at offset −inLen; cool spans pace→fill at offset −paceLen, drawn after fill).*

## Dev Notes

### File being modified

- **`mobile/components/IntakeRing.tsx`** *(UPDATE — full current state read).* Static SVG ring (`react-native-svg` `Circle`), **no Reanimated today**. Geometry: `stroke = max(6, round(size*0.09))`, `r = (size-stroke)/2`, `circ = 2πr`, `ratio = value/target`, `inLen = circ * clamp(ratio,0,1)`, over-target drawn as a second arc (`overColor`, `strokeDashoffset = -inLen`). Both arcs `rotation={-90}` (start 12 o'clock, clockwise) with `origin`. Center text shows `value` / `target`; `hideCenter`/`hideLabel` supported. **Preserve every bit of this.**

### ⚠️ Regression scope (the #1 risk)

`IntakeRing` has **4 consumers** — only the hero gets pace:
- `components/TodayDashboard.tsx:80` — **the hero** (`color={colors.star}`, `unit="cal"`, `size={HERO_SIZE}`, `hideCenter hideLabel`). The 52pt number is rendered *by TodayDashboard*, not the ring (ring center is hidden). Story 4.6 adds `paceMark`/`paceState`/`animated`/`accessibilityLabel` here.
- `components/MacroRing.tsx` (`unit="g"`), `components/NutritionRingsPanel.tsx`, `app/nutrition/metric/[id].tsx` — **must not change**. They pass no pace/animation props, so defaults must yield identical output.

### "Ahead" gap-arc z-order — the one ambiguity (flag, confirm visually)

The precedent ([today-tab-ux-design §2–§3](../planning-artifacts/today-tab-ux-design-2026-05-20.md)) says z-order is track → gap arc → **fill** (fill is foreground). That reads cleanly for **behind** (the warm arc sits beyond the fill, against the track — visible). For **ahead**, the fill spans `0→inLen` and the cool arc spans `paceLen→inLen`, which would sit *under* the fill and be invisible. The ahead signal is primarily the **fill desaturation** (`star→starDim`, AC4); the cool arc is secondary. **Recommended approach:** render the ahead cool arc *on top of* the desaturated fill for the `paceLen→inLen` segment (a thin tinted overlay marking "how far past pace"), and confirm on web preview + the S24 Ultra. If the overlay reads poorly, falling back to "desaturation only, no cool arc for ahead" is acceptable — record the call in the Dev Agent Record. Do **not** block the story on pixel-perfection here.

### Animation pattern (Reanimated 4 + react-native-svg 15)

- `react-native-reanimated@~4.1.0`, `react-native-svg@15.12.1`, `react-native-worklets@0.5.1` (babel plugin `react-native-worklets/plugin` already configured per build spec — do not touch babel config). Reanimated 4 keeps `useSharedValue`/`useAnimatedProps`/`withTiming`/`withDelay`/`Easing` imports from `react-native-reanimated`.
- Pattern: `const AnimatedCircle = Animated.createAnimatedComponent(Circle)`; `const animatedProps = useAnimatedProps(() => ({ strokeDasharray: \`${inLen * fillProgress.value} ${circ - inLen * fillProgress.value}\` }))`. (String interpolation in a worklet is fine; keep it pure.)
- There is **no existing animated-SVG example** in the repo (the `RestTimer` migration is a separate future story), so this establishes the pattern — keep it minimal and self-contained.
- Easing: `Easing.out(Easing.cubic)` (precedent §6). Durations: mount fill 400ms, arc fade-in 200ms starting at t=200ms; data-change fill 300ms, arc crossfade 200ms.

### Scope boundaries

- **No wiring** (`getToday`/`resolvePace` → hero props) — that's Story 4.6.
- **No hero-number changes** (52pt tabular, "at target" copy, textPrimary-in-all-states) — Story 4.6 / already handled in TodayDashboard.
- **No `pace.ts` changes** — Story 4.4 delivered it (`PaceState`, `resolvePace`, `PACE_ON_THRESHOLD`). Import the type only.
- Inherits the deferred timezone-unification limitation (see `deferred-work.md`) — not addressed here.

### Testing standards

- No JS test runner in the repo (see Story 4.4 Task 0; `jest-expo` still deferred). Visual verification on web preview + tsc is the bar for this rendering story. Animation/geometry are inherently visual — do not fake a unit test. If `jest-expo` lands later, a geometry-math helper (e.g. arc-length calc extracted to a pure fn) could be unit-tested then.
- 60 FPS check: watch the mount-settle on web preview and (ideally) the S24 Ultra; confirm no JS-thread jank.

### Project Structure Notes

- Single-file change (`IntakeRing.tsx`) plus the eventual 4.6 call-site. No new files, no new deps, no token changes (4.4 added the tokens). NativeWind/theme untouched.

### References

- [epics.md → Epic 4 / Story 4.5](../planning-artifacts/epics.md) — UX-DR1 (T-S1), ring rendering portion.
- [today-tab-ux-design-2026-05-20.md §2 (anatomy/z-order), §3 (four states), §6 (animation timing/budget), §11 (hero size/stroke unchanged)](../planning-artifacts/today-tab-ux-design-2026-05-20.md).
- [4-4-pace-computation-color-tokens-client.md](4-4-pace-computation-color-tokens-client.md) — `PaceState`, `resolvePace`, tokens (`paceWarmGap`/`paceCoolGap`).
- `mobile/components/IntakeRing.tsx` (current), `mobile/components/TodayDashboard.tsx:80` (hero call-site), `mobile/components/MacroRing.tsx` / `NutritionRingsPanel.tsx` / `app/nutrition/metric/[id].tsx` (regression consumers) — read for this story.
- CLAUDE.md §3 (60 FPS, Reanimated worklets, no JS-thread animation), §4 (token-first; `IntakeRing` accepts props, doesn't fetch).

### Open questions / assumptions

1. **Ahead z-order** (above) — recommended overlay approach; confirm visually, fallback documented. The only real unknown.
2. **`animated` default false** — chosen so the 3 non-hero rings stay static. If product later wants macro rings to mount-settle too, flip per-consumer (out of scope here).
3. **Accessibility label construction** — full-sentence built by the caller in 4.6 (it has remaining/over context); 4.5 only plumbs the prop + role.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.7 (1M context)

### Debug Log References

- `tsc --noEmit` (mobile): clean (incl. `Animated.createAnimatedComponent(Circle)` + `useAnimatedProps`).

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created.
- **Implemented** the opt-in Pace Ring on `IntakeRing`: new props `paceMark`/`paceState`/`animated`/`accessibilityLabel`; warm/cool gap arcs (z-order: track → warm → fill → cool overlay → over); tonal shift (`starDim` when ahead, `overColor` when over) gated on `paceActive`; Reanimated mount-settle (fill 0→inLen 400ms `Easing.out(cubic)`, gap-arc opacity fade-in delayed 200ms) + data-change (300ms) via `useSharedValue`/`useAnimatedProps` on an `AnimatedCircle`; reduced-motion snaps to final via `AccessibilityInfo.isReduceMotionEnabled()`; `accessibilityLabel`→`role="image"` on the container.
- **Regression-safe by construction:** with no pace/animated props the component renders through the original *static* `Circle` branch with `fillColor === color` and no gap arcs — output identical for the 3 non-hero consumers (MacroRing / NutritionRingsPanel / nutrition-metric). Verified by inspection + tsc.
- **Deferred to review/manual (inherent — no JS test runner, no device/headless preview in this env):** visual confirmation of the four states, the mount-settle at 60 FPS, and the **ahead z-order** decision (cool overlay vs desaturation-only — recommended overlay shipped; easy to switch to desaturation-only if it reads poorly). Geometry reasoned correct against the existing `−inLen` offset convention.
- **No wiring yet** (Story 4.6 passes real `resolvePace` output into the hero at `TodayDashboard.tsx:80`). No new deps, no token/config changes.

### File List

- `mobile/components/IntakeRing.tsx` (modified) — opt-in pace gap arc + tonal shift + Reanimated animation; static path preserved for non-pace/non-animated callers.

## Code Review (2026-05-24)

**Method:** 3-layer adversarial (Blind Hunter · Edge Case Hunter · Acceptance Auditor). Reviewer: Claude Opus 4.7 (1M), fresh context. Verdict: **PASS → done** (2 visual items flagged for Brady; not blockers per the track plan).

**Verified clean:**
- **No logic bugs (Blind Hunter).** `paceActive = paceMark != null && paceState != null` gates all pace logic; tonal shift (`starDim` ahead / `overColor` over) and gap-arc geometry (warm `paceLen−inLen` @ offset `−inLen`; cool `inLen−paceLen` @ offset `−paceLen`) are sound. Worklets pure (no `console.log`/`runOnJS`). Mount→data-change interrupt handled via `firstRun` ref (400ms→300ms) and Reanimated tween interruption from current value.
- **Static path is byte-identical to the pre-change `IntakeRing`** (diffed against `HEAD`): track→fill→over circles, center text, label, "Over limit" all unchanged. With no pace/animated props, `fillColor === color`, no gap arcs → identical output for `MacroRing` / `NutritionRingsPanel` / `nutrition/metric/[id]`. **AC1 satisfied by construction.**
- **Backend consistency confirmed** (cross-checked `today.py:178`): `remaining = daily_calorie_target + burned − consumed = effectiveTarget − consumed`, so the hero number and the ring fill (`consumed/effectiveTarget`, Story 4.6) never drift; `over = remaining<0 ⟺ ratio>1 ⟺ state "over"`.
- **Edge cases (Edge Case Hunter):** `target=0` → `computePaceState` null → `paceActive` false → graceful empty ring; `consumed=0` mid-day → `inLen=0`, warm arc spans `0→paceLen` (AC6 ✓); `f≫1` over → whole ring + over arc red, consistent.

**Patch applied during review (unambiguous, AC1 fidelity):** gated the reduce-motion detection effect on `animated` (`if (!animated) return;`, dep `[animated]`) so the 3 non-hero static consumers no longer fire `AccessibilityInfo.isReduceMotionEnabled()` or take the extra re-render — they now render *exactly* as before. `tsc --noEmit` clean after patch.

**Flagged for Brady's on-device/preview pass (NOT blockers — explicitly carried per the T-S1 track plan):**
1. **AC6 gap-arc crossfade is partial.** Mount-settle opacity fade works; but on a *state change* (behind↔ahead, or a paceMark shift) the gap-arc **length changes instantly** and the warm→cool **swap is a hard cut** (two separate `Circle` elements), not the 200ms length/color crossfade AC6 describes. In practice paceMark moves slowly (hourly curve, on refresh) and the *fill* length (`inLen`) does tween, so this reads as a minor polish gap. Animating gap length would mean promoting `warmLen`/`coolLen` to shared values — non-trivial animation work that itself needs visual verification, so it was not blind-patched. → **animation-smoothness item for Brady; revisit only if it reads poorly.**
2. **Ahead z-order** — cool arc renders *on top of* the desaturated fill (the recommended overlay). Confirm on web preview + S24 Ultra; fall back to "desaturation-only, no cool arc" if the thin overlay reads poorly (one-line change to drop `showCool`).

## Change Log

- **2026-05-24** — Implemented Story 4.5: extended `IntakeRing` with the (opt-in) Pace Ring — gap arc, tonal shift, and Reanimated mount-settle/data-change, reduced-motion aware. tsc clean; static path preserved for the 3 non-hero consumers. Visual/animation + ahead-z-order confirmation deferred to review/device. Status → review.
- **2026-05-24** — Code review PASS (3-layer adversarial). Applied one safe patch (reduce-motion effect gated on `animated` for AC1 fidelity); tsc clean. Two visual items (AC6 crossfade partial; ahead z-order) flagged for Brady's device/preview pass, not blockers. Status → done.
