from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_current_user, get_supabase
from app.models.schemas import ExerciseCreate, ExerciseOut
from app.services.met import DEFAULT_MET, met_for_type

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("/", response_model=list[ExerciseOut])
def list_exercises(user: dict = Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("exercises").select("*").eq("user_id", user["id"]).order("name").execute()
    return [ExerciseOut(id=r["id"], met_value=float(r["met_value"]), **{k: r[k] for k in r if k not in ("id", "met_value", "user_id")}) for r in (res.data or [])]


@router.post("/", response_model=ExerciseOut)
def create_exercise(body: ExerciseCreate, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    met = met_for_type(body.type, body.met_value)
    row = {
        "user_id": user["id"],
        "name": body.name,
        "type": body.type,
        "met_value": met,
        "default_sets": body.default_sets,
        "default_reps": body.default_reps,
        "default_duration_sec": body.default_duration_sec,
    }
    res = sb.table("exercises").insert(row).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Could not create exercise")
    r = res.data[0]
    return ExerciseOut(id=r["id"], met_value=float(r["met_value"]), name=r["name"], type=r["type"], default_sets=r.get("default_sets"), default_reps=r.get("default_reps"), default_duration_sec=r.get("default_duration_sec"))
