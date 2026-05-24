from collections import Counter

from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_current_user, get_supabase, safe_single
from app.models.schemas import ExerciseOut, RoutineCreate, RoutineExerciseOut, RoutineOut

router = APIRouter(prefix="/routines", tags=["routines"])


def _scheduled_days(sb, routine_id: str) -> list[int]:
    res = (
        sb.table("routine_days")
        .select("day_of_week")
        .eq("routine_id", routine_id)
        .order("day_of_week")
        .execute()
    )
    return [int(r["day_of_week"]) for r in (res.data or [])]


def _routine_detail(sb, routine_id: str, user_id: str) -> RoutineOut:
    routine = safe_single(sb.table("routines").select("*").eq("id", routine_id).eq("user_id", user_id))
    if not routine.data:
        raise HTTPException(status_code=404, detail="Routine not found")
    r = routine.data
    re = (
        sb.table("routine_exercises")
        .select("*")
        .eq("routine_id", routine_id)
        .order("position")
        .execute()
    )
    exercises_out: list[RoutineExerciseOut] = []
    for row in re.data or []:
        ex = safe_single(sb.table("exercises").select("*").eq("id", row["exercise_id"]))
        ex_out = None
        if ex.data:
            e = ex.data
            ex_out = ExerciseOut(
                id=e["id"],
                name=e["name"],
                type=e["type"],
                met_value=float(e["met_value"]),
                default_sets=e.get("default_sets"),
                default_reps=e.get("default_reps"),
                default_duration_sec=e.get("default_duration_sec"),
            )
        exercises_out.append(
            RoutineExerciseOut(
                exercise_id=row["exercise_id"],
                position=row["position"],
                sets=row.get("sets"),
                reps=row.get("reps"),
                duration_sec=row.get("duration_sec"),
                rest_sec=row.get("rest_sec"),
                exercise=ex_out,
            )
        )
    return RoutineOut(
        id=r["id"],
        name=r["name"],
        created_at=r.get("created_at"),
        exercises=exercises_out,
        scheduled_days=_scheduled_days(sb, routine_id),
        exercise_count=len(exercises_out),
    )


def _exercise_counts(sb, routine_ids: list[str]) -> dict[str, int]:
    if not routine_ids:
        return {}
    re = sb.table("routine_exercises").select("routine_id").in_("routine_id", routine_ids).execute()
    return dict(Counter(row["routine_id"] for row in (re.data or [])))


@router.get("/", response_model=list[RoutineOut])
def list_routines(user: dict = Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("routines").select("id,name,created_at").eq("user_id", user["id"]).order("created_at", desc=True).execute()
    rows = res.data or []
    counts = _exercise_counts(sb, [r["id"] for r in rows])
    return [
        RoutineOut(
            id=r["id"],
            name=r["name"],
            created_at=r.get("created_at"),
            scheduled_days=_scheduled_days(sb, r["id"]),
            exercise_count=counts.get(r["id"], 0),
        )
        for r in rows
    ]


@router.post("/", response_model=RoutineOut)
def create_routine(body: RoutineCreate, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("routines").insert({"user_id": user["id"], "name": body.name}).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Could not create routine")
    routine_id = res.data[0]["id"]
    for ex in body.exercises:
        sb.table("routine_exercises").insert({
            "routine_id": routine_id,
            "exercise_id": ex.exercise_id,
            "position": ex.position,
            "sets": ex.sets,
            "reps": ex.reps,
            "duration_sec": ex.duration_sec,
            "rest_sec": ex.rest_sec,
        }).execute()
    days = sorted({d for d in body.scheduled_days if 0 <= d <= 6})
    for d in days:
        sb.table("routine_days").insert({"routine_id": routine_id, "day_of_week": d}).execute()
    return _routine_detail(sb, routine_id, user["id"])


@router.get("/{routine_id}", response_model=RoutineOut)
def get_routine(routine_id: str, user: dict = Depends(get_current_user)):
    return _routine_detail(get_supabase(), routine_id, user["id"])


@router.delete("/{routine_id}")
def delete_routine(routine_id: str, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    existing = (
        sb.table("routines")
        .select("id")
        .eq("id", routine_id)
        .eq("user_id", user["id"])
        .maybe_single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Routine not found")
    sb.table("routines").delete().eq("id", routine_id).eq("user_id", user["id"]).execute()
    return {"ok": True}
