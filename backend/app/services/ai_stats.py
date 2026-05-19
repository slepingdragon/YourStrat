from datetime import datetime, timedelta, timezone

from app.services.gemini import LOW_CONFIDENCE_THRESHOLD

ACCURACY_NOTE = (
    "Typical error 10–25% vs Nutrition Facts labels; best for clear photos of home-cooked meals. "
    "Not a lab test—verify packaged foods on the label when accuracy matters."
)


def _week_start_utc(now: datetime) -> datetime:
    """Monday 00:00 UTC for the current week."""
    weekday = now.weekday()
    start = (now - timedelta(days=weekday)).replace(hour=0, minute=0, second=0, microsecond=0)
    return start


def fetch_ai_stats(sb, user_id: str) -> dict:
    meals_res = (
        sb.table("meals")
        .select("id, scanned_at")
        .eq("user_id", user_id)
        .order("scanned_at", desc=True)
        .execute()
    )
    meals = meals_res.data or []
    total_scans = len(meals)
    week_start = _week_start_utc(datetime.now(timezone.utc))
    scans_this_week = sum(
        1
        for m in meals
        if m.get("scanned_at") and datetime.fromisoformat(m["scanned_at"].replace("Z", "+00:00")) >= week_start
    )

    if not meals:
        return {
            "total_scans": 0,
            "scans_this_week": 0,
            "avg_confidence": None,
            "low_confidence_count": 0,
            "accuracy_note": ACCURACY_NOTE,
        }

    meal_ids = [m["id"] for m in meals]
    confidences: list[float] = []
    low_confidence_count = 0

    chunk = 80
    for i in range(0, len(meal_ids), chunk):
        batch = meal_ids[i : i + chunk]
        items_res = sb.table("meal_items").select("confidence").in_("meal_id", batch).execute()
        for row in items_res.data or []:
            c = row.get("confidence")
            if c is None:
                continue
            val = float(c)
            confidences.append(val)
            if val < LOW_CONFIDENCE_THRESHOLD:
                low_confidence_count += 1

    avg_confidence = round(sum(confidences) / len(confidences), 2) if confidences else None

    return {
        "total_scans": total_scans,
        "scans_this_week": scans_this_week,
        "avg_confidence": avg_confidence,
        "low_confidence_count": low_confidence_count,
        "accuracy_note": ACCURACY_NOTE,
    }
