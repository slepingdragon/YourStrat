import os
from datetime import date

os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "test-key")

from app.routers import meals


def test_build_daily_totals_fills_missing_days():
    start = date(2026, 5, 20)
    rows = [
        {
            "scanned_at": "2026-05-20T08:10:00+00:00",
            "total_calories": 400,
            "total_protein_g": 30,
            "total_carbs_g": 40,
            "total_fat_g": 10,
            "total_fiber_g": 4,
            "total_sugar_g": 8,
            "total_sodium_mg": 320,
        },
        {
            "scanned_at": "2026-05-22T12:00:00+00:00",
            "total_calories": 600,
            "total_protein_g": 25,
            "total_carbs_g": 70,
            "total_fat_g": 20,
            "total_fiber_g": 6,
            "total_sugar_g": 16,
            "total_sodium_mg": 510,
        },
    ]

    out = meals._build_daily_totals(rows, start, 4)

    assert [item.date for item in out] == ["2026-05-20", "2026-05-21", "2026-05-22", "2026-05-23"]
    assert out[0].totals.calories == 400
    assert out[1].totals.calories == 0
    assert out[2].totals.calories == 600
    assert out[3].totals.calories == 0


def test_build_daily_totals_sums_multiple_meals_same_day():
    start = date(2026, 5, 20)
    rows = [
        {
            "scanned_at": "2026-05-20T08:00:00+00:00",
            "total_calories": 200,
            "total_protein_g": 10,
            "total_carbs_g": 20,
            "total_fat_g": 8,
            "total_fiber_g": 2,
            "total_sugar_g": 4,
            "total_sodium_mg": 100,
        },
        {
            "scanned_at": "2026-05-20T18:00:00+00:00",
            "total_calories": 500,
            "total_protein_g": 30,
            "total_carbs_g": 55,
            "total_fat_g": 16,
            "total_fiber_g": 5,
            "total_sugar_g": 11,
            "total_sodium_mg": 420,
        },
    ]

    out = meals._build_daily_totals(rows, start, 1)
    totals = out[0].totals
    assert totals.calories == 700
    assert totals.protein_g == 40
    assert totals.carbs_g == 75
    assert totals.fat_g == 24
    assert totals.fiber_g == 7
    assert totals.sugar_g == 15
    assert totals.sodium_mg == 520
