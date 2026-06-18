# Open Questions for Nischal (before any build)

## Scope
1. **Screen list confirmation** — happy with the 11 modules (Story · North Bangalore · Location · Masterplan · Towers · Residences · Amenities · Gallery · Specifications · Tools · Booking)? Anything to drop or add?
2. **Booking flow** — is this a true booking form that creates a record, or a *demo* booking like Universe (no backend, captures + prints/whatsapps a snapshot)?
3. **Tools** — keep Cost Calculator + EMI + Compare? Or simpler?
4. **Saver Snapshot** — should the sales rep be able to generate a shareable customer PDF/image at the end?

## Brand & Visual
5. **Theme metaphor** — confirm **Tree of Life with branches** (replacing Universe's cosmic orbit) as the central animation idea?
6. **Palette** — forest green + gold + parchment (from factsheet cover). Sound right, or do you have brand hex?
7. **Type** — display serif + sans (matching factsheet headline)? Any locked typefaces?
8. **Same code stack as Universe** (single index.html, Vanilla React + Tailwind via CDN, deploy on Netlify)? Or migrate to Vite/Next?

## Data & Assets
9. **Logos** — do you have LivingTree wreath + Kalyani triangle in vector (SVG/AI)?
10. **Renders** — where can I find hi-res tower + clubhouse renders? Factsheet PNGs are too small for full-screen.
11. **Floor plans** — separate PDF or image files per typology?
12. **Real pricing/inventory** — placeholders OK for first cut, or do we have a price master from Kalyani sales?
13. **Sales person identity** — does the app log in as a specific rep (name on Saver), or is it generic?

## Deploy
14. **Hosting** — Netlify like Universe, or do you want to host on khosha.cloud?
15. **Device target** — iPad landscape primary (Universe canvas is 2560×1600)? Confirm.

---

## My recommended defaults (so we can move fast if you just want me to start)
- Match Universe stack 1:1 (single HTML + CDN React + Tailwind)
- Tree-of-life home metaphor
- Forest green + gold + parchment palette
- Demo booking (no backend) + Saver Snapshot
- iPad landscape primary
- Use placeholders for prices + availability for now
- Pull renders/plans from the factsheet at higher DPI; flag the rest as "asset gap" for Nischal/Kalyani to send
