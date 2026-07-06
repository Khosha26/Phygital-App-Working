# The Universe (Venus) — Experiential PWA · OPS

| | |
|---|---|
| **Live URL** | https://universestudio.venusprojects.co.in (A record → this server; Caddy auto-HTTPS) |
| **Type** | Static PWA (in-browser Babel/React, RealDesk kiosk build). NO server, NO build step. |
| **Served from** | `/var/www/universe-studio` (Caddy `root * … ; file_server`) |
| **Source mirror** | `~/projects/phygital-app-working/the-universe-venus/v2` (git: Khosha26/Phygital-App-Working) |
| **Caddy vhost** | `/etc/caddy/Caddyfile` → `universestudio.venusprojects.co.in` block |
| **Telemetry** | posts to analytics.khosha.tech (RealDesk), token in `realdesk.config.json` |

## Redeploy after a repo update
```
cd ~/projects/phygital-app-working && git pull
sudo rsync -a --delete ~/projects/phygital-app-working/the-universe-venus/v2/ /var/www/universe-studio/
```
(No service restart — static files. Hard-refresh to bust the service worker `sw.js` cache.)

---

## 1. Development
| | |
|---|---|
| **LLM used to develop** | Claude (Claude Code) — Studio screens/UI polish; the presenter/claim gate (`app/presenter.jsx`, 2026-07-03) |
| Source repo | `github.com/Khosha26/Phygital-App-Working`, branch `main` (monorepo — this app is the `the-universe-venus/` folder only) |
| Language / stack | Plain React 18 + in-browser Babel (no build/bundler), vanilla JS helpers (`session.jsx`) |
| Code owner (person) | Nishchal (Khosha Systems, upstream UI/unit-plans) + ankitjm (integration/presenter gate) |
| Runs as OS user | `ubuntu` (dev tree + rsync); served files owned however `/var/www/universe-studio` is set up (Caddy reads, no app process) |

## 2. Hosting / server
| | |
|---|---|
| Host | srv1751425 |
| Public IP | 187.127.180.28 |
| OS | Ubuntu 26.04 LTS |
| Code path (dev tree) | `~/projects/phygital-app-working/the-universe-venus/v2` |
| Served path (deployed) | `/var/www/universe-studio` (byte-for-byte rsync mirror of `v2/`, no build artifacts differ from source) |
| Persistent data path | none — fully static; the only "data" is bundled assets + the two hardcoded JS data files (`app/data.jsx`, `app/plate-data.js`) |

## 3. Runtime / process
| | |
|---|---|
| Process manager | none — static files, no Node/Express process for Studio itself |
| Start / stop | n/a |
| **Port** | n/a (Caddy `file_server` directly) |
| Health check | `curl -sI https://universestudio.venusprojects.co.in` (200) |
| Logs | Caddy access log only (no app log) |
| Boot persistence | n/a |

