# Story 6.2: vs-average derived field

Status: review

## Story

As the Nutrition hero,
I want a "vs 7-day average" value,
so that today gets relative context without a chart (UX-DR39).

Backend-first story: adds a derived `vs_avg_kcal` to the nutrition snapshot and syncs the TS type (NFR4). Unblocks 6.4's "+N vs 7-day avg" pill.

## Acceptance Criteria

1. **Derived field.** The nutrition API (`GET /meals/journal`, the snapshot the Nutrition surface consumes) returns a derived `vs_avg_kcal` = today's kcal minus the recent daily average.
2. **Schema + type together (NFR4).** `schemas.py` (`NutritionJournal.vs_avg_kcal`) and the `api.ts` `NutritionJournal` type land in the same change.

## Design decisions

- **Definition:** `vs_avg_kcal = round(today_kcal − mean(up to 7 most-recent prior days with calories > 0))`. Today is **excluded** from the average (it's "today vs your recent norm"). **`null`** when today has nothing logged yet (`today_kcal == 0`) or there's no prior day with data — so the pill stays hidden rather than showing a misleading "−2,400 vs avg" on a fresh day.
- **Pure + tested:** the math lives in `app/services/nutrition.py::compute_vs_avg_kcal(prior_kcals_recent_first, today_kcal)` (no Supabase) and is unit-tested; the router just feeds it the per-day totals. ("today" = the journal's `date.today()` UTC-day key, consistent with the existing journal grouping — the known pace-vs-meals tz seam is unchanged here.)

## Tasks / Subtasks

- [x] **Task 1 — Pure helper + test** (AC: #1) — `app/services/nutrition.py` `compute_vs_avg_kcal`; `tests/test_nutrition.py` covers normal, no-prior, empty-today, <7 days, >7-day window.
- [x] **Task 2 — Schema + endpoint** (AC: #1, #2) — `NutritionJournal.vs_avg_kcal: int | None = None`; `meals_journal` computes prior-day kcals (recent first, today excluded) → helper → response.
- [x] **Task 3 — TS type** (AC: #2) — `api.ts` `NutritionJournal` gains `vs_avg_kcal: number | null`.

## Dev Notes
- No new dep. Backend pure-core tested; the `cd mobile && npx tsc --noEmit` bar covers the type. (No venv here — `test_nutrition.py` runs in CI / on Brady's backend env; full suite has a pre-existing `pytest-asyncio` gap on the gemini test only.)
- Consumer (the pill) is **Story 6.4** — this story is the contract; the field is additive/back-compatible (`null` default) so nothing breaks before 6.4 lands.

### References
- [epics.md → Epic 6 / Story 6.2](../planning-artifacts/epics.md) (lines 1190–1204), UX-DR39, NFR4.
- `backend/app/routers/meals.py` (`meals_journal`), `backend/app/models/schemas.py` (`NutritionJournal`), `mobile/lib/api.ts` (`NutritionJournal`).

## Dev Agent Record
### Agent Model Used
Claude Opus 4.7 (1M context)
### Completion Notes List
- Pure `compute_vs_avg_kcal(prior_kcals_recent_first, today_kcal)` in `app/services/nutrition.py`; `meals_journal` feeds it `[totals.calories for each prior day, recent-first]` + today's kcal and returns `vs_avg_kcal` on `NutritionJournal`. Schema field + `api.ts` type landed together (NFR4). Additive/back-compat (`null` default) — safe before 6.4 consumes it.
- **`tests/test_nutrition.py` — 7/7 pass** (`python -m pytest`, runnable without the Supabase/FastAPI stack): normal +212, below-norm −200, none-when-empty-today, none-when-no-prior, zero-days-ignored, 7-day window cap, int rounding. (The `asyncio_mode` warning is the unrelated pre-existing `pytest-asyncio` gap.) `mobile npx tsc --noEmit` clean; `py_compile` clean on all changed backend files.
### File List
- `backend/app/services/nutrition.py` (**new**)
- `backend/tests/test_nutrition.py` (**new**)
- `backend/app/routers/meals.py` (modified)
- `backend/app/models/schemas.py` (modified)
- `mobile/lib/api.ts` (modified)

## Change Log
- **2026-05-25** — Drafted + implemented (autonomous). Status → review.
