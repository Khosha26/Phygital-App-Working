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

## Notes
- Integration with the Venus suite (CRM/EOI booking) is PLANNED, not yet wired (2026-07-01).
