# Story 5.5: Active-session endpoint

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the app on cold start,
I want to query whether a session is active (independent of the date it started),
so that I can restore the live workout exactly where I left off.

First story of the **W-C2 Active Session Takeover** track (Tier-1 pick #2). Pure backend + API-type plumbing — it adds the `GET /sessions/active` endpoint that Story 5.6 calls on cold-start. **No UI in this story** (5.6 consumes it). The endpoint must find **any** unfinished session, *not* just one started today (the existing Today snapshot's `active_session` is date-scoped and would miss a session that crossed midnight or was started on a prior day).

## Acceptance Criteria

1. **Returns the active session.** `GET /sessions/active` returns the caller's single unfinished session (`ended_at IS NULL`), most-recent first if more than one somehow exists, scoped to `user_id` (RLS/owner pattern). The body shape is `ActiveSessionInfo` (`id`, `routine_id`, `routine_name`, `started_at`, `planned_rpe`) — reused, **not** a new schema.
2. **Returns null when none.** When the user has no unfinished session, the endpoint returns JSON `null` (HTTP 200), not 404, not `{}`. `response_model=ActiveSessionInfo | None`.
3. **Not date-scoped.** Unlike `today.fetch_today`'s `active_session` (which filters `started_at` to today's local window), this endpoint considers sessions started on **any** date. A session started yesterday and never finished is returned.
4. **Auth required.** Requires `Authorization: Bearer <jwt>` via `Depends(get_current_user)` (the established router pattern). No anonymous access.
5. **Schema/type parity (NFR4).** The mobile `ActiveSessionInfo` TS type already exists and matches the Pydantic model — confirm parity and add `api.getActiveSession(): Promise<ActiveSessionInfo | null>` in the **same** change. `getActiveSession` goes through `apiFetch`/`handle` + `authHeader` (never raw `fetch`), and `handle` already returns `null` cleanly for a `null` body.
6. **Testable + tested.** Selection/shaping logic lives in a service function (`fetch_active_session(sb, user_id)` in `app/services/today.py`, beside `_fetch_workout_state`) so it is unit-testable with the existing service-level mock harness. Tests: (a) an unfinished session → correct `ActiveSessionInfo` with `routine_name`; (b) no rows → `None`; (c) the only session is finished → `None` (the Python `ended_at is None` guard, since the mock ignores DB filters); (d) unfinished session without a routine → `routine_name`/`routine_id` `None`.
7. **Verification.** `cd mobile; npx tsc --noEmit` clean. Backend `pytest` green (throwaway `SUPABASE_URL`/`SUPABASE_SERVICE_KEY`; Supabase mocked — no live DB).

## Tasks / Subtasks

