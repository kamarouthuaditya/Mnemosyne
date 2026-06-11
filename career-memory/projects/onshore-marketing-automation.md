---
type: project
slug: onshore-marketing-automation
name: Onshore Labs Content Generation Engine
repo_path: C:\Users\Aditya Kamarouthu\Work\OnshoreLabs\Onshorelabs - Marketing - Automation
remote_url: ""
status: active
started_at: 2026-06-08
features:
  - slug: placeit
    name: ImageGen Platform (Placid alternative)
  - slug: n8n-content-engine
    name: n8n Content Engine
  - slug: onshore-studio
    name: Onshore Studio (approval + publishing app)
---
An end-to-end **marketing content automation system** for Onshore Labs: it writes daily social posts,
renders branded images for them, and gives a human a place to review, edit, approve, and publish — all
without a marketer touching a design tool or a copy doc.

Three parts work together:

- **ImageGen Platform (`placeit`)** — a self-hosted replacement for Placid (a paid image-templating
  service). It turns reusable templates + text into finished branded images via an API.
- **n8n Content Engine** — a scheduled automation that runs every morning, drafts the day's posts for
  Instagram / X / LinkedIn with an AI strategist + per-platform writers, calls ImageGen for the
  Instagram visual, and saves the drafts to a database.
- **Onshore Studio** — a web app where a person reviews those AI drafts, edits captions, approves or
  rejects them, and publishes the approved ones straight to the social platforms.

```mermaid
flowchart LR
  A[n8n Content Engine<br/>daily 06:00] -->|drafts| B[(content DB)]
  A -->|render call| C[ImageGen / placeit]
  C -->|image URL| B
  B --> D[Onshore Studio<br/>approval inbox]
  D -->|publish| E[Instagram / X / LinkedIn]
```
