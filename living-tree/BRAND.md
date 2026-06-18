# Living Tree by Kalyani Developers · Brand Spec

> Sources: `kalyanidevelopers.com/residential/living-tree-by-kalyani-developers` (fetched 2026-05-21), `client dump/logo.png`, `app/assets/brand/livingtree-lockup.png`, `assets/9727924_26905.svg` (leaf illustration), `client dump/master plan test.svg`, existing `app/app/styles.css` scaffold.
>
> The 147 MB Factsheet PDF was **not** opened (out of scope, too large). Items marked **[from Factsheet]** are TBD until that doc is parsed. The live website is a thin Next.js page; most numeric/legal facts (RERA, configurations, possession date) are **not present in the public page HTML** — they likely live only inside the Factsheet PDF.

---

## 1 · Project Facts

| Field | Value | Source |
|---|---|---|
| Project name | **Living Tree by Kalyani Developers** (also stylised **LivingTree**, one word, with `®` registered mark on the lockup) | website `<title>`, hero copy |
| Developer | **Kalyani Developers** (parent: Kalyani Group) | site meta + footer `Kalyani developers` |
| Internal name | "Kalyani LivingTree" (Salesforce project name in CMS payload) | `__NEXT_DATA__` JSON |
| Location | **Bagalur, Bangalore (Bengaluru), Karnataka, India** | site `<title>`, meta description, schema.org `PostalAddress` |
| Airport | **15 minutes from Bangalore International Airport (BLR / KIA)** | About section copy (verbatim) |
| Total community area | **25 acres** (described as a "lush, 25-acre community") | About section copy (verbatim) |
| Towers | **Ten (10) towers** | About section copy (verbatim) |
| Floors per tower | **24 floors each** ("ten 24-floored towers") | About section copy (verbatim) |
| Amenities | **60+ amenities**, "specially curated for four generations" | About section copy (verbatim) |
| Multi-gen positioning | **"curated for four generations"** | About section copy |
| Configurations (BHK) | **Not stated on website** [from Factsheet] | — |
| Total units | **Not stated on website** [from Factsheet] | — |
| RERA number | **Not stated on website** [from Factsheet] | — |
| Possession date | **Not stated on website**. Project status = **"Ongoing"**, statusName = **"New Launch"**, CMS Date = **2024-12-01**. Construction-update photos run **Feb 2025 → Mar 2025**. | `__NEXT_DATA__` |
| Pricing | **Not stated on website** (EMI calculator only — defaults 20L → 1.8C loan range as widget UI, **not project pricing**) | EMI widget |

### Neighbourhood proof points (verbatim, in website's accordion order)
- **Tech Parks / Work Spaces**: Wipro Aerospace, Manyata Tech Park, L&T Tech Park, Boeing, Brigade Magnum
- **Schools / Colleges**: Delhi Public School, National Public School, Presidency School, Presidency University, CRM University
- **Hospitals**: Aster Hospital, Regal Hospital, Columbia Asia
- **Shopping Malls**: Mall of Asia, Elements Mall, Bhartiya Mall, Galleria Mall, Lulu Value Mart
- **Others**: Bangalore International Airport, Byg Brewski, Decathlon, Hebbal Flyover

> Distances are **blank** on the live site (every `<span class="dis"></span>` is empty). Don't fabricate numbers.

---

## 2 · Logos & Marks

