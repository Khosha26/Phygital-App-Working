# LivingTree Sales Suite — Proposed Screen Flow

Structure mirrors **The Universe Sales Suite** so the team can reuse the codebase, animation system, and deploy pipeline. Total: **1 splash + home + 11 modules**. Visual metaphor swapped from cosmos → **tree of life** (branches as modules).

```
Splash
  ↓
Home (tree-of-life with branches → modules)
  ↓
┌── 1. Story            About Kalyani + LivingTree philosophy
├── 2. North Bangalore  5 Reasons to invest + KIADB Advantage
├── 3. Location         Map + nearby landmarks (Tech / Edu / Health / Retail)
├── 4. Masterplan       Site plan, 10 trees + 2 clubhouses, amenity hotspots
├── 5. Towers           Drill into each named tower (Aspen, Chestnut…)
├── 6. Residences       Unit plans 1/2/2.5/3 BHK × Smart/Optimal/Luxe × E/W
├── 7. Amenities        65 amenities, Sport/Social/Wellness/Family/Kids
├── 8. Gallery          Renders + clubhouse + site photos
├── 9. Specifications   Structure/finishes/electrical/security matrix
├── 10. Tools           Cost calculator, EMI, compare units
└── 11. Booking         Reserve a residence (sales agent capture)
        ↓
   Saver Snapshot       Whatsapp/PDF takeaway for the customer (like Universe)
```

---

## Screen-by-screen

### 0. Splash
- Logo wreath animates open (leaves unfurl), reveals **"Designed for Life."** in serif gold on forest-green ground.
- Co-branded foot: LivingTree® · Kalyani Developers.
- Tap-anywhere → Home.

### 1. Home — split stage "Tree of Life"
Universe pattern: LEFT editorial title block, RIGHT orbit of module buttons around a centre monogram. Adapted:
- **LEFT:** *Designed for Four Generations* headline + descriptive copy + key stats (25 acres · 10 towers · 60+ amenities · 15 min to airport).
- **RIGHT:** branches radiate from a central LivingTree monogram. Each branch terminates in a leaf-shaped tile (one per module).
- Tap a tile → leaf jumps + spins + flies into centre monogram → screen transitions.
- Ambient: drifting leaf-dust particles on a parchment ground.

### 2. Story
- Hero: **Designed for Four Generations** + *Rooted in Luxury, Branching into the Future*.
- About Kalyani timeline: 30+ years · 12M+ sft offices · 75 auto showrooms · diversified portfolio (residential/commercial/auto/green energy/hospitality/managed spaces).
- Sign-off card: *"It's a Feeling."*

### 3. North Bangalore
- Big "5 Reasons to Invest" ticker — each reason is its own card with icon, headline, 2-line description (metro, industrial growth, aerospace park, MH industrial corridor, KIA T2).
- Inline KIADB Advantage card-strip.

### 4. Location
- Stylised map (the green map shown on page 2) with LivingTree pin at centre.
- 4 swappable category panels: **Tech Parks / Schools / Hospitals / Shopping & Lifestyle**.
- Each row: name + distance + drive time (some times from website, others to be filled by Kalyani team — see open questions).
- "Connectivity" badge row across the bottom: Airport · Hebbal · Metro · Outer Ring Road.

### 5. Masterplan
- Render or top-down site map.
- 10 tree-named towers as tappable hotspots (Aspen, Chestnut, Coral, Deodar, Laurel, Ashoka, Walnut, Tamarind, Plumeria, Mahogany).
- 2 clubhouse hotspots (Clubhouse 01, Clubhouse 02).
- 65-amenity overlay (toggleable: Sport / Social / Wellness / Family / Kids).
- Tapping a tower → opens Tower detail screen.

### 6. Towers
- One detail view per tree-named tower.
- Tower stats: floors · units · typologies hosted · view orientation · cluster.
- Inventory ribbon: Available / Hold / Sold counts (placeholder until Kalyani sends live data — see open questions).
- CTA → jump into Residences filtered to that tower's typologies.

