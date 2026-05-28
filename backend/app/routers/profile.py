import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_current_user, get_supabase
from app.models.schemas import AiStats, OnboardingInput, Profile, ProfileUpdate, TrialStatus
from app.services.ai_stats import fetch_ai_stats
from app.services.targets import compute_targets
from app.services.trial import build_trial_status, trial_window_iso

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/profile", tags=["profile"])


def _row_to_profile(row: dict, trial: TrialStatus) -> Profile:
    return Profile(
        id=str(row["id"]),
        units=row["units"],
        weight_kg=float(row["weight_kg"]),
        height_cm=float(row["height_cm"]),
        age=int(row["age"]),
        sex=row["sex"],
        activity_level=row["activity_level"],
        goal=row["goal"],
        daily_calorie_target=int(row["daily_calorie_target"]),
        daily_protein_target_g=int(row["daily_protein_target_g"]),
        daily_carbs_target_g=int(row["daily_carbs_target_g"]),
        daily_fat_target_g=int(row["daily_fat_target_g"]),
        timezone=str(row.get("timezone") or "UTC"),
        day_start_minutes=int(row.get("day_start_minutes") if row.get("day_start_minutes") is not None else 120),
        trial=trial,
    )


def _merge_profile(existing: dict, update: ProfileUpdate) -> dict:
    data = dict(existing)
    for field, value in update.model_dump(exclude_unset=True).items():
        data[field] = value
    targets = compute_targets(
        data["sex"],
        float(data["weight_kg"]),
        float(data["height_cm"]),
        int(data["age"]),
        data["activity_level"],
        data["goal"],
    )
    data.update(targets)
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    return data


@router.post("/onboard", response_model=Profile)
def onboard(body: OnboardingInput, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    targets = compute_targets(
        body.sex,
        body.weight_kg,
        body.height_cm,
        body.age,
        body.activity_level,
        body.goal,
    )
    started_at, ends_at = trial_window_iso()
    row = {
        "id": user["id"],
        "units": body.units,
        "weight_kg": body.weight_kg,
        "height_cm": body.height_cm,
        "age": body.age,
        "sex": body.sex,
        "activity_level": body.activity_level,
        "goal": body.goal,
        "timezone": body.timezone or "UTC",
        "day_start_minutes": body.day_start_minutes,
        "trial_started_at": started_at,
        "trial_ends_at": ends_at,
        **targets,
    }
    try:
        res = sb.table("profiles").upsert(row, on_conflict="id").execute()
    except Exception as e:
        logger.exception("profile onboard upsert failed")
        msg = str(e).lower()
        if "profiles" in msg and ("does not exist" in msg or "42p01" in msg):
            raise HTTPException(
                status_code=500,
                detail="Database not set up. Run supabase/migrations/001_init.sql in Supabase.",
            ) from e
        raise HTTPException(status_code=500, detail="Could not save profile.") from e

    if not res.data:
        raise HTTPException(status_code=500, detail="Could not save profile.")
    saved = res.data[0]
    trial_data = build_trial_status(sb, user["id"], saved, user.get("email"))
    return _row_to_profile(saved, TrialStatus(**trial_data))


@router.get("/trial", response_model=TrialStatus)
def get_trial(user: dict = Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("profiles").select("*").eq("id", user["id"]).maybe_single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return TrialStatus(**build_trial_status(sb, user["id"], res.data, user.get("email")))


@router.get("/ai-stats", response_model=AiStats)
def get_ai_stats(user: dict = Depends(get_current_user)):
    sb = get_supabase()
    return AiStats(**fetch_ai_stats(sb, user["id"]))


@router.get("/", response_model=Profile)
def get_profile(user: dict = Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("profiles").select("*").eq("id", user["id"]).maybe_single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    trial_data = build_trial_status(sb, user["id"], res.data, user.get("email"))
    return _row_to_profile(res.data, TrialStatus(**trial_data))


@router.put("/", response_model=Profile)
def update_profile(body: ProfileUpdate, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    existing = sb.table("profiles").select("*").eq("id", user["id"]).maybe_single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    row = _merge_profile(existing.data, body)
    res = sb.table("profiles").upsert(row).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Could not update profile")
    saved = res.data[0]
    trial_data = build_trial_status(sb, user["id"], saved, user.get("email"))
    return _row_to_profile(saved, TrialStatus(**trial_data))
