# Mnemosyne — Design System

Editorial monograph. Ink on paper. Sharp edges only. The type and the rules do the work.

## Theme

**Light paper, black-and-white.** Near-white paper, near-black ink, a warm-neutral grey ramp.
Monochrome by intent; a whisper of warmth (chroma ~0.003, hue ~90) keeps it paper, not screen-white.
No pure `#000` / `#fff`.

## Color (OKLCH)

| Token | Value | Use |
|---|---|---|
| `--paper` | `oklch(0.985 0.002 90)` | page background |
| `--paper-sunk` | `oklch(0.965 0.002 90)` | subtle insets / hover |
| `--ink` | `oklch(0.18 0.004 90)` | primary text, headings |
| `--ink-soft` | `oklch(0.42 0.003 90)` | secondary text |
| `--ink-faint` | `oklch(0.60 0.003 90)` | meta, captions |
| `--rule` | `oklch(0.88 0.003 90)` | hairline borders |
| `--rule-strong`| `oklch(0.72 0.003 90)` | emphasized rules, active |

No color accents. Status / source differentiation is by weight, label, and rule, never hue.

## Typography

- **Display / headings:** Playfair Display (serif), weights 400/500/600, tight tracking on large sizes.
- **Body / UI / labels / meta:** Montserrat (sans), weights 400/500/600; uppercase + letter-spacing for small labels.
- Body line length capped 65–75ch. Hierarchy via scale + serif/sans contrast, ratio ≥1.25.
- Small meta labels: Montserrat, 11–12px, uppercase, tracking ~0.12em, `--ink-faint`.

## Shape & elevation

- **Border radius: 0 everywhere.** Sharp edges only. No rounded utilities anywhere.
- **No shadows.** Depth comes from hairline rules and whitespace, not elevation.
- Hairline rules (1px `--rule`) separate; ruled rows and ledgers preferred over cards.

## Layout

- Editorial, asymmetric, generous whitespace. Max content width ~5xl (timeline narrower, ~3xl).
- Avoid card grids as the default. Use ruled list rows / ledger lines.
- Vary spacing for rhythm; never uniform padding.

## Motion

- Minimal. Hover = ink/rule darkening only, ~150ms ease-out. No transforms on layout, no bounce.

## Bans (project-specific, on top of impeccable shared bans)

- No rounded corners, no shadows, no color accents, no gradients.
- No source-color badges; sources render as monochrome uppercase labels.
- No em dashes in copy.
