import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.deps import get_supabase
from app.routers import exercises, meals, profile, routines, sessions, today

logger = logging.getLogger(__name__)
app = FastAPI(title="YourStrat API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile.router)
app.include_router(meals.router)
app.include_router(exercises.router)
app.include_router(routines.router)
app.include_router(sessions.router)
app.include_router(today.router)


@app.on_event("startup")
def log_supabase_host():
    host = settings.SUPABASE_URL.replace("https://", "").split("/")[0]
    logger.info("Supabase host: %s", host)


@app.get("/health")
def health():
    return {"ok": True, "supabase": settings.SUPABASE_URL.startswith("https://")}
