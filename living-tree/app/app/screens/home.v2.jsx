// LivingTree · Home — The Botanical Album (v2)
// ---------------------------------------------------------------------------
// DIRECTION: Option A — "The Botanical Album". The home is staged as a
// hand-bound botanical specimen page: parchment ground, gilt hairline border,
// eleven pressed-leaf cards arranged as an asymmetric organic spread (NOT a
// grid). Each card uses one of the 16 REAL leaf bunches from LEAF_BANK as its
// silhouette via SVG clipPath — every tile reads as a different pressed leaf.
//
// ASSUMPTIONS / TRADE-OFFS:
//  · Layout is hand-tuned by index — not auto-packed — so the composition is
//    deliberately editorial. Overview is the hero leaf (largest, anchor-left),
//    Gallery sits beside it, the six chapter leaves cluster around the brand
//    plate centre, and the three utility tools form a quiet bottom row.
//  · Idle "breathing": sin wobble (±2°, ±3px), staggered phase per tile.
//  · Hover: lift, gold halo bloom, rotation eases toward upright, gradient
//    brightens. Tap: leaf "presses back" (0.94) then zooms toward viewer
//    (scale → 6, fade) — falling-leaf-toward-camera feel — then navigate.
//  · Gold hairline "petioles" arc between Overview ↔ Masterplan ↔ Inventory
//    so the page hints at arborescence without being literal.
//  · NO purple gradients, NO emoji, NO rounded-card-with-left-border-accent.

