# AI food scan — accuracy strategy (internal)

## Goal

Target **~85–90% usefulness** on clear, single-plate home meals — not a certified lab analysis. Marketing and in-app copy must stay honest; do not claim "90% accurate" without caveats.

## Pipeline

1. **Prompt** (`backend/app/prompts/food_scan.py`): conservative estimates, per-item `confidence`, portion labels tied to common serving sizes, macro–calorie cross-check instructions before the model returns JSON.
2. **Post-process** (`backend/app/services/gemini.py`): clamp absurd values, align calories with `4P + 4C + 9F` within 20% (prefer lower calories when they disagree), penalize `confidence` on adjustments.
3. **User edit + save**: scan result is editable; saved values are what the journal uses.

## Validation rules (code)

| Rule | Behavior |
|------|----------|
| Macro-derived calories | `4×protein_g + 4×carbs_g + 9×fat_g` |
| Tolerance | ±20% vs stated `calories` |
| Mismatch | Set `calories = min(stated, derived)`; reduce confidence |
| Max per item | 2500 cal (clamp + confidence penalty) |
| Max macros | 250 g each; sodium 6000 mg |
| Low confidence | `< 0.7` — show warnings in app |

## Honest accuracy claims (user-facing)

- **Packaged / labeled foods:** typical error **10–25%** vs Nutrition Facts; users should verify the label when it matters.
- **Clear home meals (single plate, good light):** internal target **~85–90%** on calories/macros vs manual review in spot tests — still not a guarantee.
- **Weak cases:** mixed buffets, deep bowls, blurry photos, alcohol, sauces — expect wider error; confidence should drop.

## Model & cost

- Env `GEMINI_MODEL` (default `gemini-2.0-flash`) — keep on the cheap flash model for trial economics (`docs/TRIAL_AND_COSTS.md`).

## Measuring quality (lightweight)

- No production ML pipeline in v1.
- `GET /profile/ai-stats`: `total_scans`, `avg_confidence`, `low_confidence_count`, `scans_this_week` from `meal_items.confidence`.
- Optional manual spot checks: photograph → scan → compare to USDA or label → log in a spreadsheet (not in app).

## What we do not build (scope)

- AI meal commentary, coach personality, or gamified "accuracy scores."
- Automated ground-truth regression against a live API in CI (unit tests cover validation only).
