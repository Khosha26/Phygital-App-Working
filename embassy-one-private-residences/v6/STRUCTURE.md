# The Residences at Embassy ONE — Sales Suite

**Internal experience codename: AETHER**
*Mekri Circle, North Bangalore · within Embassy ONE (Four Seasons)*

Planning + content + screen architecture. Pass 1 — assumptions labeled, decisions
open. Nothing built yet.

---

## 0. Resolved decisions (intake answered 2026-06-12)
- **Audience: the customer**, not the RM. A self-driven, immersive experience a UHNI
  buyer uses (in the gallery or remotely) to *understand and feel the project before
  buying*. RM may stand beside it, but the buyer drives.
- **Navigation: FREE SPATIAL EXPLORE.** The *place* is the home. No forced linear deck —
  the buyer roams. Narrative whispers are ambient/discoverable, never gated.
- **Devices: responsive, multi-aspect** — Tab S7 (16:10) · 65" kiosk (16:9) · iPad (4:3).
  One build, aspect-aware layout + letterboxing. Touch-first, ≥44px targets, no hover-deps.
- **Brand pack: new `embassy-one`**, informed by their own style files (below).
- **Invitation:** deferred — keep it as a quiet contact/close for now; the priority is
  the interactive exploration, not lead capture.

## 1. What this is

A **customer-facing, immersive, freely-explorable experience of the project** — a quiet
spatial world the buyer roams to understand the address, the grounds, the tower and the
residences before they buy. Runs as an app across tablet / kiosk / iPad.
Not a website, not a brochure-as-PDF, not an RM slide-deck. A curated world you walk.

The brand is **relationship-first, not digital-first**. So the suite must feel like a
*rare object* — turning pages of light — never a property app. Every interaction is
slow, sensory, and earned. No urgency, ever.

### Source-of-truth brand reads (from the briefs)
- **Tagline / tone:** *Singular. Elevated. Effortlessly Complete.*
- **Positioning:** "The address is known before it is announced."
- **Voice:** Whispered, not announced. Confident, never boastful. Sensory. Every word
  earns its place. Lead with emotion; let the location speak.
- **The product is not square footage — it is a legacy address.** Buyers compare
  globally (Park Avenue, Mayfair), decide slowly, by referral.

### The six brand pillars (must surface across the suite)
Rarity · Provenance · Living Standard · Scale · Integration · Service

---

## 2. The hard guardrails (these shape the UI, not just the copy)

**NEVER:** price-per-sqft · prices anywhere consumer-facing · "investment/ROI/value/
affordable" · possession dates · urgency ("limited", "book now", countdowns) ·
comparison to other projects · superlative stacking · glitter/chandelier/gilded mass-
luxury codes · feature-listing ("3 kitchens, 4 parks").

**ALWAYS:** lead with emotion · let location speak · trust buyer intelligence (don't
over-explain) · one voice / one visual world everywhere · Four Seasons present but
never over-leveraged (context, not crutch) · white space *is* the luxury cue —
never two dense frames back to back.

> Design consequence: the "call to action" is **an invitation, not a button**. No
> pricing module. No availability/urgency. The inventory explorer shows *configuration
> and place*, never *price or "only N left"*.

---

## 3. The product facts (locked from briefs — verify before printing any figure)

| Fact | Value |
|---|---|
| Tower | 30 floors, "a vertical manor" |
| Exclusivity | 2 residences per floor · **60 homes** (headline) |
| ⚠ reconcile | working schedule = 59 distinct homes + entrance lobby — confirm w/ project team before locking any printed number |
| Unit sizes | 4,500 – 15,000 sq ft |
| Land | 2-acre residence ground within the 8-acre Embassy ONE |
| Ecosystem | Four Seasons Hotel + Four Seasons Private Residences + offices + retail/dining |
| Location | Mekri Circle — confluence of Sadashivanagar · Dollars Colony · Jayanagar |
| Pricing (INTERNAL ONLY — never in UI) | ₹35–40k+/sqft · ₹18 Cr onwards |
| Service | Embassy Group's proprietary hospitality & lifestyle arm |

