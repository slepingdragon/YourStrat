DEFAULT_MET = {"strength": 5.0, "cardio": 8.0, "mobility": 2.5}


def calories_burned(met: float, weight_kg: float, duration_sec: int) -> int:
    duration_min = duration_sec / 60.0
    return round(met * weight_kg * (duration_min / 60.0))


def met_for_type(exercise_type: str, override: float | None = None) -> float:
    if override is not None:
        return float(override)
    return DEFAULT_MET.get(exercise_type, 5.0)
