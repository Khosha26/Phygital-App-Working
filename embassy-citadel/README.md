# Embassy Citadel — Sales Suite (Interactive)

A touch-first sales experience for **Embassy Citadel** — single 79-floor tower in Worli, Mumbai.
Built for **Samsung Galaxy Tab S7** (primary) and responsive up to **65" wall screens**.

## Current — v3 (live in `index.html`)
- **Intro v3** (`intro-v3.html`) — cinematic brass-and-wood doors on marble entrance · double-tap to swing them open in 3D (rotateY) · whoosh + chime + bone wipe → navigates to home
- **Home v3** (`home-v3.html`) — compass radial menu with 8 segments around a dial (N/E/S/W cardinals + degree ticks) · tower hero on left · selection card with "DOUBLE TAP TO EXPLORE" · hamburger drawer · BOOK A VIEWING button · live status bar
- **Entry point** (`index.html`) — meta-refresh redirect to intro-v3.html (kiosk-friendly)
- **Backups** — `index-v1.html` (Phase 1: cinematic logo reveal + chapter menu), `index-v2.html` (Phase 2: editorial layout + asymmetric cards)

## How to launch

### Quickest — just double-click
```
Open: sales-suite/index.html
```
The app is a single self-contained file. Brand tokens and the logo SVG are linked from `brand/`, fonts from Google Fonts, React/Babel/GSAP from CDN.

### For testing on the actual Tab S7
Run a local server so the tab can reach it on the same Wi-Fi:
```bash
cd "sales-suite"
python3 -m http.server 8090
# then on Tab S7 Chrome: http://<your-mac-ip>:8090
```

### Recommended interaction tests
- **Tap anywhere** during intro → chime + transition to home
- **Hover/tap menu items** → bronze hairline animation, item highlights
- **Rotating headlines** → cycle every 5.5s, dots indicator updates
- **Audio toggle** in footer → mute/unmute the ambient pad
- **Press `Enter` or `Space`** on intro for keyboard accessibility

## File layout
```
sales-suite/
├── index.html              ← main app (single-file inline React)
├── README.md
├── brand/
│   ├── tokens.css          ← all design tokens (colors, type, spacing, motion)
│   ├── logo.svg            ← Embassy ▲ mark, three stacked triangles
│   ├── coms-guideline-colors.jpg
│   └── coms-guideline-materials.jpg
├── data/
│   └── project.json        ← canonical project copy + menu data
└── docs/
    └── 01-architecture.md  ← screen map, tech stack, R&D
```

## Stack
- React 18 + Babel-standalone (no build step)
- GSAP 3.12 for the intro fade-out orchestration
- Web Audio API (synthesized chime + low pad — no mp3 files)
- Cormorant Garamond (display) + Inter (body) from Google Fonts
- Tailwind not yet wired — using brand CSS tokens directly (cleaner for a small kiosk app)

## What's deliberately not in Phase 1
- Photography (using type-as-hero); brochure renders extracted in Phase 2
- Tower 3D / inventory flow (Phase 3)
- Leaflet map / EMI calculator / booking form (Phase 4)
- Offline bundling of React/Babel/GSAP/fonts (Phase 5)

## Open assumptions (call these out if wrong)
- **Display typeface** — using Cormorant Garamond as nearest-match for the brochure's tall elegant serif. If Embassy has shared the licensed font file (looks like a custom Caprasimo / Editorial New variant), drop it into `brand/fonts/` and update `--font-display` in `tokens.css`.
- **Audio** — chime + pad synthesized via Web Audio. If you want a real bespoke mastered audio piece, point me to the asset and I'll swap.
- **Menu hints** ("a self-contained world", "tower · floor · unit"…) — written in the Frank Curator voice from the approved brochure tone. Edit in `index.html` `PROJECT.menu` or `data/project.json`.
