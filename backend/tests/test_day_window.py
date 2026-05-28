from datetime import datetime, timezone

from app.services.day_window import day_bounds_iso, logical_local_date


def test_logical_date_before_day_start_counts_as_previous_day():
    # 2026-05-27 01:30 UTC+0 with 02:00 reset -> nutrition day is May 26
    now = datetime(2026, 5, 27, 1, 30, tzinfo=timezone.utc)
    assert logical_local_date("UTC", 120, now) == datetime(2026, 5, 26).date()


def test_logical_date_after_day_start_is_same_calendar_day():
    # 2026-05-27 19:00 UTC with 02:00 reset -> still May 27 (not rolled to May 28)
    now = datetime(2026, 5, 27, 19, 0, tzinfo=timezone.utc)
    assert logical_local_date("UTC", 120, now) == datetime(2026, 5, 27).date()


def test_day_bounds_half_open_24h():
    now = datetime(2026, 5, 27, 15, 0, tzinfo=timezone.utc)
    start, end = day_bounds_iso("UTC", 120, now)
    assert start < end
    assert "2026-05-27" in start
