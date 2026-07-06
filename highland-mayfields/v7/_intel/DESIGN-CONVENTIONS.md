# Highland Mayfields — Shared Design Conventions (single source of truth)

Follow these so every screen feels like ONE app. Brand = warm dusk editorial: espresso grounds, copper text, gold ornament, cream ink, Jost-class sans. Target 2560×1600 landscape, no-scroll, touch (≥44px), kiosk.

## Tokens (already in `styles/brand.css` — USE THESE, never hardcode hex)
- Grounds: `--hm-espresso` #221a18, `--hm-espresso-2` #1e1816. Ink: `--ink` cream, `--ink-dim`. Accent: `--accent`/`--hm-gold`, `--hm-gold-bright`, `--hm-gold-soft`, `--hm-copper`. Lines: `--hairline`, `--hairline-soft`. Motif: `--hm-lattice` (quatrefoil). Fonts: `--font-display` (light Jost), `--font-body`, `--font-label` (tracked caps). Radii `--r-tile/--r-pill`. Eases `--ease-soft`,`--ease-settle`.
- Type helpers / components already in `screens/_kit.css`: `.k-eyebrow`, `.k-title`, `.k-lede`, `.k-card`(`.int` for tappable), `.k-btn`(`.gold`/`.ghost`), `.k-chip`, `.k-panel`, `.k-rule`, `.k-legend`, `.k-float`(generic centered window via `HMKit.openFloat`), `.k-lightbox`(`HMKit.lightbox`). REUSE these for consistency; extend locally only when needed, still token-driven.

## Status colours (NEW — for availability everywhere, esp. inventory)
Add/use these (define locally if not present): available = green `oklch(0.62 0.12 150)` (`--st-ok`), sold = muted red `oklch(0.55 0.15 25)` (`--st-no`), booked/blocked/on-hold = amber `oklch(0.72 0.13 75)` (`--st-hold`). Keep them tasteful against the dusk palette (slightly desaturated, gold-adjacent), not neon.

## Motion (emil)
- Enter/exit = ease-out (`cubic-bezier(.16,1,.3,1)`); on-screen move = ease-in-out; never `ease-in`. UI interactions <300ms; `scale(.97)` press feedback; origin-aware popovers (scale from the trigger, not center); never animate from scale(0) (start ~.95+opacity). Stagger 40–80ms. `prefers-reduced-motion` → fades only, no transforms. Verify motion is actually felt (frame-diff/feltProbe).

## Pins / hotspots → popups (pearl, landscape; pattern to reuse)
- Pins must read as tappable: gold medallion + soft pulsing ring/glow.
- On tap: cinematically zoom/pan the plan toward the pin and bring the pin toward center; then show a glass card. **Card side = opposite the pin** (pin on left half → card right; pin on right half → card left), clamped in-bounds, origin-aware. Card ≈ 15–20% of screen width (generous, readable), `.k-panel` styling, with eyebrow + title + body + close.
- One open at a time; outside-tap / Esc / re-tap dismiss; closing restores the map.

## Zoom on plans/images
- Every floor plan / master plan / gallery image / render gets pinch + wheel + double-tap zoom and drag-pan (and +/− if space). Keep within the frame; reset on close. Reuse a small zoom-pan helper per screen.

## Background & transitions & sound (CENTRAL — do NOT implement per screen)
- The animated blended background is injected via `_kit.css .scr-bg` (handled centrally) — every inside screen gets it automatically; do not add your own full-screen background.
- Screen open/close transitions + the luxury switch sound are handled centrally (home.html + index.html). Don't build screen-to-screen transitions inside a screen file.
- For in-screen tap feedback, rely on the existing ripple (`.k-card.int/.k-btn` auto-bound) + `scale(.97)`.

## DATA INTEGRITY (kd Law 3 — non-negotiable)
- Use ONLY real content already in the screen file / `data/*.json` / the client dump (`OneDrive/.../Raghav Sir`, inventory xlsx). Areas, configs, counts, names must match. NO invented prices (always "On Request"), NO invented availability beyond the existing indicative engine. Tag representative renders honestly.

## FILE BOUNDARIES (avoid conflicts)
- Edit ONLY your assigned screen `.html`. Do NOT touch `index.html`, `home.html`, `screens/_kit.css`, `screens/_kit.js`, `styles/brand.css`, `screens/inventory.html` (owned centrally). If you need a shared token/class that's missing, define it locally in your screen's `<style>`.

## VERIFY before done
- Serve `app/` (`python3 -m http.server`), open your screen at 2560×1600 via Playwright (reduced-motion for stable clicks), screenshot, confirm: zero console errors, no page scroll, back button works, your new interactions work (open/close/zoom), nothing overlaps/clips. Report what changed + a screenshot path.
