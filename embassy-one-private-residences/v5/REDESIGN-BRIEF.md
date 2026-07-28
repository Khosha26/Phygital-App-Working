# Embassy ONE Private Residences — Redesign Brief (v2 → deck-aligned)

Source of truth = client sales-presenter deck `ONE (1).pdf` + agency files in
`Files for Agency 2/` + `FSNorth_Map.pdf` (Unit Matrix). This brief governs every screen.

## 🔒 FROZEN until client sends assets (DO NOT TOUCH)
- **Tower image** — leave `tower-scene.webp` / `tower-hero.webp` references as-is. Client emailed for correct isolated render.
- **Logo** — keep current "EMBASSY"/Residences wordmark in place. Client emailed for the Embassy ONE Private Residences vector lockup.
- Anyone touching a screen: do NOT swap the tower render or logo image. Everything else is in scope.

## Brand tokens (paste this :root block into every screen; rewire colours to it)
Palette sampled from the deck. Ink-navy primary + warm bone. Minimal/no gold.
```css
:root{
  /* deck palette */
  --ink:#121621;          /* signature dark navy-charcoal (statement bg) */
  --ink-2:#1a2030;         /* raised panel on dark */
  --ink-3:#222a3a;
  --bone:#e9e1d4;          /* warm light bg */
  --bone-2:#f2ece0;        /* lighter bone panel */
  --paper:#faf8f4;         /* near-white */
  --taupe:#6e5c58;         /* mauve-taupe accent block (use sparingly) */
  --champ:#c9b79c;         /* pale champagne — hairline/text accent ONLY, never a button border */
  --on-dark:#ece8e0;       /* text on ink */
  --on-dark-dim:#9aa1ad;
  --on-light:#1b2230;      /* text on bone */
  --on-light-dim:#6b6f78;
  --line-dark:rgba(236,232,224,.14);   /* hairline on ink */
  --line-light:rgba(18,22,33,.12);      /* hairline on bone */
  /* motion */
  --ease-out:cubic-bezier(.23,1,.32,1);
  --ease-io:cubic-bezier(.77,0,.175,1);
}
```
**Type** (already loaded — keep): headings = `Cormorant Garamond`, **UPPERCASE, weight 300–500, letter-spacing .06–.16em** (deck look). Body/labels = `Jost`, light, ALL-CAPS, wide tracking for eyebrows. Italic Cormorant for single-word emphasis. (Exact deck fonts TBC with client — Cormorant/Jost are the approved stand-ins.)

**Glass buttons** (replace every gold-bordered button):
```css
.glass{ background:rgba(236,232,224,.06); backdrop-filter:blur(14px) saturate(1.1);
  border:1px solid rgba(236,232,224,.16); border-radius:14px; color:var(--on-dark);
  transition:transform .16s var(--ease-out), background .2s, border-color .2s; }
.glass:active{ transform:scale(.97); }            /* on light bg use rgba(255,255,255,.5)+blur, border var(--line-light) */
@media(hover:hover){ .glass:hover{ background:rgba(236,232,224,.12); } }
```
No gold borders anywhere. Rounded, glass where it sits on imagery; flat bone panels elsewhere.

## Global changes (ALL screens)
1. Re-skin parchment/gold → **ink-navy + bone** via tokens above. Statement screens = ink bg; content screens = bone/paper bg.
2. **Remove every falling-leaf / foliage animation + watermark** (fleaf, foliage, leaf-cluster, leaf-motif). Intro = simple fade, no leaf sequence.
3. **Buttons → glass, rounded, no gold border.** `:active` scale .97. Hover gated `@media(hover:hover)`.
4. Copy: "The Residences" → **Embassy ONE Private Residences**; "The Place" → **The Address**; any **"60"** residences → **59**.
5. Remove all **"The Fifth Key" / key / crest** language + visuals (see service.html specifics).
6. Keep all existing motion mechanics (reveals, staggers) — just re-colour. Motion must stay FELT; durations <300ms; ease-out.

## Per-screen
- **index.html (home)** — reskin; remove leaf intro; rename hero to Embassy ONE Private Residences; glass buttons; keep 360 + download gate (recolour to glass). Tower SVG/render FROZEN.
- **service.html** — remove key/crest/Fifth-Key entirely; threshold heading → **“Bespoke Services”**, drop all top text; keep master-detail layout + animations, reskin to glass/ink; faded non-selected buttons stay non-functional + lower opacity.
- **Bespoke Services last screen** — each service field gets **richer content** (we write it; structure follows deck’s 3-tier *Curated Care / Considered Care / Complete Care*). Allow **direct sidebar toggling** (no back-out between items).
- **lanterns.html** — images **blow up to full-screen on swipe-up**; reskin.
- **masterplan.html / masterplan-illustrated.html** — reskin; remove trees/planting (PSD is layered, regenerate clean base) OR add legend key — pending client answer; clicked pins centre on screen (already done).
- **amenities.html** — reskin; show the **amenity render on select**; (Pool render missing — placeholder until client sends).
- **place-location.html** — reskin map UI to bone/ink; keep light tiles.
- **tower.html** — reskin only; tower render FROZEN; FLOORMAP correction handled separately (see mapping table, pending verify).
- **floorplans.html, gallery.html, overview.html, invitation.html** — reskin to tokens; rename copy.

## Floor-plan mapping — PENDING VERIFY before editing FLOORMAP (legal data)
Unit code = floor + wing (`23N` = 23rd floor North). One plan drawing serves several floors.
Authoritative source: booklet unit captions + Unit Matrix. See chat for the table; apply only after sign-off.
