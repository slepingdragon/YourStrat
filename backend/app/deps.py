import time

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from postgrest.exceptions import APIError
from supabase import Client, create_client

from app.config import settings

security = HTTPBearer()


def get_supabase() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


class _EmptySingle:
    """Stand-in for a postgrest response when maybe_single() matched 0 rows.
    Newer postgrest-py returns None entirely instead of Response(data=None)."""
    data = None


def _is_clock_skew(e: APIError) -> bool:
    # PGRST303 "JWT issued at future" — transient clock skew between Supabase
    # services; it self-heals within ~a second.
    code = getattr(e, "code", None)
    msg = (getattr(e, "message", None) or str(e)).lower()
    return code == "PGRST303" or "issued at future" in msg


def safe_single(query):
    """Run `.maybe_single().execute()` and always return an object with `.data`.
    Use instead of `.maybe_single().execute()` directly. Retries once on a
    transient PGRST303 clock-skew error."""
    single = query.maybe_single()
    for attempt in range(2):
        try:
            res = single.execute()
            return res if res is not None else _EmptySingle()
        except APIError as e:
            if attempt == 0 and _is_clock_skew(e):
                time.sleep(1.0)
                continue
            raise
    return _EmptySingle()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credentials.credentials
    sb = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    try:
        res = sb.auth.get_user(token)
    except Exception as e:
        err = str(e).lower()
        if "10061" in err or "connection refused" in err or "connect" in err:
            raise HTTPException(
                status_code=503,
                detail="Backend cannot reach Supabase. Check SUPABASE_URL in backend/.env.",
            ) from e
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sign in again. Your session may have expired.",
        ) from e

    user = getattr(res, "user", None)
    if not user or not getattr(user, "id", None):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token did not resolve to a user",
        )

    return {"id": user.id, "email": getattr(user, "email", None)}
