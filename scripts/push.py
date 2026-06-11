#!/usr/bin/env python3
"""Sync the career-memory markdown store -> Supabase (idempotent).

Walks career-memory/, parses YAML frontmatter, and upserts rows keyed by natural
keys so re-running never duplicates. Projects + skills + features are resolved
first, then entries / achievements / joins that reference them.

Usage:
    python scripts/push.py [--dry-run] [--home <path-to-career-memory>]

Needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (in .env or the environment).
If creds are missing it exits 0 with a notice — the markdown is still the source
of truth, so a failed/absent push is non-fatal.
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

try:
    import frontmatter
    from dotenv import load_dotenv
except ImportError:
    sys.stderr.write(
        "Missing deps. Run: pip install -r scripts/requirements.txt\n"
    )
    raise SystemExit(1)

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_HOME = REPO_ROOT / "career-memory"


# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #
def slugify(value: str) -> str:
    out = "".join(c if c.isalnum() else "-" for c in str(value).lower())
    while "--" in out:
        out = out.replace("--", "-")
    return out.strip("-")


def load_docs(home: Path) -> list[tuple[Path, frontmatter.Post]]:
    docs = []
    for md in sorted(home.rglob("*.md")):
        if md.name.lower() == "readme.md":
            continue
        post = frontmatter.load(md)
        if post.get("type"):
            docs.append((md, post))
    return docs


class Pusher:
    def __init__(self, client, dry_run: bool):
        self.c = client
        self.dry = dry_run
        self.created = 0
        self.updated = 0
        # caches: natural-key -> uuid
        self.projects: dict[str, str] = {}
        self.features: dict[tuple[str, str], str] = {}
        self.skills: dict[str, str] = {}

    def _upsert(self, table: str, row: dict, on_conflict: str) -> dict | None:
        """Upsert one row, return the stored row (with id)."""
        label = f"{table} <- {row.get('slug') or row.get('title') or row.get('name') or row.get('source_ref') or row.get('week_start') or '?'}"
        if self.dry:
            print(f"  [dry] upsert {label}")
            return {"id": "00000000-0000-0000-0000-000000000000", **row}
        resp = (
            self.c.table(table)
            .upsert(row, on_conflict=on_conflict, returning="representation")
            .execute()
        )
        data = resp.data[0] if resp.data else None
        self.updated += 1
        print(f"  upsert {label}")
        return data

    # -- reference rows ----------------------------------------------------- #
    def project_id(self, slug: str, fields: dict | None = None) -> str:
        slug = slugify(slug)
        if slug in self.projects:
            if fields:  # refresh details if we have richer data
                row = {"slug": slug, **fields}
                stored = self._upsert("projects", row, "slug")
                if stored:
                    self.projects[slug] = stored["id"]
            return self.projects[slug]
        row = {"slug": slug, "name": (fields or {}).get("name", slug), **(fields or {})}
        row["slug"] = slug
        stored = self._upsert("projects", row, "slug")
        pid = stored["id"] if stored else slug
        self.projects[slug] = pid
        return pid

    def feature_id(self, project_id: str, name: str) -> str | None:
        if not name:
            return None
        fslug = slugify(name)
        key = (project_id, fslug)
        if key in self.features:
            return self.features[key]
        row = {"project_id": project_id, "slug": fslug, "name": name}
        stored = self._upsert("features", row, "project_id,slug")
        fid = stored["id"] if stored else None
        if fid:
            self.features[key] = fid
        return fid

    def skill_id(self, name: str) -> str | None:
        name = str(name).strip().lower()
        if not name:
            return None
        if name in self.skills:
            return self.skills[name]
        stored = self._upsert("skills", {"name": name}, "name")
        sid = stored["id"] if stored else None
        if sid:
            self.skills[name] = sid
        return sid

    # -- documents ---------------------------------------------------------- #
    def push_project(self, post):
        m = post.metadata
        fields = {
            "name": m.get("name", m["slug"]),
            "repo_path": m.get("repo_path"),
            "remote_url": m.get("remote_url"),
            "description": post.content.strip() or None,
            "status": m.get("status", "active"),
            "started_at": str(m["started_at"]) if m.get("started_at") else None,
        }
        fields = {k: v for k, v in fields.items() if v is not None}
        pid = self.project_id(m["slug"], fields)
        for feat in m.get("features", []) or []:
            if isinstance(feat, dict):
                self.feature_id(pid, feat.get("name") or feat.get("slug"))
            else:
                self.feature_id(pid, str(feat))

    def push_work_entry(self, post):
        m = post.metadata
        pid = self.project_id(m["project"])
        fid = self.feature_id(pid, m["feature"]) if m.get("feature") else None
        row = {
            "project_id": pid,
            "feature_id": fid,
            "occurred_on": str(m["occurred_on"]),
            "title": m["title"],
            "summary": post.content.strip() or None,
            "source": m.get("source", []) or [],
            "source_ref": str(m.get("source_ref") or "manual"),
            "files_changed": m.get("files_changed"),
            "context": m.get("context"),
            "options_considered": m.get("options_considered"),
            "decision": m.get("decision"),
            "rationale": m.get("rationale"),
            "foresight": m.get("foresight"),
            "outcome": m.get("outcome"),
        }
        row = {k: v for k, v in row.items() if v is not None}
        stored = self._upsert("work_entries", row, "project_id,source_ref,occurred_on")
        eid = stored["id"] if stored else None
        if eid and not self.dry:
            for sk in m.get("skills", []) or []:
                sid = self.skill_id(sk)
                if sid:
                    self.c.table("entry_skills").upsert(
                        {"work_entry_id": eid, "skill_id": sid},
                        on_conflict="work_entry_id,skill_id",
                    ).execute()

    def push_achievement(self, post):
        m = post.metadata
        pid = self.project_id(m["project"])
        fid = self.feature_id(pid, m["feature"]) if m.get("feature") else None
        row = {
            "project_id": pid,
            "feature_id": fid,
            "title": m["title"],
            "description": post.content.strip() or None,
            "impact": m.get("impact"),
            "occurred_on": str(m["occurred_on"]) if m.get("occurred_on") else None,
            "tags": m.get("tags", []) or [],
        }
        row = {k: v for k, v in row.items() if v is not None}
        self._upsert("achievements", row, "project_id,title")

    def push_skill(self, post):
        m = post.metadata
        row = {"name": str(m["name"]).strip().lower(), "category": m.get("category")}
        row = {k: v for k, v in row.items() if v is not None}
        self._upsert("skills", row, "name")

    def push_weekly(self, post):
        m = post.metadata
        row = {
            "week_start": str(m["week_start"]),
            "week_end": str(m["week_end"]) if m.get("week_end") else None,
            "summary": post.content.strip() or None,
            "highlights": m.get("highlights", []) or [],
        }
        row = {k: v for k, v in row.items() if v is not None}
        self._upsert("weekly_reports", row, "week_start")


DISPATCH = {
    "project": "push_project",
    "work_entry": "push_work_entry",
    "achievement": "push_achievement",
    "skill": "push_skill",
    "weekly_report": "push_weekly",
}


def main() -> int:
    ap = argparse.ArgumentParser(description="Push career-memory markdown to Supabase.")
    ap.add_argument("--dry-run", action="store_true", help="print planned writes, don't push")
    ap.add_argument("--home", default=None, help="path to career-memory/ (default: repo)")
    args = ap.parse_args()

    load_dotenv(REPO_ROOT / ".env")
    home = Path(args.home or os.getenv("WORKLOG_HOME") or DEFAULT_HOME).resolve()
    if not home.exists():
        sys.stderr.write(f"Store not found: {home}\n")
        return 1

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    client = None
    if not args.dry_run:
        if not url or not key:
            print(
                "No SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY found — skipping push.\n"
                "Markdown is still saved. Add creds to .env then re-run, or use --dry-run."
            )
            return 0
        from supabase import create_client
        client = create_client(url, key)

    docs = load_docs(home)
    # order: projects + skills first so references resolve
    order = {"project": 0, "skill": 1, "work_entry": 2, "achievement": 3, "weekly_report": 4}
    docs.sort(key=lambda d: order.get(d[1].get("type"), 9))

    pusher = Pusher(client, args.dry_run)
    print(f"{'[dry-run] ' if args.dry_run else ''}Scanning {home} — {len(docs)} docs")
    for path, post in docs:
        method = DISPATCH.get(post.get("type"))
        if not method:
            continue
        try:
            getattr(pusher, method)(post)
        except Exception as e:  # noqa: BLE001 — keep going, report per-file
            sys.stderr.write(f"  ! {path.name}: {e}\n")

    print(f"Done. {pusher.updated} rows upserted." if not args.dry_run else "Dry run complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
