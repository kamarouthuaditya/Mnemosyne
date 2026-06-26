---
type: work_entry
project: onshore-internal
feature: onshore-studio
occurred_on: 2026-06-11
title: Built Onshore Studio — the review, approve, and publish app over the content engine
source: [commit, transcript]
source_ref: 4a93711
significance: notable
skills: [next.js, react, typescript, tailwind, supabase, "social-media-apis", ui-design, server-actions]
files_changed: 33
context: "The n8n Content Engine produces AI-drafted posts every morning, but nothing should go live unsupervised. A person needed a single place to see the day's drafts, fix a caption, approve or reject each one, and then actually publish the approved posts to Instagram, X, and LinkedIn — without juggling three platform dashboards."
options_considered: |
  - **Review drafts directly in the database / a generic admin tool** — zero build effort, but a raw
    table of rows is hostile to read, can't preview the image, and gives no clean publish action.
  - **Bolt the approval UI onto the existing ImageGen app** — reuses a running app, but mixes two
    concerns (template tooling vs. content review) and fights over the same port.
  - **A dedicated lightweight Next.js app — Onshore Studio (chosen)** — its own purpose-built inbox,
    reusing ImageGen's proven session-auth and locked-down Supabase patterns.
decision: "A separate Next.js app on its own port (3001) with a status-filtered approval inbox, per-platform editing, and built-in publishing adapters for X, LinkedIn, and Instagram — gated by a single-admin login."
rationale: "Keeping Studio separate from ImageGen keeps each app focused and independently deployable, while copying the already-hardened auth + service-role Supabase access means the security model was proven, not reinvented. Grouping the per-platform rows back into one 'draft' by post id gives the reviewer one card per idea instead of three disconnected rows."
foresight: "Made every publishing credential optional and read from env — a missing key produces a clean 'not configured' message instead of a crash, so the app ships and runs before the social tokens are pasted in. Built the data layer to group the IG/X/LI rows by a shared base post id (stripping the _IN/_X/_LI suffix) so the human reviews one coherent post, not fragments. Published state is only writable from an Approved row, and writes back the live platform post id + URL so there's an audit trail. Flagged the two DB migrations (publish columns) and the missing service-role key the user must supply before it's fully wired."
outcome: "Phase B (approval inbox) and Phase D (publishing) both DONE and building clean. The inbox shows status-filtered draft cards with an editable caption, an Instagram image preview/lightbox, and per-platform + whole-group approve/reject actions. Publishing adapters for X, LinkedIn, and Instagram dispatch approved posts and record the resulting post URL. Design system delivered to spec: Playfair Display + Montserrat, teal accent, dark sharp-edged UI, phone-optimized."
---
## What I built

**Onshore Studio** — the web app where a human takes control of the AI's daily drafts. The content
engine writes posts automatically, but a person should always have the final say. Studio is that final
say: an **inbox of draft posts** where you can read each one, edit the caption, see the Instagram image,
and then **approve, reject, or publish** it — and publishing sends it straight to Instagram, X, and
LinkedIn from this one screen.

## Why it mattered

- **One place to control everything.** Instead of logging into three social platforms, the reviewer
  works from a single inbox.
- **Nothing goes out unchecked.** Every AI draft passes through a human's approve/reject before it can be
  published.
- **One post, not three fragments.** The engine writes a separate row per platform; Studio stitches them
  back into a single card so you review the *idea*, not disconnected pieces.

## How it works

```mermaid
flowchart LR
  A[(content DB drafts)] --> B[Inbox: draft cards<br/>filter by status]
  B --> C[Edit caption / preview image]
  C --> D{Approve or Reject}
  D -->|Approved| E[Publish]
  E --> F[Instagram / X / LinkedIn]
  E --> G[(write back post URL + status)]
```

The app reads the drafts the [[n8n-content-engine]] saved, groups the per-platform rows into one card,
and lets the reviewer edit and decide. Approving unlocks **Publish**, which calls each social platform's
API and records the live post's link back into the database.

## What I was careful about

- **Ships before the keys do.** Every social-media credential is optional — if one's missing, you get a
  tidy "not configured" message instead of a crashed app, so it runs today and the tokens get pasted in
  later.
- **Publish is a one-way gate.** Only an *approved* post can be published, and publishing writes back the
  real post id and URL — an audit trail of what actually went live.
- **Reused proven security.** Login and the locked-down database access were copied from the already-
  hardened ImageGen app rather than reinvented — see [[placeit-imagegen-platform]].
- **Designed to a spec, on a phone.** Playfair + Montserrat type, teal-on-dark, sharp edges, and a
  layout that works on a phone screen.
