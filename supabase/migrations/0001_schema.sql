-- ═════════════════════════════════════════════════════════════════════
-- JARVIS — Schema, Row Level Security und Zugangsbeschränkung
--
-- Noch nicht eingespielt: die App läuft zunächst mit lokaler Speicherung
-- (IndexedDB). Sobald ein Supabase-Projekt existiert, wird diese Datei
-- ausgeführt und VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY gesetzt —
-- dann schaltet src/lib/data/index.ts automatisch um.
--
-- Grundregeln:
--   • jede Tabelle trägt user_id und ist per RLS auf auth.uid() beschränkt
--   • Spaltennamen in snake_case, die App wandelt mechanisch um
--   • ids kommen vom Client (crypto.randomUUID), damit lokale Daten
--     unverändert importiert werden können
-- ═════════════════════════════════════════════════════════════════════

-- ── Profil ───────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  display_name text,
  settings     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- ── Habits ───────────────────────────────────────────────────────────
create table if not exists public.habits (
  id              uuid primary key,
  user_id         uuid not null references auth.users on delete cascade,
  name            text not null,
  color           text not null default 'habits',
  target_per_week int  not null default 7 check (target_per_week between 1 and 7),
  sort_order      int  not null default 0,
  archived        boolean not null default false,
  created_at      timestamptz not null default now()
);

create table if not exists public.habit_entries (
  id       uuid primary key,
  user_id  uuid not null references auth.users on delete cascade,
  habit_id uuid not null references public.habits on delete cascade,
  date     date not null,
  done     boolean not null default true,
  -- Ein Haken pro Habit und Tag; ein zweiter überschreibt den ersten.
  unique (habit_id, date)
);

-- ── Aufgaben und Notizen ─────────────────────────────────────────────
create table if not exists public.tasks (
  id         uuid primary key,
  user_id    uuid not null references auth.users on delete cascade,
  title      text not null,
  notes      text,
  due_at     text,
  tag        text,
  done       boolean not null default false,
  done_at    timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id         uuid primary key,
  user_id    uuid not null references auth.users on delete cascade,
  title      text not null default '',
  body       text not null default '',
  tags       text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Journal ──────────────────────────────────────────────────────────
create table if not exists public.journal_entries (
  id         uuid primary key,
  user_id    uuid not null references auth.users on delete cascade,
  date       date not null,
  body       text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Genau ein Eintrag pro Tag.
  unique (user_id, date)
);

-- ── Uni und Lernzeit ─────────────────────────────────────────────────
create table if not exists public.courses (
  id         uuid primary key,
  user_id    uuid not null references auth.users on delete cascade,
  name       text not null,
  ects       int  not null default 5,
  semester   text,
  exam_date  date,
  grade      numeric(2,1) check (grade is null or grade between 1.0 and 5.0),
  passed     boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.study_sessions (
  id         uuid primary key,
  user_id    uuid not null references auth.users on delete cascade,
  course_id  uuid references public.courses on delete set null,
  date       date not null,
  started_at timestamptz not null default now(),
  seconds    int  not null check (seconds >= 0),
  note       text
);

-- ── Ziele ────────────────────────────────────────────────────────────
create table if not exists public.goals (
  id          uuid primary key,
  user_id     uuid not null references auth.users on delete cascade,
  title       text not null,
  description text,
  target_date date,
  progress    int  not null default 0 check (progress between 0 and 100),
  status      text not null default 'active' check (status in ('active','done','dropped')),
  created_at  timestamptz not null default now()
);

-- ── Sport ────────────────────────────────────────────────────────────
create table if not exists public.workouts (
  id         uuid primary key,
  user_id    uuid not null references auth.users on delete cascade,
  date       date not null,
  type       text not null,
  minutes    int  not null default 0 check (minutes >= 0),
  note       text,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_sets (
  id         uuid primary key,
  user_id    uuid not null references auth.users on delete cascade,
  workout_id uuid not null references public.workouts on delete cascade,
  exercise   text not null,
  reps       int  not null default 0,
  weight     numeric(6,2) not null default 0,
  sort_order int  not null default 0
);

-- ── Indizes für die Abfragen, die die App tatsächlich stellt ─────────
create index if not exists habit_entries_user_date_idx  on public.habit_entries (user_id, date);
create index if not exists study_sessions_user_date_idx on public.study_sessions (user_id, date);
create index if not exists tasks_user_done_idx          on public.tasks (user_id, done);
create index if not exists workouts_user_date_idx       on public.workouts (user_id, date);

-- ── Row Level Security ───────────────────────────────────────────────
-- Ohne diese Regeln wäre jede Zeile für jeden angemeldeten Nutzer sichtbar.
alter table public.profiles        enable row level security;
alter table public.habits          enable row level security;
alter table public.habit_entries   enable row level security;
alter table public.tasks           enable row level security;
alter table public.notes           enable row level security;
alter table public.journal_entries enable row level security;
alter table public.courses         enable row level security;
alter table public.study_sessions  enable row level security;
alter table public.goals           enable row level security;
alter table public.workouts        enable row level security;
alter table public.workout_sets    enable row level security;

drop policy if exists "eigenes Profil" on public.profiles;
create policy "eigenes Profil" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array[
    'habits','habit_entries','tasks','notes','journal_entries',
    'courses','study_sessions','goals','workouts','workout_sets'
  ] loop
    execute format('drop policy if exists "eigene Zeilen" on public.%I', t);
    execute format(
      'create policy "eigene Zeilen" on public.%I for all
         using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

-- ── Zugang auf eine Person begrenzen ─────────────────────────────────
-- Dasselbe Muster wie im bestehenden Projekt "birthday": ohne Eintrag in
-- allowed_emails bricht die Registrierung ab. Damit ist die App auch unter
-- öffentlicher URL dicht, selbst wenn jemand den anon key kennt.
create table if not exists public.allowed_emails (
  email text primary key
);
alter table public.allowed_emails enable row level security;
-- Kein Client-Zugriff: die Tabelle wird ausschließlich im SQL-Editor gepflegt.

insert into public.allowed_emails (email)
values ('ali.kodak@outlook.de')
on conflict (email) do nothing;

create or replace function public.enforce_allowed_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.allowed_emails
    where lower(email) = lower(new.email)
  ) then
    raise exception 'Diese E-Mail-Adresse ist für JARVIS nicht freigeschaltet.';
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;

  return new;
end $$;

drop trigger if exists enforce_allowed_email on auth.users;
create trigger enforce_allowed_email
  before insert on auth.users
  for each row execute function public.enforce_allowed_email();
