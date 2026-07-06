# The Universe · Sales Suite — Studio kiosk (v2)

A tablet-first **sales-presentation kiosk PWA** for The Universe (Venus Group, Nehru Nagar, Ahmedabad): story, location, master plan, floor-plan drill-down, amenities, gallery, calculators, inventory and a gamified booking flow, plus a hidden Sales-Desk mini-CRM console and (new, 2026-07-03) a salesperson presenter/claim gate tied to the central CRM.

**Canonical documentation for this app is `~/projects/venus-suite/STUDIO.md`** (suite-standard doc: full screen map with data sources, the session/journey tracker, the presenter/claim gate, the unit-plan referencing model, and the CRM integration-gap workplan). This README is a quick local-dev/deploy card; **OPS.md** in this same folder is the infra runbook. Keep all three in sync — update the doc closest to what you changed.

- **Live:** https://universestudio.venusprojects.co.in
- **Repo:** `github.com/Khosha26/Phygital-App-Working` — **monorepo**, this app's slice is the `the-universe-venus/` folder only (siblings: `embassy-citadel/`, `embassy-one-tower/`, `gre-universe/`, `highland-mayfields/`, `living-tree/`, `phygital-master-app/` — unrelated client builds, don't cross-edit).
- **Active version:** `v2/` (this is what's deployed). `v1/` is legacy/reference, not served.
- **Sibling app:** `~/projects/gre-universe` — the reception kiosk that captures a walk-in and files it as a CRM lead at `site_visit_done`; Studio is the presenter iPad used *after* that, and (as of 2026-07-03) calls back into the gre-universe relay for lead-claim + (in progress) session-end/mini-CRM data.

## Stack

Plain **React 18 + in-browser Babel**, **zero build step** — `index.html` loads React/ReactDOM/Babel/Leaflet as plain `<script>` vendor files, then every `app/**/*.jsx` as `type="text/babel"` (transpiled in the browser on load). `app/plate-data.js` is the one file loaded as plain JS (not Babel). No npm install, no bundler, no SSR — editing a `.jsx` file and reloading the page is the entire dev loop.

Every screen is authored against a fixed **2560×1600** canvas that scales-to-fit any device/aspect at runtime (`useFitScale()` in `app/utils.jsx`).

## Screen map (quick reference — full detail + data sources in STUDIO.md)

`splash`/`splash-dark` → `explore` → `home` (hub + hidden Sales-Desk console) → `story` · `location` · `masterplan` · `masterplan-explorer` · `residences` · `amenities` · `gallery` · `tools` (cost sheet/EMI/compare) · `inventory` → `floors` → `floor` → `unit` (the 4-step drill-down) · `booking` (gamified, local-only demo). Plus global chrome: `_header`, `_dock` (floating shortcuts FAB), `_tools-float` (draggable price/EMI windows), `saver` (idle screensaver), and the new `presenter.jsx` (`PresenterGate`, wraps everything).

Data is **100% hardcoded** in `app/data.jsx` (project facts, towers, amenities, gallery, pricing placeholder `DUMMY_RATE`) and `app/plate-data.js` (floor-plate tables) — the **only** network call anywhere in the app is the presenter/claim gate's `POST /api/studio/claim` to the gre-universe relay. See STUDIO.md's integration-gap table for exactly what it would take to make gallery/inventory/pricing/booking CRM-live.

## Local dev

No install, no build. From the repo root:

```bash
cd ~/projects/phygital-app-working/the-universe-venus/v2
python3 -m http.server 8080   # or any static file server
# open http://localhost:8080  (localhost/LAN IPs auto-skip the "Download experience" PWA gate)
```

Edit any `app/**/*.jsx` and reload — Babel transpiles on the fly, no watch/build process. `?pwa=reset` in the URL clears the cached-install flag; `?pwa=0` forces dev mode even off `localhost`.

⚠️ In production the service worker (`sw.js`) precaches aggressively for offline kiosk use — if you're testing changes against the deployed URL, hard-refresh or bump the cache-version check in `index.html`'s inline boot script.

## Deploy

Static rsync mirror, no build, no service to restart:

```bash
cd ~/projects/phygital-app-working && git pull
sudo rsync -a --delete ~/projects/phygital-app-working/the-universe-venus/v2/ /var/www/universe-studio/
```

See [OPS.md](OPS.md) for the full infra runbook (Caddy, backups, secrets, SOP table).

## In progress today (2026-07-03) — don't collide

Two workstreams are landing in parallel on top of the same Jul-1 base:
1. **This app:** `app/presenter.jsx` (`PresenterGate`) — shipped, committed locally (`333fb27`), not yet pushed upstream.
2. **The gre-universe relay** (separate repo/deploy, `~/projects/gre-universe`): `routes-studio.js` (new) adding `GET /api/studio/walkins`, `POST /api/studio/session-end`, `GET /api/studio/dispositions` — plus, per the suite plan, an `app/screens/minicrm.jsx` for Studio itself to replace the hardcoded `SALES_DESK` mock console on Home with a live one. If you're touching `home.jsx`, `session.jsx`, or `index.html`'s script list, check for a fresher local copy before editing.

Upstream (Nishchal, `Khosha26` on GitHub) has **not** pushed anything new to `the-universe-venus/` since the Jul 1 12:15 base commit — confirmed via `git fetch origin` on 2026-07-03 (8 new commits landed, all under `highland-mayfields/`, none under `the-universe-venus/`). When his unit-plans/UI-tweak work does land, expect touch-points in `app/data.jsx`, `app/plate-data.js`, and `index.html`'s script list — see STUDIO.md's "Upstream status" section for the full diff-risk breakdown.
