# YourStrat

Focused fitness coach: food scan, workouts, daily snapshot.

See [YOURSTRAT_BUILD.md](YOURSTRAT_BUILD.md) for the full spec.

## Setup

### Supabase

1. Create a project and run [supabase/migrations/001_init.sql](supabase/migrations/001_init.sql)
2. Create private bucket `meal-photos` with per-user policies (see [supabase/README.md](supabase/README.md))
3. Configure auth redirect URLs: `yourstrat://` and `yourstrat://reset-confirm`

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# fill SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY
uvicorn app.main:app --host 0.0.0.0 --port 18000 --reload
```

### Mobile

```powershell
cd mobile
copy .env.example .env
# fill EXPO_PUBLIC_* vars; use LAN IP for API on device
npm install
npx expo start
```

### Mobile preview in Cursor

1. `npm install` in `mobile/` (once).
2. Backend venv: `cd backend`, `python -m venv .venv`, `pip install -r requirements.txt`.
3. Copy `mobile/.env.example` → `mobile/.env` and fill Supabase keys (auth screens need them).
4. **Run Build Task** — **Terminal → Run Build Task**, or **Ctrl+Shift+P** → **Tasks: Run Build Task** → **YourStrat: Mobile Preview**, or from repo root:

```powershell
.\scripts\start-dev.ps1
```

That starts the API on port **18000**, Expo web on **18081**, then opens the phone frame in the editor Simple Browser. For full-width web UI, use task **YourStrat: Open app (full width)**.

**Shortcuts:** **Ctrl+Alt+B** runs the default build task in this workspace (see `.vscode/keybindings.json`). **Ctrl+Shift+B** works only when the editor has focus—not when the Simple Browser preview panel is focused (the browser steals it for bookmarks).

**If tasks do nothing:** reload the window (**Ctrl+Shift+P** → **Developer: Reload Window**), then try again. The script above kills stale processes on ports **18000**, **18081**, **18082**, and **18083**, starts the API, waits for `/health`, then starts Expo with `--clear` so `mobile/.env` is re-read. Open **Simple Browser** to `http://127.0.0.1:18082/preview-frame.html` after Metro is ready.

`mobile/.env` must set `EXPO_PUBLIC_API_URL=http://127.0.0.1:18000` (not `localhost`) for the web preview iframe.

Manual terminals: `cd backend` + uvicorn, and `cd mobile && npm run preview`.

### API connection errors (web preview)

If the app shows **Cannot reach the API** on sign-in screens:

1. **Backend** — open `http://127.0.0.1:18000/health` in a browser; expect JSON `{"ok":true,...}`. If it fails, start the API (`.\scripts\start-dev.ps1` or uvicorn in `backend/`).
2. **Metro proxy** — with Expo running, open `http://127.0.0.1:18081/api/health` (or your Expo port). Expect the same JSON, not an HTML page. HTML means Metro started without `metro.config.js` proxy — stop old Expo processes and run `start-dev.ps1` or `npx expo start --web --clear`.
3. **Stale session** — a saved Supabase session can trigger profile load on `/login`; the app no longer toasts on public auth routes, but sign out from Profile if redirects behave oddly.

Native builds use `EXPO_PUBLIC_API_URL` directly (no `/api` proxy).

### Browser + Railway only

Use a deployed backend without running local uvicorn or `start-dev.ps1`:

1. In `mobile/.env`, set `EXPO_PUBLIC_API_URL` to your Railway HTTPS API URL (e.g. `https://yourstrat-production.up.railway.app`). Include `https://` — bare hostnames are auto-normalized, but the explicit scheme avoids confusion.
2. Verify deploy: `Invoke-WebRequest https://YOUR_APP.up.railway.app/health` should return `{"ok":true,...}`. If it fails while the service is “Online”, check Railway **Networking → Public domain target port** matches the port uvicorn binds to (`$PORT` in `backend/railway.json`; Railway sets `PORT` automatically — do not change the service port in the UI unless you know the app is listening on a different port).
3. Ensure the same Supabase keys as production and that Railway CORS allows your Expo web origin (ports **18081–18083** on `localhost` / `127.0.0.1` are in `backend/app/main.py`).
4. From `mobile/`:

```powershell
npm run web:remote
```

Open the URL Expo prints (default `http://localhost:18081`). The app calls Railway directly; no Metro `/api` proxy.

### Deploy

- **Railway:** connect repo, set root to `backend`, env vars from `.env.example`
- **TestFlight:** `cd mobile && npx eas build --platform ios --profile production` (after `eas init`)

## Git workflow

From the repo root:

```powershell
git add -A
git commit -m "describe your change"
git push origin main
```

Do not commit secrets: `mobile/.env` and `backend/.env` are gitignored; use the `.env.example` files as templates.
