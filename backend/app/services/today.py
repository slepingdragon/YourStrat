from datetime import date, datetime, time, timezone

from supabase import Client

from app.models.schemas import MealOut, MealItemOut, Profile, TodaySnapshot, TrialStatus
from app.services.trial import build_trial_status


def _today_bounds() -> tuple[str, str]:
    today = date.today()
    start = datetime.combine(today, time.min, tzinfo=timezone.utc).isoformat()
    end = datetime.combine(today, time.max, tzinfo=timezone.utc).isoformat()
    return start, end


def _round_cal(n: float) -> int:
    return int(round(n / 5) * 5)


def _round_g(n: float) -> int:
    return int(round(n))


def build_callouts(profile: Profile, consumed: dict) -> list[str]:
    callouts: list[str] = []
    protein_short = profile.daily_protein_target_g - consumed["protein_g"]
    if protein_short >= 1:
        callouts.append(f"You're {_round_g(protein_short)}g protein short.")
    carbs_over = consumed["carbs_g"] - profile.daily_carbs_target_g
    if carbs_over >= 1:
        callouts.append(f"You're {_round_g(carbs_over)}g over on carbs.")
    fat_over = consumed["fat_g"] - profile.daily_fat_target_g
    if fat_over >= 1:
        callouts.append(f"You're {_round_g(fat_over)}g over on fat.")
    sugar_over = consumed["sugar_g"] - 50
    if sugar_over >= 1:
        callouts.append(f"You're {_round_g(sugar_over)}g over on sugar.")
    sodium_over = consumed["sodium_mg"] - 2300
    if sodium_over >= 1:
        callouts.append(f"You're {_round_g(sodium_over)}mg over on sodium.")
    return callouts


def _profile_from_row(sb: Client, user_id: str, row: dict) -> Profile:
    trial = TrialStatus(**build_trial_status(sb, user_id, row))
    return Profile(
        id=str(row["id"]),
        units=row["units"],
        weight_kg=float(row["weight_kg"]),
        height_cm=float(row["height_cm"]),
        age=int(row["age"]),
        sex=row["sex"],
        activity_level=row["activity_level"],
        goal=row["goal"],
        daily_calorie_target=int(row["daily_calorie_target"]),
        daily_protein_target_g=int(row["daily_protein_target_g"]),
        daily_carbs_target_g=int(row["daily_carbs_target_g"]),
        daily_fat_target_g=int(row["daily_fat_target_g"]),
        trial=trial,
    )


def fetch_today(sb: Client, user_id: str, profile_row: dict) -> TodaySnapshot:
    profile = _profile_from_row(sb, user_id, profile_row)
    start, end = _today_bounds()

    meals_res = (
        sb.table("meals")
        .select("*")
        .eq("user_id", user_id)
        .gte("scanned_at", start)
        .lte("scanned_at", end)
        .order("scanned_at", desc=True)
        .execute()
    )
    meals_data = meals_res.data or []

    consumed = {
        "calories": 0,
        "protein_g": 0.0,
        "carbs_g": 0.0,
        "fat_g": 0.0,
        "fiber_g": 0.0,
        "sugar_g": 0.0,
        "sodium_mg": 0,
    }
    meals_out: list[MealOut] = []

    for m in meals_data:
        items_res = sb.table("meal_items").select("*").eq("meal_id", m["id"]).execute()
        items = [MealItemOut(id=i["id"], **{k: i[k] for k in i if k != "id" and k != "meal_id"}) for i in (items_res.data or [])]
        meals_out.append(
            MealOut(
                id=m["id"],
                photo_url=m.get("photo_url"),
                scanned_at=m["scanned_at"],
                total_calories=m["total_calories"],
                total_protein_g=float(m["total_protein_g"]),
                total_carbs_g=float(m["total_carbs_g"]),
                total_fat_g=float(m["total_fat_g"]),
                total_fiber_g=float(m["total_fiber_g"]),
                total_sugar_g=float(m["total_sugar_g"]),
                total_sodium_mg=m["total_sodium_mg"],
                items=items,
            )
        )
        consumed["calories"] += m["total_calories"]
        consumed["protein_g"] += float(m["total_protein_g"])
        consumed["carbs_g"] += float(m["total_carbs_g"])
        consumed["fat_g"] += float(m["total_fat_g"])
        consumed["fiber_g"] += float(m["total_fiber_g"])
        consumed["sugar_g"] += float(m["total_sugar_g"])
        consumed["sodium_mg"] += m["total_sodium_mg"]

    sessions_res = (
        sb.table("sessions")
        .select("calories_burned")
        .eq("user_id", user_id)
        .gte("started_at", start)
        .lte("started_at", end)
        .execute()
    )
    burned = sum(s.get("calories_burned", 0) for s in (sessions_res.data or []))

    remaining = profile.daily_calorie_target + burned - consumed["calories"]
    net = consumed["calories"] - burned

    return TodaySnapshot(
        targets=profile,
        consumed_calories=consumed["calories"],
        consumed_protein_g=consumed["protein_g"],
        consumed_carbs_g=consumed["carbs_g"],
        consumed_fat_g=consumed["fat_g"],
        consumed_fiber_g=consumed["fiber_g"],
        consumed_sugar_g=consumed["sugar_g"],
        consumed_sodium_mg=consumed["sodium_mg"],
        burned_calories=burned,
        remaining_calories=_round_cal(remaining),
        net_calories=net,
        callouts=build_callouts(profile, consumed),
        meals=meals_out,
    )
