from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, create_client

from app.config import settings

security = HTTPBearer()


def get_supabase() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


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
