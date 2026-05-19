from app.services import gemini


def test_macro_derived_calories():
    assert gemini.macro_derived_calories(25, 30, 10) == 310.0


def test_validate_item_macros_aligns_high_calories_conservatively():
    item = {
        "name": "Chicken",
        "portion": "6 oz",
        "calories": 800,
        "protein_g": 40,
        "carbs_g": 0,
        "fat_g": 5,
        "fiber_g": 0,
        "sugar_g": 0,
        "sodium_mg": 100,
        "confidence": 0.9,
    }
    out = gemini._validate_item_macros(item)
    derived = gemini.macro_derived_calories(40, 0, 5)
    assert out["calories"] <= 800
    assert out["calories"] <= derived + 1
    assert out["confidence"] < 0.9


def test_validate_item_macros_clamps_absurd_calories():
    item = {
        "name": "Mystery",
        "portion": "1 plate",
        "calories": 9000,
        "protein_g": 10,
        "carbs_g": 10,
        "fat_g": 10,
        "fiber_g": 0,
        "sugar_g": 0,
        "sodium_mg": 0,
        "confidence": 0.85,
    }
    out = gemini._validate_item_macros(item)
    assert out["calories"] == gemini.MAX_ITEM_CALORIES
    assert out["confidence"] < 0.85


def test_normalize_scan_result_applies_validation():
    data = {
        "items": [
            {
                "name": "Salad",
                "portion": "1 bowl",
                "calories": 320,
                "protein_g": 12,
                "carbs_g": 20,
                "fat_g": 8,
                "confidence": 0.8,
            },
        ]
    }
    out = gemini._normalize_scan_result(data)
    assert len(out["items"]) == 1
    item = out["items"][0]
    assert item["fiber_g"] == 0.0
    assert item["sodium_mg"] == 0
    assert 0 <= item["confidence"] <= 1


def test_low_confidence_after_macro_mismatch():
    item = {
        "name": "Pasta",
        "portion": "2 cups",
        "calories": 900,
        "protein_g": 15,
        "carbs_g": 40,
        "fat_g": 5,
        "fiber_g": 2,
        "sugar_g": 3,
        "sodium_mg": 400,
        "confidence": 0.95,
    }
    out = gemini._validate_item_macros(item)
    assert out["calories"] < 900
    assert out["confidence"] < 0.95