### Configuration index (Act V — the only place "substance" appears)
| Configuration | Size |
|---|---|
| 2-Bedroom Duplexes | 4,149 sq ft |
| 3-Bedroom Residences | 5,423 sq ft |
| 3-Bedroom + Study / + Study + Media | 5,856 – 7,549 sq ft |
| 4-Bedroom & 4-Bedroom + Study | 6,272 – 7,571 sq ft |
| 4-Bedroom Recessed | 6,280 – 6,335 sq ft |
| 5-Bedroom Penthouse Duplexes | 12,977 – 15,124 sq ft |

### The signature landscape gesture — **Five Lanterns** (the suite's spine metaphor)
Light · guidance · gathering · warmth · storytelling. Each tuned to a season + festival:
| Lantern | Season / Festival | Where | Tree |
|---|---|---|---|
| Winter | Makara Sankranti (Jan) | Main drop-off | Tabebuia rosea (pink blossom) |
| Spring | Ugadi (Mar/Apr) | Miyawaki Forest | Alstonia scholaris |
| Summer | Karka Sankranti (Jul/Aug) | Rain Terrace | Cassia spectabilis (golden) |
| Autumn | Diwali (Oct/Nov) | The Bridge | Erythrina variegata (Indian Coral) |
| **Center** | Brahma · all year | **Infinity pool edge** | Feature tree on axis — floats, reacts to weather |

---

## 4. The visual world (from the renders)

- **Tower exterior:** warm dusk — rose/amber sky, dark glass, Four Seasons beside it,
  warm-lit lobby, red light-trails. Cinematic, calm, twilight.
- **Daytime gardens:** light, airy, botanical — greens, pool water, white frosted-glass
  lantern, soft haze. Serene, not glossy.
- **Dusk lanterns:** deep twilight blue, a single warm glowing lantern / moon. Quiet,
  meditative.

→ The suite lives in **two light states — day (botanical) and dusk (lantern glow)** —
and one of the most-felt interactions is the gentle transition between them.

---

## 5. Proposed brand pack: `embassy-one.css` (NEW — to be created, not Citadel)

| Token | Direction (to confirm in intake) |
|---|---|
| Ground | warm stone / bone off-white (day) ↔ deep twilight ink-blue (dusk) |
| Ink | soft charcoal, never pure black |
| Accent | aged brass / bronze (hairlines + small marks only) |
| Warmth | timber taupe |
| Living accent | garden green — used *sparingly*, as life not decoration |
| Light | frosted-glass white (the lantern) |
| Display type | high-contrast serif, **spaced ALL-CAPS** (brief sets `E M B A S S Y`) — Cormorant / Canela register |
| Body type | quiet humanist grotesque, generous leading |
| Motion | slow expoOut, long courtesy holds, crossfades — nothing springy/playful |

Status will be `inferred` until Nischal confirms; colors derived from renders +
materiality (stone / aged brass / timber). **Logo:** need the official Embassy ONE
Residences wordmark/lockup — flagged as an open asset request (Law 1: never substitute).

---

## 6. SCREEN / FRAME ARCHITECTURE

The brief's 6-act deck flow → an explorable journey of **arrival and ascent**.
A buyer (or RM) moves: *Threshold → The Idea → The Place → The Grounds → The Tower →
The Residences → The Service → The Invitation.* Two of these are live interactive
"rooms"; the rest are image-led narrative frames with deep white space.

### 0 · ATTRACT / IDLE *(kiosk only)*
Slow loop: tower-at-dusk, drifting lantern glow, tagline fade. Wakes on touch.

### 1 · THRESHOLD (Cover)
Full-bleed tower at dusk. Spaced type: `EMBASSY ONE · THE RESIDENCES` / `Bengaluru`.
Whisper fades in: *"An address known before it is announced."* One quiet entry gesture
(hold-to-enter — Embassy house language). No menu yet.

### 2 · THE IDEA  *(Act I — narrative, 3 quiet frames)*
1. Near-twilight spread, one line: *"At the centre of the city, a deep quiet."*
2. *"An address with nothing to prove."* — Embassy ONE three-tower development render.
3. Provenance — Embassy Group + Four Seasons, stated with restraint.

