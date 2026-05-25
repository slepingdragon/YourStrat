# Story 6.4: Hero composite, magnified macros & vs-avg pill (N-C1, N-M1, N-A1)

Status: review

## Story

As a user,
I want a strong hero with relative context,
so that the surface answers "how's today vs usual" instantly (UX-DR22, 23, 24).

Adds a hero to the top of the Nutrition tab (`NutritionTrendsView`) consuming Story 6.2's `vs_avg_kcal`. **Additive** — the existing trend rows / score strip / past days stay below (the larger 6.3 consolidation that *replaces* them is deferred — see note).

## Acceptance Criteria

1. **Hero on the sparkline (N-C1).** Today's kcal at **72pt tabular** sits over the 7-day calorie sparkline (its negative space).
2. **Magnified macros (N-M1).** P/C/F render as **32pt tabular columns** (gram value + label, macro-colored).
3. **vs-avg pill (N-A1).** When `vs_avg_kcal` is present, a small pill shows "+212 vs 7-day avg" (signed); hidden when null.
4. **Premium/theme.** Tokens only; `tabular-nums`; `allowFontScaling={false}` on the big number; reuses the existing `Sparkline`.
5. **Empty (folds in 6.1 N-E2).** With nothing logged today the hero shows tabular **"0"** with the calm caption **"of {target} — eat something."** — no illustration, no apology.
6. **Verification.** `tsc --noEmit` clean; visual/hierarchy is Brady's device pass.

## Design decisions

- The hero is **additive at the top** of the existing Nutrition tab, not a replacement. Data is already computed in `NutritionTrendsView` (`todayDay.totals`, `window7` calorie values, `targets`); I add capture of the journal's `vs_avg_kcal`.
- **6.1 status:** the tab already shows per-day totals (`NutritionPastDays`) + a 7-day trend (`NutrientTrendRow`s) RLS-scoped, so 6.1's first AC is already met; this story adds its **empty-state hero copy** (N-E2). 6.1's "virtualize ≥10 rows" is noted as a separate follow-up (past days are bounded to the ≤30-day journal window, rendered via map today — not an infinite feed).
- **6.3 deferred (needs Brady's call):** 6.3 *replaces* the per-nutrient trend rows + score strip with a single calorie heatmap strip and a month-long day scroll. That **removes existing working features** from the tab — a product decision, so it's left for confirmation rather than done blind. (The tab already has no Today/Week/Month toggle, so N-E1 is effectively already satisfied.)

## Tasks / Subtasks

- [x] **Task 1 — `NutritionHero`** (AC: #1–#5) — new `components/nutrition/NutritionHero.tsx`: faint 7-day `Sparkline` backdrop + 72pt today-kcal + "eaten today"/empty caption + signed vs-avg pill + 32pt P/C/F columns.
- [x] **Task 2 — Wire + capture vs_avg** (AC: #1, #3) — `NutritionTrendsView` stores `vsAvgKcal` from the journal and renders `<NutritionHero/>` above the TRENDS header.
- [x] **Task 3 — Verify** — `tsc --noEmit` clean.

## Dev Notes
- Reuse `Sparkline`, `formatKcal`/`formatMacroGrams`, `protein`/`carbs`/`fat` color tokens. No new dep/token; no backend change (6.2 shipped the field).

### References
- [epics.md → Epic 6 / Story 6.4](../planning-artifacts/epics.md) (lines 1222–1236) + 6.1 (1170–1188), UX-DR22/23/24/39, N-C1/N-M1/N-A1/N-E2.
- `components/nutrition/NutritionTrendsView.tsx`, `components/nutrition/Sparkline.tsx`, `lib/api.ts` (`NutritionJournal.vs_avg_kcal`), `lib/nutritionTargets.ts`.

## Dev Agent Record
### Agent Model Used
Claude Opus 4.7 (1M context)
### Completion Notes List
- `NutritionHero` (new): faint 7-day `Sparkline` backdrop (opacity 0.4, `starDim`) + 72pt tabular today-kcal (`allowFontScaling={false}`, red when over target) + caption/pill row + 32pt P/C/F columns (macro-colored). Empty today → "0" + "of {target} — eat something." (6.1 N-E2); pill hidden when `vsAvgKcal` null.
- `NutritionTrendsView`: captures `vs_avg_kcal` from the journal into state; renders the hero between `TrialBanner` and the TRENDS header, gated `targets && journalLoaded` (loading still shows the skeleton). Existing trends/score/past-days untouched below.
- `tsc --noEmit` clean. No backend change (6.2 shipped the field); tokens only.
### ⚠️ Brady checklist (gates `done`)
1. Nutrition tab: big 72pt today-kcal over a faint sparkline; "+N vs 7-day avg" pill once 2+ prior days have data; fresh day shows "0 — of {target}, eat something." (no pill).
2. P/C/F columns read at 32pt, macro-colored; over-target turns the number red.
3. Sanity: hero today-kcal matches the calorie trend row below.
### File List
- `mobile/components/nutrition/NutritionHero.tsx` (**new**)
- `mobile/components/nutrition/NutritionTrendsView.tsx` (modified)

## Change Log
- **2026-05-25** — Drafted + implemented (autonomous). Status → review.
