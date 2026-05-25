# Story 6.3: Nutrition surface rework (heatmap + scroll-spy)

Status: review

## Story

As a user,
I want the trends as one strip and history as one scroll,
so that I drop the date picker and view toggles (UX-DR21).

Reworks the Nutrition tab: a single calorie **heatmap strip** for weekly trends (N-S1) and a virtualized **month-as-long-scroll** of 64pt day rows with a sticky date chip (N-S2). Builds on the 6.4 hero (kept at top).

## Acceptance Criteria

1. **Heatmap strip (N-S1).** Weekly trends render as a single ~80pt strip of 7 vertical bars — **height = kcal vs target**, **color = macro adherence** — replacing the per-nutrient trend-row list.
2. **Month scroll (N-S2).** History is a single long scroll of **64pt day rows** (date · hero kcal · macro tri-bar) with a **sticky header chip showing the visible date/month**, replacing the horizontal day-chip strip. Rows **virtualize** (FlatList) — also satisfies 6.1's ≥10-row AC.
3. **No toggles (N-E1).** No Today/Week/Month toggle / date picker (already absent — preserved).
4. **Premium/theme/60fps.** Tokens only; fixed-height rows (`getItemLayout`); the day list is the root `FlatList` (header = hero/strip/score) so it's truly virtualized (no `FlatList`-in-`ScrollView`). `tsc` clean.

## Scope decision (ambiguous "proceed" — documented)

6.3 as written *replaces* the per-nutrient trends. I interpreted "proceed" as: **replace** the per-nutrient `NutrientTrendRow` list → the calorie heatmap (per-nutrient detail still reachable via the existing `/nutrition/metric/[id]` drill-down), and **replace** the `NutritionPastDays` chip strip → the 64pt month scroll. I **kept** the 6.4 hero, `ScoreStrip` (stats summary), and `BurnTrendRow` (workout burn) — they aren't redundant with the calorie heatmap. Brady can ask to strip those too for the maximal-calm version.

## Tasks / Subtasks

- [x] **Task 1 — `CalorieHeatmapStrip`** (AC: #1) — new `components/nutrition/CalorieHeatmapStrip.tsx`: 7 bars, height = `min(1.15, kcal/target)`, color = macro adherence (mean P/C/F proximity → success / neutral / dim; calm, no red/amber alarm), day-of-week labels, today emphasized.
- [x] **Task 2 — `NutritionDayRow`** (AC: #2) — new `components/nutrition/NutritionDayRow.tsx`: fixed 64pt row (date · tabular kcal · thin P/C/F tri-bar), `onPress(date)`.
- [x] **Task 3 — Restructure to FlatList** (AC: #2, #4) — `NutritionTrendsView`: root `FlatList` of day rows; `ListHeaderComponent` = TrialBanner + hero + TRENDS + ScoreStrip + heatmap + BurnTrendRow + HISTORY label; sticky month chip via `onViewableItemsChanged`; `getItemLayout`; RefreshControl. Drops `NutrientTrendRow` list + `NutritionPastDays` from this view.
- [x] **Task 4 — Verify** — `tsc --noEmit` clean.

## Dev Notes
- Reuse `getMetricTarget`/`getMetricValueFromTotals`, `Sparkline`/hero, color tokens. New files spec-named (N-S1/N-S2). No new dep/token; no backend change.
- **v1 limits:** macro adherence = mean proximity of P/C/F to target (not calorie-weighted); sticky chip shows the topmost visible row's month; per-nutrient trends move to drill-down (metric/[id]).

### References
- [epics.md → Epic 6 / Story 6.3](../planning-artifacts/epics.md) (lines 1206–1220), UX-DR21, N-S1/N-S2/N-E1.
- `components/nutrition/NutritionTrendsView.tsx`, `lib/todayMetrics.ts`, `lib/nutritionTargets.ts`.

## Dev Agent Record
### Agent Model Used
Claude Opus 4.7 (1M context)
### Completion Notes List
- `CalorieHeatmapStrip` (new): 7 bars, height `min(1.15, kcal/target)`, color = `macroAdherence` (mean P/C/F proximity → `success` ≥0.8 / `starDim` ≥0.55 / `textMuted` — calm, no red/amber), today bar `star`-bordered, DOW labels.
- `NutritionDayRow` (new): fixed 64pt row (date · tabular kcal · thin P/C/F tri-bar), memoized, tap → `/nutrition/day/[date]`.
- `NutritionTrendsView` restructured to a root `FlatList` of `pastDays` with `ListHeaderComponent` = TrialBanner + hero + ScoreStrip + "This week" heatmap + Workouts/BurnTrendRow + "History"; sticky month chip via ref'd `onViewableItemsChanged`; `!targets`/`!loaded` keep their own ScrollView branches.
- **Two review fixes:** memoized `targets` (was a new object each render → broke the heatmap memo while the chip updates state on scroll); **removed `getItemLayout`** (wrong offsets under a tall variable header, and no `scrollToIndex` uses it — FlatList still virtualizes).
- **Orphaned by this rework (left in place, flagged):** `components/nutrition/NutrientTrendRow.tsx` + `components/NutritionPastDays.tsx` are no longer imported anywhere. Left intact (no delete-in-passing); safe to remove in a follow-up. Per-nutrient trends remain reachable via the `/nutrition/metric/[id]` drill-down.
- `tsc --noEmit` clean.
### ⚠️ Brady checklist (gates `done`)
1. Nutrition tab: "This week" shows the 7-bar heatmap (bar height = calories, green = macros on-point, grey = off); today's bar is outlined.
2. "History" is a smooth scroll of 64pt day rows (date · kcal · tri-bar); tap → day detail; a month chip appears top-center as you scroll and tracks the visible month.
3. Long history (≥10 days) scrolls smoothly (virtualized); no jank, no blank gaps.
4. Confirm you're OK losing the per-nutrient trend rows + chip strip from the tab (per-nutrient detail still opens via a metric drill-down) — or tell me to restore them / also drop ScoreStrip+BurnTrendRow.
### File List
- `mobile/components/nutrition/CalorieHeatmapStrip.tsx` (**new**)
- `mobile/components/nutrition/NutritionDayRow.tsx` (**new**)
- `mobile/components/nutrition/NutritionTrendsView.tsx` (modified — FlatList restructure)

## Change Log
- **2026-05-25** — Drafted + implemented (autonomous, replace-interpretation of "proceed"). Status → review.
