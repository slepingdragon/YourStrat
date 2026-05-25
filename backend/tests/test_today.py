from datetime import date, datetime, timezone
from unittest.mock import MagicMock

from app.services import today as today_service


class _MockQuery:
    def __init__(self, data):
        self._data = data

    def select(self, *_a, **_k):
        return self

    def eq(self, *_a, **_k):
        return self

    def gte(self, *_a, **_k):
        return self

    def lte(self, *_a, **_k):
        return self

    def order(self, *_a, **_k):
        return self

    def in_(self, *_a, **_k):
        return self

    def is_(self, *_a, **_k):
        return self

    def limit(self, *_a, **_k):
        return self

    def execute(self):
        res = MagicMock()
        res.data = self._data
        return res


class _MockSupabase:
    def __init__(self, tables: dict[str, list[dict]]):
        self._tables = tables

    def table(self, name: str):
        return _MockQuery(self._tables.get(name, []))


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def test_fetch_workout_state_returns_active_and_completed():
    sessions = [
        {
            "id": "s-active",
            "routine_id": "r-1",
            "started_at": _now_iso(),
            "ended_at": None,
            "duration_sec": None,
            "calories_burned": 0,
        },
        {
            "id": "s-done",
            "routine_id": "r-2",
            "started_at": _now_iso(),
            "ended_at": _now_iso(),
            "duration_sec": 1800,
            "calories_burned": 240,
        },
    ]
    routines = [
        {"id": "r-1", "name": "Push day"},
        {"id": "r-2", "name": "Mobility"},
    ]
    sb = _MockSupabase({"sessions": sessions, "routines": routines})

    burned, active, completed = today_service._fetch_workout_state(sb, "u-1", "s", "e")

    assert burned == 240
    assert active is not None
    assert active.id == "s-active"
    assert active.routine_name == "Push day"
    assert completed is not None
    assert completed.id == "s-done"
    assert completed.routine_name == "Mobility"
    assert completed.calories_burned == 240


def test_fetch_workout_state_handles_no_sessions():
    sb = _MockSupabase({"sessions": [], "routines": []})
    burned, active, completed = today_service._fetch_workout_state(sb, "u-1", "s", "e")
    assert burned == 0
    assert active is None
    assert completed is None


def test_fetch_workout_state_handles_session_without_routine():
    sessions = [
        {
            "id": "s-1",
            "routine_id": None,
            "started_at": _now_iso(),
            "ended_at": _now_iso(),
            "duration_sec": 600,
            "calories_burned": 80,
        }
    ]
    sb = _MockSupabase({"sessions": sessions, "routines": []})
    burned, active, completed = today_service._fetch_workout_state(sb, "u-1", "s", "e")
    assert burned == 80
    assert active is None
    assert completed is not None
    assert completed.routine_id is None
    assert completed.routine_name is None


# --- Story 5.5: GET /sessions/active (fetch_active_session) -------------------


def test_fetch_active_session_returns_unfinished_with_routine_name():
    sessions = [
        {
            "id": "s-active",
            "routine_id": "r-1",
            "started_at": _now_iso(),
            "planned_rpe": 7,
            "ended_at": None,
        }
    ]
    routines = [{"id": "r-1", "name": "Push day"}]
    sb = _MockSupabase({"sessions": sessions, "routines": routines})

    active = today_service.fetch_active_session(sb, "u-1")

    assert active is not None
    assert active.id == "s-active"
    assert active.routine_id == "r-1"
    assert active.routine_name == "Push day"
    assert active.planned_rpe == 7


def test_fetch_active_session_none_when_no_sessions():
    sb = _MockSupabase({"sessions": [], "routines": []})
    assert today_service.fetch_active_session(sb, "u-1") is None


def test_fetch_active_session_none_when_only_finished():
    # Mock ignores the DB `.is_("ended_at","null")` filter, so the Python guard
    # is what keeps a finished session from leaking through.
    sessions = [
        {
            "id": "s-done",
            "routine_id": "r-1",
            "started_at": _now_iso(),
            "planned_rpe": None,
            "ended_at": _now_iso(),
        }
    ]
    sb = _MockSupabase({"sessions": sessions, "routines": [{"id": "r-1", "name": "Push day"}]})
    assert today_service.fetch_active_session(sb, "u-1") is None


