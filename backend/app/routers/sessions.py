from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_current_user, get_supabase
from app.models.schemas import SessionOut, SessionSetInput, SessionStart
from app.services.met import calories_burned

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("/start", response_model=SessionOut)
def start_session(body: SessionStart, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    row = {
        "user_id": user["id"],
        "routine_id": body.routine_id,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "calories_burned": 0,
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
    )


@router.post("/{session_id}/sets")
def append_set(session_id: str, body: SessionSetInput, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    session = sb.table("sessions").select("id").eq("id", session_id).eq("user_id", user["id"]).maybe_single().execute()
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


@router.post("/{session_id}/finish", response_model=SessionOut)
def finish_session(session_id: str, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    session = sb.table("sessions").select("*").eq("id", session_id).eq("user_id", user["id"]).maybe_single().execute()
    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")
    s = session.data
    profile = sb.table("profiles").select("weight_kg").eq("id", user["id"]).maybe_single().execute()
    weight_kg = float(profile.data["weight_kg"]) if profile.data else 70.0

    sets_res = sb.table("session_sets").select("exercise_id,duration_sec").eq("session_id", session_id).execute()
    total_burn = 0
    started = datetime.fromisoformat(s["started_at"].replace("Z", "+00:00"))
    ended = datetime.now(timezone.utc)
    duration_sec = int((ended - started).total_seconds())

    for row in sets_res.data or []:
        ex = sb.table("exercises").select("met_value,type").eq("id", row["exercise_id"]).maybe_single().execute()
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
                ex = sb.table("exercises").select("met_value").eq("id", row["exercise_id"]).maybe_single().execute()
                met = float(ex.data["met_value"]) if ex.data else 5.0
                dur = row.get("duration_sec") or (row.get("sets") or 1) * (row.get("reps") or 10) * 3
                total_burn += calories_burned(met, weight_kg, dur)

    update = {
        "ended_at": ended.isoformat(),
        "duration_sec": duration_sec,
        "calories_burned": total_burn,
    }
    res = sb.table("sessions").update(update).eq("id", session_id).execute()
    s2 = res.data[0] if res.data else {**s, **update}
    return SessionOut(
        id=s2["id"],
        routine_id=s2.get("routine_id"),
        started_at=s2["started_at"],
        ended_at=s2.get("ended_at"),
        duration_sec=s2.get("duration_sec"),
        calories_burned=s2.get("calories_burned", 0),
    )