## 4. Database
| | |
|---|---|
| Engine | **none directly.** All project/inventory/pricing data is hardcoded JS (`app/data.jsx`, `app/plate-data.js`) baked into the static bundle. |
| Live dependency | The **presenter/claim gate** (`app/presenter.jsx`) and the in-progress mini-CRM wiring call the **gre-universe relay** (`~/projects/gre-universe`), which in turn talks to the central Supabase-Venus `public` schema (the CRM's database) — see `~/projects/venus-suite/STUDIO.md`'s integration-gap table for what else would need this. |

## 5. Routing / network
| | |
|---|---|
| Public domain | `universestudio.venusprojects.co.in` |
| TLS | Caddy automatic Let's Encrypt |
| Reverse proxy config | `/etc/caddy/Caddyfile` → `universestudio.venusprojects.co.in` block, `root * /var/www/universe-studio; file_server` |
| Cross-origin calls out | `presenter.jsx` → `https://universegre.venusprojects.co.in/api/studio/claim` (CORS allow-listed on the gre-universe relay to this exact origin) |
| Firewall (ufw) | server-wide: 22/80/443 only |

## 6. Environment / secrets
- **No `.env` for this app** — it's static and holds no secrets. (Contrast: `app/presenter.jsx` hardcodes the relay's public claim URL, which is fine — it's a public CORS-gated endpoint, not a credential.)
- Telemetry token (`realdesk.config.json`, `rdk_...`) is a write-only analytics token, not sensitive.

## 7. Backup & restore
- **What is backed up:** nothing dedicated today — the deployed dir is a disposable rsync mirror; the source of truth is the git repo (`~/projects/phygital-app-working`) + the developer's local working tree. Not yet in `~/projects/ops/`'s server-wide backup manifest (static-dir class, same pattern as `kds-demo`) — **add it** if this becomes business-critical beyond a sales demo.
- **Restore procedure:** `git clone`/`git pull` the repo, `rsync` `the-universe-venus/v2/` to `/var/www/universe-studio/`. No DB, no volumes.

## 8. SOP — maintenance runbook
| Task | Command / steps |
|---|---|
| Check status | `curl -sI https://universestudio.venusprojects.co.in` |
| View logs | Caddy access log (`journalctl -u caddy` or the configured log file) |
| Restart | n/a (static) |
| Deploy / update from repo | `cd ~/projects/phygital-app-working && git pull && sudo rsync -a --delete the-universe-venus/v2/ /var/www/universe-studio/` |
| Rebuild | n/a (no build step) |
| Rollback | `git checkout <prior-commit> -- the-universe-venus/v2` then re-rsync, or restore from a prior local snapshot before the bad edit |
| Manual backup now | `tar czf universe-studio-$(date +%s).tar.gz -C ~/projects/phygital-app-working/the-universe-venus v2` |
| Bust the PWA/service-worker cache after deploy | bump the cache-version string checked in `index.html`'s inline boot script, or visit with `?pwa=reset` |

## 9. Dependencies & gotchas
- **Zero build step is load-bearing**, not a shortcut — every `.jsx` is transpiled client-side by `assets/vendor/babel.min.js` on page load. A syntax error in any screen file breaks the *entire* app (Babel parse failure), not just that screen.
- **Monorepo:** this repo also holds several *other* unrelated client kiosk builds (`embassy-citadel/`, `embassy-one-tower/`, `highland-mayfields/`, `living-tree/`, `phygital-master-app/`, and `gre-universe/` itself). `git pull`/`git log` at the repo root will show noisy unrelated commits — always check `git log -- the-universe-venus` / `git diff --dirstat` to scope to this app.
- **`app/screens/_*.pre2331.jsx` / `_*.bak.jsx` files** are dead snapshots, not loaded by `index.html` — don't edit them expecting effect, and don't delete them without checking nothing references them (nothing does, as of 2026-07-03).
- **Two parallel key-spaces for block pairs** (`BLOCK_SPECS` uses `'A&B'`, `PLATE_DATA` uses `'AB'`) are bridged ad hoc in `floorplate.jsx` (`tower.pair.replace(/&/g,'')`) — a landmine for anyone adding a new lookup against either structure without going through the existing bridge.
- **Full architecture, screen-by-screen data sources, and the CRM integration-gap workplan:** `~/projects/venus-suite/STUDIO.md` (canonical, keep in sync with this file).

## 10. Change log
| Date | Change | By |
|---|---|---|
| 2026-07-01 | v2 sourced from upstream ("Highland Mayfields v1" batch commit, monorepo quirk — actually the-universe-venus content) | Nishchal (Khosha26) |
| 2026-07-03 | Added `app/presenter.jsx` — salesperson passcode-claim gate wired to the gre-universe relay's `/api/studio/claim` (live) | ankitjm + Claude |
| 2026-07-03 | Wrote canonical suite doc `~/projects/venus-suite/STUDIO.md`, this README, extended this OPS.md, confirmed no upstream conflicts (read-only review) | ankitjm + Claude |
