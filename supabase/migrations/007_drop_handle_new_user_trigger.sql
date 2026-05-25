-- 007 — Remove the leftover auth-helper "new user" trigger.
--
-- WHY: During Google sign-in setup the Supabase "User Management" quickstart was
-- run, which created `public.handle_new_user()` + the `on_auth_user_created`
-- trigger on `auth.users`. That trigger inserts a row into `public.profiles`
-- using only (id, display_name, avatar_url). After the 2026-05-24 schema fix
-- re-added the original NOT NULL nutrition columns (units, weight_kg, height_cm,
-- age, sex, activity_level, goal, daily_*_target — no defaults), the trigger's
-- insert violates those constraints, so GoTrue fails creating ANY new user with
-- "server_error: Database error saving new user" (Google OAuth and email signup).
--
-- YourStrat creates the profile itself at onboarding via POST /profile/onboard
-- (`profiles.upsert(..., on_conflict=id)` with every required column), so no
-- auth trigger is needed. Dropping it is safe: a new auth user simply has no
-- profile row until onboarding upserts the full one.
--
-- DIAGNOSE FIRST (optional — confirm the names before dropping):
--   select tgname, pg_get_triggerdef(oid)
--   from pg_trigger
--   where tgrelid = 'auth.users'::regclass and not tgisinternal;
--   select proname, prosrc from pg_proc where proname = 'handle_new_user';
-- If your trigger/function have different names, substitute them below.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
