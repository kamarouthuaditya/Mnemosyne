---
type: achievement
project: onshore-marketing-automation
title: Shipped an end-to-end AI marketing-content pipeline — generate, render, approve, publish
impact: "Replaced a paid image SaaS (Placid) with a self-hosted render API, and turned daily multi-platform social posting into an automated draft → human-approval → publish flow. Daily content engine live in production; zero per-render cost; nothing publishes without human sign-off."
occurred_on: 2026-06-10
tags: [automation, ai, full-stack, infrastructure, cost-savings, social-media]
---
Designed and built three interlocking systems that take Onshore Labs' social content from idea to live
post with one human checkpoint:

- **ImageGen (`placeit`)** — a self-hosted Placid alternative (Next.js + `@napi-rs/canvas` + Sharp),
  shipped to Vercel with a Bearer-auth render API, a visual template editor, Supabase-Storage assets,
  and a concurrency-guarded engine load-tested at 20 concurrent renders (p95 ~694ms, 0 failures, 18/18
  API tests passing). Removed the recurring per-render SaaS cost from the pipeline.
- **n8n Content Engine** — a code-managed (n8nac) daily 06:00 workflow with an AI strategist + per-
  platform writers (IG/X/LinkedIn) on claude-haiku-4.5, rendering its Instagram image via ImageGen.
  Activated in production; first live run produced real, on-brand drafts end-to-end.
- **Onshore Studio** — a dedicated Next.js review app: a draft inbox grouping per-platform rows into one
  card, caption editing, image preview, approve/reject, and publishing adapters for X, LinkedIn, and
  Instagram that write the live post URL back as an audit trail.

What made it notable: a clean separation of concerns (generate → review → publish) with a human gate,
serverless-first engineering (Storage over local disk, concurrency caps), a security-conscious data
model (RLS-locked Supabase + server-only service-role keys), and pragmatic ship-now choices (optional
publish credentials that degrade gracefully). Security debt was surfaced explicitly rather than hidden:
shared keys to rotate and a default render key to replace.