const HOME_KEYS_ID = 'lt-home-album-keys';
function ensureAlbumKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(HOME_KEYS_ID)) return;
  const s = document.createElement('style');
  s.id = HOME_KEYS_ID;
  s.textContent = `
    @keyframes ltAlbumIn {
      0%   { opacity: 0; transform: translateY(18px) scale(0.92) rotate(var(--leaf-rot, 0deg)); filter: blur(8px); }
      100% { opacity: 1; transform: translateY(0)    scale(1)    rotate(var(--leaf-rot, 0deg)); filter: blur(0); }
    }
    @keyframes ltLeafPress {
      0%   { transform: scale(1)    rotate(0deg); filter: drop-shadow(0 14px 28px rgba(15,30,12,0.32)); opacity: 1; }
      18%  { transform: scale(0.94) rotate(-3deg); filter: drop-shadow(0 6px 14px rgba(15,30,12,0.42)); opacity: 1; }
      48%  { transform: scale(1.35) rotate(4deg);  filter: drop-shadow(0 28px 60px rgba(15,30,12,0.55)) drop-shadow(0 0 30px rgba(232,216,168,0.7)); opacity: 1; }
      100% { transform: scale(6.0)  rotate(14deg); filter: drop-shadow(0 0 60px rgba(232,216,168,0.95)); opacity: 0; }
    }
    @keyframes ltPetiole {
      0%   { stroke-dashoffset: var(--pet-len, 600); opacity: 0; }
      30%  { opacity: 1; }
      100% { stroke-dashoffset: 0; opacity: 0.55; }
    }
    @keyframes ltChromeIn {
      0%   { opacity: 0; transform: translateY(-10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(s);
}

// ============================================================================
// LAYOUT — hand-tuned positions for 11 leaves on a 2560×1600 canvas.
// Coordinates are leaf-centre. Sizes (w/h) tuned per tile for visual hierarchy.
// rotation is the *base* rotation; idle wobble adds ±2°.
// leafIdx picks one of 16 LEAF_BANK silhouettes (cycled to ensure each tile is
// unique). orient flips the leaf horizontally/vertically for further variety.
// ============================================================================
const TILES = [
  // ---- HERO — Project Overview (top-left anchor, largest leaf) ----
  { id:'overview',  route:'story',      label:'The Story',           sub:'In one screen.',
    cx: 560,  cy: 540,  w: 520, h: 600, rot: -14, leafIdx: 0,  orient: 0,
    tier:'hero', icon:'story' },

  // ---- FEATURE — Gallery (upper-mid, large) ----
  { id:'gallery',   route:'gallery',    label:'Gallery',             sub:'Renders · photography · walkthroughs',
    cx: 1180, cy: 430,  w: 400, h: 460, rot:  9,  leafIdx: 1,  orient: 1,
    tier:'feature', icon:'gallery' },

  // ---- CHAPTER LEAVES — six modules around the centre ----
  { id:'masterplan',route:'masterplan', label:'Masterplan',          sub:'Site plan · ten tree-named towers',
    cx: 1700, cy: 360,  w: 320, h: 380, rot: -6,  leafIdx: 2,  orient: 0,
    tier:'chapter', icon:'masterplan' },

  { id:'inventory', route:'towers',     label:'Inventory',           sub:'Available units, live.',
    cx: 2150, cy: 510,  w: 320, h: 380, rot:  12, leafIdx: 3,  orient: 1,
    tier:'chapter', icon:'towers', live:true },

  { id:'floorplan', route:'residences', label:'Floor Plan',          sub:'1 · 2 · 2.5 · 3 BHK',
    cx: 1180, cy: 850,  w: 320, h: 380, rot:  16, leafIdx: 4,  orient: 0,
    tier:'chapter', icon:'residences' },

  { id:'amenities', route:'amenities',  label:'Amenities',           sub:'65 across two clubhouses',
    cx: 1600, cy: 880,  w: 320, h: 380, rot: -10, leafIdx: 5,  orient: 1,
    tier:'chapter', icon:'amenities' },

  { id:'location',  route:'location',   label:'Location Advantage', sub:'KIADB · 15 min to KIA',
    cx: 2010, cy: 910,  w: 320, h: 380, rot:  4,  leafIdx: 6,  orient: 0,
    tier:'chapter', icon:'location' },

  { id:'booking',   route:'booking',    label:'Booking',             sub:'Reserve a residence',
    cx: 2310, cy: 1140, w: 280, h: 340, rot: -18, leafIdx: 7,  orient: 1,
    tier:'chapter', icon:'booking' },

  // ---- UTILITY LEAVES — three sales tools, bottom row, slightly smaller, paler ----
  { id:'email',     route:'saver',      label:'Email Sender',        sub:'Brochure · quote · e-receipt',
    cx: 380,  cy: 1190, w: 260, h: 300, rot:  14, leafIdx: 8,  orient: 0,
    tier:'utility', icon:'tools' },

  { id:'gre',       route:'gre',        label:'GRE',                 sub:'Guest Relations workspace',
    cx: 760,  cy: 1240, w: 260, h: 300, rot: -8,  leafIdx: 9,  orient: 1,
    tier:'utility', icon:'pair' },

  { id:'dashboard', route:'dashboard',  label:'Mini Dashboard',      sub:'Live numbers',
    cx: 1140, cy: 1240, w: 260, h: 300, rot: 11,  leafIdx: 10, orient: 0,
    tier:'utility', icon:'specs' },
];

// Petiole connections — Overview ↔ Masterplan ↔ Inventory
const PETIOLES = [
  { from: 'overview',  to: 'masterplan' },
  { from: 'masterplan',to: 'inventory'  },
];

// ============================================================================
// LeafShape — render one of the 16 real leaves from LEAF_BANK as a clipPath,
// then fill with a forest-or-pale gradient depending on tier.
// LEAF_BANK source viewBox is 504×288.
// ============================================================================
function LeafShape({ idx, orient, w, h, tier, active, jumping, t, phase, children }) {
  const leaf = (window.LEAF_BANK || [])[idx % (window.LEAF_BANK || [{}]).length];
  if (!leaf) return null;
  const [bx, by, bw, bh] = leaf.bbox;

  // Map the leaf's bbox into our tile viewBox. We expand 8% of bbox as bleed so
  // the silhouette doesn't kiss the edge.
  const pad = 0.08;
  const vbx = bx - bw * pad;
  const vby = by - bh * pad;
  const vbw = bw * (1 + pad * 2);
  const vbh = bh * (1 + pad * 2);

  // Orientation flips
  const sx = (orient & 1) ? -1 : 1;
  const sy = (orient & 2) ? -1 : 1;

  // Wobble — slow sin oscillation
  const wob = Math.sin(t * 0.7 + phase) * 0.6; // ±0.6°
  const wobY = Math.sin(t * 0.55 + phase * 1.3) * 2; // ±2px
  // Gradient palette by tier
  const palettes = {
    hero:    { top:'#3a5536', mid:'#2a4329', deep:'#1c321e' }, // deep forest
    feature: { top:'#456446', mid:'#2e4a2c', deep:'#1f3522' },
    chapter: { top:'#587350', mid:'#3a5536', deep:'#243a23' },
    utility: { top:'#e8d8a8', mid:'#c9a865', deep:'#8d6f33' }, // gold-pale for tools
  };
  const pal = palettes[tier] || palettes.chapter;
  const isPaleTier = tier === 'utility';

  const uid = `lf-${idx}-${tier}-${Math.round(w)}`;

  return (
    <div style={{
      position:'relative', width: w, height: h,
      transform: `translateY(${wobY}px) rotate(${wob}deg)`,
      transition: 'transform 280ms cubic-bezier(.2,.7,.2,1)',
    }}>
      <svg viewBox={`${vbx} ${vby} ${vbw} ${vbh}`}
        width={w} height={h}
        preserveAspectRatio="xMidYMid meet"
        style={{
          position:'absolute', inset:0,
          overflow:'visible',
          filter: active
            ? `drop-shadow(0 24px 44px rgba(15,30,12,0.5)) drop-shadow(0 0 36px ${isPaleTier ? 'rgba(232,216,168,0.85)' : 'rgba(232,216,168,0.7)'})`
            : `drop-shadow(0 14px 28px rgba(15,30,12,${isPaleTier ? 0.18 : 0.32}))`,
          transition:'filter 320ms ease',
        }}>
        <defs>
          {/* Body gradient — green/forest by tier; gold for utility */}
          <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%"  stopColor={pal.top}  stopOpacity={active ? 1 : 0.95}/>
            <stop offset="55%" stopColor={pal.mid}  stopOpacity="1"/>
            <stop offset="100%" stopColor={pal.deep} stopOpacity="1"/>
          </linearGradient>
          {/* Specular gold band across the top half */}
          <linearGradient id={`rim-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor="#e8d8a8" stopOpacity="0.95"/>
            <stop offset="50%" stopColor="#c9a865" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="#8d6f33" stopOpacity="0.85"/>
          </linearGradient>
          {/* The leaf silhouette itself — used both as fill mask and stroke set */}
          <g id={`leaf-${uid}`} transform={`translate(${bx + bw/2} ${by + bh/2}) scale(${sx} ${sy}) translate(${-(bx + bw/2)} ${-(by + bh/2)})`}>
            {leaf.parts.map((d, k) => <path key={k} d={d}/>)}
          </g>
          {/* mask: white = visible. Fill every part with white so the union of
              all leaf-bunch sub-paths becomes the visible leaf body. */}
          <mask id={`mask-${uid}`} maskUnits="userSpaceOnUse" x={vbx} y={vby} width={vbw} height={vbh}>
            <rect x={vbx} y={vby} width={vbw} height={vbh} fill="black"/>
            <g transform={`translate(${bx + bw/2} ${by + bh/2}) scale(${sx} ${sy}) translate(${-(bx + bw/2)} ${-(by + bh/2)})`}>
              {leaf.parts.map((d, k) => (
                <path key={k} d={d} fill="white" stroke="white" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
              ))}
            </g>
          </mask>
        </defs>

        {/* Body fill — masked by leaf silhouette so the rect bleeds only where the leaf is */}
        <rect x={vbx} y={vby} width={vbw} height={vbh} fill={`url(#grad-${uid})`} mask={`url(#mask-${uid})`}/>

        {/* Specular gold highlight band across upper portion of the leaf */}
        <rect x={vbx} y={vby} width={vbw} height={vbh*0.55}
          fill={`url(#rim-${uid})`}
          opacity={active ? 0.34 : 0.18}
          mask={`url(#mask-${uid})`}
          style={{transition:'opacity 320ms ease'}}/>

        {/* Vein / contour detail — each leaf-bunch path drawn as gold filigree on top */}
        <g transform={`translate(${bx + bw/2} ${by + bh/2}) scale(${sx} ${sy}) translate(${-(bx + bw/2)} ${-(by + bh/2)})`}
          mask={`url(#mask-${uid})`}>
          {leaf.parts.map((d, k) => (
            <path key={k} d={d} fill={isPaleTier ? "rgba(141,111,51,0.34)" : "rgba(232,216,168,0.32)"} fillOpacity={active ? 1 : 0.8}
              stroke="none"/>
          ))}
        </g>

        {/* Crisp gold rim outline */}
        <g transform={`translate(${bx + bw/2} ${by + bh/2}) scale(${sx} ${sy}) translate(${-(bx + bw/2)} ${-(by + bh/2)})`}>
          {leaf.parts.map((d, k) => (
            <path key={k} d={d} fill="none"
              stroke={active ? "#e8d8a8" : "#c9a865"}
              strokeOpacity={active ? 0.95 : 0.6}
              strokeWidth={active ? 1.6 : 1.0}
              strokeLinejoin="round" strokeLinecap="round"
              style={{transition:'stroke 320ms, stroke-opacity 320ms, stroke-width 320ms'}}/>
          ))}
        </g>
      </svg>

      {/* Tile content sits OVER the leaf, vertically centred in the bbox */}
      <div style={{
        position:'absolute', inset:0,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        pointerEvents:'none',
        padding: '18% 14%',
        textAlign:'center',
      }}>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Petiole — gold hairline curve between two leaf centres.
