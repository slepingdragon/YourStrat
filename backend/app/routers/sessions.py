from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_current_user, get_supabase, safe_single
from app.models.schemas import BurnDay, SessionFinish, SessionOut, SessionSetInput, SessionStart, SessionStats
from app.services.met import calories_burned

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/stats", response_model=SessionStats)
def session_stats(user: dict = Depends(get_current_user)):
    sb = get_supabase()
    # Lifetime totals
    res = (
        sb.table("sessions")
        .select("id, started_at, calories_burned, actual_rpe, ended_at")
        .eq("user_id", user["id"])
        .execute()
    )
    rows = res.data or []
    lifetime_burn = 0
    lifetime_sessions = 0
    rpe_sum = 0
    rpe_count = 0
    for s in rows:
        # Only count finished sessions in lifetime totals.
        if not s.get("ended_at"):
            continue
        lifetime_sessions += 1
        lifetime_burn += int(s.get("calories_burned", 0) or 0)
        rpe = s.get("actual_rpe")
        if rpe is not None:
            rpe_sum += int(rpe)
            rpe_count += 1

    avg_rpe = (rpe_sum / rpe_count) if rpe_count > 0 else None

    # Last 7 days burn — bucket by local date.
    today = date.today()
    seven_days_ago = today - timedelta(days=6)
    by_day: dict[str, int] = defaultdict(int)
    for s in rows:
        if not s.get("ended_at"):
            continue
        started = s.get("started_at", "")
        day_key = started[:10] if started else ""
        if not day_key:
            continue
        if day_key < seven_days_ago.isoformat():
            continue
        by_day[day_key] += int(s.get("calories_burned", 0) or 0)

    days_out: list[BurnDay] = []
    for i in range(7):
        d = (seven_days_ago + timedelta(days=i)).isoformat()
        days_out.append(BurnDay(date=d, calories=by_day.get(d, 0)))

    return SessionStats(
        lifetime_calories_burned=lifetime_burn,
        lifetime_sessions=lifetime_sessions,
        avg_actual_rpe=round(avg_rpe, 1) if avg_rpe is not None else None,
        burn_last_7_days=days_out,
    )


@router.post("/start", response_model=SessionOut)
def start_session(body: SessionStart, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    row = {
        "user_id": user["id"],
        "routine_id": body.routine_id,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "calories_burned": 0,
        "planned_rpe": body.planned_rpe,
    }
    res = sb.table("sessions").insert(row).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Could not start session")
    s = res.data[0]
    return SessionOut(
        id=s["id"],
        routine_id=s.get("routine_id"),
        started_at=s["started_at"],
        calories_burned=s.get("calories_burned", 0),
        planned_rpe=s.get("planned_rpe"),
    )


@router.post("/{session_id}/sets")
def append_set(session_id: str, body: SessionSetInput, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    session = safe_single(sb.table("sessions").select("id").eq("id", session_id).eq("user_id", user["id"]))
    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")
    sb.table("session_sets").insert({
        "session_id": session_id,
        "exercise_id": body.exercise_id,
        "position": body.position,
        "reps": body.reps,
        "weight_kg": body.weight_kg,
        "duration_sec": body.duration_sec,
    }).execute()
    return {"ok": True}


@router.post("/{session_id}/rate", response_model=SessionOut)
def rate_session(session_id: str, body: SessionFinish, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    session = safe_single(sb.table("sessions").select("*").eq("id", session_id).eq("user_id", user["id"]))
    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")
    if body.actual_rpe is None:
        raise HTTPException(status_code=400, detail="actual_rpe is required")
    res = (
        sb.table("sessions")
        .update({"actual_rpe": body.actual_rpe})
        .eq("id", session_id)
        .eq("user_id", user["id"])
        .execute()
    )
    s = res.data[0] if res.data else session.data
    return SessionOut(
        id=s["id"],
        routine_id=s.get("routine_id"),
        started_at=s["started_at"],
        ended_at=s.get("ended_at"),
        duration_sec=s.get("duration_sec"),
        calories_burned=s.get("calories_burned", 0),
        planned_rpe=s.get("planned_rpe"),
        actual_rpe=s.get("actual_rpe"),
    )


@router.post("/{session_id}/finish", response_model=SessionOut)
def finish_session(session_id: str, body: SessionFinish | None = None, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    session = safe_single(sb.table("sessions").select("*").eq("id", session_id).eq("user_id", user["id"]))
    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")
    s = session.data
    profile = safe_single(sb.table("profiles").select("weight_kg").eq("id", user["id"]))
    weight_kg = float(profile.data["weight_kg"]) if profile.data else 70.0

    sets_res = sb.table("session_sets").select("exercise_id,duration_sec").eq("session_id", session_id).execute()
    total_burn = 0
    started = datetime.fromisoformat(s["started_at"].replace("Z", "+00:00"))
    ended = datetime.now(timezone.utc)
    duration_sec = int((ended - started).total_seconds())

    for row in sets_res.data or []:
        ex = safe_single(sb.table("exercises").select("met_value,type").eq("id", row["exercise_id"]))
        met = 5.0
        if ex.data:
            met = float(ex.data["met_value"])
        dur = row.get("duration_sec") or 60
        total_burn += calories_burned(met, weight_kg, dur)

    if not sets_res.data:
        routine_id = s.get("routine_id")
        if routine_id:
            re = sb.table("routine_exercises").select("exercise_id,duration_sec,sets,reps").eq("routine_id", routine_id).execute()
            for row in re.data or []:
                ex = safe_single(sb.table("exercises").select("met_value").eq("id", row["exercise_id"]))
                met = float(ex.data["met_value"]) if ex.data else 5.0
                dur = row.get("duration_sec") or (row.get("sets") or 1) * (row.get("reps") or 10) * 3
                total_burn += calories_burned(met, weight_kg, dur)

    update: dict = {
        "ended_at": ended.isoformat(),
        "duration_sec": duration_sec,
        "calories_burned": total_burn,
    }
    if body and body.actual_rpe is not None:
        update["actual_rpe"] = body.actual_rpe
    res = sb.table("sessions").update(update).eq("id", session_id).execute()
    s2 = res.data[0] if res.data else {**s, **update}
    return SessionOut(
        id=s2["id"],
        routine_id=s2.get("routine_id"),
        started_at=s2["started_at"],
        ended_at=s2.get("ended_at"),
        duration_sec=s2.get("duration_sec"),
        calories_burned=s2.get("calories_burned", 0),
        planned_rpe=s2.get("planned_rpe"),
        actual_rpe=s2.get("actual_rpe"),
    )