| Asset | Path | When to use |
|---|---|---|
| **LivingTree primary lockup** (mono-sage circular monogram `LT` woven into leaves, plus "LivingTree®" wordmark in sans-serif, on a pale parchment field) | `/Users/mi1k/Documents/Projects/livingtree/client dump/logo.png` and `/Users/mi1k/Documents/Projects/livingtree/app/assets/brand/livingtree-lockup.png` (both 438 × 176 PNG, identical file) | Splash hero reveal; home-screen top-left lockup; PDF deliverable headers. This is the only logo asset we have. |
| **Decorative leaf illustration** (3-tone green watercolour-style leaves on white) | `/Users/mi1k/Documents/Projects/livingtree/assets/9727924_26905.svg` | Background motif, page transitions, hero canvas decoration. **Not a logo** — illustration. Adobe Illustrator export, 504 × 288 viewBox. |
| **Master plan blueprint** | `/Users/mi1k/Documents/Projects/livingtree/client dump/master plan test.svg` (7.5 MB raster-traced SVG, 19k unique colours — treat as image, **don't recolour**) | Master plan screen only. Aesthetic is CAD/blueprint cyan, not brand colours. |
| **Kalyani parent-brand mark** | **Not provided** in dump | Footer attribution only. Existing scaffold encodes a Kalyani red/yellow/blue triangle — verify before using. |

**No SVG vector of the LivingTree logo exists in the dump** — only the 438 × 176 PNG. If splash needs a high-res reveal, request SVG from client or accept 4× upscaling artefacts.

---

## 3 · Color Palette (HEX)

### 3a · Sage green family — extracted from the actual LivingTree logo lockup
The logo PNG sits on a **pale sage/celadon background** (~`#dce0cb` band, eyeballed from the lockup image — **not lifted from CSS**). The monogram itself is a **muted sage green** (~`#8a9b7e` range). The wordmark "LivingTree®" is the same sage. This is the brand's true centre of gravity — soft, dusty, organic, **not a saturated forest green**.

> Conflict flag: the existing `styles.css` `--forest #2e4a2c` and `--forest-deep #1f3522` are **considerably darker and more saturated** than what the actual logo uses. The logo's mood is *celadon / sage*, not *deep forest*. See §3e.

### 3b · Greens from the leaf illustration SVG (only HEX values actually present in source)
Pulled from `assets/9727924_26905.svg` gradient stops — these are **verified**:

| HEX | Role |
|---|---|
| `#1C4C3E` | Deepest leaf shadow (very dark teal-green) |
| `#56A67F` | Mid leaf body (medium emerald-sage) |
| `#98DDBC` | Leaf highlight (mint pastel) |
| `#FFFFFF` | Pure white (gradient anchor) |

This is a **cooler / more emerald** palette than the logo's dusty sage — sits *adjacent* to brand, not at the centre.

### 3c · Colours actually present in the website's inline CSS
Verified extraction of the rendered HTML — the **only** HEX values inline on `kalyanidevelopers.com/.../living-tree...`:

| HEX | Where |
|---|---|
| `#000` / `#000000` | Body text, dark UI |
| `#666` | Breadcrumb link |
| `#FEC715` | List-marker accent (EMI section spec list) — **a saturated mustard-gold** |
| `#fff` | Backgrounds |
| `#ddd` / `#d3d3db` | Slider rails |

> **There is no project-specific brand palette in the live website HTML.** No CSS variables, no design tokens, no Tailwind config. Kalyani Developers' main site is generic Bootstrap 5 + a single gold accent. **Do not invent project-specific HEX values from this source.**

### 3d · The single accent gold from the live site
- `#FEC715` — bright marigold/mustard gold. **The only accent that has a verified source on the website.**

### 3e · Conflicts with existing `app/app/styles.css`

| Existing scaffold token | Value | Verdict vs. verified sources |
|---|---|---|
| `--forest #2e4a2c` | dark forest green | **Too dark/saturated.** Logo is sage `~#8a9b7e`. Leaf SVG mid-green is `#56A67F`. The scaffold leans *British racing green*; brand is *celadon*. **Recommend either softening to `#56A67F`–`#6a8a5b` range OR keeping `--forest` only as a deep-accent and adding a true sage variable.** |
| `--forest-deep #1f3522` | deepest hero green | Plausible as inverted/dark surface, but **not a logo colour**. |
| `--forest-soft #4d6a44` | mid green | Reasonable bridge value. |
| `--leaf-light #a8c293`, `--leaf-pale #d8e3c8` | highlight greens | **Close match** to the logo's background sage and the leaf SVG's mint. Keep. |
| `--gold #c9a865`, `--gold-deep #b08e45`, `--gold-soft #e8d8a8` | accent gold | **No verified source.** The live site's only gold is `#FEC715` (mustard, not antique). The scaffold's antique-gold reads more luxurious — defensible designer choice, but **flag as "designer-invented, not lifted from brand"**. |
| `--parchment #f4edda` family | warm cream backgrounds | **No verified source.** Logo background is pale sage, not cream. **Major aesthetic divergence** — scaffold reads "Mediterranean villa", brand reads "Japanese garden / celadon". |
| `--kalyani-red #c8312f`, `-yellow #f3c52d`, `-blue #2a3a73` | parent-brand triangle | Unverified — no Kalyani brand book in the dump. Use sparingly. |
| `--available #4a8b52`, `--sold #b85547`, `--hold #c9a865` | inventory status | Designer-invented; fine. |

### 3f · Recommended verified palette for new screens
If a coding agent needs colours that are **defensibly from source**, use this short list. Everything else is designer interpretation:

- **Sage (logo field)** — eyeballed `#dce0cb`
- **Sage (logo mark)** — eyeballed `#8a9b7e`
- **Leaf deep** — `#1C4C3E`
- **Leaf mid** — `#56A67F`
- **Leaf pale** — `#98DDBC`
- **Mustard gold accent** — `#FEC715`
- **Ink** — `#000000`
- **Soft text** — `#666666`

---

## 4 · Typography

### Website (kalyanidevelopers.com)
- **No webfont link** in the page `<head>` — the site loads only Bootstrap 5.3.3 CSS.
- Body falls back to **Bootstrap 5 default**: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`.
- Custom class names suggest serif display (`section-title-dark`, `section-title-light`) but **no `@font-face` or Google Fonts import found**.
- Conclusion: **the live site uses no curated typography** — it runs on system-ui. **The brand has no defined typeface in its public touchpoint.**

### Existing app scaffold (`app/index.html` -> Google Fonts)
- Display / serif: **Cormorant Garamond** (300–700, italics) + **Cinzel** (400–700, used for `.display` class)
- Body / UI: **Inter** (300–700)
- Mono / eyebrow: **JetBrains Mono** (400–600)

> Conflict: Cormorant + Cinzel are *European classical luxury* (wineries, jewellery). The brand's logo wordmark "LivingTree®" is set in **a clean humanist sans-serif** (looks like Nunito Sans / Source Sans / Mulish family). **Cormorant Garamond is not derived from the wordmark** — it's a designer interpretation of "luxury residential". Keep it for editorial display, but consider matching body UI to a sans closer to the wordmark (Nunito Sans 400/600 or Mulish 500/700).

---

## 5 · Hero Imagery / Visual Vocabulary

### Dominant hero
- The website preloads two hero images **with `fetchPriority="high"`**:
  - Desktop: `kalyani_image_1_2_e32792efcb.jpg`
  - Mobile: `Mobileres_banner_1_71963cef3a.jpg` (alt: **"Entrance of Living Tree by Kalyani Developers"**)
- The hero shows the **project entrance / gatehouse**.

### Gallery exteriors (in carousel order)
- `g4_0ffef3361d.png` — used as `og:image` and gallery main → **Front elevation hero render**
- `g5_62914d4f04.png`
- `g1_a87178bb9a.png`
- `g2_8a7f35315c.png`
- `g3_4b4ae8fd22.png`
- Alt-tag vocabulary used by the site: **"Front Elevation View"**, **"Living Tree Elevation"**, **"Open Garden"**

### Amenity carousel (in site order)
1. **Spa** (`a1_8bab5e2a12.png`)
2. **Kid's Play Area** (`a2_2d0aa2e64a.png`)
3. **Multipurpose Court** (`a3_61ee9344f7.png`)
4. **Swimming Pool** (`a5_816bb80747.png`)
5. **Gym** ("Fully Equipped Gym", `a4_7ec2483226.png`)

### Recurring motifs
- **Stylised tree / leaf monogram** (the LT-in-a-leaf-circle logo).
- **Lush 25-acre community greenery** — site copy emphasises "nature", "sanctuaries", "rooted", "branching".
- **Tower elevations** (architectural exterior renders).
- **Open Garden** imagery — explicitly named.

### Leaf SVG palette (greens used, verified)
`#1C4C3E` → `#56A67F` → `#98DDBC` → `#FFFFFF` — 3-stop linear gradient, illustrator-style watercolour leaf cluster.

### Master plan
- Live site uses a raster JPG: `kalyani_master_plan_e58e63eb6a.jpg`
- Local SVG (`client dump/master plan test.svg`) is 7.5 MB raster-traced (19k unique colours) — display as bitmap, never as recolourable vector.

---

## 6 · Tone of Voice

### Taglines / headlines (VERBATIM, in quotes — pulled directly from rendered HTML)

> "**Experience the Art of Living**"  — Hero H1

> "**Rooted in Luxury, Branching into the Future**"  — About section H2

> "**At LivingTree by Kalyani Developers, we don't just build homes; we craft personal sanctuaries that resonate with your unique story.**"  — Hero subtitle

> "**At LivingTree, we're designing more than just living spaces—we're crafting the canvas for your life's most cherished memories. Nestled within a lush, 25-acre community, our residential property in Bangalore combines the best of nature and luxury, just 15 minutes from Bangalore International Airport. With ten 24-floored towers and over 60 amenities specially curated for four generations, we create a home that is a reflection of your dreams—a place where you can truly belong.**"  — About body copy (full)

> "**Calculate Your EMI**"  — EMI section H3

> "**Construction Updates**" / "**Stay informed about construction progress of LivingTree...**"  — Project Status section

> "**Know Your Neighbourhood**"  — Location section H3

### Page meta (verbatim)
- Title: **"Living Tree by Kalyani Developers | Luxury Residences in Bagalur"**
- Meta description: **"Discover Living Tree by Kalyani Developers, a luxury residential project in Bagalur crafted for sophisticated living."**
- Schema.org description: **"Living Tree is a residential project designed for sustainable living with modern amenities and eco-friendly features."**

### USP themes (extracted from the body copy above — no separate bulleted USP list exists on the live site)
1. **Multi-generational** — "curated for four generations"
2. **Scale** — "25-acre community", "ten 24-floored towers", "60+ amenities"
3. **Connectivity** — "15 minutes from Bangalore International Airport"
4. **Nature + luxury duality** — "combines the best of nature and luxury"
5. **Emotional / narrative framing** — "sanctuaries that resonate with your unique story", "canvas for your life's most cherished memories", "a place where you can truly belong"

### Voice descriptors (inferred from above)
- Aspirational, narrative, slightly precious. **Avoids spec-sheet language entirely.**
- Heavy use of organic metaphors: *rooted, branching, sanctuary, canvas, lush.*
- Multi-generational angle is unusually specific — **lean on it** as differentiation.
- **Word choice to mirror**: *sanctuary, rooted, branching, lush, curated, belong, story, canvas, memories.*
- **Words to avoid**: *unit, inventory, premium fittings, world-class, RCC framework* — none of those appear on the public page.

### Surprising findings (flagged for both agents)
1. **No price, no RERA, no possession date, no BHK config** anywhere on the public page. If splash/home need these, sourcing is **client-side (Factsheet PDF) only**.
2. **Construction Updates carousel has ~30 slots, all labelled FEB 2025 / MAR 2025 with empty descriptions.** Template was filled in, content never written. Don't mirror this — it'll look broken.
3. **EMI calculator's defaults are placeholder garbage** (2 % interest, 2-year tenure, 20-lakh loan). Don't lift defaults blindly.
4. Project's CMS field is **"Salesforce_projectname: Kalyani LivingTree"** — internal name flips word order vs. consumer name.
5. The site treats **"LivingTree"** (one word, with `®`) as the consumer brand and **"Living Tree by Kalyani Developers"** (three words) as the legal/SEO title. **Splash should reveal "LivingTree®"; legal footer should use the long form.**

---

## 7 · For Splash Agent: Quick Reference

### Logo file to reveal
- `/Users/mi1k/Documents/Projects/livingtree/app/assets/brand/livingtree-lockup.png`
  (438 × 176 PNG, sage monogram + "LivingTree®" wordmark on pale celadon field — only logo asset we have)

### Recommended sage background that matches the logo's own field
- `#dce0cb` (eyeballed from lockup PNG) — sits cleanly behind the logo with no halo
- The scaffold's `--parchment #f4edda` produces a **visible warm-vs-cool mismatch** behind the lockup. Either swap parchment for the celadon, or place the lockup on a soft sage card on top of parchment.

### Hero copy candidates (pick one — all verbatim from source)
1. **"Experience the Art of Living"** (the actual hero H1 — safest, most on-brand)
2. **"Rooted in Luxury, Branching into the Future"** (the actual About H2 — more poetic, more differentiated)
3. **"LivingTree® · Bagalur, Bengaluru"** (location lockup line — useful as subtitle under either)

### Subtitle / paragraph candidate (verbatim)
> "At LivingTree by Kalyani Developers, we don't just build homes; we craft personal sanctuaries that resonate with your unique story."

### Tap-to-continue / CTA wording
Site has no splash CTA, but the dominant verb across the site is **"Experience"** (hero H1) and global nav uses **"Enquire Now"**. For a tablet sales app, **"Touch to begin"** or **"Begin the tour"** is on-brand.

### Decorative motif option
Leaf SVG at `/Users/mi1k/Documents/Projects/livingtree/assets/9727924_26905.svg` — reduced opacity / large-scale behind the lockup. Greens already match: `#1C4C3E` / `#56A67F` / `#98DDBC`.

---

## 8 · For Home Agent: Quick Reference

### Section labels — mirror the live site's exact wording
The website's section eyebrows / labels (uppercase pill style on actual site):

| Site label | Recommended tile label |
|---|---|
| `ABOUT` | **Our Story** *or* **About** |
| `AMENITIES` | **Amenities** |
| `Gallery` (Exterior · Interior · Walkthrough) | **Gallery** |
| `Plans` (Master Plan · Unit Plan) | **Master Plan** + **Residences** (or "Unit Plan") |
| `emi calculator` | **EMI Calculator** *or* **Tools** |
| `PROJECT STATUS` / Construction Updates | **Construction Updates** |
| Know Your Neighbourhood | **Neighbourhood** *or* **Location** |
| (parent nav) Home · About Us · Residential · Commercial · Media Center · Blogs · Contact Us | Reserve "About Us / Contact" for footer only |

### Existing scaffold's screens (from `app/index.html`)
`splash · home · story · north (North Bangalore) · location · masterplan · towers · residences · amenities · gallery · specifications · tools · booking · saver`

→ **`story` ≈ ABOUT**, **`north` is custom** (not on live site — designer add-on for North Bangalore micromarket), **`specifications` is custom** (Factsheet-driven, not on live site), **`tools` ≈ EMI calculator**.

### Site-implied flow (if you want to mirror the actual website)
1. Hero (Experience the Art of Living)
2. About (Rooted in Luxury, Branching into the Future)
3. Amenities carousel
4. Gallery (Exterior / Interior / Walkthrough tabs)
5. Plans (Master Plan / Unit Plan tabs)
6. EMI calculator
7. Location & Neighbourhood (map + accordion: Tech Parks, Schools, Hospitals, Malls, Others)
8. Project Status / Construction Updates
9. Footer / Enquire

### Module hub tile copy (recommended, all derived from verified source)
- **Our Story** — "Rooted in luxury, branching into the future."
- **Master Plan** — "Ten towers. 25 acres. Curated for four generations."
- **Residences / Towers** — "Twenty-four floors of light and air."
- **Amenities** — "Sixty amenities, four generations."
- **Gallery** — "Exteriors · Interiors · Walkthrough."
- **Location / North Bangalore** — "Fifteen minutes from Bengaluru International Airport."
- **EMI / Tools** — "Plan your investment."
- **Booking / Enquire** — "Begin your story."

### Quantitative chips a tile can safely show (sourced)
- **25** acres
- **10** towers
- **24** floors
- **60+** amenities
- **4** generations
- **15** minutes to BLR Airport

### Quantitative chips DO NOT show without client confirmation
- Total units · BHK mix · price · sqft range · RERA number · possession date · per-unit cost
- (None appear on the live website; these likely come from the Factsheet PDF.)

---

## Appendix · File inventory used to build this spec

| File | Used for |
|---|---|
| `https://kalyanidevelopers.com/residential/living-tree-by-kalyani-developers` (saved at `working/livingtree-fetched.html`) | All taglines, project facts, section labels, image manifests, hero copy |
| `client dump/logo.png` (= `app/assets/brand/livingtree-lockup.png`, 438×176) | Logo, sage palette derivation |
| `assets/9727924_26905.svg` | Verified leaf-green HEX values (`#1C4C3E`, `#56A67F`, `#98DDBC`) |
| `client dump/master plan test.svg` | Confirmed it's a raster-traced 19k-colour artefact — treat as bitmap, not vector palette |
| `app/app/styles.css` | Conflict analysis against existing scaffold tokens |
| `app/index.html` | Existing route inventory + webfont list |
| `client dump/Factsheet-Final.pdf` (147 MB) | **NOT opened** — RERA / config / pricing / possession will need to come from here later |
