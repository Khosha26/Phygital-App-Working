# Embassy ONE — Floor-Plan Mapping (authoritative)

**Verified 2026-07-02** against the client ground-truth:
- `Files for Agency 2/Inventory mix and Floor plans/Embassy ONE Private Residences - Floor plan booklet.pdf` (28 pages)
- `…North Tower - Area Statement.pdf` (per-unit Saleable Area, the DeDerive statement)

## Booklet PDF page → plan (1:1 with `app/assets/floorplans/booklet/pNN.webp`)

> PDF pages **1, 2, 28 are cover / divider / RERA pages (blank/black)** — NOT plans. `p01.webp`, `p02.webp`, `p28.webp` exist but are **never referenced** by the app. Page 27 = masterplan keyplan.

| webp | Unit Type | Floors | Total Area (sq ft) | Units |
|---|---|---|---|---|
| p03 | Two Bedroom · Duplex | 8,9,10,11,12,14 | 4,149.03 | 08D–14D |
| p04 | Three Bedroom · Garden Duplex | 1 & 2 | 5,066.9 | 01D/02D (app: 01N) |
| p05 | Three Bedroom | 2 | 5,423.83 | 02N |
| p06 | Three Bedroom | 8,10,12,16 | 5,449.30 | 08N,10N,12N,16N |
| p07 | Three Bedroom | 9,11,14,17 | 5,477.89 | 09N,11N,14N,17N |
| p08 | Three Bedroom + Study | 8,10,12,16 | 5,856.56 | 08S,10S,12S,16S |
| p09 | Three Bedroom + Study | 9,11,14,17 | 5,858.65 | 09S,11S,14S,17S |
| p10 | Three Bedroom + Study + Media | 15 | 7,443.18 | 15S |
| p11 | Three Bedroom + Study + Media | 7 | 7,454.35 | 07S |
| p12 | Three Bedroom + Study + Media | 22 | 7,549.95 | 22S |
| p13 | Four Bedroom | 23–28 | 6,272.46 | 23N–28N |
| p14 | Four Bedroom · Recessed | 7 | 6,280.21 | 07N |
| p15 | Four Bedroom | 3,4,5,6 | 6,280.35 | 04N,05N,06N (see ⚠ 3N) |
| p16 | Four Bedroom · Recessed | 15 | 6,335.30 | 15N |
| p17 | Four Bedroom · Recessed | 22 | 6,335.30 | 22N |
| p18 | Four Bedroom | 18–21 | 6,392.18 | 18N–21N |
| p19 | Four Bedroom + Study | 23–27 | 7,537.14 | 23S–27S |
| p20 | Four Bedroom + Study | 18–21 | 7,571.39 | 18S–21S |
| p21 | Five Bedroom · South Garden Duplex (lower) | 1 | 5,744.28 | 01S lower |
| p22 | Five Bedroom · South Garden Duplex (upper) | 2 | 5,445.72 | 01S upper |
| p23 | Five Bedroom · Penthouse (lower) | 29 | 6,326.81 | 29N lower |
| p24 | Five Bedroom · Penthouse (upper) | 30 | 6,649.80 | 29N/30N upper |
| p25 | Five Bedroom · Penthouse (lower) | 29 | 7,528.06 | 29S lower |
| p26 | Five Bedroom · Penthouse (upper) | 30 | 7,595.51 | 30S upper |

The tower flow (`app/screens/tower.html` → `FLOORMAP[floor][wing].p`) references exactly p03–p26. The residence-comparison screen (`floorplans.html`) uses the separate, correct type-level set in `assets/floorplans/hi/*.webp`.

## ⚠ Client-data items to confirm (source-PDF issues, not app bugs)
1. **Booklet page 10** unit label reads "29N" but the plan is the 15th-floor 3BR+Study+Media (15S). Area is correct; the label is a copy-paste typo in the client PDF.
2. **Area-statement vs booklet, 3rd-floor North (3N):** booklet page 15 groups floors 3–6 at 6,280.35, but the Area Statement lists 3N (4B-N-01) Saleable = 7,648.67 — materially larger. The app follows the booklet (6,280). Confirm which the client wants shown.
3. **Booklet page 13** floor list ("23,24,28") and unit list ("23,25,26,27") don't fully align; the full 4B-N set is 23N–28N.
4. **Booklet page 11** running header reads "NORTH TOWER RESIDENCES" instead of "EMBASSY ONE PRIVATE RESIDENCES" (cosmetic).

## History
- **Prior bug (fixed v2.5 / phygital v3):** FLOORMAP `p:` refs were offset by the cover pages — floor 1N pointed at black `p02`, all mid-floor duplexes at black `p01`, floor 2N showed the 2BR-duplex plan mislabeled 3BR, and floors 7 / 8–17 / 22–28 were shifted. Corrected so every unit shows its true plan; verified via Playwright across floors 1,2,7,8,15,22,29.
