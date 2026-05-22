-- Pre-workout and post-workout RPE (Rate of Perceived Exertion, 1-10 Borg CR-10 scale).
-- planned_rpe is captured when the user starts a session;
-- actual_rpe is captured on the session summary screen after finishing.

alter table sessions
  add column if not exists planned_rpe smallint check (planned_rpe between 1 and 10),
  add column if not exists actual_rpe smallint check (actual_rpe between 1 and 10);
