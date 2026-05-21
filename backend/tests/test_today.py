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
