# Wave-2 Shared Brief (read fully before editing anything)

App: `/Users/mi1k/Documents/Projects/embassy one/sales-suite/app/` — CLIENT-APPROVED luxury kiosk PWA (Embassy ONE Private Residences), just re-themed to beige. Your changes are design + small additive features ONLY. ZERO functionality regressions. Goes to a real sales team.

## Hard rules
1. Edit ONLY the files assigned to you. Other agents own the other files IN PARALLEL — touching their files causes conflicts.
2. NEVER touch: `sw.js`, `assets-manifest.json`, `deploy/`, any `*.pre-*.html` / `*.v*.html` / `_service-v1.html`, FLOORMAP/CFG data in tower.html, floor-plan image paths, existing nav wiring.
3. Theme tokens (already applied — match them, never reintroduce old colors): beige `#efe8da` primary surface, panels `#e6dcc8`, paper `#faf7f0`, ink/navy text+buttons `#121621`, gold `#c9a84c` for eyebrows/hairlines STATIC ONLY. Dark navy glass cards = accent (keep). NO shimmer animations, NO fireflies, NO birds, NO gradient text, no new gold button borders.
4. Fonts: match index.html's system — serif display (Cormorant family stack as used) for headings, "Jost" for UI/body. Kill any one-off font styles you find in your files (checklist item 5: inconsistent fonts).
5. iPad is the ONLY target device family, all aspect ratios, landscape primary. Nothing may assume a fixed viewport. No `100dvh`. Keep `env(safe-area-inset-*)` handling.

## Repetitive-label sweep (applies to YOUR files — client demanded this)
REMOVE these recurring marks wherever they appear (top strips, top-right marks, bottom-center marks, eyebrows):
- "EMBASSY ONE · PRIVATE RESIDENCES", "EMBASSY ONE · NORTH TOWER", standalone "EMBASSY ONE" corner/footer marks
- "A DEVELOPMENT BY EMBASSY GROUP - MEKRI CIRCLE, BENGALURU"
- Screen-name strips that duplicate the on-screen heading (e.g. "THE TOWER · FLOOR 14" strip above a big "Floor 14" heading → keep ONLY the big heading; "THE GROUNDS · MASTER PLAN" strip; "BESPOKE SERVICES · CARE TIERS" strip; "CURATED · CONSIDERED · COMPLETE" small circled heading)
Keep: the RETURN/back button, the actual screen heading (one instance), functional UI. Remove only decorative repetition. Check `grep -in "embassy one\|north tower\|development by" yourfile` to find them all (case-insensitive — markup may split words with spans; verify visually).

## 360° button (add to YOUR screens if missing — user wants it on ALL screens)
Replicate index.html's pattern (see lines ~741-752 + ~866-871): a `.float360`-style pill button ("360° View") that opens a fullscreen `#view360` overlay containing `<iframe src="https://www.turiya.co/360/EmbassyOne/" allow="fullscreen; accelerometer; gyroscope; magnetometer; xr-spatial-tracking" allowfullscreen>` with a Back button that closes it and blanks the src after fade. Style it navy-ink on beige per theme (index's is already themed — copy it). Position: top-right area, must NOT overlap the back/return button or the time/date, and must respect safe-area. Only set iframe src on tap (never preload). Note: this URL is online-only; that is accepted.

## Four Seasons ban
"Four Seasons" must not appear anywhere: no text, no label, no logo. (Images already cleaned at asset level.) If your files mention it, remove/replace with "the five-star hotel" phrasing or delete.

## Verification (mandatory before you report done)
- Serve: `cd "/Users/mi1k/Documents/Projects/embassy one/sales-suite/app" && python3 -m http.server <YOUR_PORT>` (your port is in your task prompt; do not use other ports).
- Playwright with real Chrome (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`), viewports 1366×1024 AND 1024×768.
- Screenshot every screen you changed → `/Users/mi1k/Documents/Projects/embassy one/sales-suite/_qa/wave2/<your-agent-name>/`.
- Zero console errors (favicon.ico 404 excepted). Click-test every interactive thing you added or touched. If your screen loads inside index via iframe, also test it standalone.
- Bottom 8px of screenshots must not be white.

Report back: what changed per file, what you removed (labels list), verification results, anything flagged for client confirmation. Keep it tight.
