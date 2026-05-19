from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

from fastapi import HTTPException

from app.config import settings

TRIAL_DAYS = 7


def _parse_ts(value: str | datetime | None) -> datetime | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    text = str(value).replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(text)
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def is_trial_active(profile_row: dict) -> bool:
    ends = _parse_ts(profile_row.get("trial_ends_at"))
    if ends is None:
        return False
    return datetime.now(timezone.utc) < ends


def days_remaining(profile_row: dict) -> int:
    ends = _parse_ts(profile_row.get("trial_ends_at"))
    if ends is None:
        return 0
    delta = ends - datetime.now(timezone.utc)
    if delta.total_seconds() <= 0:
        return 0
    return max(0, delta.days + (1 if delta.seconds > 0 else 0))


def trial_window_iso() -> tuple[str, str]:
    now = datetime.now(timezone.utc)
    return now.isoformat(), (now + timedelta(days=TRIAL_DAYS)).isoformat()


def get_scans_today(sb, user_id: str) -> int:
    try:
        today = date.today().isoformat()
        res = (
            sb.table("daily_scan_counts")
            .select("count")
            .eq("user_id", user_id)
            .eq("scan_date", today)
            .maybe_single()
            .execute()
        )
        if not res.data:
            return 0
        return int(res.data.get("count") or 0)
    except Exception:
        return 0


def increment_scan_count(sb, user_id: str) -> int:
    today = date.today().isoformat()
    current = get_scans_today(sb, user_id)
    new_count = current + 1
    sb.table("daily_scan_counts").upsert(
        {"user_id": user_id, "scan_date": today, "count": new_count},
        on_conflict="user_id,scan_date",
    ).execute()
    return new_count


def build_trial_status(sb, user_id: str, profile_row: dict) -> dict:
    limit = settings.DAILY_SCAN_LIMIT
    scans_today = get_scans_today(sb, user_id)
    active = is_trial_active(profile_row)
    return {
        "trial_active": active,
        "days_remaining": days_remaining(profile_row) if active else 0,
        "scans_today": scans_today,
        "scans_limit": limit,
    }


def check_scan_allowed(sb, user_id: str, profile_row: dict) -> None:
    if not is_trial_active(profile_row):
        raise HTTPException(
            status_code=403,
            detail="Your 7-day trial has ended. Full access is coming soon — contact us if you need help.",
        )
    limit = settings.DAILY_SCAN_LIMIT
    scans_today = get_scans_today(sb, user_id)
    if scans_today >= limit:
        raise HTTPException(
            status_code=429,
            detail=f"Daily scan limit reached ({limit} per day during your trial). Try again tomorrow.",
        )
