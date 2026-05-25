"""Pure nutrition derivations (no I/O) — unit-tested independently of Supabase."""

from __future__ import annotations


def compute_vs_avg_kcal(prior_kcals_recent_first: list[int], today_kcal: int) -> int | None:
    """Today's calories minus the recent daily average (UX-DR39, Story 6.2).

    The average is taken over up to the 7 most-recent **prior** days that have
    logged calories (``> 0``); ``prior_kcals_recent_first`` must already exclude
    today and be ordered most-recent first.

    Returns ``None`` (no comparison) when today has nothing logged yet
    (``today_kcal <= 0``) or there is no prior day with data — so the hero pill
    stays hidden instead of showing a misleading large negative on a fresh day.
    """
    prior = [k for k in prior_kcals_recent_first if k > 0][:7]
    if today_kcal <= 0 or not prior:
        return None
    return round(today_kcal - sum(prior) / len(prior))