// ============================================================================
function Petiole({ from, to, tilesById, mounted, delayMs }) {
  const a = tilesById[from], b = tilesById[to];
  if (!a || !b) return null;
  // Sag the curve downward for an organic stem feel
  const mx = (a.cx + b.cx) / 2;
  const my = Math.min(a.cy, b.cy) + Math.abs(a.cy - b.cy) * 0.5 + 60;
  const d = `M ${a.cx} ${a.cy} Q ${mx} ${my} ${b.cx} ${b.cy}`;
  const len = Math.hypot(b.cx - a.cx, b.cy - a.cy) * 1.25;
  return (
    <path d={d}
      stroke="var(--gold-deep)"
      strokeWidth="0.9"
      fill="none"
      strokeLinecap="round"
      strokeDasharray={len}
      strokeDashoffset={len}
      style={{
        '--pet-len': len + 'px',
        animation: mounted ? `ltPetiole 1600ms ${delayMs}ms cubic-bezier(.25,1,.4,1) forwards` : 'none',
        filter:'drop-shadow(0 0 5px rgba(232,216,168,0.45))',
      }}/>
  );
}

// ============================================================================
// Home — the page
// ============================================================================
function Home() {
  ensureAlbumKeys();
  const t = useLoop();
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const [hovered, setHovered] = React.useState(null);
  const [jumping, setJumping] = React.useState(null);
  const [exiting, setExiting] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const tilesById = React.useMemo(() => Object.fromEntries(TILES.map(x => [x.id, x])), []);

  const handleTap = (m) => {
    if (jumping) return;
    setJumping(m.id);
    setTimeout(() => setExiting(true), 380);
    setTimeout(() => navigate(m.route), 560);
  };

  const hhmm = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  const dateStr = now.toLocaleDateString('en-GB', { weekday:'short', day:'2-digit', month:'short', year:'numeric' }).toUpperCase();

  return (
    <div style={{
      position:'absolute', inset:0,
      background:'var(--parchment)',
      color:'var(--ink)',
      overflow:'hidden',
      opacity: exiting ? 0 : 1,
      transform: exiting ? 'scale(0.985)' : 'scale(1)',
      transition: 'opacity 320ms ease, transform 320ms ease',
    }}>

      {/* === AMBIENT — pressed-album texture (parchment + faint aurora) === */}
      <div style={{position:'absolute', inset:0, opacity:0.32, pointerEvents:'none', zIndex:0}}>
        <ForestAurora intensity={0.4}/>
      </div>
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:1,
        background:`
          radial-gradient(ellipse 70% 60% at 50% 45%, rgba(232,216,168,0.18) 0%, transparent 70%),
          radial-gradient(ellipse 90% 70% at 50% 50%, transparent 60%, rgba(60,45,20,0.10) 100%)
        `,
      }}/>
      <div style={{position:'absolute', inset:0, opacity:0.28, pointerEvents:'none', zIndex:1}}>
        <LeafField count={22} opacity={0.5} color="rgba(60,90,55," goldRatio={0.22}/>
      </div>

      {/* === DECKLED-EDGE FRAME — hairline gilt border with corner accents === */}
      <div style={{
        position:'absolute', left:48, top:48, right:48, bottom:48,
        pointerEvents:'none', zIndex:2,
        border:'1px solid rgba(176,142,69,0.35)',
        boxShadow:'inset 0 0 0 1px rgba(176,142,69,0.10), inset 0 0 80px rgba(232,216,168,0.10)',
        opacity: mounted ? 1 : 0,
        transition:'opacity 800ms ease 200ms',
      }}>
        {[[0,0],[1,0],[0,1],[1,1]].map(([rx, ry], i) => (
          <svg key={i} width="44" height="44" viewBox="0 0 44 44"
            style={{
              position:'absolute',
              left: rx ? 'auto' : -1, right: rx ? -1 : 'auto',
              top:  ry ? 'auto' : -1, bottom: ry ? -1 : 'auto',
              transform: `scale(${rx?-1:1},${ry?-1:1})`,
            }}>
            <path d="M 0 22 Q 0 0 22 0" stroke="var(--gold-deep)" strokeWidth="1.2" fill="none"/>
            <circle cx="2" cy="2" r="2" fill="var(--gold-deep)" opacity="0.85"/>
          </svg>
        ))}
      </div>

      {/* === TOP CHROME — brand mark + project locator + clock === */}
      <div style={{
        position:'absolute', left:120, right:120, top: 90,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        opacity: mounted ? 1 : 0,
        transform:`translateY(${mounted ? 0 : -10}px)`,
        transition: 'opacity 520ms ease, transform 520ms ease',
        zIndex: 10,
      }}>
        {/* Brand block: crisp PNG mark + locator */}
        <div style={{display:'flex', alignItems:'center', gap: 28}}>
          <img src="assets/brand/livingtree-mark-2x.png" alt="LivingTree"
            style={{width: 240, height: 'auto', display:'block', filter:'drop-shadow(0 4px 14px rgba(46,74,44,0.18))'}}/>
          <div style={{height: 64, width: 1, background:'var(--line)'}}/>
          <div style={{display:'flex', flexDirection:'column', gap: 6}}>
            <div className="eyebrow forest" style={{fontSize:12, letterSpacing:'0.36em', color:'var(--gold-deep)'}}>
              SALES STUDIO · TABLET 01
            </div>
            <div className="serif" style={{fontSize: 30, lineHeight: 1, color:'var(--graphite)', fontStyle:'italic'}}>
              A botanical album of the project
            </div>
          </div>
        </div>

        {/* Right: clock + date + Kalyani credit */}
        <div style={{display:'flex', alignItems:'center', gap: 28}}>
          <div style={{textAlign:'right', display:'flex', flexDirection:'column', gap: 4}}>
            <div className="mono" style={{fontSize: 30, color:'var(--graphite)', letterSpacing:'0.04em', lineHeight: 1}}>{hhmm}</div>
            <div className="mono" style={{fontSize: 11, color:'var(--slate)', letterSpacing:'0.30em'}}>{dateStr}</div>
          </div>
          <div style={{height: 64, width: 1, background:'var(--line)'}}/>
          <div style={{display:'flex', alignItems:'center', gap: 14}}>
            <div style={{textAlign:'right', display:'flex', flexDirection:'column', gap: 4}}>
              <div className="mono" style={{fontSize: 11, letterSpacing:'0.32em', color:'var(--slate)'}}>A KALYANI</div>
              <div className="mono" style={{fontSize: 11, letterSpacing:'0.32em', color:'var(--slate)'}}>DEVELOPERS PROJECT</div>
            </div>
            <div style={{
              background:'var(--ivory)', padding: 6, borderRadius: 4,
              boxShadow:'0 4px 14px rgba(0,0,0,0.08), 0 0 0 1px var(--line)',
            }}>
              <KalyaniTriangle size={48}/>
            </div>
          </div>
        </div>
      </div>

      {/* === Gilt hairline below top chrome === */}
      <div style={{
        position:'absolute', left:120, right:120, top: 200, height:1,
        background:'linear-gradient(90deg, transparent, rgba(176,142,69,0.55) 12%, rgba(176,142,69,0.55) 88%, transparent)',
        opacity: mounted ? 1 : 0,
        transition:'opacity 600ms ease 280ms',
        zIndex: 3,
      }}/>

      {/* === PETIOLE CURVES — gold hairlines between Overview ↔ Masterplan ↔ Inventory === */}
      <svg viewBox="0 0 2560 1600" preserveAspectRatio="none"
        style={{position:'absolute', inset:0, width:'100%', height:'100%', zIndex: 4, pointerEvents:'none'}}>
        {PETIOLES.map((p, i) => (
          <Petiole key={i} from={p.from} to={p.to} tilesById={tilesById}
            mounted={mounted} delayMs={1200 + i * 220}/>
        ))}
      </svg>

      {/* === SPECIMEN PLATE — small "title plate" placed off-centre, like a museum label === */}
      <div style={{
        position:'absolute',
        left: 1500, top: 620,
        opacity: mounted ? 1 : 0,
        transform: `translateY(${mounted ? 0 : 12}px)`,
        transition: 'opacity 800ms ease 600ms, transform 800ms ease 600ms',
        zIndex: 5,
        pointerEvents:'none',
      }}>
        <div style={{
          padding: '18px 24px',
          background:'rgba(251,246,234,0.78)',
          border:'1px solid rgba(176,142,69,0.30)',
          boxShadow:'0 8px 28px rgba(46,40,15,0.10)',
          display:'inline-flex', flexDirection:'column', gap: 6,
          backdropFilter:'blur(2px)',
          transform:'rotate(-2.5deg)',
        }}>
          <div className="mono" style={{fontSize: 10, letterSpacing:'0.42em', color:'var(--gold-deep)'}}>
            PLATE XI · LIVINGTREE
          </div>
          <div className="serif" style={{fontSize: 22, fontStyle:'italic', color:'var(--graphite)', lineHeight: 1}}>
            Designed for <span style={{color:'var(--gold-deep)'}}>Four Generations.</span>
          </div>
          <div className="mono" style={{fontSize: 9, letterSpacing:'0.30em', color:'var(--slate)'}}>
            25 ACRES · 10 TOWERS · 65 AMENITIES · NORTH BENGALURU
          </div>
        </div>
      </div>

      {/* === LEAF TILES — 11 pressed specimens === */}
      {TILES.map((m, i) => {
        const isHov   = hovered === m.id;
        const isJump  = jumping === m.id;
        const isOther = jumping && !isJump;
        const Glyph   = (window.Icons || {})[m.icon] || window.Icons.story;

        const isUtility = m.tier === 'utility';
        const labelColor = isUtility ? '#2c3527' : 'var(--on-tile)';
        const subColor   = isUtility ? 'rgba(44,53,39,0.62)' : 'rgba(232,216,168,0.78)';
        const iconColor  = isUtility ? 'var(--forest-deep)' : 'var(--gold-soft)';

        const labelSize  = m.tier === 'hero'    ? 56
                         : m.tier === 'feature' ? 40
                         : m.tier === 'chapter' ? 30
                         : 24;
        const iconSize   = m.tier === 'hero'    ? 84
                         : m.tier === 'feature' ? 64
                         : m.tier === 'chapter' ? 52
                         : 44;

        const baseRot = m.rot;
        const hoverRot = isHov && !jumping ? baseRot * 0.35 : baseRot; // ease toward upright on hover
        const lift     = isHov && !jumping ? -10 : 0;
        const phase    = i * 0.7;

        return (
          <div key={m.id}
            onPointerEnter={() => setHovered(m.id)}
            onPointerLeave={() => setHovered(null)}
            onClick={() => handleTap(m)}
            style={{
              position:'absolute',
              left: m.cx - m.w/2,
              top:  m.cy - m.h/2,
              width: m.w, height: m.h,
              cursor: 'pointer',
              zIndex: isJump ? 25 : (isHov ? 15 : 6 + (m.tier === 'hero' ? 2 : 0)),
              opacity: jumping ? (isJump ? 1 : 0.18) : (mounted ? 1 : 0),
              transform: `translateY(${lift}px) rotate(${hoverRot}deg)`,
              transformOrigin: 'center center',
              transition: jumping ? 'opacity 280ms ease' : 'transform 380ms cubic-bezier(.22,1,.36,1), opacity 480ms ease',
              animation: mounted && !jumping
                ? `ltAlbumIn 700ms ${120 + i * 70}ms cubic-bezier(.22,1,.36,1) both`
                : 'none',
              '--leaf-rot': `${hoverRot}deg`,
              filter: isOther ? 'blur(3px) saturate(0.7)' : 'none',
              willChange: 'transform, opacity',
            }}>
            {/* The pressed leaf itself (clipPath of real LEAF_BANK silhouette) */}
            <div style={{
              position:'absolute', inset:0,
              animation: isJump ? 'ltLeafPress 540ms cubic-bezier(.34,1.18,.4,1) forwards' : 'none',
              transformOrigin:'center center',
            }}>
              <LeafShape idx={m.leafIdx} orient={m.orient} w={m.w} h={m.h}
                tier={m.tier} active={isHov || isJump} jumping={isJump} t={t} phase={phase}>
                {/* Content: icon, label, subtitle */}
                <div style={{
                  display:'flex', flexDirection:'column', alignItems:'center', gap: m.tier === 'hero' ? 18 : 12,
                  pointerEvents:'none', textAlign:'center',
                  maxWidth:'92%',
                }}>
                  {/* Eyebrow numeral / live tag */}
                  <div style={{display:'flex', alignItems:'center', gap: 10}}>
                    <div className="mono" style={{
                      fontSize: m.tier === 'hero' ? 12 : 10,
                      letterSpacing:'0.40em',
                      color: isUtility ? 'rgba(44,53,39,0.55)' : 'rgba(232,216,168,0.65)',
                    }}>
                      {String(i + 1).padStart(2, '0')} · {m.tier === 'utility' ? 'TOOL' : (m.tier === 'hero' ? 'HERO' : 'CHAPTER')}
                    </div>
                    {m.live && (
                      <span style={{
                        display:'inline-flex', alignItems:'center', gap:6,
                        padding:'2px 8px',
                        background:'rgba(74,139,82,0.20)',
                        border:'1px solid rgba(74,139,82,0.45)',
                      }}>
                        <span style={{
                          width:6, height:6, borderRadius:'50%',
                          background:'#a8e0a0',
                          boxShadow:`0 0 ${4 + Math.sin(t*3.5)*4}px #a8e0a0`,
                        }}/>
                        <span className="mono" style={{fontSize:9, letterSpacing:'0.28em', color:'#cfeacf'}}>LIVE</span>
                      </span>
                    )}
                  </div>

                  {/* Icon (gold, small) */}
                  <div style={{
                    color: iconColor,
                    transform: (isHov || isJump) ? 'scale(1.06)' : 'scale(1)',
                    transition: 'transform 320ms cubic-bezier(.2,.7,.2,1)',
                    filter: (isHov || isJump) ? `drop-shadow(0 0 ${m.tier==='hero'?22:14}px rgba(232,216,168,0.85))` : 'none',
                  }}>
                    <Glyph width={iconSize} height={iconSize}/>
                  </div>

                  {/* Label (serif) */}
                  <div className="serif" style={{
                    fontSize: labelSize,
                    lineHeight: 1.0,
                    fontWeight: 500,
                    color: labelColor,
                    letterSpacing:'-0.01em',
                    fontStyle: m.tier === 'hero' ? 'italic' : 'normal',
                    textShadow: (isHov || isJump) ? `0 0 14px ${isUtility ? 'rgba(176,142,69,0.45)' : 'rgba(232,216,168,0.55)'}` : 'none',
                  }}>
                    {m.label}
                  </div>

                  {/* Subtitle (mono, uppercase) */}
                  <div className="mono" style={{
                    fontSize: m.tier === 'hero' ? 12 : 10,
                    letterSpacing:'0.24em',
                    color: subColor,
                    textTransform:'uppercase',
                    maxWidth: 280,
                    lineHeight: 1.45,
                  }}>
                    {m.sub}
                  </div>
                </div>
              </LeafShape>
            </div>
          </div>
        );
      })}

      {/* === BOTTOM CHROME === */}
      <div style={{
        position:'absolute', left:120, right:120, bottom: 90,
        display:'flex', alignItems:'flex-end', justifyContent:'space-between',
        opacity: mounted ? 1 : 0,
        transform:`translateY(${mounted ? 0 : 14}px)`,
        transition: 'opacity 600ms ease 480ms, transform 600ms ease 480ms',
        zIndex: 10,
      }}>
        <div style={{display:'flex', flexDirection:'column', gap: 6}}>
          <div className="mono" style={{fontSize: 11, letterSpacing:'0.36em', color:'var(--gold-deep)'}}>
            TAP A LEAF TO BEGIN
          </div>
          <div className="mono" style={{fontSize: 11, letterSpacing:'0.20em', color:'var(--slate)'}}>
            RERA · {PROJECT.rera}
          </div>
        </div>

        <div className="serif" style={{
          fontSize: 22, fontStyle:'italic',
          color:'var(--slate)', letterSpacing:'0.01em',
        }}>
          {PROJECT.tagline2}
        </div>

        <div style={{display:'flex', flexDirection:'column', gap: 6, alignItems:'flex-end'}}>
          <div className="mono" style={{fontSize: 11, letterSpacing:'0.32em', color:'var(--slate)'}}>STUDIO BUILD</div>
          <div className="mono" style={{fontSize: 11, letterSpacing:'0.18em', color:'var(--graphite)'}}>v0.3 · BANGALORE · BOTANICAL ALBUM</div>
        </div>
      </div>

      {/* Bottom hairline */}
      <div style={{
        position:'absolute', left:120, right:120, bottom: 150, height:1,
        background:'linear-gradient(90deg, transparent, rgba(176,142,69,0.45) 14%, rgba(176,142,69,0.45) 86%, transparent)',
        opacity: mounted ? 1 : 0,
        transition:'opacity 600ms ease 540ms',
        zIndex: 3,
      }}/>
    </div>
  );
}

window.Home = Home;
