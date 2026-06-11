# Work-Memory

Career memory for everything I build at Onshore Labs. Manually triggered from Claude Code —
no daemon. It self-assembles from real signals (git commits, changed files, PR descriptions,
Claude transcripts, TODOs) plus interview-captured PM reasoning, then feeds a web app.

## Architecture (hybrid)

```
Claude Code  ──/worklog──▶  career-memory/*.md   ──push.py──▶  Supabase (Postgres)  ──▶  app/
 (capture)                  (source of truth,                  (backend)                 (review,
                             git-friendly, offline)                                       resume, share)
```

- **`career-memory/`** — human-readable markdown, the source of truth. Git-friendly, offline,
  hand-editable. See `career-memory/README.md` for the frontmatter format.
- **Supabase** — structured backend the app reads. `supabase/migrations/0001_init.sql` is the schema.
- **`scripts/push.py`** — idempotent sync from markdown → Supabase.
- **`app/`** — Next.js dashboard: timeline, project/feature drill-down, decision logs, weekly, resume.

## The skill: `/worklog`

Global skill at `~/.claude/skills/worklog/`. Works from inside any Onshore repo.

| Command | What it does |
|---|---|
| `/worklog log [--feature <name>]` | Capture work in the current repo since the last entry (git + PR + transcript). Falls back to `note` if no transcript. |
| `/worklog note [--feature <name>]` | Interview-driven capture of pure thinking — problem, options, decision, rationale, foresight, outcome. The PM-showcase path. |
| `/worklog reconstruct` | Backfill a project from full git history + all past transcripts. |
| `/worklog week` | Weekly report from the last 7 days. |
| `/worklog resume` | Resume bullets from achievements + high-impact entries. |
| `/worklog achievements [--project <slug>] [--feature <name>]` | Show achievements. |
| `/worklog all [--project <slug>] [--feature <name>]` | Show the full timeline / portfolio. |

**Project** = a repo. **Feature** = a named part of it (Bombino → `admin-panel`, `mail-automation`).
Entries optionally tag a feature, so you can highlight a whole project or just one slice.

## Setup

1. **Create a Supabase project** (https://supabase.com).
2. Run `supabase/migrations/0001_init.sql` in the SQL editor.
3. `cp .env.example .env` and fill in `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.
4. Install push deps: `pip install -r scripts/requirements.txt`.
5. App: `cd app && npm install`, create `app/.env.local` with `NEXT_PUBLIC_SUPABASE_URL` +
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then `npm run dev`.

## Usage

From any Onshore repo: `/worklog log` after a chunk of work, or `/worklog note` to capture
thinking. Then `python scripts/push.py` to sync (the skill runs this for you). Open the app to review.

## Security note

The starter schema grants **anon read** so the app works out of the box. The service-role key is
write-only-via-script and must never reach the browser. Lock down RLS / add auth before storing
anything sensitive.
