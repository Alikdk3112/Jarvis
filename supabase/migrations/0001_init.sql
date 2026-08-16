-- ═════════════════════════════════════════════════════════════════════
-- Personal OS — initial schema
--
-- Tables are prefixed `os_` because this project also hosts an older,
-- unrelated app's tables (habits, tasks, notes, ...) that stay untouched.
--
-- Single-user app: every table carries user_id for forward-compatibility
-- with multi-user mode (see README "Going further"), but access control
-- for now is the app's HMAC-cookie auth gate, not Postgres auth. RLS is
-- therefore deny-all across the board — every read/write must go through
-- the service-role key from a trusted server route.
-- ═════════════════════════════════════════════════════════════════════

create extension if not exists vector;
create extension if not exists pgcrypto;

-- ── Entities ─────────────────────────────────────────────────────────
-- People, companies, projects — anything a task or capture can be routed to.
create table if not exists public.os_entities (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  name       text not null,
  kind       text not null default 'other',
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ── Raw captures ─────────────────────────────────────────────────────
-- Every voice/text capture, before and after AI classification/routing.
create table if not exists public.os_raw_captures (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null,
  source         text not null check (source in ('telegram', 'web')),
  raw_text       text not null,
  audio_url      text,
  classification jsonb,
  llm_source     text check (llm_source in ('anthropic', 'openai', 'regex')),
  routed_to      text,
  routed_id      uuid,
  created_at     timestamptz not null default now()
);

-- ── Tasks ────────────────────────────────────────────────────────────
create table if not exists public.os_tasks (
  id                uuid primary key default gen_random_uuid(),
  user_id           text not null,
  title             text not null,
  description       text,
  urgency           text not null default 'someday'
                      check (urgency in ('today', 'this_week', 'this_month', 'someday')),
  key               boolean not null default false,
  priority_score    double precision not null default 0,
  time_estimate_min int,
  tags              text[] not null default '{}',
  due_date          date,
  owner             text,
  entity_id         uuid references public.os_entities (id) on delete set null,
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists os_tasks_user_urgency_idx on public.os_tasks (user_id, urgency);
create index if not exists os_tasks_user_completed_idx on public.os_tasks (user_id, completed_at);

-- ── Daily logs ───────────────────────────────────────────────────────
-- One row per user per day; `notes` holds the JSON payloads for habits,
-- nutrition, and (on the GOALS_SENTINEL_DATE row only) goals/finance.
create table if not exists public.os_daily_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  log_date   date not null,
  notes      jsonb not null default '{}'::jsonb,
  mood       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

-- ── Memory chunks ────────────────────────────────────────────────────
create table if not exists public.os_memory_chunks (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  source_type text not null,
  source_id   uuid not null,
  text        text not null,
  embedding   vector(1536),
  created_at  timestamptz not null default now()
);

create index if not exists os_memory_chunks_embedding_idx
  on public.os_memory_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ── Audit log ────────────────────────────────────────────────────────
create table if not exists public.os_audit_log (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null,
  action        text not null,
  resource_type text not null,
  resource_id   uuid,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

-- ── Vector search RPC ────────────────────────────────────────────────
-- supabase-js can't express `<=>` in .select(), so cosine search goes
-- through this function instead.
create or replace function public.match_os_memory_chunks(
  query_embedding vector(1536),
  match_user_id text,
  match_count int default 20
)
returns table (
  id uuid,
  user_id text,
  source_type text,
  source_id uuid,
  text text,
  created_at timestamptz,
  similarity double precision
)
language sql stable
as $$
  select
    id, user_id, source_type, source_id, text, created_at,
    1 - (embedding <=> query_embedding) as similarity
  from public.os_memory_chunks
  where user_id = match_user_id
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- ── Row Level Security: deny-all. Service role bypasses RLS entirely. ──
alter table public.os_entities enable row level security;
alter table public.os_raw_captures enable row level security;
alter table public.os_tasks enable row level security;
alter table public.os_daily_logs enable row level security;
alter table public.os_memory_chunks enable row level security;
alter table public.os_audit_log enable row level security;