### 7. Residences
- Filter chips: 1 BHK · 2 BHK · 2.5 BHK · 3 BHK Smart · 3 BHK Optimal · 3 BHK Luxe.
- Card per typology with E + W variants side-by-side, saleable / carpet / balcony figures.
- Full floor-plan zoom view (factsheet pages 7–12 already have these renders).
- "Show in masterplan" CTA → masterplan with tower(s) highlighted.

### 8. Amenities
- Hero: **Double Everything** — two of each amenity, on north + south.
- 65 amenities organised into 5 categories with icons:
  - Sport (kids play area, basketball, cricket nets, tennis, skate park, mini golf, bocce, viewing gallery, rock climbing, sports zone, fleet games…)
  - Social (party lawn, event lawn, amphitheatre with stage, gathering area, picnic lawn, infinity edge, arts & crafts zone, reading nook…)
  - Wellness (yoga zone, meditation zone, jogging track, reflexology pathway, garden 1–8, woodland, fern's café…)
  - Family (kids pool, leisure pool, infinity edge, aqua gym with Jacuzzi, aqua deck, pool deck, lap pool, mum's staff, tile court, tactile walk…)
  - Kids (Eden's plaza, working space, outdoor gym, picnic lawn with mound, arts & crafts zone, sculpture court, fairy lawn…)
- Each amenity tile includes its number from the masterplan legend so the sales rep can point to it on the plan.

### 9. Gallery
- Tabs: **Site Renders · Clubhouse · Tower Renders · Flowing Roots Landscape**.
- Lightbox zoom.
- (Universe pulled these from `assets/photos`, `assets/renders`, `assets/clubhouse` — same convention here.)

### 10. Specifications
- Matrix of Structure · Lobby · Flooring · Kitchen · Toilets · Doors · Windows · Painting · Electrical · Security · DG Power.
- Each row icon + value.
- Optional "compare-to-competition" toggle (later phase).

### 11. Tools
- **Cost Calculator** — pick tower + unit type + floor + orientation → all-in price (BSP + maintenance + GST + reg).
- **EMI Calculator** — loan amount, tenure, ROI slider.
- **Compare Units** — pick 2 typologies side-by-side (Smart vs Optimal vs Luxe).

### 12. Booking
- Customer KYC capture (sales agent fills in): name, phone, email, PAN, employer.
- Pick unit (tower + floor + variant).
- Booking amount, mode (UPI/cheque/RTGS), token receipt.
- Triggers Saver Snapshot.

### Saver Snapshot (auxiliary)
- One-pager summary the sales agent can share via WhatsApp or print.
- Project hero · selected unit · price breakdown · floor plan thumbnail · sales agent contact + RERA.

---

## Visual + Tech Direction (proposed)

| Layer | Universe | LivingTree |
|-------|----------|------------|
| Canvas | 2560×1600 tablet, scaled | Same |
| Stack | Vanilla React (via CDN) + Tailwind + single index.html | Same — re-use Universe scaffolding |
| Palette | Cosmic night + warm gold | **Forest green #2E4A2C + gold #C9A865 + parchment #F4EDDC** |
| Type | Display serif + sans | Same — display serif (Cormorant/Cardo) + sans (Inter) |
| Motif | Orbital cosmos, gold dust | **Tree of life, branches, drifting leaves** |
| Animations | Card-flip → orbit-to-centre | Branch-extends → leaf-flies-to-trunk |
| Deploy | Netlify PWA + service worker | Same |

---

## Asset gaps (need from Nischal/Kalyani)

1. Vector logos: LivingTree wreath, Kalyani triangle (`.svg` / `.ai`).
2. Hi-res 3D tower renders (factsheet has thumbnails only).
3. Clubhouse renders (interior + exterior of both clubhouses).
4. Site walk-around photography.
5. Floor-plan PDFs as separate files (or extracted from factsheet at full resolution).
6. Real availability + price master (otherwise we use placeholders like Universe did).
7. Drive-time data for landmarks the website doesn't list explicitly.
8. Brand book PDF if one exists, for confirming green/gold hex values + font picks.
