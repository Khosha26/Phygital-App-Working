# Embassy Citadel — Sales Suite Architecture (R&D)

> Internal Khosha working doc. Built for Embassy Citadel sales gallery on Samsung Tab S7 + 65" wall screens.

## 1. Goals

- **Experiential, not informational.** The tab is a curator, not a brochure.
- **One brand, every screen.** "The Frank Curator" — composed, honest, restrained.
- **Performance is part of luxury.** Lazy-load everything past intro. Aim ≤ 60fps idle, ≤ 1.5s first paint on Tab S7.
- **Touch-first.** Every interaction reachable with thumb or stylus. Tap + horizontal swipe + pinch where it earns its keep.
- **Responsive 1280px → 4K.** Same app, fluid layout, scaled type.

## 2. Hardware envelope

| Device | Resolution | Aspect | Primary gesture |
|---|---|---|---|
| Galaxy Tab S7 (landscape) | 2560 × 1600 | 16:10 | Tap + swipe |
| 65" wall screen | 3840 × 2160 | 16:9 | Tap (touchscreen) or remote |

Design baseline: **1600 × 1000 reference grid**, fluid scale via `clamp()` and a single `--scale` CSS var.

## 3. Tech stack (locked Phase 1)

| Layer | Choice | Why |
|---|---|---|
| Runtime | React 18 + Babel-standalone via CDN | No build step. Same pattern as Living Tree. Fast to iterate. |
| Styles | Tailwind CDN + custom CSS layer | Utility velocity + brand-token CSS vars |
| Motion | GSAP CDN (CDN-default) + Web Animations API | GSAP only where curve/orchestration earns it; else CSS transitions |
| Map | Leaflet + OSM tiles | Free, no API key, styleable to bone/olive palette |
| Audio | HTML5 `Audio` element + Web Audio for ducking | Single ambient pad on intro tap, mute toggle |
| Fonts | Cormorant Garamond + Inter (Google Fonts) | Display serif + clean body sans, both have weight range |
| 3D tower | Pure SVG with parallax layers (Phase 2) | No WebGL needed for the geometry we have; lighter, sharper on retina |

> Build step deferred: if we hit Babel runtime cost on inventory + map screen, we promote to Vite. Phase 1 doesn't need it.

## 4. Screen map (11 screens, hash router)

```
#/intro          → IntroScreen     (logo reveal, tap-to-enter)
#/home           → HomeScreen      (curated menu)
#/gallery        → GalleryScreen   (photography, swipeable)
#/overview       → OverviewScreen  (brand + project story)
#/location       → LocationScreen  (Leaflet map + POI sidebar)
#/amenities      → AmenitiesScreen (5-floor clubhouse + 79th lounge)
#/masterplan     → MasterplanScreen (zoomable site plan)
#/inventory      → InventoryFlow    (Tower → Floor → Unit → Sheet)
#/floorplan      → FloorPlanScreen  (compare up to 3)
#/tools          → ToolsScreen      (EMI / FSI / sheet)
#/booking        → BookingScreen    (autofills from inventory selection)
```

Each screen is a separate JSX chunk fetched on demand (preloaded after intro).

## 5. Information architecture (sidebar menu)

Order in home screen (left → right or top → down depending on grid):

1. Project Overview  *(start here, story)*
2. Gallery
3. Masterplan
4. Amenities
5. Inventory  *(commercial: pick a unit)*
6. Floor Plans
7. Location
8. Tools (EMI / FSI / Price)
9. Book *(top-right pinned)*

## 6. Inventory flow (the spine of the sale)

```
[Inventory entry]
   ↓
[Master Plan view]  ← shows site + Sovereign Tower in 3D-style SVG
   ↓ tap tower
[Floor selector]    ← vertical scroll of floors with availability dots
   ↓ tap floor
[Unit selector]     ← floor plate with units highlighted by status
   ↓ tap unit
[Unit detail]       ← floor plan + price sheet + skydeck render + "Book" CTA
   ↓ Book
[Booking form]      ← pre-filled: Tower, Floor, Unit, Carpet area, Price
```

State persistence: keep `selectedTower / Floor / Unit` in a top-level context so back/forward + booking autofill work.

## 7. Animation system

Three motion tiers — pick by purpose, not novelty:

| Tier | When | Tools | Examples |
|---|---|---|---|
| **Reveal** | Screen entry | CSS keyframes | Logo fade, copy stagger |
| **Continuous** | Idle hero loops | GSAP timelines / CSS | Bronze line shimmer, water ripple, slow Ken Burns |
| **Reactive** | User input | GSAP + Web Anim | Tower zoom, floor scrub, swipe-to-compare |

Easing house style: `cubic-bezier(0.22, 1, 0.36, 1)` (gentle ease-out for entries) + `cubic-bezier(0.65, 0, 0.35, 1)` for reactive.

## 8. Asset strategy

- **Photography** → use brochure renders (already brand-approved). Extract on Phase 2.
- **Logo / wordmark** → re-create as crisp inline SVG (no JPG).
- **Tower silhouette** → trace from brochure "A CUT ABOVE WORLI" render to clean SVG.
- **Decorative marks** → vertical bronze line, bronze underline, ▲ triangle stack — inline SVG.
- **POI icons (map)** → custom SVG icons matching brochure illustration style (figures, train, racecourse).
- **Textures** → black metal + dull bronze gradients reproduced as CSS gradients (no raster).
- **Generated assets via Higgsfield** → deferred to Phase 3 (if specific gaps after brochure extraction).

## 9. Performance budget

| Asset | Cap |
|---|---|
| First paint payload | ≤ 300 KB |
| Per-screen lazy chunk | ≤ 150 KB |
| Hero image | ≤ 400 KB (WebP) |
| Total tower screen | ≤ 1.2 MB |
| Idle CPU | ≤ 5% on Tab S7 |

## 10. Phase plan

- **Phase 1 (now):** Intro + Home. Brand system. Asset pipeline.
- **Phase 2:** Overview + Amenities + Gallery + Masterplan
- **Phase 3:** Inventory flow (Tower → Floor → Unit) + Floor Plan compare
- **Phase 4:** Location map (Leaflet) + Tools (EMI/FSI) + Booking form
- **Phase 5:** Polish, audio, transitions, perf pass, 4K test on 65" mock

User said: "build things under my command only." Ship Phase 1, confirm, then proceed.
