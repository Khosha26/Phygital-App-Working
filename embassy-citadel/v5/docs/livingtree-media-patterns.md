# Livingtree Media + Functionality Pattern (Decoded)

> What Livingtree actually does — the technique, the assets, the interaction model — so we replicate the proven pattern for Embassy Citadel instead of reinventing.

## Universal pattern (true for ALL screens)
**Photography / renders as the base + SVG polygons on top for click hotspots.** No Three.js, no Leaflet, no heavy 3D. Just images + transparent SVG overlays = the entire "interactive map / tower / floor" experience.

---

## Per-screen breakdown

### 01 · Project Overview
- **Media:** `assets/renders/render-04.jpg` (cinematic hero) + `assets/renders/cover-01.png` (identity art)
- **Functionality:** Left half = static cinematic hero with stats overlay. Right half = tabbed explorer with pill filters + stat boxes + USP rows (hoverable, selectable).
- **No scroll.** Everything fits one screen.

### 02 · Gallery
- **Media:** `item.src` (photos) + `item.poster` (video thumbnails) in a grid
- **Functionality:** Tab filters at top, thumbnail grid that scales on hover (`transform: scale(1.055)`), lightbox on click. Video items show a play overlay icon.

### 03 · Masterplan
- **Media:** ONE big `assets/masterplan-render.jpg` (the architectural site-plan image, ground-up bird's-eye render)
- **Functionality:** Pan + zoom (drag handler + scale state). Above the image is a `<svg>` with **transparent polygon hotspots** for each zone (tower, club, sport, social, wellness, family, water). Each hotspot:
  - Hover → glow / outline
  - Click → select + show info panel
- **Category toggles** at top: `{ towers, clubs, Sport, Social, Wellness, Family, Water }` — toggling hides/shows the corresponding hotspot group.

### 04 · Amenities
- **Media:** **No big photos.** All inline SVG line-art icons (lotus, person, clock, building, leaf, grid pattern).
- **Functionality:** Category filter chips at top (`All` + categories), responsive grid of amenity cards. Hover lifts card. Active category gets a tinted background.

### 05 · Inventory (the 4-step drill-down — THIS is the key pattern)
- **Step 1: Project View**
  - **Media:** `assets/towers-3d.jpg` and `assets/towers-3d-day.jpg` — a wide 3D render showing all towers in the complex
  - **Functionality:** SVG polygons over each tower silhouette. Hover shows tower stats, click enters Step 2.
- **Step 2: Tower View**
  - **Media:** `assets/tower-single.webp` — single tower elevation render
  - **Functionality:** Floor-row list overlaid on the right. Each floor row = `inv-floor-row` clickable, has unit count + price. Hover highlights both the row AND the corresponding floor on the tower image (via SVG floor-band hotspot). Click → Step 3.
- **Step 3: Floor View**
  - **Media:** `assets/unit-floor.jpg` — top-down floor plan image showing all units on that floor
  - **Functionality:** SVG polygons over each unit. Color-coded by status (available / soldout / unavail). Hover shows unit specs. Click → Step 4.
- **Step 4: Unit View / Price Sheet**
  - **Media:** Unit floor plan image (specific to chosen unit) + spec table
  - **Functionality:** Price + carpet area + BHK + view + CTA buttons (Reserve, Download price sheet)
- **Breadcrumbs** at top throughout (Project › Tower X › Floor 27 › Unit 2702)

### 06 · Floor Plans
- **Media:** Individual unit floor plan images (one per type)
- **Functionality:** 3 tabs — `compare` | `price` | `fsi`. Compare mode = pick up to 3 unit types, see them side-by-side with synced spec rows (carpet, balcony, BHK, etc.) using inline SVG row-icons (area, carpet, balcony, BHK, tower, price, status).

### 07 · Location
- **Media:** **`assets/maps/location-02.jpg`** — a static stylized map image (NOT interactive Leaflet!)
- **Functionality:** Custom SVG pins overlaid on the map, with hover pulse + selected-state pulse animation (`selectedPinPulse` keyframes). Category chips filter visible pins (Education / Healthcare / Entertainment / etc.). List of POIs on the side with distance. Selecting a list item highlights its pin + draws a route overlay SVG line from project to POI.
- **Key takeaway:** Static map + SVG pins beats Leaflet for this kind of curated brand experience. Faster, fully on-brand, no tile provider dependency.

---

## Applying this to Embassy Citadel (with real assets)

| Screen | Embassy media to use | Functionality |
|---|---|---|
| **01 Project Overview** | `assets/photography/hero-tower-skyline-wide.jpg` + `brochure-p-10.jpg` (A CUT ABOVE WORLI) | Left hero + right tabbed explorer (Brand · Vitals · The Sovereign Tower · WAYS) |
| **02 Gallery** | All `brochure-p-08…14.jpg` + Higgsfield-generated assets in `assets/generated/` | Photo grid, tabbed filters (Exterior / Lobby / Pool / Sky Lounge / Residences), lightbox |
| **03 Masterplan** | `~/Desktop/embassy-pristine-master-plan.jpg` (we already have it!) | Image + SVG polygons over: tower, podium, landscape zones, arrival court, jogging loop, water features |
| **04 Amenities** | SVG icons + brochure spread photos for each level | Filter by floor: L10 Active Rec, L12 Grand Social, L13 Movement, L14 Composed Retreat, L15 Wellness, L79 Sky Lounge. Each card shows floor # + name + 3 highlights + hero photo |
| **05 Inventory** | Step 1: `hero-tower-dusk.jpg` (single tower since Citadel is one tower) — skip to Step 2. Step 2: same tower + SVG floor bands. Step 3: floor plan image (need to extract from brochure or generate). Step 4: price sheet table. | 3-step (not 4) since one tower: Tower → Floor → Unit → Price sheet. Breadcrumbs. Mock realistic 4 & 5 BHK data, ₹18–40 Cr. |
| **06 Floor Plans** | Floor plan images per BHK type (extract from brochure or generate via Higgsfield) | 3-up comparison, sync-hover rooms across columns |
| **07 Location** | **Brochure page 9 has the location map already!** Extract that as `assets/maps/location-worli.jpg`. Add SVG pins for real POIs (Acharya Atre Metro, Sea Link, Four Seasons, Race Course, Phoenix Palladium, etc.). | Category chips (Connectivity / Entertainment / Education / Healthcare). Pin pulse on hover. Selected POI shows distance + route line. |
| **08 Tools** | Inline SVG icons + form widgets | Three sub-tools: EMI calculator (slider for principal/tenure/rate) · FSI calculator · Downloadable price sheet PDF |

## Assets we need to source / generate

| Asset | Status | Plan |
|---|---|---|
| Masterplan site-plan render | **✅ already have** (`~/Desktop/embassy-pristine-master-plan.jpg`) | Copy to `assets/masterplan/` |
| Tower elevation render | **✅ already have** (`hero-tower-dusk.jpg`) | Already in `assets/photography/` |
| Floor plan images (per unit type) | **❌ need** | Higgsfield generate OR extract from brochure if available |
| Location map (styled top-down of Worli area) | **✅ already have** (brochure page 9) | Extract clean from `brochure-p-09.jpg` |
| Lifestyle photos for Gallery + Amenities | **✅ mostly have** (`brochure-p-10…14.jpg` + `assets/generated/`) | Use directly |
| Unit price sheet data | **❌ mock** | Generate realistic Embassy-style: 4 BHK ~4500sqft @ ₹18Cr / 5 BHK ~6500sqft @ ₹30Cr / etc. |

## Direct corrections to the planning agent's brief

When the planning agent returns:
1. **Location screen:** Override "Leaflet + OSM" with **static image + SVG pins** (Livingtree's pattern). Brochure p9 map is the asset.
2. **Inventory:** It's **3 steps not 4** (Citadel is single-tower) — Tower → Floor → Unit → Price sheet.
3. **Floor Plans:** Comparison tab is the headline. Add price + FSI sub-tabs per Livingtree.
4. **Project Overview:** Use the tabbed-explorer pattern, not pure scroll.
5. **Amenities:** SVG icons primary, photos secondary. Filter by floor (10/12/13/14/15/79).
