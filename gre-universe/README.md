# GRE · the UNIVERSE — Reception Kiosk

Guest Relations Executive (GRE) walk-in onboarding for **the UNIVERSE** by **Venus Group**, Nehru Nagar, Ahmedabad.
A single-file, offline-capable PWA kiosk that captures a walk-in visitor's intent in under a minute, then issues a desk token.

## Run

```
cd GRE
python3 -m http.server 8123
# open http://127.0.0.1:8123/
```

**Fully responsive** — one fluid layout (clamp()-driven type + flex/grid, no fixed canvas) that flows cleanly from a 360px phone through tablets (portrait + landscape) and laptops to the 2560×1600 reception kiosk. Honors safe-area insets, `prefers-reduced-motion`, and `:focus-visible`; touch targets floored at 44px; WCAG-AA gold-on-black contrast.

**Cinematic intro (step 0)** — a volumetric title-sequence landing built to match a reference comp:
- A **light shaft pours down a receding golden corridor** clipped inside the ring — a perspective hall of ribs + compressing steps converging on a soft light source at the crown, with an overhead shaft descending from above the ring. Built procedurally (inline SVG), softened with a warm volumetric haze. The original brand logo (`assets/logo-mark.png`) is the glowing hero.
- **Concentric shimmer rings** — a crisp main ring plus two offset rings (overlapping-orbit look), with a bright glint that slowly travels around the rim.
- **Floating dust motes** rising in the beam, **twinkling 4-point diamond sparkles** placed to echo the comp, and **silk thread filaments** drifting at the sides.
- A refined **outlined gold BEGIN pill** (glass fill, gold hairline border, gold text, drifting inner sheen) over a **warm bloom** at the ring's base.
- Deliberately **de-saturated / refined gold** tint, and motion you actually *feel* (corridor breathing-zoom + ring glint + motes + sparkle twinkle + bloom pulse ≈ 2.5% of the frame in constant subtle motion).
- **Sequenced reveal**: the logo emerges glowing *first* from darkness, *then* eyebrow / headline / divider / subtitle / BEGIN / "Press Enter" rise in, *then* the shaft, corridor, rings, motes and sparkles build in around it.
- **Clean composition**: the kiosk top chrome and top progress bar are hidden on the intro and fade back in on every form step; the whole intro deco fades out off step 0. Earlier edge furniture (timeline, rails, footer, frame) kept in markup but CSS-hidden.
- **Press Enter** (or tap BEGIN) to continue. All motion is GPU-only and fully disabled under `prefers-reduced-motion`.

**Inside screens (steps 1–8)** — every form screen now carries the same luxury language as the intro (a faint **gold ring + lens-flare star**, a soft crown **glow**, a bottom **silk-wave** field and scattered **diamond sparkles** behind the content via `body.show-form`), plus reference-matched chrome: **eyebrow flourishes** (— TEXT —), a **circular EXIT**, glowing **filled-gold CTAs with leading icons** + trailing arrow, and gold-bordered dark **input/keypad/card** components with focus glow. Each screen was refined to the reference comp: phone (flag + chevron, phone-icon input, paper-plane CTA), OTP (gold tiles + tactile keypad + shield), name/email (user/mail icon pills), typology (floor-plan/tower cards), budget (gold instrument slider + ₹ glow), purpose/timeline (icon chips + divider), family (gold counter + must-have chips with icons), and done (glowing check + gold token).

**Throughout** — filmic atmosphere (gradient wash + drifting aura + vignette + grain) and subtle interactivity (selection sheen, OTP fill-pop, budget number reacting to the slider, token "minted" moment). All motion is GPU-only (transform/opacity/filter), 60fps, fully disabled under `prefers-reduced-motion`. No external animation libraries — pure CSS/JS.

**Sizing** — the whole UI is tuned ~30% tighter than the original kiosk-scale (every fluid `clamp()` viewport-coefficient and ceiling scaled to 0.72; phone floors like the 44px tap target preserved).

## The flow (9 steps)

| # | Step | Captures |
|---|------|----------|
| 0 | Welcome | — |
| 1 | Phone | 10-digit mobile (+91) |
| 2 | OTP | 4-digit code (demo accepts any; `1234` shown as hint) |
| 3 | Name & Email | full name + email |
| 4 | Typology | 3 BHK / 4 BHK / 4 BHK Premium |
| 5 | Budget | slider, ₹1.5 Cr – ₹10 Cr |
| 6 | Purpose & Timeline | live-in/investment/both + move-in window |
| 7 | Family & Must-haves | household size + multi-select preferences |
| 8 | Done | issues a token (initial + 2-digit) |

Collected answers live on `window.recState.data` — wire this to your CRM/API at the **Done** step.

## Files

```
index.html       single-file app (markup + CSS + JS)
manifest.json    PWA manifest (fullscreen, portrait)
sw.js            service worker (offline precache)
assets/          logo-mark.png
icons/           PWA + favicon icons
```

## Notes for editing

- All copy, options, budget range, and must-have chips are plain HTML/JS constants near the top of the `<script>` — safe to edit.
- OTP is a demo stub (`onKey` auto-advances on 4 digits). Replace with a real verification call before production.
- A `[data-theme="light"]` palette is included in CSS for an optional light kiosk; set it on `<html>` to enable.

Extracted as a standalone deliverable from `venus-universe-live/Animations Building/_gre`.
