---
type: achievement
project: onshore-internal
feature: lead-automation
title: Shipped AI-personalized auto-replies for website leads
impact: "Every website lead is now captured, logged, and answered automatically — high-intent prospects who describe their needs get an AI-written, on-brand reply in seconds instead of a generic template."
occurred_on: 2026-06-11
tags: [automation, ai, lead-gen, n8n]
---
Designed and built an end-to-end n8n workflow that turns the OnShore Labs website lead form into a
self-running first-touch system. Branches on whether the prospect left a comment: if they did, a
Google Gemini agent drafts a tailored 2-3 sentence reply that's injected into a branded HTML email;
if not, a standard welcome goes out. Every lead is logged to Google Sheets, with an explicit guard so
the personalized template never sends without its AI insight.