def test_fetch_active_session_without_routine():
    sessions = [
        {
            "id": "s-active",
            "routine_id": None,
            "started_at": _now_iso(),
            "planned_rpe": None,
            "ended_at": None,
        }
    ]
    sb = _MockSupabase({"sessions": sessions, "routines": []})

    active = today_service.fetch_active_session(sb, "u-1")

    assert active is not None
    assert active.id == "s-active"
    assert active.routine_id is None
    assert active.routine_name is None


def test_scheduled_routine_today_returns_first_by_created_at():
    routine_days = [{"routine_id": "r-a"}, {"routine_id": "r-b"}]
    routines = [{"id": "r-a", "name": "Pull day", "created_at": "2026-01-01T00:00:00Z"}]
    sb = _MockSupabase({"routine_days": routine_days, "routines": routines})

    result = today_service._scheduled_routine_today(sb, "u-1")
    assert result is not None
    assert result.id == "r-a"
    assert result.name == "Pull day"


def test_scheduled_routine_today_none_when_no_schedule():
    sb = _MockSupabase({"routine_days": [], "routines": []})
    assert today_service._scheduled_routine_today(sb, "u-1") is None


def test_scheduled_routine_today_none_when_schedule_belongs_to_other_user():
    routine_days = [{"routine_id": "r-other"}]
    routines: list[dict] = []
    sb = _MockSupabase({"routine_days": routine_days, "routines": routines})
    assert today_service._scheduled_routine_today(sb, "u-1") is None


# --- Story 4.3: pace_position -------------------------------------------------

_PROFILE_ROW = {
    "id": "u-1",
    "units": "metric",
    "weight_kg": 80,
    "height_cm": 180,
    "age": 30,
    "sex": "male",
    "activity_level": "moderate",
    "goal": "maintain",
    "daily_calorie_target": 2400,
    "daily_protein_target_g": 180,
    "daily_carbs_target_g": 240,
    "daily_fat_target_g": 80,
}


def test_compute_pace_position_pre_window_is_zero():
    # 5am is before the 7am eating window -> flat 0.0
    assert today_service.compute_pace_position(5.0, 2400) == 0.0


def test_compute_pace_position_midday_is_about_half():
    # 1pm anchor is exactly 0.50 in the curve
    assert abs(today_service.compute_pace_position(13.0, 2400) - 0.50) < 0.05


def test_compute_pace_position_evening_anchor():
    # 6pm anchor is 0.75
    assert abs(today_service.compute_pace_position(18.0, 2400) - 0.75) < 0.05


def test_compute_pace_position_late_is_one():
    # 11pm is at/after the final anchor -> 1.0
    assert today_service.compute_pace_position(23.0, 2400) == 1.0


def test_compute_pace_position_interpolates_between_anchors():
    # halfway between 12 (0.40) and 13 (0.50) -> ~0.45
    assert abs(today_service.compute_pace_position(12.5, 2400) - 0.45) < 0.02


def test_compute_pace_position_none_when_no_target():
    assert today_service.compute_pace_position(13.0, 0) is None
    assert today_service.compute_pace_position(13.0, None) is None


def test_local_hour_from_offset_applies_minutes_east():
    # 17:00 UTC, offset -300 (UTC-5) -> local 12:00
    now = datetime(2026, 1, 1, 17, 0, tzinfo=timezone.utc)
    assert today_service._local_hour_from_offset(-300, now) == 12.0


def test_local_hour_from_offset_clamps_absurd_values():
    # An out-of-range offset is clamped to the real-world max (+840), not used raw.
    now = datetime(2026, 1, 1, 12, 0, tzinfo=timezone.utc)
    assert today_service._local_hour_from_offset(999999, now) == today_service._local_hour_from_offset(840, now)
    assert today_service._local_hour_from_offset(-999999, now) == today_service._local_hour_from_offset(-720, now)


def test_fetch_today_pace_position_none_without_offset():
    sb = _MockSupabase({"meals": [], "sessions": [], "routine_days": [], "routines": []})
    snap = today_service.fetch_today(sb, "u-1", _PROFILE_ROW, None, tz_offset_minutes=None)
    assert snap.pace_position is None


def test_fetch_today_pace_position_present_with_offset():
    sb = _MockSupabase({"meals": [], "sessions": [], "routine_days": [], "routines": []})
    snap = today_service.fetch_today(sb, "u-1", _PROFILE_ROW, None, tz_offset_minutes=0)
    assert snap.pace_position is not None
    assert 0.0 <= snap.pace_position <= 1.0
