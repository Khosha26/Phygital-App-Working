# Master Build Prompt — Embassy ONE Home Screen ("The Living Threshold")

Paste the block below into Claude (claude.ai / artifacts) to generate a working,
interactive home-screen prototype. Synthesizes the approved direction: immersive living
twilight scene + Five-Lantern frosted-glass nav buttons + day↔dusk toggle, keeping the
client's design touch (bone/sage/brass, spaced serif + script, agave leaf, Four Seasons
restraint, no price/urgency).

Once you approve how it feels, Kd builds the production version (token-driven, real
renders/video, all 18+ inner screens, responsive Tab/kiosk/iPad).

---

```text
ROLE
You are a world-class UI designer-engineer building hi-fi, interactive prototypes. Build a SINGLE self-contained HTML file (inline CSS + JS, only Google Fonts allowed as external) that opens by double-click and runs offline. This is the HOME SCREEN of an ultra-luxury real-estate sales app. Quality bar: Apple keynote meets a Four Seasons monograph. No frameworks needed; vanilla HTML/CSS/JS.

THE PROJECT
"The Residences at Embassy ONE" — 60 ultra-luxury residences, Mekri Circle, Bengaluru, set within Embassy ONE alongside the Four Seasons. Buyers are UHNI families curating a legacy address. Brand voice: whispered, not announced; confident, never boastful; sensory; every word earns its place.

HARD BRAND RULES (do not break)
- NO prices, NO "book now"/urgency, NO superlatives, NO feature lists, NO glitter/gold-excess.
- White space IS the luxury cue. Restraint over decoration. Trust the viewer.
- Anti-slop: no purple gradients, no emoji, no neon, no drop-shadow-heavy cards, no generic SaaS look.

CONCEPT TO BUILD — "THE LIVING THRESHOLD"
A full-bleed, immersive, slowly-living twilight scene of a lush garden with a glowing frosted-glass lantern at a still reflecting pool, a slender glass tower beyond. The scene breathes (very slow ambient drift + the lantern softly pulses). Over it, a minimal interface:
- Centred-high: a widely letter-spaced high-contrast serif wordmark "EMBASSY ONE", a hairline rule, small caps "THE RESIDENCES · BENGALURU", and a script accent line "the residences".
- A whispered italic line lower: "An address known before it is announced."
- NAVIGATION = five frosted-glass "lantern" buttons in an elegant row across the lower third, one per the project's Five Lanterns, labelled: "THE PLACE", "THE GROUNDS", "THE TOWER", "THE RESIDENCES", "THE SERVICE". Each button: translucent frosted glass (backdrop-filter blur), a fine 1px aged-brass edge, a soft warm inner glow, a small letter-spaced serif label.
- A subtle, translucent sage-green agave/aloe-leaf silhouette bleeding from one lower corner (draw as SVG).
- Top-right: a small, elegant DAY <-> DUSK toggle (a thin brass sun/moon control).

DESIGN TOKENS (use exactly)
--bone:#F4EEE2; --bone-deep:#E7DECB; --ink:#2B2A26; --brass:#B08D57; --brass-deep:#8A6E45;
--sage:#9DA585; --twilight:#1C2730; --glass: rgba(244,238,226,.14);
Fonts (Google): display serif "Cormorant Garamond" (600), UI "Jost" (300/400, letter-spacing .18em for caps labels), script accent "Tangerine" (700). Body small caps tracked wide.

MOTION (make it FELT, not decorative — easeOutExpo by default)
- Entrance: scene fades up from black; wordmark letters stagger in; nav buttons rise + fade in sequence with a 60ms stagger.
- Button hover/touch: frosted fill brightens, a diagonal light-sweep sheen passes across the glass, and a brass underline draws in beneath the label; soft scale 1.0->1.03.
- Button active/press: a gentle ripple from the touch point.
- DAY<->DUSK toggle: cross-dissolve the scene's lighting/overlay between warm-day and deep-twilight; the lantern glow intensifies at dusk. ~1.2s.
- The lantern: continuous, very slow breathing glow.
- Respect prefers-reduced-motion (disable ambient + sweeps, keep states).

HERO IMAGE HANDLING (important)
I will swap in a real render. For now, build the scene with a tasteful layered CSS approach: a twilight gradient background (twilight -> bone horizon), soft radial garden haze, and a CSS/SVG frosted-glass lantern that actually glows — so it looks intentional without a photo. Put the hero in a single element with a clearly-commented line: /* SWAP: replace background with real render URL here */. Provide BOTH day and dusk versions of this gradient/overlay so the toggle works with no image.

LAYOUT & DEVICE
- Design at 16:9 but make it responsive and aspect-aware: must look composed at 16:9 (kiosk 3840x2160), 16:10 (tablet 2560x1600), and 4:3 (iPad). Use a centred max-width stage with graceful letterboxing; never let nav buttons crowd. Touch targets >= 44px. No hover-only behaviour — everything works on tap.
- Clicking a nav button should do a quiet "enter" transition (scene dims, button expands/glows) then show a placeholder panel titled with that section name and a "< back" — just to prove the interaction; real screens come later.

DELIVERABLE
One polished, commented .html file. Include a short comment block at top listing the design tokens and where to swap real renders/video. Make it feel expensive, quiet, and alive. Do not add anything that breaks the brand rules above.
```
