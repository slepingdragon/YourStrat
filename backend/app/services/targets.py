ACTIVITY = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9,
}
GOAL_DELTA = {"lose": -500, "maintain": 0, "gain": 300}


def bmr(sex: str, weight_kg: float, height_cm: float, age: int) -> float:
    base = 10 * weight_kg + 6.25 * height_cm - 5 * age
    return base + (5 if sex == "male" else -161)


def daily_calories(sex: str, weight_kg: float, height_cm: float, age: int, activity_level: str, goal: str) -> int:
    tdee = bmr(sex, weight_kg, height_cm, age) * ACTIVITY[activity_level]
    return round(tdee + GOAL_DELTA[goal])


def macro_targets(daily_cal: int) -> dict[str, int]:
    protein_g = round((daily_cal * 0.30) / 4)
    carbs_g = round((daily_cal * 0.40) / 4)
    fat_g = round((daily_cal * 0.30) / 9)
    return {
        "daily_calorie_target": daily_cal,
        "daily_protein_target_g": protein_g,
        "daily_carbs_target_g": carbs_g,
        "daily_fat_target_g": fat_g,
    }


def compute_targets(
    sex: str,
    weight_kg: float,
    height_cm: float,
    age: int,
    activity_level: str,
    goal: str,
) -> dict[str, int]:
    cal = daily_calories(sex, weight_kg, height_cm, age, activity_level, goal)
    return macro_targets(cal)
