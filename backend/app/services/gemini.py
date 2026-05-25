import json
import math
from typing import TypedDict

import google.generativeai as genai

from app.config import settings
from app.prompts.food_scan import FOOD_SCAN_PROMPT

genai.configure(api_key=settings.GEMINI_API_KEY)


# Structured Outputs (Cal-AI approach): a hard response schema the model is
# constrained to, so the scan always returns clean, parseable, schema-shaped
# JSON instead of free-form text. The normalization below still runs as
# defense-in-depth (clamps absurd values, aligns calories↔macros).
class _ScanItemSchema(TypedDict):
    name: str
    portion: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    sugar_g: float
    sodium_mg: int
    confidence: float


class _ScanResultSchema(TypedDict):
    items: list[_ScanItemSchema]

LOW_CONFIDENCE_THRESHOLD = 0.7
MAX_ITEM_CALORIES = 2500
MAX_MACRO_G = 250.0
MAX_SODIUM_MG = 6000
MACRO_CAL_TOLERANCE = 0.20
CONFIDENCE_PENALTY_CLAMP = 0.12
CONFIDENCE_PENALTY_MACRO = 0.15
CONFIDENCE_PENALTY_ABSURD = 0.25


def macro_derived_calories(protein_g: float, carbs_g: float, fat_g: float) -> float:
    return 4.0 * protein_g + 4.0 * carbs_g + 9.0 * fat_g


def _clamp_confidence(value: float | None, default: float = 0.55) -> float:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return default
    return max(0.0, min(1.0, float(value)))


def _round_macro(value: float) -> float:
    return round(max(0.0, value), 1)


def _penalize_confidence(confidence: float, amount: float) -> float:
    return max(0.05, confidence - amount)


def _confidence_range(confidence: float) -> float:
    """Derived ± fractional band for the scan-result whiskers (Story 3.4).

    Confident (→1.0) collapses to ~0 (no whisker); lower confidence widens it,
    capped at 0.35. Derived from `confidence` rather than asked of the model, so
    the structured-output schema/prompt stay untouched."""
    return round(min(0.35, max(0.0, (1.0 - confidence) * 0.6)), 2)


def _validate_item_macros(item: dict) -> dict:
    """Clamp absurd values and align calories with macros; reduce confidence when adjusted."""
    confidence = _clamp_confidence(item.get("confidence"))
    protein = _round_macro(float(item.get("protein_g") or 0))
    carbs = _round_macro(float(item.get("carbs_g") or 0))
    fat = _round_macro(float(item.get("fat_g") or 0))
    fiber = _round_macro(float(item.get("fiber_g") or 0))
    sugar = _round_macro(float(item.get("sugar_g") or 0))
    calories = max(0, int(float(item.get("calories") or 0)))
    sodium = max(0, int(float(item.get("sodium_mg") or 0)))

    adjusted = False

    if protein > MAX_MACRO_G:
        protein = MAX_MACRO_G
        adjusted = True
    if carbs > MAX_MACRO_G:
        carbs = MAX_MACRO_G
        adjusted = True
    if fat > MAX_MACRO_G:
        fat = MAX_MACRO_G
        adjusted = True
    if sodium > MAX_SODIUM_MG:
        sodium = MAX_SODIUM_MG
        adjusted = True

    # Sugar is a subset of carbs — it can never exceed total carbs.
    if sugar > carbs:
        carbs = sugar
        adjusted = True

    clamped_absurd_calories = False
    if calories > MAX_ITEM_CALORIES:
        calories = MAX_ITEM_CALORIES
        confidence = _penalize_confidence(confidence, CONFIDENCE_PENALTY_ABSURD)
        adjusted = True
        clamped_absurd_calories = True

    derived = macro_derived_calories(protein, carbs, fat)
    if not clamped_absurd_calories and derived > 0 and calories > 0:
        ratio = calories / derived
        low = 1.0 - MACRO_CAL_TOLERANCE
        high = 1.0 + MACRO_CAL_TOLERANCE
        if ratio < low or ratio > high:
            # Conservative: prefer the lower credible energy estimate.
            calories = int(min(calories, derived))
            confidence = _penalize_confidence(confidence, CONFIDENCE_PENALTY_MACRO)
            adjusted = True
    elif derived > 0 and calories == 0:
        calories = int(derived * 0.95)
        confidence = _penalize_confidence(confidence, CONFIDENCE_PENALTY_MACRO)
        adjusted = True

    if adjusted and confidence >= LOW_CONFIDENCE_THRESHOLD:
        confidence = min(confidence, LOW_CONFIDENCE_THRESHOLD - 0.01)

    item.update(
        {
            "protein_g": protein,
            "carbs_g": carbs,
            "fat_g": fat,
            "fiber_g": fiber,
            "sugar_g": sugar,
            "calories": calories,
            "sodium_mg": sodium,
            "confidence": round(confidence, 2),
            "confidence_range": _confidence_range(confidence),
        }
    )
    return item


def _normalize_scan_item(raw: dict) -> dict:
    item = {
        "name": str(raw.get("name") or "Food").strip()[:120] or "Food",
        "portion": str(raw["portion"]).strip()[:80] if raw.get("portion") else None,
        "calories": max(0, int(float(raw.get("calories") or 0))),
        "protein_g": max(0.0, float(raw.get("protein_g") or 0)),
        "carbs_g": max(0.0, float(raw.get("carbs_g") or 0)),
        "fat_g": max(0.0, float(raw.get("fat_g") or 0)),
        "fiber_g": max(0.0, float(raw.get("fiber_g") or 0)),
        "sugar_g": max(0.0, float(raw.get("sugar_g") or 0)),
        "sodium_mg": max(0, int(float(raw.get("sodium_mg") or 0))),
        "confidence": _clamp_confidence(
            float(raw["confidence"]) if raw.get("confidence") is not None else None
        ),
    }
    return _validate_item_macros(item)


def _normalize_scan_result(data: dict) -> dict:
    items = data.get("items") if isinstance(data, dict) else None
    if not isinstance(items, list):
        return {"items": []}
    out = []
    for raw in items:
        if isinstance(raw, dict):
            out.append(_normalize_scan_item(raw))
    return {"items": out}


async def scan_food(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    # Default gemini-2.0-flash: ~1k tokens/scan × 10 scans/day ≈ see docs/TRIAL_AND_COSTS.md
    model = genai.GenerativeModel(settings.GEMINI_MODEL)
    response = model.generate_content(
        [FOOD_SCAN_PROMPT, {"mime_type": mime_type, "data": image_bytes}],
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=_ScanResultSchema,
            temperature=0,  # deterministic: same photo -> same answer; biases to most-likely (accurate) recall
        ),
    )
    try:
        data = json.loads(response.text)
    except (json.JSONDecodeError, ValueError, TypeError):
        return {"items": []}
    return _normalize_scan_result(data)
