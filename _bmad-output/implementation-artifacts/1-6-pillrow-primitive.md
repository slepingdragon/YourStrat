# Story 1.6: `PillRow` primitive

Status: review

## Story

As a user making a few-choice selection,
I want a horizontal pill-row control,
so that onboarding and profile selects are compact (AP-10) and consistent.

> Gating decision **resolved 2026-05-24 — build `PillRow`** (not `SegmentedControl`; iOS-native baggage AP-18 would clash with the monochrome brand).

## Acceptance Criteria

1. Renders a horizontal row of pills; selected pill = `star`-filled with `bg` text; unselected = `border`-outlined with `textSecondary` text.
2. On tap → animates via the LAW-3 #1 state-flip spring and fires `Haptics.selectionAsync()`.
3. Screen reader: group = `radiogroup`; each pill = `radio` with `accessibilityState={{ selected }}`.

## Tasks / Subtasks

- [x] **Task 1 — Build the primitive** (AC: #1, #2, #3)
  - [x] `components/ui/PillRow.tsx` (generic `<T extends string>`): `options`/`value`/`onChange`/`accessibilityLabel`. Row = `View accessibilityRole="radiogroup"`; each pill = `AnimatedPressable accessibilityRole="radio" accessibilityState={{selected}}`. Exported from `components/ui/index.ts` (+ `PillOption` type).
  - [x] State-flip: a per-pill `progress` shared value `withTiming(0/1, 300ms, Easing.bezier(0.32,0.72,0,1))` drives (a) an absolute `star` **fill** opacity 0→1, (b) `borderColor` `border`→`star` via `interpolateColor`, (c) text color `textSecondary`→`bg` via `interpolateColor`. Weighted, never bouncy (NFR10). Haptic on press.
- [x] **Task 2 — Migrate real consumers** (AC: #1; CLAUDE §5 no dead primitive)
  - [x] Onboarding **Sex** (Male/Female) and **Goal** (Lose/Maintain/Gain) → `PillRow`. Tightened `goal` state to `"lose"|"maintain"|"gain"|null` (flows cleanly: `computeTargets`/`OnboardingInput` take `goal: string`) so the wiring needs **no casts**.
  - [x] **Left as `OptionCard`:** Units (long "(kg, cm)" labels) and Activity (5 options) — neither suits a single compact horizontal row. PillRow is for *short* few-choice selects per AP-10.
- [x] **Task 3 — Verify** — `tsc --noEmit` clean.

## Dev Notes

- Reuses the exact motion contract just established for the bottom-tab animation (LAW-3 bezier + `Haptics.selectionAsync`) — one consistent state-flip feel across tabs, pills, and (future) the W-C1 in-row RPE strip.
- `OptionCard` is **kept**, not replaced — the two coexist (PillRow = compact horizontal few-choice; OptionCard = full-width vertical, longer labels / more options).

### Brady visual check (gates `done`)
- Onboarding → Sex step + Goal step: pills should fill green-free `star` white on select with the weighted spring + a haptic tick. Watch **Goal's 3-pill row** for label fit ("Maintain" is the widest at `fontSize:15` in a ~⅓-width pill) — if it ever truncates on a narrow device, drop to `fontSize:14` or shorten. Confirm the fill+border+text flip reads clean (no flemish border-snap).

### Consumers migrated
- **Onboarding:** Sex + Goal → PillRow.
- **Profile edit:** Sex + Goal → PillRow (mirrors onboarding). Units (long labels) + Activity (5 options) stay `OptionCard` on both screens — PillRow is for short few-choice only (AP-10).

## File List
- `mobile/components/ui/PillRow.tsx` (**new**) — the primitive.
- `mobile/components/ui/index.ts` (modified) — export `PillRow` + `PillOption`.
- `mobile/app/(auth)/onboarding.tsx` (modified) — Sex + Goal → `PillRow`; `goal` state type tightened.
- `mobile/app/(tabs)/profile.tsx` (modified) — Sex + Goal → `PillRow`.

## Code Review (2026-05-24, self / 3-layer)
- **Blind Hunter:** generic infers `T` from `options`; `value={sex}`/`value={goal}` are `T|null` (no casts after the goal-type tightening); `onChange={setSex/setGoal}` assignable; fill `overflow:hidden`+`absoluteFill` clips to the pill radius; `pointerEvents="none"` on the fill keeps taps on the Pressable. tsc clean.
- **Edge Case Hunter:** `value=null` → all pills unselected (correct initial onboarding state); rapid taps interrupt `withTiming` cleanly from current value; a deselect (value leaves a pill) animates back to outline.
- **Acceptance Auditor:** AC1 (star fill / border outline / correct text colors) ✓; AC2 (LAW-3 state-flip + selection haptic) ✓; AC3 (radiogroup + radio + selected state) ✓.

## Change Log
- **2026-05-24** — Built `PillRow` (LAW-3 state-flip fill/border/text + selection haptic, radiogroup a11y); migrated onboarding Sex + Goal; tightened `goal` type (no casts). tsc clean; self-reviewed. Status → review (Brady visual gates `done`; profile-select migration is a noted follow-up).