- [x] **Task 1 — Service function** (AC: #1, #3, #6)
  - [x] In `app/services/today.py`, add `fetch_active_session(sb: Client, user_id: str) -> ActiveSessionInfo | None`. Query `sessions` for `user_id`, `ended_at IS NULL` (`.is_("ended_at", "null")`), `.order("started_at", desc=True).limit(1)`. Defensive Python guard: `if not rows or rows[0].get("ended_at") is not None: return None` (the guard makes the "finished → None" case correct under the filter-ignoring mock and is a safety net in prod).
  - [x] Attach `routine_name` via a `routines` lookup by `routine_id` (mirror `_fetch_workout_state`'s `.select("name").eq("id", rid).execute()` shape — **not** `safe_single`, whose `.maybe_single()` isn't in the test mock). Build and return `ActiveSessionInfo`.
- [x] **Task 2 — Route** (AC: #1, #2, #4)
  - [x] In `app/routers/sessions.py`, add `@router.get("/active", response_model=ActiveSessionInfo | None)` → `get_active_session(user = Depends(get_current_user))` returning `fetch_active_session(get_supabase(), user["id"])`. Import `ActiveSessionInfo` from schemas and `fetch_active_session` from `app.services.today`. (Placed at the top of the router; both static GET subpaths — no conflict with the `POST /{session_id}/...` routes; route-registration verified via `app.main` import.)
- [x] **Task 3 — API client** (AC: #5)
  - [x] In `mobile/lib/api.ts`, add `export async function getActiveSession(): Promise<ActiveSessionInfo | null>` using `authHeader()` + `apiFetch(apiUrl("/sessions/active"), { headers })` + `handle<ActiveSessionInfo | null>(res)`. (`ActiveSessionInfo` type already exported — parity confirmed, no new type.)
- [x] **Task 4 — Tests + verify** (AC: #6, #7)
  - [x] Add `.is_(self, *_a, **_k): return self` to the `_MockQuery` in `tests/test_today.py`.
  - [x] Add the four `fetch_active_session` tests (AC#6 a–d).
  - [x] `pytest` green (test_today: 20/20); `tsc --noEmit` clean; `app.main` imports + `/sessions/active` registers.

## Dev Notes

### Why a distinct endpoint (the core rationale)

`today._fetch_workout_state` (today.py:207) finds `active_session` but filters `sessions` by `gte started_at = start` / `lte = end` (today's local window). For cold-start restore (5.6), a session started before today and left unfinished must still be found, so `GET /sessions/active` does an **unscoped** `ended_at IS NULL` lookup. The two are intentionally separate; don't try to reuse the date-scoped path.

### Files

- `backend/app/services/today.py` (UPDATE) — add `fetch_active_session`. It already imports `ActiveSessionInfo` and houses `_fetch_workout_state` (the precedent for shaping `ActiveSessionInfo` + routine-name join).
- `backend/app/routers/sessions.py` (UPDATE) — add the `GET /active` route; extend the schemas import with `ActiveSessionInfo`; import `fetch_active_session`.
- `mobile/lib/api.ts` (UPDATE) — add `getActiveSession`. `ActiveSessionInfo` TS type already present (api.ts:266) and matches the model.
- `backend/tests/test_today.py` (UPDATE) — `.is_` on the mock + four tests.

### `.is_("ended_at", "null")`

Standard postgrest-py filter for `IS NULL`; `.limit`/`.order(desc=True)` already used in today.py. The `_MockQuery` ignores all filters (returns the table's rows as-is), so the unit tests verify the **Python shaping + the `ended_at is None` guard**, not the DB filter — consistent with how `test_fetch_workout_state_*` already work (they rely on the mock returning the rows they pass).

### `response_model=ActiveSessionInfo | None`

FastAPI serializes a returned `None` to JSON `null` (HTTP 200). Mobile `handle<T>` does `await res.json()` → `null`, so `getActiveSession` resolves to `null` with no special-casing. Do **not** return 404 for "no active session" — null is the not-an-error signal 5.6 branches on.

### Scope boundaries

- **No UI** (5.6 builds the Takeover + tab badge + cold-start wiring). **No Zustand changes.** **No new schema/type** (reuse `ActiveSessionInfo`). **No change to `today.fetch_today`** (its date-scoped `active_session` stays for the Today snapshot).
- Honors §2 Scope Guard — no streaks/notifications/etc.; this is plumbing for an explicitly-approved Tier-1 feature.

### Testing standards

- Backend: pytest at the service-function level with the `_MockSupabase`/`_MockQuery` harness in `tests/test_today.py` (run with throwaway `SUPABASE_URL`/`SUPABASE_SERVICE_KEY`; no live DB, no venv/.env on this machine). Mirrors Story 4.3's pace tests.
- Mobile: `tsc --noEmit` (no JS test runner; `jest-expo` still deferred). The added function is declarative.

### References

- [epics.md → Epic 5 / Story 5.5](../planning-artifacts/epics.md) — UX-DR40 (`/sessions/active`), AR12, FR26.
- `backend/app/services/today.py:207` (`_fetch_workout_state` — precedent), `backend/app/routers/sessions.py` (router), `backend/app/models/schemas.py:190` (`ActiveSessionInfo`), `mobile/lib/api.ts:266` (TS type), `tests/test_today.py` (mock harness).
- CLAUDE.md §5 (no route without a same-track UI consumer — 5.6; all routes JWT; schema↔TS parity), §8 (new route is the story's purpose).

## Dev Agent Record

### Agent Model Used

Claude Opus 4.7 (1M context)

### Debug Log References

- `pytest tests/test_today.py -q` (throwaway `SUPABASE_*`): **20 passed** (16 prior + 4 new `fetch_active_session`).
- Full `pytest -q`: **40 passed, 1 failed** — the 1 failure is `test_gemini.py::test_scan_food_invalid_json_returns_empty`, a pre-existing **environment** issue (`@pytest.mark.asyncio` test with no `pytest-asyncio` plugin installed on this machine: *"You need to install a suitable plugin for your async framework"*). Unrelated to this story (touches gemini scanning, not sessions/today); not fixed here (would require adding a dep — out of scope, ask-first).
- `python -c "from app.main import app; ..."` → `/sessions/active` present in route table; no circular import from `sessions → services.today`.
- `tsc --noEmit` (mobile): clean.

### Completion Notes List

- **`GET /sessions/active`** added, returning `ActiveSessionInfo | None`. Logic extracted to `fetch_active_session(sb, user_id)` in `services/today.py` (beside `_fetch_workout_state`), queried **non-date-scoped** (`ended_at IS NULL`, `order started_at desc`, `limit 1`) so a session started on a prior day is still restored on cold-start — the deliberate difference from Today's date-scoped `active_session`.
- **Reused `ActiveSessionInfo`** (Pydantic + the existing `api.ts:266` TS type already matched) — no new schema/type; just `api.getActiveSession()` added through the standard `authHeader`/`apiFetch`/`handle` path. `handle` returns `null` cleanly for a JSON `null` body, so "no active session" needs no special-casing in 5.6.
- **Python `ended_at is None` guard** backs up the DB `.is_` filter — also what makes the "only finished → None" unit test meaningful (the `_MockQuery` ignores DB filters, mirroring how `test_fetch_workout_state_*` test Python shaping, not the filter).
- No UI, no Zustand, no `today.fetch_today` change — Story 5.6 consumes this.

### File List

- `backend/app/services/today.py` (modified) — `fetch_active_session`.
- `backend/app/routers/sessions.py` (modified) — `GET /active` route + `ActiveSessionInfo` import + `fetch_active_session` import.
- `mobile/lib/api.ts` (modified) — `getActiveSession()`.
- `backend/tests/test_today.py` (modified) — `.is_` on `_MockQuery` + 4 `fetch_active_session` tests.

## Code Review (2026-05-24)

**Method:** 3-layer adversarial (Blind Hunter · Edge Case Hunter · Acceptance Auditor). Reviewer: Claude Opus 4.7 (1M). Verdict: **PASS → done.**

- **Blind Hunter:** query correct (`.is_("ended_at","null").order(desc).limit(1)`); `res.data or []` guards a None response; bracket access on `id`/`started_at` matches the NOT-NULL precedent; orphan/deleted routine → `routine_name=None` (graceful). No route shadowing (no `GET /{session_id}`; `/active` & `/stats` distinct literals). No circular import (verified by importing `app.main`).
- **Edge Case Hunter:** multiple active → most-recent (`limit 1` + `order desc`); only-finished → Python guard → None; routine deleted → None name; `started_at` passed through verbatim for 5.6 elapsed-time.
- **Acceptance Auditor:** AC1✓ AC2✓ (null not 404) AC3✓ (non-date-scoped — the point) AC4✓ (JWT) AC5✓ (type parity, no raw fetch) AC6✓ (4 tests pass) AC7✓ (tsc + pytest).

No patch needed.

## Change Log

- **2026-05-24** — Story 5.5 drafted (create-story): `GET /sessions/active` (non-date-scoped, `ActiveSessionInfo | None`) + `fetch_active_session` service fn + `api.getActiveSession` + tests.
- **2026-05-24** — Implemented (dev-story) + code review PASS. test_today 20/20 green; tsc clean; app imports + route registers. (Full-suite's 1 failure is the pre-existing `pytest-asyncio`-missing gemini test, unrelated.) Status → done.
