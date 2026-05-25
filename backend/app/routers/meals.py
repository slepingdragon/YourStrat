import logging
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.deps import get_current_user, get_supabase, safe_single
from app.models.schemas import MealCreate, MealItemOut, MealOut, NutritionDay, NutritionDayTotals, NutritionJournal, ScanResult
from app.services.nutrition import compute_vs_avg_kcal
from app.services.barcode import lookup_barcode
from app.services.gemini import scan_food
from app.services.storage import signed_photo_url, upload_meal_photo
from app.services.trial import check_scan_allowed, increment_scan_count

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/meals", tags=["meals"])


def _sum_items(items: list) -> dict:
    totals = {
        "total_calories": 0,
        "total_protein_g": 0.0,
        "total_carbs_g": 0.0,
        "total_fat_g": 0.0,
        "total_fiber_g": 0.0,
        "total_sugar_g": 0.0,
        "total_sodium_mg": 0,
    }
    for it in items:
        totals["total_calories"] += it["calories"]
        totals["total_protein_g"] += float(it["protein_g"])
        totals["total_carbs_g"] += float(it["carbs_g"])
        totals["total_fat_g"] += float(it["fat_g"])
        totals["total_fiber_g"] += float(it["fiber_g"])
        totals["total_sugar_g"] += float(it["sugar_g"])
        totals["total_sodium_mg"] += it["sodium_mg"]
    return totals


def _meal_with_items(sb, meal_row: dict) -> MealOut:
    items_res = sb.table("meal_items").select("*").eq("meal_id", meal_row["id"]).execute()
    items = [
        MealItemOut(
            id=i["id"],
            name=i["name"],
            portion=i.get("portion"),
            calories=i["calories"],
            protein_g=float(i["protein_g"]),
            carbs_g=float(i["carbs_g"]),
            fat_g=float(i["fat_g"]),
            fiber_g=float(i["fiber_g"]),
            sugar_g=float(i["sugar_g"]),
            sodium_mg=i["sodium_mg"],
            confidence=i.get("confidence"),
        )
        for i in (items_res.data or [])
    ]
    photo = meal_row.get("photo_url")
    if photo and not photo.startswith("http"):
        photo = signed_photo_url(sb, photo)
    return MealOut(
        id=meal_row["id"],
        photo_url=photo,
        scanned_at=meal_row["scanned_at"],
        total_calories=meal_row["total_calories"],
        total_protein_g=float(meal_row["total_protein_g"]),
        total_carbs_g=float(meal_row["total_carbs_g"]),
        total_fat_g=float(meal_row["total_fat_g"]),
        total_fiber_g=float(meal_row["total_fiber_g"]),
        total_sugar_g=float(meal_row["total_sugar_g"]),
        total_sodium_mg=meal_row["total_sodium_mg"],
        items=items,
    )


