-- Project kind + why: project-level context the entries can't carry on their own.
--   kind   — what sort of project this is, which frames the "why":
--              client   — built for a client (an engagement); also set `client`
--              internal — OnShore's own operational tooling (a problem we removed)
--              personal — your own product / experiment
--   why    — the framed narrative (markdown): the engagement for client work, the
--            operational problem for internal tooling, the goal for personal work
--   client — the client's name (when kind = client)
alter table projects add column if not exists kind text;
alter table projects drop constraint if exists projects_kind_check;
alter table projects add constraint projects_kind_check
  check (kind is null or kind in ('client', 'internal', 'personal'));
alter table projects add column if not exists why text;
alter table projects add column if not exists client text;
