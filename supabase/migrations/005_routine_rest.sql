-- Per-exercise rest duration for routines.
-- Falls back to 60s in the app when null.
alter table routine_exercises
  add column if not exists rest_sec int;
