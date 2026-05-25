from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_current_user, get_supabase, safe_single
from app.models.schemas import TodaySnapshot
from app.services.today import fetch_today

router = APIRouter(prefix="/today", tags=["today"])


@router.get("/", response_model=TodaySnapshot)
def get_today(
    tz_offset_minutes: int | None = None,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    profile = safe_single(sb.table("profiles").select("*").eq("id", user["id"]))
    if not profile.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return fetch_today(sb, user["id"], profile.data, user.get("email"), tz_offset_minutes)
