# Story 6.1: Nutrition history & 7-day trend

Status: review

## Story

As a user,
I want to see my nutrition history and recent trend,
so that I understand my week without analysis (FR20).

Met across the existing Nutrition surface + the 6.4 hero + the 6.3 rework (no standalone work needed beyond those — recorded here for traceability).

## Acceptance Criteria → status

1. **Per-day totals + 7-day trend, RLS-scoped.** ✅ `GET /meals/journal` (RLS via the user's bearer) feeds the 64pt day rows (per-day totals, Story 6.3) + the "This week" heatmap + the hero's 7-day sparkline.
2. **No history → tabular "0" + calm caption, no apology.** ✅ Delivered by the 6.4 `NutritionHero`: empty today shows tabular **"0"** + **"of {target} — eat something."** (N-E2 / AP-6), no illustration.
3. **Day rows ≥10 virtualize.** ✅ The 6.3 restructure makes the day list a root `FlatList` (virtualized), replacing the prior horizontal chip strip / `.map`.

## Notes
- No code unique to 6.1 — it's the sum of the existing journal endpoint + 6.4 (empty hero) + 6.3 (virtualized day rows + heatmap). Flipped to `review` alongside 6.3 so the device pass covers all three together.

### References
- [epics.md → Epic 6 / Story 6.1](../planning-artifacts/epics.md) (lines 1170–1188), FR20, N-E2, AP-6.
- See `6-2`, `6-3`, `6-4` stories. Files: `components/nutrition/{NutritionHero,CalorieHeatmapStrip,NutritionDayRow,NutritionTrendsView}.tsx`, `backend/app/routers/meals.py`.

## Change Log
- **2026-05-25** — Recorded as satisfied by the existing surface + 6.4 + 6.3. Status → review (device pass shared with 6.3).
