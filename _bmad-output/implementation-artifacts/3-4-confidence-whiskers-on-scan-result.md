# Story 3.4: Confidence whiskers on scan result (UX-DR25, UX-DR38, NFR12)

Status: review

## Story

As a user evaluating an AI estimate,
I want to see the model's uncertainty visually,
so that I know which numbers to trust without reading a disclaimer.

Adds per-macro uncertainty whiskers to the scan-result macros, derived from the existing per-item `confidence`. **The Gemini call / structured-output schema / prompt are left 100% untouched** — `confidence_range` is derived server-side, so the working scan pipeline carries zero new failure modes.

## Acceptance Criteria

1. **Backend returns `confidence_range` + types synced (NFR4).** The scan response includes a per-item `confidence_range`; `schemas.py` (new `ScanResult`/`ScanItemOut`) and the `api.ts` `MealItem` type land in the same change.
2. **Whiskers (UX-DR25/38).** The P/C/F macros show a 1pt whisker tick proportional to the range (narrow=confident, wide=uncertain, **hidden when no data**).
3. **Low-confidence warning (AC3).** A low-confidence item (<0.7) surfaces a calm warning — **already present** (meal-level banner + per-item note); preserved, no alarm/precision claim.
4. **A11y (AC4).** The macro group exposes an `accessibilityHint` reading the estimated ranges aloud.

## Design decisions (don't-break-the-scan)

- **`confidence_range` is DERIVED, not model-estimated:** `round(min(0.35, (1 − confidence) × 0.6), 2)` — a ± fractional band per item (confident → ~0 → no whisker; uncertain → wider, capped 0.35). Avoids asking Gemini for uncalibrated ranges and keeps `_ScanItemSchema`/prompt unchanged. Computed in `gemini.py` normalization where the final `confidence` is set.
- **Scan-only field, not on `MealItemInput`:** the save path inserts `{**item}` into `meal_items`, which has no `confidence_range` column — adding it to `MealItemInput` would break saving. So it lives on a new `ScanItemOut`/`ScanResult` (the scan response contract); the FE may carry it but `MealCreate` (save) ignores the extra field.
- **Whisker = per-item band applied per macro:** each P/C/F macro draws a tick whose height ∝ the band (visualizes the item's uncertainty consistently); a11y hint reads per-macro low–high grams.

## Tasks / Subtasks

- [x] **Task 1 — Derive + expose** (AC: #1) — `gemini.py` `_confidence_range` + item field; `schemas.py` `ScanItemOut(MealItemInput)+confidence_range` & `ScanResult`; `POST /meals/scan` `response_model=ScanResult`; `api.ts` `MealItem.confidence_range?`; `mealNutrition.normalizeMealItem` preserves it.
- [x] **Task 2 — Whiskers + a11y** (AC: #2, #4) — `FoodItemNutritionCard`: whisker tick on P/C/F StatLines (hidden when range null/0); macro group `accessibilityHint` reading low–high grams.
- [x] **Task 3 — Verify** (AC: all) — `tsc --noEmit` clean; `py_compile` clean. (AC3 warning already shipped.)

## Dev Notes
- No new dep/token. Gemini model call unchanged (only normalization adds a derived field). Save/DB untouched (`confidence_range` not in `MealItemInput`). Couldn't runtime-test the scan here (no Gemini key); `response_model=ScanResult` is safe because `_normalize_scan_item` is total and `ScanItemOut` mirrors its exact shape.

### References
- [epics.md → Epic 3 / Story 3.4](../planning-artifacts/epics.md) (lines 708–730), UX-DR25/38, NFR12/NFR4.
- `backend/app/services/gemini.py`, `backend/app/models/schemas.py`, `backend/app/routers/meals.py` (`/scan`), `mobile/lib/api.ts`, `mobile/lib/mealNutrition.ts`, `mobile/components/FoodItemNutritionCard.tsx`, `mobile/app/scan-result.tsx` (existing low-confidence banner).

## Dev Agent Record
### Agent Model Used
Claude Opus 4.7 (1M context)
### Completion Notes List
- Gemini call/`_ScanItemSchema`/prompt **untouched**; `_confidence_range(confidence) = round(min(0.35, (1−c)×0.6), 2)` added in `_validate_item_macros` (1.0→0, 0.7→0.18, 0.4→0.35). New `ScanItemOut(MealItemInput)+confidence_range` / `ScanResult`; `/scan` now `response_model=ScanResult`. `api.ts` `MealItem.confidence_range?` + `normalizeMealItem` preserves it through the param round-trip. `FoodItemNutritionCard`: P/C/F StatLines get a 1pt whisker (height ∝ band, hidden at 0); macro group `accessibilityHint` reads per-macro low–high grams. AC3 low-confidence banner/note were already present.
- **Verified (no Gemini key needed):** mobile `tsc` clean; `py_compile` clean; **`pytest tests/test_food_scan_validation.py tests/test_nutrition.py` = 12/12** (gemini change didn't regress validation); ad-hoc check confirmed `ScanResult` accepts real normalized items + empty (response_model is safe — `_normalize_scan_item` is total). **Scan runtime itself still needs Brady's device pass** (no key here), but the pipeline logic is unchanged.
### ⚠️ Brady checklist (gates `done`)
1. **Scan still works** (most important): take a photo → result screen populates as before. (The pipeline is unchanged; only a derived field was added.)
2. Macros show small whisker ticks — short/none on confident items, taller on uncertain ones; none when there's no confidence.
3. Low-confidence (<70%) still shows the calm banner + per-item note.
4. VoiceOver on a macro row reads the estimated range.
### File List
- `backend/app/services/gemini.py` (modified — derived `confidence_range`)
- `backend/app/models/schemas.py` (modified — `ScanItemOut`/`ScanResult`)
- `backend/app/routers/meals.py` (modified — `/scan` `response_model`)
- `mobile/lib/api.ts` (modified — `MealItem.confidence_range`)
- `mobile/lib/mealNutrition.ts` (modified — preserve field)
- `mobile/components/FoodItemNutritionCard.tsx` (modified — whiskers + a11y)

## Change Log
- **2026-05-25** — Drafted + implemented (autonomous; derived-range design to keep the scan pipeline untouched). Status → review.
