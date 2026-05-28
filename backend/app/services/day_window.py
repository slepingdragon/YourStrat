"""User-local nutrition day boundaries (e.g. reset at 2:00 AM, not UTC midnight)."""

from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

DEFAULT_TIMEZONE = "UTC"
DEFAULT_DAY_START_MINUTES = 120  # 02:00


def _clamp_day_start(minutes: int) -> int:
    return max(0, min(int(minutes), 1439))


def _zone(tz_name: str) -> ZoneInfo:
    key = (tz_name or DEFAULT_TIMEZONE).strip() or DEFAULT_TIMEZONE
    try:
        return ZoneInfo(key)
    except ZoneInfoNotFoundError:
        return ZoneInfo(DEFAULT_TIMEZONE)


def logical_local_date(
    tz_name: str,
    day_start_minutes: int = DEFAULT_DAY_START_MINUTES,
    now_utc: datetime | None = None,
) -> date:
    """Calendar date for the user's current nutrition day."""
    tz = _zone(tz_name)
    now = now_utc or datetime.now(timezone.utc)
    local = now.astimezone(tz)
    start_m = _clamp_day_start(day_start_minutes)
    local_m = local.hour * 60 + local.minute
    d = local.date()
    if local_m < start_m:
        d -= timedelta(days=1)
    return d


def day_bounds_iso(
    tz_name: str,
    day_start_minutes: int = DEFAULT_DAY_START_MINUTES,
    now_utc: datetime | None = None,
) -> tuple[str, str]:
    """
    Half-open window [start, end) in ISO for meal/session queries.
    end is exclusive (first instant of next nutrition day).
    """
    tz = _zone(tz_name)
    start_m = _clamp_day_start(day_start_minutes)
    logical = logical_local_date(tz_name, start_m, now_utc)
    hour, minute = divmod(start_m, 60)
    start_local = datetime.combine(logical, time(hour, minute), tzinfo=tz)
    end_local = start_local + timedelta(days=1)
    return start_local.isoformat(), end_local.isoformat()
