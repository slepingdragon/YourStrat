from app.services.targets import bmr, compute_targets, daily_calories


def test_bmr_male():
    assert bmr("male", 80, 180, 30) == 10 * 80 + 6.25 * 180 - 5 * 30 + 5


def test_bmr_female():
    assert bmr("female", 60, 165, 25) == 10 * 60 + 6.25 * 165 - 5 * 25 - 161


def test_daily_calories_lose_goal():
    cal = daily_calories("male", 80, 180, 30, "moderate", "lose")
    assert cal < daily_calories("male", 80, 180, 30, "moderate", "maintain")


def test_compute_targets_macro_split():
    t = compute_targets("female", 65, 170, 28, "light", "maintain")
    assert t["daily_calorie_target"] > 0
    assert t["daily_protein_target_g"] > 0
    assert t["daily_carbs_target_g"] > 0
    assert t["daily_fat_target_g"] > 0
