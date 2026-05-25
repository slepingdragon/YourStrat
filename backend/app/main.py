import logging
import sys

import json

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse

from app.config import settings
from app.routers import exercises, meals, profile, routines, sessions, today

# Uvicorn only configures its own loggers (uvicorn / uvicorn.access). Without
# this, our app.* loggers propagate to root (default level WARNING), so every
# logger.info(...) — including the food-scan diagnostics (image byte size + raw
# Gemini output) — is silently dropped and never reaches the Railway log stream.
# Configure the app namespace to INFO on stdout so those lines actually show.
logging.basicConfig(level=logging.INFO, stream=sys.stdout, format="%(levelname)s:%(name)s:%(message)s")
logging.getLogger("app").setLevel(logging.INFO)

logger = logging.getLogger(__name__)
app = FastAPI(title="YourStrat API", version="1.0.0")

# Credentials + wildcard origin is invalid in browsers; allow Expo web preview hosts.
_CORS_ORIGINS = [
    "http://localhost:18081",
    "http://127.0.0.1:18081",
    "http://localhost:18082",
    "http://127.0.0.1:18082",
    "http://localhost:18083",
    "http://127.0.0.1:18083",
    "http://localhost:19006",
    "http://127.0.0.1:19006",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
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


_ROOT_HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>YourStrat API</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 36rem; margin: 3rem auto; padding: 0 1rem; line-height: 1.5; color: #1f2937; }
    h1 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    p { color: #4b5563; }
    a { color: #2563eb; }
    code { background: #f3f4f6; padding: 0.1em 0.35em; border-radius: 4px; font-size: 0.9em; }
    ul { padding-left: 1.25rem; }
  </style>
</head>
<body>
  <h1>YourStrat API</h1>
  <p>This server (<code>127.0.0.1:18000</code>) is the backend only — not the mobile app UI.</p>
  <ul>
    <li><a href="/docs">API docs (Swagger)</a></li>
    <li><a href="/health?html=1">Health check</a> (<a href="/health">JSON</a>)</li>
    <li>App preview: <a href="http://127.0.0.1:18082/preview-frame.html">http://127.0.0.1:18082/preview-frame.html</a> (Expo web; port 18083 if 18082 is busy)</li>
  </ul>
  <p>In VS Code/Cursor: <strong>Terminal → Run Build Task</strong>, or <strong>Ctrl+Shift+P</strong> → <em>Tasks: Run Build Task</em> → <em>YourStrat: Mobile Preview</em>, or <code>.\scripts\start-dev.ps1</code> from repo root. <em>Ctrl+Shift+B</em> only when the editor is focused; <strong>Ctrl+Alt+B</strong> in this workspace.</p>
</body>
</html>"""


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
def root():
    return HTMLResponse(_ROOT_HTML)


_HEALTH_PAYLOAD = lambda: {
    "ok": True,
    "supabase": settings.SUPABASE_URL.startswith("https://"),
}


@app.get("/health")
def health(request: Request):
    payload = _HEALTH_PAYLOAD()
    accept = request.headers.get("accept", "")
    if "text/html" in accept or request.query_params.get("html") is not None:
        body = json.dumps(payload, indent=2)
        return HTMLResponse(
            f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><title>YourStrat /health</title>
<style>body{{font-family:system-ui,sans-serif;margin:2rem;line-height:1.5;color:#1f2937}}
pre{{background:#f3f4f6;padding:1rem;border-radius:8px}}</style></head>
<body><h1>Health</h1><pre>{body}</pre>
<p><a href="/">API home</a> · <a href="/health">JSON only</a></p></body></html>"""
        )
    return JSONResponse(content=payload, media_type="application/json")