@router.post("/scan", response_model=ScanResult)
async def scan_meal(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    profile = safe_single(sb.table("profiles").select("*").eq("id", user["id"]))
    if not profile.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    check_scan_allowed(sb, user["id"], profile.data, user.get("email"))
    data = await file.read()
    mime = file.content_type or "image/jpeg"
    try:
        result = await scan_food(data, mime)
    except Exception as e:
        logger.exception("scan_food failed")
        msg = str(e).lower()
        if "api key" in msg or "api_key" in msg or "permission" in msg or "401" in msg or "403" in msg or "unauthenticated" in msg:
            raise HTTPException(
                status_code=503,
                detail="Food scan service is unavailable: GEMINI_API_KEY missing or invalid on the backend.",
            ) from e
        if "quota" in msg or "rate" in msg or "429" in msg:
            raise HTTPException(
                status_code=503,
                detail="Food scan service is temporarily over quota. Try again in a minute.",
            ) from e
        raise HTTPException(
            status_code=503,
            detail=f"Food scan failed: {str(e)[:200] or type(e).__name__}",
        ) from e
    increment_scan_count(sb, user["id"])
    return result


@router.get("/barcode/{code}")
async def barcode_lookup(code: str, user: dict = Depends(get_current_user)):
    """Exact nutrition for a packaged product by barcode (Open Food Facts).
    Free + unlimited (no AI cost) — not gated by the daily scan limit."""
    code = code.strip()
    if not code.isdigit() or not (8 <= len(code) <= 14):
        raise HTTPException(status_code=400, detail="That doesn't look like a product barcode.")
    try:
        result = await lookup_barcode(code)
    except Exception as e:
        logger.exception("barcode lookup failed")
        raise HTTPException(status_code=503, detail="Food database is unreachable right now. Try the photo scan.") from e
    if result is None:
        raise HTTPException(status_code=404, detail="Not found in the food database. Snap a photo of the food instead.")
    return result


@router.post("/", response_model=MealOut)
def create_meal(body: MealCreate, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    items = [i.model_dump() for i in body.items]
    totals = _sum_items(items)
    meal_row = {
        "user_id": user["id"],
        "photo_url": body.photo_url,
        **totals,
    }
    res = sb.table("meals").insert(meal_row).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Could not save meal")
    meal = res.data[0]
    for it in items:
        sb.table("meal_items").insert({"meal_id": meal["id"], **it}).execute()
    return _meal_with_items(sb, meal)


@router.get("/journal", response_model=NutritionJournal)
def meals_journal(user: dict = Depends(get_current_user), days: int = 14):
    sb = get_supabase()
    since = datetime.now(timezone.utc) - timedelta(days=max(1, min(days, 30)))
    res = (
        sb.table("meals")
        .select("*")
        .eq("user_id", user["id"])
        .gte("scanned_at", since.isoformat())
        .order("scanned_at", desc=True)
        .execute()
    )
    by_date: dict[str, list[MealOut]] = defaultdict(list)
    totals_by_date: dict[str, NutritionDayTotals] = defaultdict(lambda: NutritionDayTotals())

    for row in res.data or []:
        meal = _meal_with_items(sb, row)
        day_key = meal.scanned_at[:10]
        by_date[day_key].append(meal)
        t = totals_by_date[day_key]
        t.calories += meal.total_calories
        t.protein_g += meal.total_protein_g
        t.carbs_g += meal.total_carbs_g
        t.fat_g += meal.total_fat_g
        t.fiber_g += meal.total_fiber_g
        t.sugar_g += meal.total_sugar_g
        t.sodium_mg += meal.total_sodium_mg

    today_key = date.today().isoformat()
    if today_key not in by_date:
        by_date[today_key] = []

    day_keys = sorted(by_date.keys(), reverse=True)
    prior_kcals = [totals_by_date[d].calories for d in day_keys if d != today_key]
    vs_avg_kcal = compute_vs_avg_kcal(prior_kcals, totals_by_date[today_key].calories)
    return NutritionJournal(
        days=[
            NutritionDay(date=d, meals=by_date[d], totals=totals_by_date[d])
            for d in day_keys
        ],
        vs_avg_kcal=vs_avg_kcal,
    )


@router.get("/today")
def meals_today(user: dict = Depends(get_current_user)):
    from app.services.today import fetch_today

    sb = get_supabase()
    profile = safe_single(sb.table("profiles").select("*").eq("id", user["id"]))
    if not profile.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    snap = fetch_today(sb, user["id"], profile.data, user.get("email"))
    return {"meals": snap.meals, "totals": {
        "calories": snap.consumed_calories,
        "protein_g": snap.consumed_protein_g,
        "carbs_g": snap.consumed_carbs_g,
        "fat_g": snap.consumed_fat_g,
    }}


@router.get("/{meal_id}", response_model=MealOut)
def get_meal(meal_id: str, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    res = safe_single(sb.table("meals").select("*").eq("id", meal_id).eq("user_id", user["id"]))
    if not res.data:
        raise HTTPException(status_code=404, detail="Meal not found")
    return _meal_with_items(sb, res.data)


@router.delete("/{meal_id}")
def delete_meal(meal_id: str, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("meals").delete().eq("id", meal_id).eq("user_id", user["id"]).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Meal not found")
    return {"ok": True}
