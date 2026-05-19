-- profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  units text not null check (units in ('metric','imperial')),
  weight_kg numeric not null,
  height_cm numeric not null,
  age int not null,
  sex text not null check (sex in ('male','female')),
  activity_level text not null check (activity_level in ('sedentary','light','moderate','active','very_active')),
  goal text not null check (goal in ('lose','maintain','gain')),
  daily_calorie_target int not null,
  daily_protein_target_g int not null,
  daily_carbs_target_g int not null,
  daily_fat_target_g int not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- meals
create table meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  photo_url text,
  scanned_at timestamptz not null default now(),
  total_calories int not null default 0,
  total_protein_g numeric not null default 0,
  total_carbs_g numeric not null default 0,
  total_fat_g numeric not null default 0,
  total_fiber_g numeric not null default 0,
  total_sugar_g numeric not null default 0,
  total_sodium_mg int not null default 0
);

create table meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meals(id) on delete cascade,
  name text not null,
  portion text,
  calories int not null,
  protein_g numeric not null,
  carbs_g numeric not null,
  fat_g numeric not null,
  fiber_g numeric not null default 0,
  sugar_g numeric not null default 0,
  sodium_mg int not null default 0,
  confidence numeric
);

-- exercises (user-owned)
create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  type text not null check (type in ('strength','cardio','mobility')),
  met_value numeric not null default 5.0,
  default_sets int,
  default_reps int,
  default_duration_sec int
);

-- routines
create table routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table routine_exercises (
  routine_id uuid references routines(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete cascade,
  position int not null,
  sets int,
  reps int,
  duration_sec int,
  primary key (routine_id, position)
);

-- workout sessions
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  routine_id uuid references routines(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_sec int,
  calories_burned int not null default 0
);

create table session_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  exercise_id uuid references exercises(id),
  position int not null,
  reps int,
  weight_kg numeric,
  duration_sec int
);

create index meals_user_scanned_idx on meals (user_id, scanned_at desc);
create index sessions_user_started_idx on sessions (user_id, started_at desc);

-- RLS
alter table profiles enable row level security;
alter table meals enable row level security;
alter table meal_items enable row level security;
alter table exercises enable row level security;
alter table routines enable row level security;
alter table routine_exercises enable row level security;
alter table sessions enable row level security;
alter table session_sets enable row level security;

create policy profiles_select on profiles for select using (id = auth.uid());
create policy profiles_insert on profiles for insert with check (id = auth.uid());
create policy profiles_update on profiles for update using (id = auth.uid());
create policy profiles_delete on profiles for delete using (id = auth.uid());

create policy meals_all on meals for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy meal_items_select on meal_items for select using (
  exists (select 1 from meals m where m.id = meal_id and m.user_id = auth.uid())
);
create policy meal_items_insert on meal_items for insert with check (
  exists (select 1 from meals m where m.id = meal_id and m.user_id = auth.uid())
);
create policy meal_items_update on meal_items for update using (
  exists (select 1 from meals m where m.id = meal_id and m.user_id = auth.uid())
);
create policy meal_items_delete on meal_items for delete using (
  exists (select 1 from meals m where m.id = meal_id and m.user_id = auth.uid())
);

create policy exercises_all on exercises for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy routines_all on routines for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy routine_exercises_select on routine_exercises for select using (
  exists (select 1 from routines r where r.id = routine_id and r.user_id = auth.uid())
);
create policy routine_exercises_insert on routine_exercises for insert with check (
  exists (select 1 from routines r where r.id = routine_id and r.user_id = auth.uid())
);
create policy routine_exercises_update on routine_exercises for update using (
  exists (select 1 from routines r where r.id = routine_id and r.user_id = auth.uid())
);
create policy routine_exercises_delete on routine_exercises for delete using (
  exists (select 1 from routines r where r.id = routine_id and r.user_id = auth.uid())
);

create policy sessions_all on sessions for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy session_sets_select on session_sets for select using (
  exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid())
);
create policy session_sets_insert on session_sets for insert with check (
  exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid())
);
create policy session_sets_update on session_sets for update using (
  exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid())
);
create policy session_sets_delete on session_sets for delete using (
  exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid())
);

-- Storage bucket (run in dashboard or via supabase CLI)
-- insert into storage.buckets (id, name, public) values ('meal-photos', 'meal-photos', false);
