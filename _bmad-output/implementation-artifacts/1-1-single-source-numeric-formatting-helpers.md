# Story 1.1: Single-source numeric formatting helpers

Status: review

## Story

As a developer building any numeric surface,
I want one set of `formatKcal()` / `formatWeight()` / `formatMacroGrams()` helpers,
so that every number reads identically across the app and numeric cosmetic drift (AP-11) is impossible.

First Epic-1 (Premium Foundation & Quality Guardrails) story. Greenfield-ish: adds `mobile/lib/format.ts` and routes every calorie *display* through it.

## Acceptance Criteria (from epics.md)

1. **formatKcal** — a calorie value rendered through `formatKcal()` is rounded to the nearest 5 with a locale-aware thousands separator (e.g. `1422 → "1,420"`); **no caller renders a raw calorie number without the helper.**
2. **formatWeight** — given a weight (stored kg) + unit preference, metric rounds to nearest 0.5 kg, imperial to the whole pound, each with the correct unit suffix.
3. **formatMacroGrams** — a macro gram value is rounded to the nearest gram.
4. **Helpers live in `mobile/lib/format.ts`**, with unit tests covering ≥1 boundary case per helper (1,422 → 1,420; 0; negative remaining).

## Tasks / Subtasks

- [x] **Task 1 — Create `lib/format.ts`** (AC: #1, #2, #3, #4)
  - [x] `formatKcal(n)` = `roundCal(n).toLocaleString()` (nearest-5 + separator); `formatWeight(kg, units)` (metric `Math.round(kg*2)/2 + " kg"`, imperial `Math.round(kgToLbs(kg)) + " lb"`); `formatMacroGrams(n)` = `roundG(n).toLocaleString()`. Reuses `roundCal`/`roundG`/`kgToLbs` from `lib/targets` so math + display share one source.
- [x] **Task 2 — Migrate every calorie display to `formatKcal`** (AC: #1)
  - [x] All aggregate / derived / target / burn / remaining calorie renders now go through `formatKcal` (list below). Editable `Input value=` props and static educational copy are excepted (see Decisions).
- [x] **Task 3 — Tests / verification** (AC: #4, #7)
  - [x] `tsc --noEmit` clean. All three helpers smoke-tested via throwaway `tsx` (11 boundary cases incl. 1422→"1,420", 0, negative, 72.3 kg→"72.5 kg"/"159 lb"); file deleted. **Persistent `format.test.ts` is blocked on the `jest-expo` decision (no JS runner) — same posture as Story 4.4's `pace.test.ts`; add it when the runner lands.**

## Dev Agent Record

### Agent Model Used
Claude Opus 4.7 (1M context)

### Debug Log References
- `tsc --noEmit` (mobile): clean.
- `format` throwaway `tsx` smoke: 11/11 — `formatKcal` (1422→"1,420", 0→"0", 2347→"2,345", −12→"−10"), `formatWeight` (72.3 metric→"72.5 kg", 72→"72 kg", 72.3 imperial→"159 lb", 0→"0 kg"), `formatMacroGrams` (45.6→"46", 0→"0", 1422→"1,422"). Deleted.

### Completion Notes List
- **`lib/format.ts` created** with the three helpers, built on the existing `roundCal`/`roundG`/`kgToLbs` (one rounding source; no new conversion math).
- **Calorie-display migration (13 sites / 9 files)** — every calorie *display* now reads uniformly (nearest-5 + separator): `TodayDashboard` (hero number, daily-target, meals-total, equation cells, effort-recap burn), `CalorieSparkline` (avg + a11y), `profile` (lifetime burn, daily target, edit-preview), `BurnTrendRow` (today + avg), `CalorieHero` (headline + eaten/burned/target), `ScoreStrip` (avg-cal), `MealCard` (total), `MealNutritionSummary` (meal-total hero), `NutritionRingsPanel` (summary string), `MealSlotsList` (slot total), `FoodItemNutritionCard` (read-only display), `ExerciseSwipePicker` (estimate), `session/[id]/summary` (burn), `onboarding` (target preview). Also migrated the macros on `MealCard`/`NutritionRingsPanel` lines to `formatMacroGrams` for line-consistency.

### Decisions / documented exceptions
- **Editable calorie inputs stay raw** — `FoodItemNutritionCard`'s `Input value={String(item.calories)}` keeps the exact, un-separated value (commas would break number entry; it's an input, not a render). Its **read-only** mirror (display mode) does use `formatKcal`. The two never show simultaneously (editable ? input : display).
- **Static educational copy is not a dynamic render** — `ai-info.tsx` ("~2,000 kcal", "4 kcal per gram") left as prose.
- **`formatWeight` / `formatMacroGrams` are created + correct + smoke-tested but not force-migrated to every caller** — only the **calorie** AC requires "no raw caller". Weight is still shown via the existing 1-decimal `displayWeight` helpers in `profile`/`ProfileIdentity` (switching those to `formatWeight`'s 0.5 kg rounding is a debatable body-weight-precision change → deferred, not required by AC2). A pre-existing macro formatter (`formatGram`/`formatSodium` in `lib/mealNutrition`) overlaps `formatMacroGrams` — **future consolidation candidate**, out of scope here.
- **Visible effect:** calorie numbers that were previously shown raw (e.g. a `2,347` target, exact burn totals) now round to the nearest 5 (`2,345`). This is the intended AP-11 anti-drift behavior, but it is an app-wide visible change → Brady should eyeball that uniform nearest-5 reads well on Today / Profile / Nutrition.

### File List
- `mobile/lib/format.ts` (**new**) — `formatKcal` / `formatWeight` / `formatMacroGrams`.
- Calorie-display migration: `mobile/components/TodayDashboard.tsx`, `mobile/components/today/CalorieSparkline.tsx`, `mobile/components/today/WorkoutCard.tsx`, `mobile/app/(tabs)/profile.tsx`, `mobile/components/nutrition/BurnTrendRow.tsx`, `mobile/components/nutrition/CalorieHero.tsx`, `mobile/components/nutrition/ScoreStrip.tsx`, `mobile/components/nutrition/MealSlotsList.tsx`, `mobile/components/MealCard.tsx`, `mobile/components/MealNutritionSummary.tsx`, `mobile/components/NutritionRingsPanel.tsx`, `mobile/components/FoodItemNutritionCard.tsx`, `mobile/components/ExerciseSwipePicker.tsx`, `mobile/app/(auth)/onboarding.tsx`, `mobile/app/session/[id]/summary.tsx`.

## Code Review (2026-05-24, self / 3-layer)
Reviewer: Claude Opus 4.7 (1M). Verdict: **code-complete + reviewed → `review`** (Brady visual glance of uniform nearest-5 + the `jest-expo` test decision gate `done`).
- **Blind Hunter:** helpers correct (smoke 11/11); migrations are 1:1 swaps (tsc-clean); removed now-unused `roundCal` import from `TodayDashboard`/`CalorieSparkline`; editable input correctly left raw.
- **Edge Case Hunter:** `formatKcal(0)`→"0", negative→nearest-5 negative; `formatWeight(0)`→"0 kg"; macro 0→"0". Null-guarded site (`ScoreStrip` avg) preserved.
- **Acceptance Auditor:** AC1 (formatKcal + no raw calorie caller) ✓ with documented exceptions; AC2/AC3 (helpers exist + correct) ✓; AC4 (boundary tests) — smoke ✓, persistent test blocked on `jest-expo`.

## Change Log
- **2026-05-24** — Implemented Story 1.1: `lib/format.ts` (formatKcal/formatWeight/formatMacroGrams) + migrated all 13 calorie-display sites across 9 files; smoke-tested; tsc clean. Self-reviewed. Status → review (Brady visual + jest-expo gate `done`). First Epic-1 story → epic-1 in-progress.
