-- Work-Memory schema: career memory backend
-- Run in Supabase SQL editor (or `supabase db push`).
-- Idempotent natural keys let the push script upsert without duplicating.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  repo_path   text,
  remote_url  text,
  description text,
  status      text not null default 'active',   -- active | paused | shipped | archived
  started_at  date,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- features : a named part of a project (Bombino -> admin-panel, mail-automation)
-- ---------------------------------------------------------------------------
create table if not exists features (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  slug        text not null,
  name        text not null,
  description text,
  status      text not null default 'active',
  created_at  timestamptz not null default now(),
  unique (project_id, slug)
);

-- ---------------------------------------------------------------------------
-- work_entries : the timeline. PM-reasoning fields are first-class columns.
-- ---------------------------------------------------------------------------
create table if not exists work_entries (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid not null references projects(id) on delete cascade,
  feature_id         uuid references features(id) on delete set null,
  occurred_on        date not null,
  title              text not null,
  summary            text,
  source             text[] not null default '{}',  -- commit | transcript | pr | todo | manual
  source_ref         text,                           -- sha, pr#, or 'manual'
  files_changed      int,
  -- PM-showcase layer: critical thinking + situational awareness
  context            text,
  options_considered text,
  decision           text,
  rationale          text,
  foresight          text,
  outcome            text,
  details            jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  unique (project_id, source_ref, occurred_on)
);

-- ---------------------------------------------------------------------------
-- commits : raw git signal tied to a project
-- ---------------------------------------------------------------------------
create table if not exists commits (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  sha           text not null unique,
  message       text,
  authored_at   timestamptz,
  branch        text,
  files_changed text[] not null default '{}',
  insertions    int,
  deletions     int
);

-- ---------------------------------------------------------------------------
-- achievements
-- ---------------------------------------------------------------------------
create table if not exists achievements (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  feature_id  uuid references features(id) on delete set null,
  title       text not null,
  description text,
  impact      text,
  occurred_on date,
  tags        text[] not null default '{}',
  unique (project_id, title)
);

-- ---------------------------------------------------------------------------
-- skills + entry_skills join
-- ---------------------------------------------------------------------------
create table if not exists skills (
  id       uuid primary key default gen_random_uuid(),
  name     text not null unique,
  category text
);

create table if not exists entry_skills (
  work_entry_id uuid not null references work_entries(id) on delete cascade,
  skill_id      uuid not null references skills(id) on delete cascade,
  primary key (work_entry_id, skill_id)
);

-- ---------------------------------------------------------------------------
-- todos
-- ---------------------------------------------------------------------------
create table if not exists todos (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  text       text not null,
  file_path  text,
  status     text not null default 'open',   -- open | done | dropped
  found_on   date,
  unique (project_id, file_path, text)
);

-- ---------------------------------------------------------------------------
-- weekly_reports
-- ---------------------------------------------------------------------------
create table if not exists weekly_reports (
  id           uuid primary key default gen_random_uuid(),
  week_start   date not null unique,
  week_end     date,
  summary      text,
  highlights   jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- resume_bullets
-- ---------------------------------------------------------------------------
create table if not exists resume_bullets (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  bullet     text not null,
  metric     text,
  skills     text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_work_entries_occurred_on on work_entries (occurred_on desc);
create index if not exists idx_work_entries_project     on work_entries (project_id);
create index if not exists idx_work_entries_feature     on work_entries (feature_id);
create index if not exists idx_features_project         on features (project_id);
create index if not exists idx_achievements_project     on achievements (project_id);
create index if not exists idx_commits_project          on commits (project_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
--   Push script uses the service_role key -> bypasses RLS entirely.
--   The starter app reads with the anon key -> needs explicit read policies.
--   NOTE: anon read is open for the starter app. Lock this down / add auth
--   before putting anything sensitive in here.
-- ---------------------------------------------------------------------------
alter table projects        enable row level security;
alter table features        enable row level security;
alter table work_entries    enable row level security;
alter table commits         enable row level security;
alter table achievements    enable row level security;
alter table skills          enable row level security;
alter table entry_skills    enable row level security;
alter table todos           enable row level security;
alter table weekly_reports  enable row level security;
alter table resume_bullets  enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'projects','features','work_entries','commits','achievements',
    'skills','entry_skills','todos','weekly_reports','resume_bullets'
  ]
  loop
    execute format(
      'create policy %I on %I for select to anon using (true);',
      'anon_read_' || t, t
    );
  end loop;
end $$;
