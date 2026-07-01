# Highland Mayfields — Refresh / Refinement Pass (2026-06-30)

Master checklist from Nischal's 15-point brief. Status: ☐ todo · ◑ in progress · ☑ done.
Target viewport 2560×1600 (Tab S7 landscape). kd Law 3 — NO fabricated data; use client dump + inventory xlsx. Every screen must: zero console errors, back button works, no-scroll, verified via Playwright.

## CROSS-CUTTING FOUNDATION (owner: main session — shared files only)
- ☐ **1 · New animated background, app-wide.** Blend the new wireframe building render (`assets/bg-wireframe@2560.webp`) with the existing line-art + quatrefoil lattice + grain, on the brown ground. Keep the blend identical everywhere. The line-drawing must ANIMATE (subtle continuous draw/drift glow) on EVERY screen — home + all inside screens. Implement in `_kit.css .scr-bg` (covers all inside screens via `ensureBg`) + `home.html` + `index.html`. Rich, not busy.
- ☐ **3 · Transitions.** Replace the glitchy lattice/pattern wipe with a soft luxury FADE (cross-fade / fade-through, ~0.8–1.2s, held long enough to read). Applies to: intro→home (`index.html`), screen open/close (`home.html` runWipe/openScreen/closeScreen). Add a subtle minimal luxury SWITCH/CLICK sound on every screen change + button-to-screen nav (`assets/sfx/transition.*`). Sound generated locally.
- ☐ **(speaker)** Remove the speaker toggle from all screens (`#soundToggle` in `index.html`); welcome audio plays ONLY on the intro screen (already does). Kill the persistent toggle after entering.
- ☐ **11 · Logo → intro.** Clicking the brand logo at the top of the home screen restarts the app from the intro screen (`home.html` logo → postMessage to `index.html` → reset to gate/intro).
- ☐ **14 · Home button icons = lion crest shade.** Re-skin the 7 home medallion icons to share the brand winged-lion logo's look/shade (copper/gold gradient fill matching the crest), instead of plain gold strokes. (`home.html`)
- ☐ **15 · Home shape-morph micro-motion.** When a home plaque morphs shape, add a subtle cinematic shake/shift so the transform feels alive. (`home.html`)
- ☐ **4 · Consistency system.** Define ONE component language (buttons, tiles, fields, cards) from the home screen's custom design; document in DESIGN-CONVENTIONS.md; every inside screen adopts it. Location/address screen buttons specifically must match home buttons.

## PER-SCREEN (parallel agents — one file each)
- ☐ **2 · villas.html** — Earth Villa + Sky Villa entry buttons: real focused images inside each button, panning/Ken-Burns + spotlight choreography, modern info around them, elevated tap feel.
- ☐ **4 · address.html** — buttons/fields restyled to home-button continuity (uses convention system).
- ☐ **5 · residences.html** — floor-plan comparison: ALL bottom data points equal prominence + big/readable (built-up & unit area are too small now); add zoom in/out on the floor plans.
- ☐ **6 · pearl.html** — pin click → zoom + center the pin → popup to LEFT or RIGHT depending on pin position; card bigger (~15–20% of screen). All images zoomable.
- ☐ **7 · landscape.html** — pin click → cinematic zoom into the plan at the pointer → popup left/right (~15–20%); master plan visible; GLOW the pins (signal tap); zoomable images/plans. Sustainability + Renders buttons (bottom-left) given thumbnail prominence. Sustainability panel redesigned: slides into a right-side mainframe with icons/animation + close; closing restores the map.
- ☐ **8 · gallery.html** — images & videos get MAIN prominence; clearly distinguish Images vs Films tabs (currently identical/confusing); zoom in/out on images; thumbnails functional/swipeable/tappable. **+ host the Day/Night toggle moved from masterplan (#9).**
- ☐ **9 · masterplan.html** — REMOVE day/real/night toggle (moved to gallery) + remove all metadata pins/detail points. Keep ONLY the master-plan map: cut/center it, scale-in cinematically on entry, gentle float, redesigned/highlighted pointers. Master plan zoomable.
- ☐ **9b · gallery Day↔Night** — swipe/slider transition between proper-aspect day & night shots for a seamless day→night effect.

## INVENTORY (owner: main session — inventory.html is complex/central)
- ☐ **10 · Aerial entry** — remove the floating effect; center the estate image; swipe left/right tilts perspective on Z axis (≈180° turn feel), image stays centered. Tower-number tap: other markers disappear, the chosen one pops & holds ~1s with a line to the tower, then transitions to floor selector.
- ☐ **10b · Floor selector spotlight** — fix spotlight to the ACTUAL tower position (use floor-plan/marked pointers); increase spotlight height; position per selected tower. Floor tap → a line points to that floor's level + zoom roughly to that floor WITHIN the spotlight band (line animates top↔bottom between spotlight bounds). All towers.
- ☐ **12 · Unit status colours + pop** — available=green, sold=red, booked/blocked=orange/amber accents on the unit buttons; add a pop/pulse so users know to tap.
- ☐ **13 · Unit plan focus** — on the final unit screen, focus the selected unit + darken/recede the surroundings so it reads clearly (subtle, not over-focused).
- ☐ **(data)** Re-verify all inventory content vs client xlsx (towers, units/floor, areas, floor counts G+24+PH / 7-8 G+22).

## GLOBAL QA
- ☐ Every screen: zero console errors, no-scroll, all back buttons functional, transitions + animated bg present, consistent components.
- ☐ Speaker removed everywhere; audio only on intro.
