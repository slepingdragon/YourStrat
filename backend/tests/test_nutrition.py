from app.services.nutrition import compute_vs_avg_kcal


def test_vs_avg_today_above_recent_norm():
    # avg of [2000, 2200, 1800] = 2000; today 2212 -> +212
    assert compute_vs_avg_kcal([2000, 2200, 1800], 2212) == 212


def test_vs_avg_today_below_recent_norm():
    assert compute_vs_avg_kcal([2000, 2000], 1800) == -200


def test_vs_avg_none_when_today_empty():
    assert compute_vs_avg_kcal([2000, 2100], 0) is None


def test_vs_avg_none_when_no_prior_data():
    # prior days all zero (no logged calories) -> no comparison
    assert compute_vs_avg_kcal([0, 0, 0], 1900) is None
    assert compute_vs_avg_kcal([], 1900) is None


def test_vs_avg_ignores_zero_prior_days():
    # zeros are dropped before averaging: avg of [2000] = 2000
    assert compute_vs_avg_kcal([0, 2000, 0], 2100) == 100


def test_vs_avg_window_caps_at_seven_most_recent():
    # 8 recent-first values; only the first 7 (all 2000) count -> avg 2000.
    # The trailing 100 would drag the avg down if it were included.
    assert compute_vs_avg_kcal([2000] * 7 + [100], 2000) == 0


def test_vs_avg_rounds_to_int():
    # avg of [2000, 2001] = 2000.5; today 2000 -> round(-0.5) -> 0 (banker's)
    assert isinstance(compute_vs_avg_kcal([2000, 2001], 2300), int)
