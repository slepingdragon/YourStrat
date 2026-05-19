from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app.services import trial


def _profile(ends_offset_days: int) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "trial_started_at": (now - timedelta(days=7 - ends_offset_days)).isoformat(),
        "trial_ends_at": (now + timedelta(days=ends_offset_days)).isoformat(),
    }


def test_is_trial_active_when_not_expired():
    assert trial.is_trial_active(_profile(3)) is True


def test_is_trial_active_when_expired():
    now = datetime.now(timezone.utc)
    row = {"trial_ends_at": (now - timedelta(days=1)).isoformat()}
    assert trial.is_trial_active(row) is False


def test_days_remaining_counts_partial_days():
    row = _profile(2)
    assert trial.days_remaining(row) >= 2


def test_days_remaining_zero_when_expired():
    now = datetime.now(timezone.utc)
    row = {"trial_ends_at": (now - timedelta(hours=1)).isoformat()}
    assert trial.days_remaining(row) == 0


def test_check_scan_allowed_raises_403_when_trial_ended():
    sb = MagicMock()
    now = datetime.now(timezone.utc)
    profile = {"trial_ends_at": (now - timedelta(days=1)).isoformat()}
    with pytest.raises(HTTPException) as exc:
        trial.check_scan_allowed(sb, "user-1", profile)
    assert exc.value.status_code == 403


def test_check_scan_allowed_raises_429_at_limit(monkeypatch):
    sb = MagicMock()
    profile = _profile(5)
    monkeypatch.setattr(trial.settings, "DAILY_SCAN_LIMIT", 10)
    monkeypatch.setattr(trial, "get_scans_today", lambda _sb, _uid: 10)
    with pytest.raises(HTTPException) as exc:
        trial.check_scan_allowed(sb, "user-1", profile)
    assert exc.value.status_code == 429


def test_check_scan_allowed_passes_under_limit(monkeypatch):
    sb = MagicMock()
    profile = _profile(5)
    monkeypatch.setattr(trial.settings, "DAILY_SCAN_LIMIT", 10)
    monkeypatch.setattr(trial, "get_scans_today", lambda _sb, _uid: 3)
    trial.check_scan_allowed(sb, "user-1", profile)
