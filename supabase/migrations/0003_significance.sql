-- Significance: the editorial weight of an entry — how powerful a read it is.
-- Decided by the worklog skill at capture time and stored on the row so the app
-- can tier entries visually (featured cards for the standouts vs a flat list).
--   landmark — rare, field-defining decision; the strongest read in a project
--   notable  — strong reasoning / real impact; worth surfacing above the rest
--   standard — a normal entry (the default)
alter table work_entries
  add column if not exists significance text not null default 'standard';

alter table work_entries
  drop constraint if exists work_entries_significance_check;
alter table work_entries
  add constraint work_entries_significance_check
  check (significance in ('landmark', 'notable', 'standard'));
