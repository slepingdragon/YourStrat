import uuid

from supabase import Client


def upload_meal_photo(sb: Client, user_id: str, image_bytes: bytes, content_type: str = "image/jpeg") -> str:
    ext = "jpg" if "jpeg" in content_type or "jpg" in content_type else "png"
    path = f"{user_id}/{uuid.uuid4()}.{ext}"
    sb.storage.from_("meal-photos").upload(
        path,
        image_bytes,
        {"content-type": content_type, "upsert": "false"},
    )
    return path


def signed_photo_url(sb: Client, path: str, expires_in: int = 3600) -> str:
    res = sb.storage.from_("meal-photos").create_signed_url(path, expires_in)
    if isinstance(res, dict):
        return res.get("signedURL") or res.get("signedUrl") or ""
    return getattr(res, "signed_url", "") or ""
