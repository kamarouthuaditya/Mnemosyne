---
type: work_entry
project: onshore-marketing-automation
feature: placeit
occurred_on: 2026-06-10
title: Built a self-hosted Placid alternative (ImageGen) and shipped it to production
source: [transcript]
source_ref: 96aeb765
skills: [next.js, typescript, supabase, "@napi-rs/canvas", sharp, vercel, api-design, image-rendering]
files_changed: 0
context: "The content pipeline needed branded images generated from templates + text on demand. The obvious option, Placid, is a paid SaaS with per-render pricing and an external dependency we'd be locked into. We wanted full control of the templates, the rendering, and the cost — and an API our own automation could call."
options_considered: |
  - **Keep paying for Placid** — fastest to wire up, but recurring per-render cost, a hard external
    dependency in the critical path, and zero control over the rendering internals.
  - **Render with `satori` (HTML/CSS → SVG → image)** — familiar model, but a layout spike showed it
    fights you on precise pixel control and font handling for templated brand images.
  - **Build on `@napi-rs/canvas` + Sharp (chosen)** — canvas does real text layout (wrap / auto-resize
    / align), Sharp composites and encodes. A render spike clocked ~209ms, de-risking the engine before
    committing.
decision: "Build ImageGen in-house: a Next.js app with a canvas+Sharp render engine, a visual template editor, and a Bearer-auth `POST /api/render` API — then deploy it to Vercel."
rationale: "Owning the engine kills the per-render bill and the vendor lock-in, and lets the template's layer names double as the API contract the content engine fills in. The canvas-for-layout / Sharp-for-encode split is the only combo that does true text wrapping AND fast encoding — Sharp alone can't lay out text."
foresight: "Designed for serverless from the start: migrated all asset + render storage off local disk onto Supabase Storage because Vercel has no writable disk, and capped render route at maxDuration=60. Put a FIFO concurrency semaphore (max 20, queue-timeout → 429) in front of rendering so a burst can't melt the box — load-tested at 20 concurrent with 0 failures, p95 694ms. Locked the database behind RLS-with-no-policies + a server-only service-role key so the public key is a dead end. Hit and fixed a subtle Google Fonts bug where the first @font-face subset (cyrillic) has no Latin glyphs → silent tofu in renders; now explicitly picks the Latin subset."
outcome: "ImageGen Phase 1 COMPLETE and live at https://placeit-orcin.vercel.app. Full template CRUD, a drag/resize layer editor, live preview, and a production render API. End-to-end API test 18/18 pass (auth, cache, 404/422, layer auto-detect); perf test 20-concurrent all-200. The n8n Content Engine now renders its Instagram images against this instead of Placid."
---
## What I built

A **self-hosted replacement for Placid** — Placid is a paid online service that turns a design template
plus some text into a finished image (think: "headline goes here, hook goes here," and out comes a
branded social graphic). Instead of renting that, I built our own.

It has three pieces:

- A **template editor** — a visual canvas where you place text and image "layers" on a base image,
  drag and resize them, and set fonts, colors, alignment.
- A **rendering engine** — give it a template and the actual words, and it produces the final PNG/JPEG.
- An **API** — our automation sends a web request with the text, and gets back a finished image URL.

## Why it mattered

- **No per-image bill, no outside dependency.** Every image the content system makes used to cost money
  and rely on someone else's servers. Now it's ours.
- **The template *is* the contract.** Each layer has a name (e.g. `headline`, `hook`). The automation
  just fills those names in — so when a designer edits the template, the automation keeps working with
  no code change.

## How it works

```mermaid
flowchart LR
  A[API call:<br/>template + text] --> B{Auth check}
  B --> C[Canvas: lay out + wrap text]
  C --> D[Sharp: composite + encode]
  D --> E[Save to Supabase Storage]
  E --> F[Return image URL]
```

A **canvas** library handles the hard part — wrapping text, auto-shrinking it to fit, aligning it — and
then **Sharp** stacks the layers and saves the final image. The two split the job because neither can do
it alone: canvas can't encode fast, Sharp can't lay out text.

## What I was careful about

- **Built for the cloud from day one** — Vercel (where it's hosted) has no permanent disk, so every
  image and asset is stored in Supabase Storage, not on the machine.
- **Won't fall over under load** — a queue limits how many images render at once and politely returns
  "too busy" (429) instead of crashing. Tested with 20 at once: zero failures.
- **Locked-down database** — the data is sealed behind row-level security with a server-only key; the
  public key can't read or write anything.
- **Chased down an invisible font bug** — Google Fonts split into language "subsets," and the first one
  (Cyrillic) has no English letters, which silently rendered as blank boxes. Fixed it to always grab the
  Latin set.

Related: feeds [[n8n-content-engine]] and shares the locked-down Supabase pattern used across the system.
