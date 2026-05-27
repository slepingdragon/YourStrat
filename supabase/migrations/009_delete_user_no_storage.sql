-- 009 — Fix delete_user(): stop deleting storage objects directly.
--
-- WHY: Supabase now blocks direct DELETE on storage.objects at the DB level
-- (error 42501: "Direct deletion from storage tables is not allowed. Use the
-- Storage API instead."). Migration 008's delete_user() ran exactly that DELETE
-- first, so the whole function aborted and NO account/data was deleted — the
-- Play-mandatory in-app account deletion was silently broken.
--
-- HOW: drop the storage.objects DELETE. Meal photos are not uploaded to storage
-- today (the app saves meals with photo_url = null; upload_meal_photo is unused),
-- so there is nothing to clean up — and deleting the auth.users row cascades to
-- profiles + every user table, which fully satisfies the deletion requirement.
--
-- WHEN MEAL-PHOTO UPLOAD IS WIRED LATER: delete the user's meal-photos/{uid}/...
-- objects via the Storage API (service role) from the backend before/after this
-- call — NOT via SQL (the DB blocks it). Do not re-add the DELETE here.
--
-- RUN: paste into the Supabase SQL editor (same as migration 008).

create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Cascades to profiles + all user data: auth.users → profiles → meals →
  -- meal_items, exercises, routines → routine_exercises/routine_days,
  -- sessions → session_sets, daily_scan_counts. All FKs are ON DELETE CASCADE.
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_user() from public, anon;
grant execute on function public.delete_user() to authenticated;
