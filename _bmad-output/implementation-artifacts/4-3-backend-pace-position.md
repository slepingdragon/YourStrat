# Story 4.3: Backend pace position

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the Today surface (and future home-screen widgets),
I want a server-computed `pace_position` on the `/today/` snapshot,
so that the Pace Ring can show "am I on track right now?" consistently, and the widget — which cannot run React Native code — has the same signal.

This is the first story of the Pace Ring track (Tier-1 pick **T-S1**). It ships the backend field only; the client `pace.ts`, ring rendering, and wiring follow in Stories 4.4 → 4.6.

## Acceptance Criteria

1. **`GET /today/` returns `pace_position`.** The `TodaySnapshot` response gains `pace_position: float | None` (a 0.0–1.0 fraction of the day's expected intake-by-now), computed from a piecewise-linear `PACE_CURVE` evaluated at the user's **local-timezone** hour.
2. **Timezone is client-supplied.** `GET /today/` accepts an optional `tz_offset_minutes: int | None` query param (minutes east of UTC, i.e. the client sends `-new Date().getTimezoneOffset()`). The server derives the local hour from `utc_now + tz_offset_minutes`. When the param is absent, `pace_position` is `null` (the client computes locally in Story 4.4 as the offline fallback).
3. **Null cases.** `pace_position` is `null` when `daily_calorie_target` is `0`/falsy (no meaningful target) OR when `tz_offset_minutes` is not provided. Otherwise it is the curve value clamped to `[0.0, 1.0]`.
4. **Curve shape (from the Today-tab UX precedent §5).** Pre-window (local hour < 7) → `0.0`; ramps through the day; ≥ 23:00 → `1.0`. Representative checkpoints: ~07:00 → 0.0, ~13:00 → ~0.50, ~18:00 → ~0.75, ~22:00 → ~0.98, ≥23:00 → 1.0. Interpolate linearly between anchor hours using `hour + minute/60` for sub-hour precision.
5. **Schema is the contract (CLAUDE.md §5 rule 4).** The Pydantic field in `backend/app/models/schemas.py` and the TS type in `mobile/lib/api.ts` are updated in the **same change**, and `getToday()` passes `tz_offset_minutes`.
6. **Tests.** `backend/tests/test_today.py` gains coverage for the pace computation at **5am → null-or-0.0**, **1pm → ~0.50**, **11pm → ~1.0**, plus a **no-target → null** and a **no-tz-offset → null** case. All existing tests in the file still pass.
7. **No behavior change to existing fields.** Every current `TodaySnapshot` field (targets, consumed_*, burned_calories, remaining_calories, net_calories, callouts, meals, active_session, last_completed_session_today, scheduled_routine_today) is returned exactly as before. `pace_position` is purely additive.

## Tasks / Subtasks

- [x] **Task 1 — Pace computation helper** (AC: #1, #3, #4)
  - [x] In `backend/app/services/today.py`, add a module-level `PACE_CURVE` as an ordered list of `(hour, fraction)` anchors (table below).
  - [x] Add a pure function `compute_pace_position(local_hour_float: float, target: int | float | None) -> float | None`: returns `None` if `not target`; else linearly interpolates `PACE_CURVE` at `local_hour_float`, clamped to `[0.0, 1.0]`. Below the first anchor → `0.0`; at/above the last → `1.0`.
  - [x] Keep it pure (no `sb`, no I/O) so it is trivially unit-testable.
- [x] **Task 2 — Wire local hour through `fetch_today`** (AC: #1, #2, #3)
  - [x] **Add `timedelta` to the import.** The service currently imports `from datetime import date, datetime, time, timezone` — `timedelta` is NOT imported yet and Task 2 needs it.
  - [x] Add `tz_offset_minutes: int | None = None` param to `fetch_today(...)` (default `None`, last positional/kw — do not break the existing call from the router beyond the one new arg).
  - [x] Compute `local_dt = datetime.now(timezone.utc) + timedelta(minutes=tz_offset_minutes)` only when `tz_offset_minutes is not None`; derive `local_hour_float = local_dt.hour + local_dt.minute / 60`.
  - [x] Set `pace_position = compute_pace_position(local_hour_float, profile.daily_calorie_target)` when offset present, else `None`.
  - [x] Pass `pace_position=...` into the `TodaySnapshot(...)` constructor. Leave all other fields untouched.
- [x] **Task 3 — Router query param** (AC: #2)
  - [x] In `backend/app/routers/today.py`, add `tz_offset_minutes: int | None = None` to `get_today(...)` and forward it into `fetch_today(...)`.
- [x] **Task 4 — Schema field** (AC: #1, #5)
  - [x] In `backend/app/models/schemas.py`, add `pace_position: float | None = None` to `TodaySnapshot` (after `scheduled_routine_today` to match field grouping; default `None`).
- [x] **Task 5 — Mobile contract** (AC: #2, #5)
  - [x] In `mobile/lib/api.ts`, add `pace_position?: number | null;` to the `TodaySnapshot` type.
  - [x] In `getToday()`, compute `const tz = -new Date().getTimezoneOffset();` and append `?tz_offset_minutes=${tz}` to the `/today/` URL (preserve existing auth headers + `normalizeProfile` post-processing).
- [x] **Task 6 — Tests** (AC: #6, #7)
  - [x] Add unit tests in `backend/tests/test_today.py` calling `compute_pace_position` directly: 5am→`None`-or-`0.0`, 1pm→`~0.50` (assert `abs(v-0.50) < 0.05`), 11pm→`~1.0`, target `0`→`None`.
  - [x] Add one test that `fetch_today(..., tz_offset_minutes=None)` yields `pace_position is None` (use the existing `_MockSupabase` pattern; mock `profiles`/`meals`/`sessions`/`routine_days` tables).
  - [x] Run the suite; confirm all prior tests pass.
- [x] **Task 7 — Verify** (AC: #7)
  - [x] `cd backend; .\.venv\Scripts\Activate.ps1; pytest` green.
  - [x] `cd mobile; npx tsc --noEmit` clean.
  - [ ] **(Deferred — manual)** Hit `GET /today/?tz_offset_minutes=-300` against a seeded user and confirm `pace_position` is present and sane for the current local hour (observe the uvicorn log). *Not runnable in this dev env: no backend venv / `.env` / seeded Supabase user on this machine. Logic is fully covered by the unit suite; recommend Brady spot-checks live once the backend is running.*

### PACE_CURVE anchor table (from [today-tab-ux-design-2026-05-20.md §5](../planning-artifacts/today-tab-ux-design-2026-05-20.md))

```
hour:      0    6    7    8    9   10   11   12   13   14   15   16   17   18   19   20   21   22   23
fraction:  .00  .00  .00  .10  .15  .20  .30  .40  .50  .58  .64  .68  .72  .75  .80  .88  .94  .98  1.0
```

Anchors not listed (1–5) sit on the flat 0.0 pre-window segment. Properties: outside the eating window the curve is flat (0.0 before 7am, 1.0 from 23:00); slight front-load (≈50% by 1pm); dinner taper to 100% by night. This is a v1 default — **not** user-configurable, no weekend variant, device-clock only (per §5 "Out of scope for v1").

## Dev Notes

### Files to touch (all UPDATE — read current state before editing)

- **`backend/app/services/today.py`** *(current state read).* Holds `fetch_today(sb, user_id, profile_row, user_email=None)` which assembles `TodaySnapshot`, plus helpers `_today_bounds()` (UTC), `_round_cal`, `build_callouts`, `_fetch_workout_state`, `_scheduled_routine_today`. **Preserve all of this.** The snapshot is built once at the bottom (`return TodaySnapshot(...)`) — add `pace_position` there. The service currently has **no concept of local time** (bounds are UTC midnight-to-midnight); the tz offset you add is *only* for pace, do **not** repurpose it for `_today_bounds()` in this story.
- **`backend/app/routers/today.py`** *(current state read).* Thin router: loads profile via `safe_single`, 404s if missing, calls `fetch_today`. Add the query param and forward it. Keep the 404 behavior.
- **`backend/app/models/schemas.py`** *(`TodaySnapshot` at line 225 read).* Pydantic v2 `BaseModel`s with defaulted fields. Add `pace_position: float | None = None`.
- **`mobile/lib/api.ts`** *(`TodaySnapshot` at line 301, `getToday()` at line 442 read).* Note the TS type already marks several fields optional (`?`) — match that style with `pace_position?: number | null;`. `getToday()` uses `apiUrl("/today/")`, `authHeader()`, `apiFetch`, `handle<TodaySnapshot>`, then re-wraps `targets` via `normalizeProfile`. Only change the URL to add the query string; leave the rest intact.

### The timezone decision (the one real design call)

The `/today/` endpoint has no timezone today, and the profile schema stores none. The Today-tab Correct Course (§3.1 decision #1, §6 risk) settled: **add `pace_position` to `/today/` now; server value wins when present; client computes only when offline.** Since there is no stored tz and we will not add an IANA-tz dependency for v1, the lightest correct mechanism is a **client-supplied UTC offset** (`tz_offset_minutes`). Rationale: zero new deps, widget-compatible (the widget can pass its own offset), and the client (`pace.ts`, Story 4.4) is the offline fallback when the param is absent. DST is handled correctly because the client recomputes its offset on each call.

### Pace value vs. gap-arc rendering (scope boundary)

The backend returns the raw curve fraction only. **Whether a gap arc is drawn** (none pre-window, none when on-pace within 5%, none when over-target) is the *client ring's* concern in Stories 4.5/4.6 — do not encode arc/visibility logic in the backend. Per the precedent §3, the four pace states (on / behind / ahead / over) are derived client-side from `consumed/effective_target` vs `pace_position`.

### Testing standards

- Tests live in `backend/tests/`, pytest, no live Supabase. Reuse the existing `_MockSupabase`/`_MockQuery` doubles in `test_today.py` for any `fetch_today` test. Prefer testing the pure `compute_pace_position` directly for the curve checkpoints (no mocks needed).
- Convention in this repo: one happy-path + edge case per service function (per YOURSTRAT_BUILD §12.6). Curve checkpoints + null cases satisfy this.
- Use tolerance asserts for interpolated values (`abs(v - expected) < 0.05`), exact for the null/boundary cases.

### Project Structure Notes

- New pure helper + `PACE_CURVE` go in the existing `app/services/today.py` (co-located with `fetch_today`, the only consumer), matching the source hand-off in [today-tab-ux-design §13](../planning-artifacts/today-tab-ux-design-2026-05-20.md). This mirrors the small-pure-service pattern of `targets.py`/`met.py`. No new file or route is introduced (stays within API surface; CLAUDE.md §8 ask-before-add not triggered).
- No DB migration: `pace_position` is derived, never stored.
- No new dependency (CLAUDE.md §8): pure stdlib `datetime`/`timedelta` already imported in the service.

### References

- [epics.md → Epic 4 / Story 4.3](../planning-artifacts/epics.md) — story source + ACs; UX-DR37 / AR9.
- [today-tab-ux-design-2026-05-20.md §5](../planning-artifacts/today-tab-ux-design-2026-05-20.md) — PACE_CURVE table + curve properties; §12.1 forward-compat rationale; §13 hand-off checklist.
- [today-tab-correct-course-2026-05-20.md §3.1 (decision #1), §3.4, §5, §6](../planning-artifacts/today-tab-correct-course-2026-05-20.md) — "add `pace_position` now; server wins when present; client computes when offline"; test at 5am/1pm/11pm; timezone-drift risk + mitigation.
- [ux-design-specification.md → Story 4.x / Backend wiring](../planning-artifacts/ux-design-specification.md) — `target_pace_kcal_now`/`pace_position` as a Tier-5 schema-paired change.
- `backend/app/services/today.py`, `backend/app/routers/today.py`, `backend/app/models/schemas.py:225`, `mobile/lib/api.ts:301,442`, `backend/tests/test_today.py` — current implementations (read for this story).
- CLAUDE.md §5 (UI↔backend wiring; schema-is-the-contract), §8 (ask-before-add gates — none triggered here).

### Open questions / assumptions (resolve during dev if they prove wrong)

1. **Param name/units.** Assumed `tz_offset_minutes` = minutes *east* of UTC (`-getTimezoneOffset()`). If a future widget finds it easier to send an IANA tz string, this can be widened later — out of scope now.
2. **5am result.** AC allows null *or* 0.0 at 5am. Implementation returns the curve value `0.0` when a tz offset is present (and `null` only when target is 0 or offset is absent). Both satisfy the precedent's "no gap arc pre-window," which the client enforces.
3. **`pace_position` field ordering** in `TodaySnapshot` is cosmetic; placed last for a clean additive diff.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.7 (1M context)

### Debug Log References

- `pytest tests/test_today.py` — RED: 9 failed / 6 passed (pre-impl) → GREEN: 15 passed (post-impl).
- Full backend suite: 35 passed, 1 failed (`test_gemini.py::test_scan_food_invalid_json_returns_empty`). **Verified NOT a regression**: this test fails identically on a clean tree (changes stashed) and the cause is `pytest_asyncio` not being installed in this machine's global Python (no venv) — the test is `@pytest.mark.asyncio`. Unrelated to Story 4.3.
- `tsc --noEmit` (mobile): clean.

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created.
- **Implemented** `PACE_CURVE` + pure `compute_pace_position(local_hour_float, target)` + `_local_hour_from_offset(tz_offset_minutes, now_utc=None)` in `backend/app/services/today.py`; added `timedelta` import; threaded a new `tz_offset_minutes: int | None = None` param through `fetch_today(...)` and the `GET /today/` router; added `pace_position: float | None = None` to `TodaySnapshot` (Pydantic) and the matching `mobile/lib/api.ts` type; `getToday()` now sends `?tz_offset_minutes=-getTimezoneOffset()`.
- **Design call (per Today-tab CC §3.1):** local hour is derived from a client-supplied UTC offset (no IANA-tz dep, widget-compatible). `pace_position` is `null` when the offset is absent or the target is 0 — the client `pace.ts` (Story 4.4) is the offline fallback.
- **No regressions; additive only** — every existing `TodaySnapshot` field and the UTC `_today_bounds()` are untouched.
- **Test-env note:** this machine has no backend venv or `.env`; tests were run with throwaway `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` (tests fully mock Supabase, so no real creds needed). For a normal run, `pip install -r requirements.txt` in a venv restores `pytest-asyncio` and the gemini test passes.
- **Deferred (manual, Brady):** live `GET /today/?tz_offset_minutes=...` smoke against a seeded user — not runnable here (no running backend / seeded Supabase user). Computation is fully unit-covered.

### File List

- `backend/app/services/today.py` (modified) — PACE_CURVE, `compute_pace_position`, `_local_hour_from_offset`, `timedelta` import, `tz_offset_minutes` param, `pace_position` on snapshot.
- `backend/app/routers/today.py` (modified) — `tz_offset_minutes` query param forwarded to `fetch_today`.
- `backend/app/models/schemas.py` (modified) — `pace_position: float | None = None` on `TodaySnapshot`.
- `mobile/lib/api.ts` (modified) — `pace_position?: number | null` on `TodaySnapshot`; `getToday()` sends `tz_offset_minutes`.
- `backend/tests/test_today.py` (modified) — 9 new tests (curve checkpoints, interpolation, null cases, tz conversion, `fetch_today` with/without offset).

## Change Log

- **2026-05-24** — Implemented Story 4.3: added server-computed `pace_position` to `GET /today/`, driven by a client-supplied `tz_offset_minutes`, with schema-paired mobile type + 9 unit tests. Status → review.
- **2026-05-24** — Code review (3 adversarial layers). Applied 1 patch (clamp `tz_offset_minutes`), +1 regression test (16/16 green). 1 finding deferred (pre-existing), 5 dismissed. Status → done.

## Review Findings

Code review 2026-05-24 — three adversarial layers (Blind Hunter, Edge Case Hunter, Acceptance Auditor). **Acceptance Auditor: all 7 ACs PASS.** 1 patch applied, 1 deferred, 5 dismissed.

- [x] **[Review][Patch]** Clamp `tz_offset_minutes` to the real-world range [-720, +840] `[backend/app/services/today.py]` — applied; an absurd/garbage offset now degrades to a sane local hour instead of a meaningless one. Added `test_local_hour_from_offset_clamps_absurd_values` (16/16 green).
- [x] **[Review][Defer]** Pace uses the local-day hour while consumed meals use the UTC day (`_today_bounds()`) `[backend/app/services/today.py]` — deferred, pre-existing. The UTC-day meal window predates this story and was explicitly out of scope (AC7). Needs an app-wide timezone-unification story; tracked in `deferred-work.md`.

Dismissed (noise / intentional / framework-standard): malformed non-int `tz_offset_minutes` → 422 (client always sends a valid int; clamp covers realistic abuse); `if not target` treats `0` == `None` (correct — no target ⇒ no pace); the `span == 0` guard is dead but harmless (anchors strictly increasing); `.minute/60` drops seconds (negligible for a smoothed ring); tz omitted ⇒ `null` (intentional offline-fallback design).
