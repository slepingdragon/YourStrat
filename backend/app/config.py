import io
from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Windows may set SUPABASE_URL=http://localhost globally; project .env must win.
_env_path = Path(__file__).resolve().parent.parent / ".env"
if _env_path.is_file():
    load_dotenv(stream=io.StringIO(_env_path.read_text(encoding="utf-8-sig")), override=True)
else:
    load_dotenv(_env_path, override=True)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(_env_path), extra="ignore")

    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    DAILY_SCAN_LIMIT: int = 10
    # Comma-separated list of emails that bypass trial gating and scan limits.
    ADMIN_EMAILS: str = "giskanianurzara@gmail.com,baniabradyy@gmail.com"


settings = Settings()


def admin_email_set() -> frozenset[str]:
    return frozenset(e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip())
