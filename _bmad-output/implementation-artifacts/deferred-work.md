# Deferred Work

Items surfaced during reviews that are real but intentionally not actioned in their originating story.

## Deferred from: code review of 4-3-backend-pace-position (2026-05-24)

- **Pace vs. consumed time-basis mismatch (timezone unification).** `pace_position` is computed from the user's *local* hour (via the `tz_offset_minutes` query param), but `_today_bounds()` sums consumed calories/meals over the **UTC** calendar day. For users far from UTC viewing near UTC midnight, the pace ring (local day) and the consumed total (UTC day) can reference *different days*, producing an inconsistent Today reading.
  - **Why deferred:** the UTC-day meal window predates Story 4.3 and was explicitly out of scope (Story 4.3 AC7 preserves existing field behavior; Dev Notes forbid repurposing the offset for `_today_bounds()`).
  - **Fix shape:** an app-wide timezone-unification story that makes `_today_bounds()` — and meal/session day-keying — local-offset-aware across the whole Today snapshot (and likely the nutrition history day-keying too).
  - **Source:** Edge Case Hunter (High), corroborated by Blind Hunter (day-boundary note).
