"""Barcode -> exact nutrition via Open Food Facts (free, keyless, crowd DB).

Packaged foods can't be reliably estimated from a photo, so we look them up by
barcode and return the manufacturer's real per-serving facts in the same shape
as the Gemini photo scan ({"items": [item]}). None = not found / unusable.
"""
import httpx

_OFF_URL = "https://world.openfoodfacts.org/api/v2/product/{code}.json"
_OFF_FIELDS = "product_name,brands,nutriments,serving_size,serving_quantity"
# Open Food Facts asks API clients to identify themselves.
_HEADERS = {"User-Agent": "YourStrat/1.0 (https://yourstrat.xaeryx.com)"}


def _num(value: object) -> float:
    try:
        n = float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return 0.0
    return n if n >= 0 else 0.0


def _product_to_item(product: dict) -> dict | None:
    nutr = product.get("nutriments") or {}
    if not isinstance(nutr, dict):
        return None

    serving_qty = _num(product.get("serving_quantity"))  # grams in one serving

    def per_serving(key_100g: str, key_serving: str) -> float:
        """Prefer the per-serving value; else scale per-100g by the serving size."""
        if key_serving in nutr:
            return _num(nutr.get(key_serving))
        base = _num(nutr.get(key_100g))
        return base * serving_qty / 100.0 if serving_qty > 0 else base

    kcal = per_serving("energy-kcal_100g", "energy-kcal_serving")
    if kcal <= 0:  # some products only list energy in kJ
        kj = per_serving("energy_100g", "energy_serving")
        kcal = kj / 4.184 if kj > 0 else 0.0

    protein = per_serving("proteins_100g", "proteins_serving")
    carbs = per_serving("carbohydrates_100g", "carbohydrates_serving")
    fat = per_serving("fat_100g", "fat_serving")
    fiber = per_serving("fiber_100g", "fiber_serving")
    sugar = per_serving("sugars_100g", "sugars_serving")

    sodium_g = per_serving("sodium_100g", "sodium_serving")
    if sodium_g <= 0:  # derive from salt (1 g salt = 393 mg sodium)
        salt_g = per_serving("salt_100g", "salt_serving")
        sodium_g = salt_g * 0.3934 if salt_g > 0 else 0.0

    if kcal <= 0 and protein <= 0 and carbs <= 0 and fat <= 0:
        return None  # no usable nutrition in the DB entry

    name = (product.get("product_name") or "").strip()
    brand = (product.get("brands") or "").split(",")[0].strip()
    if brand and brand.lower() not in name.lower():
        name = f"{brand} {name}".strip()
    name = name[:120] or "Packaged food"

    portion = (product.get("serving_size") or "").strip()
    if not portion:
        portion = f"{int(serving_qty)} g" if serving_qty > 0 else "100 g"

    return {
        "name": name,
        "portion": portion[:80],
        "calories": int(round(kcal)),
        "protein_g": round(protein, 1),
        "carbs_g": round(carbs, 1),
        "fat_g": round(fat, 1),
        "fiber_g": round(fiber, 1),
        "sugar_g": round(min(sugar, carbs) if carbs > 0 else sugar, 1),  # sugar <= carbs
        "sodium_mg": int(round(sodium_g * 1000)),
        "confidence": 1.0,  # exact from the product database
    }


async def lookup_barcode(code: str) -> dict | None:
    """Look up a packaged product by barcode. Returns {"items": [item]} or None."""
    async with httpx.AsyncClient(timeout=10.0, headers=_HEADERS) as client:
        resp = await client.get(_OFF_URL.format(code=code), params={"fields": _OFF_FIELDS})
    if resp.status_code != 200:
        return None
    data = resp.json()
    if data.get("status") != 1 or not isinstance(data.get("product"), dict):
        return None
    item = _product_to_item(data["product"])
    return {"items": [item]} if item else None