### 3 · THE PLACE  *(Act II — light interaction: the map)*
- **Interactive geography.** One elegant line-drawing locating the site at the
  confluence. Tap anchors (Golf Course · Hebbal Lake · WTC · Four Seasons · the three
  enclaves) → one line of meaning each. *"Gateway to the North."* Never a cluttered
  connectivity chart.
- **The ecosystem:** *"Two acres of calm. Eight acres of life."* — clean 8-acre overview,
  only meaningful anchors labeled.

### 4 · THE GROUNDS  ★ HERO INTERACTIVE  *(Act III — "Landscaping as a living poem")*
The emotional centre. *"A refuge that grows with you."*
- **Interactive masterplan / garden walk** built around the **Five Lanterns**.
- **Day ↔ Dusk toggle** — crossfades the renders (botanical day ↔ glowing lantern
  night). The single most-felt moment; sells "lived, day after day, season after season."
- Tap a lantern → its season, festival, story, tree, render. Color temperature shifts
  per season as you move between them.
- Sub-frames: **Gardens & Sanctuary** (Miyawaki forest, herb garden, pet's park,
  evening garden — lived-in warmth) · **Amenities** (*"Everything within reach. Nothing
  on display."* — pool pavilion, padel, half-court, yoga deck, banquet).
- The full 25-point masterplan legend is *available*, revealed gently — never dumped.

### 5 · THE TOWER  *(Act IV — "A vertical manor")*
Architectural portrait + the **four principles** revealed on a gentle vertical ascent:
Light · Privacy · Materiality · Proportion. Visual gradient from garden-green (lower
floors open into the gardens) up to sky (higher floors hold the city at a distance).

### 6 · THE RESIDENCES  ★ HERO INTERACTIVE  *(Act V — the only "substance")*
*"Generous, never excessive."*
- **Residence explorer.** The configuration index (2BR duplex → 5BR penthouse duplex),
  selectable. Tap → floor plan (from booklet) + interior renders + *"two per floor, no
  two floors identical."*
- **Quiet floor stack** — 60 residences, 2 per floor — explore *by place*, see which
  configuration sits where. **No availability, no prices, no urgency** — this is
  orientation, not a checkout.
- Interiors gallery (ID concept renders).

### 7 · THE SERVICE  *(Act VI)*
*"A home that takes care of itself, so you can live in it."* One understated service
moment. Embassy's service arm — anticipatory, unseen. No staff-in-uniform clichés.

### 8 · THE INVITATION (Close)
*"Arrive."* Return to the dusk tower. *Viewings are private and by appointment.*
Relationship-lead contact line. A quiet **"Request a private viewing"** capture
(serves the EOI commercial metric) — framed as an invitation, never a CTA button.
Optional: generate the curated **leave-behind** (PDF) to send home.

### Persistent / global
- A near-hidden **chapter index** (the journey, in movements) reachable by a quiet
  gesture — present, never intrusive.
- Brand watermark, no chrome clutter, generous letterboxing on fixed-size targets.
- Playback/last-frame position persists (localStorage).

---

## 7. Two formats (the brief asks for both)
- **The suite** — interactive, gallery, this document's focus.
- **The leave-behind** — printed/PDF object incl. floor plans + configuration index;
  heavier register. Delivered via Kd's HTML→PDF export from the same source.

---

## 8. Open decisions (intake)
1. **Device target** — Samsung Tab S7 (RM-led, landscape) / 65" gallery kiosk / both / iPad / desktop?
2. **Navigation spine** — guided "ascent/journey" (recommended) vs quiet chapter-index vs free-explore?
3. **Brand pack** — confirm new `embassy-one` light/airy pack + spaced-serif display direction.
4. **Interactive scope** — confirm the two hero rooms (Lanterns day/night + Residence explorer) as priorities; add 360°/film?
5. **EOI capture** — include "request a private viewing" capture, or contact-only (pure presentation)?
6. **Fidelity / deadline** — clickable Pass-1 prototype first, or push to polished suite?

## 9. Open asset requests
- Official **Embassy ONE Residences logo / wordmark lockup** (Law 1 — won't substitute).
- Floor-plan booklet pages (have PDF — to slice per configuration).
- Interior renders (ID concept WIP exists — confirm latest).
- Confirm 60 vs 59 home count for any printed figure.
