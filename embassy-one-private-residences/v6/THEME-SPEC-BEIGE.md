# Embassy ONE — Beige Re-Theme Spec (v2.6)
**Client-approved app: DESIGN CHANGE ONLY. Zero functionality/layout/geometry changes.**
Source of palette: client marketing brief (`Files for Agency 2/Brief/EMBASSY NORTH TOWER.pdf`) + ONE PRIVATE RESIDENCES logo PDF.

## Palette (extracted from client brand material)
| Token | Value | Role |
|---|---|---|
| Paper | `#faf7f0` | primary light surface (was near-white #faf8f4) |
| Beige | `#efe8da` | main app background (replaces navy as PRIMARY) |
| Beige-2 | `#e6dcc8` | raised beige panel |
| Beige-3 | `#e0d5c0` | deep beige (from brand brief panels) |
| Gold | `#c9a84c` | hairlines + eyebrow headings ONLY, STATIC (⛔ NO shimmer/sweep animations) |
| Navy ink | `#121621` | text on beige + buttons (keep existing value — user wants dark blue text/buttons) |
| Navy-2 | `#1a2030` | leather-blue glass card surface (ACCENT only) |
| On-navy | `#ece8e0` | text on blue accent cards |

## Token remap rule (per-file `:root` blocks — every screen has its own)
The app is theme-inverted: **dark navy was primary → beige becomes primary; navy becomes accent.**
In each file's `:root`:
- `--parch` / page background family: navy values → **Beige `#efe8da`**
- `--paper`: `#faf7f0`
- `--bone`: `#efe8da`, `--bone-2`: `#e6dcc8`
- `--ink/--navy` stay `#121621` but their ROLE flips: panels that used `background:var(--navy)` full-bleed become beige; only ACCENT cards/buttons keep navy.
- `--champ`/`--gold-lt` → `#c9a84c` where used as eyebrow/hairline (keep low-contrast usage; never buttons borders)
- Text on former dark screens: `--on-navy` light text → becomes `--ink #121621` dark text on beige. Muted: `#6b6f78` → warm `#7a7264`.
- `<meta name="theme-color">` → `#efe8da`; `html{background}` → beige (kills white/dark strip).

## Blue accent = leathery glass (checklist 3.0)
The 5 section cards (home) and equivalent feature cards KEEP their dark navy-blue glass style (user: "style of the buttons is fine") but gain a subtle LEATHER GRAIN: CSS-only — layered `radial-gradient` noise or an inline SVG `feTurbulence` (baseFrequency ~0.9, opacity ≤0.06) composited over `--navy-2`, within the existing glass finish (blur/border unchanged). NO external images. Buttons/CTAs: dark navy fill or navy outline, text `#faf7f0` on navy / `#121621` on beige.

## Bans
- ⛔ NO shimmer animations (remove `shimmerSweep`, `shimmerBreathe`, `.card::after` specular sweeps)
- ⛔ NO fireflies (remove firefly layer on home)
- ⛔ NO small birds (keep clouds + leaves)
- ⛔ NO gradient text, no new gold borders on buttons
- ⛔ Do not touch: FLOORMAP/CFG data in tower.html, plan image paths, SW logic, nav wiring, JS handlers, asset manifest

## Imagery notes
- Home bg plate (blue sky photo) is being replaced by beige atmosphere + line-art tower (separate workstream). Theme agent: make home bg a beige wash gradient (`#efe8da→#e0d5c0`) as base so the plate swap lands on it.
- Photographic renders inside screens (gallery, grounds) stay as-is.

## iPad mandate (item 7 + white-strip fix)
Single target device family: iPad, ALL aspect ratios, landscape-first. Must be perfect at CSS viewports:
1366×1024 (12.9"), 1376×1032 (13" M4), 1180×820 (Air 11), 1024×768 (10.2/Mini 4:3), plus portrait equivalents where app allows.
- `viewport-fit=cover` + `background` on `html` AND `body` in the theme color (no white strip at bottom on iPad Pro 13)
- safe-area insets via `env(safe-area-inset-*)` padding, not fixed offsets
- No fixed 2560×1600 assumptions: verify no `100vh` white-gap (prefer `100%`/`svh` fallback pattern already used — do NOT introduce dvh reflow)

## Verification (every changed screen)
Playwright screenshot at 1366×1024 AND 1024×768; assert no `#fff`/near-white strip at bottom edge; zero console errors; nav still works (Enter → home → each section → back).
