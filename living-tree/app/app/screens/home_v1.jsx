// LivingTree · Home VERSION 1 — "THE LIVING TREE" (tree scene + bottom dock)
// Wrapped in an IIFE so its internals never collide with v2 / the switcher.
// ---------------------------------------------------------------------------
(function () {
// CONCEPT: the painted golden-hour tree is the emotional hero — and it is
// ALIVE. Real client leaves (LEAF_BANK SVG shapes) are overlaid along the
// canopy silhouette and WAVE in the wind, so the flat painting breathes.
// Navigation is no longer hung in the tree — the 11 modules sit as a clean,
// evenly-ordered row of buttons in a forest-green DOCK STRIP across the
// bottom. Tree = feeling, strip = function.
//
// THE BREEZE — one shared gust(t) rhythm (3 composed sines, never repeats):
//   1. CANOPY BEND — the tree image leans from its trunk base.
//   2. WAVING LEAVES — ~20 real SVG leaves on the canopy edge pivot at their
//      stems; sway amplitude + a fast flutter both rise with the gust, and
//      every leaf leans toward a shared wind direction during a gust so the
//      motion reads as one coherent breeze.
//   3. Birds drift across the sky; clicking the scene bursts 5 birds.
//
// (v6's hanging lanterns + the stuck flutter/falling-leaf layers were removed
// per client direction — the canopy leaves now carry all the life.)

const HOME_KEYS_ID = 'lt-livingtree-keys';
function ensureTreeKeys() {
  if (typeof document === 'undefined' || document.getElementById(HOME_KEYS_ID)) return;
  const s = document.createElement('style');
  s.id = HOME_KEYS_ID;
  s.textContent = `
    @keyframes ltChromeDrop { 0%{opacity:0;transform:translateY(-12px)} 100%{opacity:1;transform:translateY(0)} }
    @keyframes ltStripRise  { 0%{opacity:0;transform:translateY(60px)}  100%{opacity:1;transform:translateY(0)} }
    @keyframes ltSceneIn    { 0%{opacity:0;transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }
    @keyframes ltBtnIn      { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
    @keyframes ltBirdR { 0%{transform:translate3d(-340px,0,0) scaleX(1)} 100%{transform:translate3d(2960px,0,0) scaleX(1)} }
    @keyframes ltBirdL { 0%{transform:translate3d(2960px,0,0) scaleX(-1)} 100%{transform:translate3d(-340px,0,0) scaleX(-1)} }
    @keyframes ltBirdBob { 0%,100%{transform:translateY(-12px)} 50%{transform:translateY(12px)} }
    @keyframes ltTapBird { 0%{transform:translate(0,0) scale(0.65) scaleX(var(--bsx,1));opacity:0} 14%{opacity:1} 74%{opacity:1} 100%{transform:translate(var(--dx),var(--dy)) scale(1.05) scaleX(var(--bsx,1));opacity:0} }
  `;
  document.head.appendChild(s);
}

// ============================================================================
// THE GUST — one shared wind value the whole scene listens to. Three sines of
// incommensurate periods → a calm baseline that swells into a gust every
// ~11-16s. Returns ~0 (calm) .. ~1 (peak gust).
// ============================================================================
function gust(t) {
  const slow = Math.sin(t * 0.42);
  const mid  = Math.sin(t * 0.74 + 1.3);
  const fast = Math.sin(t * 1.9 + 0.6);
  return 0.5 + 0.34 * slow + 0.20 * mid + 0.08 * fast;
}

// ----------------------------------------------------------------------------
// LeafGlyph — render one real LEAF_BANK leaf at a given size, tinted green.
// ----------------------------------------------------------------------------
function LeafGlyph({ idx, size, gradId, opacity = 1 }) {
  const bank = window.LEAF_BANK || [];
  if (!bank.length) return null;
  const leaf = bank[idx % bank.length];
  if (!leaf) return null;
  const [bx, by, bw, bh] = leaf.bbox;
  const pad = bw * 0.12;
  return (
    <svg width={size} height={size * (bh / bw)}
      viewBox={`${bx - pad} ${by - pad} ${bw + pad * 2} ${bh + pad * 2}`}
      style={{ display:'block', opacity }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#cfe9c4"/>
          <stop offset="0.5" stopColor="#74a07a"/>
          <stop offset="1" stopColor="#2c4733"/>
        </linearGradient>
      </defs>
      {leaf.parts.map((d, i) => (
        <path key={i} d={d} fill={`url(#${gradId})`}
          stroke="rgba(22,42,28,0.28)" strokeWidth="0.32"/>
      ))}
    </svg>
  );
}

// ============================================================================
// WAVING LEAVES — ~20 real client leaves placed along the canopy SILHOUETTE
// (where motion shows against the sky). Each pivots at its stem; its sway
// amplitude + a fast flutter both grow with the gust, and all leaves lean
// toward a shared wind direction during a gust → one coherent breeze.
// Positions are stage coords; they live INSIDE the canopy-bend wrapper so
// they bend with the tree.
// ============================================================================
// placed for the full-bleed tree — along the canopy of the expanded art.
const WAVE_SEEDS = [
  // crown top arc
  { x:820,  y:150, s:64 }, { x:1060, y:95,  s:70 }, { x:1280, y:82,  s:72 },
  { x:1500, y:98,  s:68 }, { x:1740, y:150, s:64 },
  // upper flanks
  { x:560,  y:260, s:58 }, { x:2000, y:270, s:58 },
  // mid flanks
  { x:420,  y:440, s:54 }, { x:500,  y:620, s:48 },
  { x:2140, y:450, s:54 }, { x:2060, y:630, s:48 },
  // mid body
  { x:960,  y:310, s:46 }, { x:1600, y:320, s:46 },
  // lower canopy
  { x:760,  y:560, s:52 }, { x:1120, y:640, s:50 },
  { x:1460, y:650, s:50 }, { x:1820, y:570, s:52 },
];

function WavingLeaf({ seed, idx, t, g }) {
  const bank = window.LEAF_BANK || [];
  const n = bank.length || 1;
  const leafIdx = (idx * 7 + 3) % n;
  const phase = (idx * 1.31) % 6.283;
  const dir = idx % 2 ? 1 : -1;
  const baseRot = ((idx * 47) % 60) - 30;                  // varied resting angle
  const speed = 1.0 + (idx % 5) * 0.16;

  // shared wind lean (all leaves bend the same way in a gust) + individual sway
  const windLean = (0.6 + g * 1.8) * 9 * Math.sin(t * 0.5 + 0.4);
  const sway  = Math.sin(t * speed + phase) * (6 + g * 16) * dir;
  const flut  = Math.sin(t * speed * 3.1 + phase) * (2 + g * 5);
  const rot   = baseRot + windLean + sway + flut;
  const sc    = 0.94 + 0.08 * Math.sin(t * speed * 1.4 + phase);

  return (
    <div style={{
      position:'absolute', left: seed.x, top: seed.y,
      transform:`translate(-50%,-90%) rotate(${rot}deg) scale(${sc})`,
      transformOrigin:'50% 90%',
      pointerEvents:'none', willChange:'transform',
    }}>
      <LeafGlyph idx={leafIdx} size={seed.s} gradId={`wv-${idx}`}
        opacity={0.92}/>
    </div>
  );
}

// ============================================================================
// 11 MODULES — in walkthrough order, for the bottom dock strip.
// ============================================================================
const MODULES = [
  { id:'overview', route:'story',      label:'Project Overview', sub:'The story',         icon:'story'      },
  { id:'gallery',  route:'gallery',    label:'Gallery',          sub:'Renders & films',   icon:'gallery'    },
  { id:'master',   route:'masterplan', label:'Masterplan',       sub:'Site & towers',     icon:'masterplan' },
  { id:'location', route:'location',   label:'Location',         sub:'KIADB · airport',   icon:'location'   },
  { id:'amenity',  route:'amenities',  label:'Amenities',        sub:'65 features',       icon:'amenities'  },
  { id:'floor',    route:'residences', label:'Floor Plan',       sub:'1–3 BHK',           icon:'residences' },
  { id:'invent',   route:'towers',     label:'Inventory',        sub:'Units, live',       icon:'towers', live:true },
  { id:'booking',  route:'booking',    label:'Booking',          sub:'Reserve a home',    icon:'booking', gold:true },
  { id:'email',    route:'saver',      label:'Email Sender',     sub:'Brochure · quote',  icon:'tools'      },
  { id:'gre',      route:'gre',        label:'GRE',              sub:'Guest Relations',   icon:'pair'       },
  { id:'dash',     route:'dashboard',  label:'Mini Dashboard',   sub:'Live numbers',      icon:'specs'      },
];

// ----------------------------------------------------------------------------
// DockButton — one module cell in the bottom strip. Even width, icon over a
// serif name over a mono sub-label, all centre-aligned. Hover lifts it and
// lights a gold top-tick; Booking carries a standing gold accent.
// ----------------------------------------------------------------------------
function DockButton({ mod, idx, t, mounted, hovered, onHover, onTap, dimmed }) {
  const isHover = hovered === mod.id;
  const Icon = (window.Icons || {})[mod.icon] || window.Icons.story;
  const gold = mod.gold;
  const glow = 0.6 + 0.4 * Math.sin(t * 2 + idx);

  return (
    <button
      onPointerEnter={() => onHover(mod.id)}
      onPointerLeave={() => onHover(null)}
      onClick={() => onTap(mod)}
      style={{
        position:'relative', flex:'1 1 0', minWidth:0, height:'100%',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        gap:9, padding:'0 6px',
        background: isHover
          ? 'linear-gradient(180deg, rgba(232,216,168,0.16), rgba(232,216,168,0.04))'
          : 'transparent',
        border:'none', cursor:'pointer',
        opacity: dimmed ? 0.3 : 1,
        transform:`translateY(${isHover ? -6 : 0}px)`,
        transition:'background 220ms ease, transform 240ms cubic-bezier(.2,.7,.2,1), opacity 280ms ease',
        animation: mounted ? `ltBtnIn 520ms ${260 + idx*44}ms cubic-bezier(.2,.7,.2,1) both` : 'none',
      }}
    >
      {/* gold top-tick — appears on hover, standing for Booking */}
      <div style={{
        position:'absolute', top:0, left:'18%', right:'18%', height:3, borderRadius:2,
        background: gold ? 'var(--gold)' : 'var(--gold-soft)',
        opacity: isHover ? 1 : (gold ? 0.55 : 0),
        boxShadow: isHover ? '0 0 12px rgba(232,216,168,0.8)' : 'none',
        transition:'opacity 220ms ease',
      }}/>

      {/* icon medallion */}
      <div style={{
        position:'relative', width:62, height:62, borderRadius:'50%',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        background: gold
          ? 'radial-gradient(circle at 38% 32%, #fff3d4, #e7c074 70%, #b98f3f)'
          : (isHover
              ? 'radial-gradient(circle at 38% 32%, #fbf6e6, #d8c48e 72%, #9c8048)'
              : 'rgba(245,239,217,0.10)'),
        border:`1.5px solid ${gold || isHover ? 'rgba(232,216,168,0.9)' : 'rgba(232,216,168,0.34)'}`,
        boxShadow: gold || isHover ? '0 6px 18px rgba(10,18,8,0.5)' : 'none',
        color: gold || isHover ? '#243a23' : 'var(--gold-soft)',
        transition:'background 240ms ease, border-color 240ms ease, color 240ms ease',
      }}>
        <Icon style={{ width:30, height:30 }}/>
        {mod.live && (
          <span style={{
            position:'absolute', top:2, right:2, width:13, height:13, borderRadius:'50%',
            background:'#6fc47a', border:'2px solid #1f3522',
            boxShadow:`0 0 ${5+glow*6}px #6fc47a`,
          }}/>
        )}
      </div>

      {/* label */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
        <div className="serif" style={{
          fontSize:22, lineHeight:1, fontWeight:600, whiteSpace:'nowrap',
          color: isHover ? '#fffaeb' : '#f4ead0',
          letterSpacing:'-0.005em', transition:'color 200ms ease',
        }}>{mod.label}</div>
        <div className="mono" style={{
          fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase',
          color: isHover ? 'rgba(232,216,168,0.95)' : 'rgba(232,216,168,0.6)',
          transition:'color 200ms ease',
        }}>{mod.sub}</div>
      </div>
    </button>
  );
}

// ============================================================================
// Home
// ============================================================================
function Home() {
  ensureTreeKeys();
  const t = useLoop();
  const [now, setNow] = React.useState(() => new Date());
  const [mounted, setMounted] = React.useState(false);
  const [hovered, setHovered] = React.useState(null);
  const [leaving, setLeaving] = React.useState(null);
  const [birds, setBirds] = React.useState([]);
  const stageRef = React.useRef(null);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    const clk = setInterval(() => setNow(new Date()), 30000);
    return () => { cancelAnimationFrame(id); clearInterval(clk); };
  }, []);

  // breeze — one gust value per frame
  const g = clamp(gust(t), 0, 1.2);
  const peak = Math.max(0, (g - 0.72) / 0.28);
  // canopy bend — leans from the trunk base (kept subtle so the full-bleed
  // image never reveals a corner of the stage as it rotates)
  const canopyLean = Math.sin(t * 0.42) * 0.7 + peak * 1.2 * Math.sin(t * 0.74 + 1.3);
  const canopyY    = Math.cos(t * 0.7) * 4 - peak * 5;

  // birds — burst 5 from a click, fanned across the upper hemisphere
  const spawnBirds = (x, y, count = 5) => {
    const flock = [];
    for (let i = 0; i < count; i++) {
      const deg = -180 + (180 * i / (count - 1)) + (Math.random() - 0.5) * 24;
      const a = deg * Math.PI / 180;
      const dist = 720 + Math.random() * 420;
      flock.push({
        key: Date.now() + '-' + i + '-' + Math.random(),
        x, y, dx: Math.cos(a) * dist, dy: Math.sin(a) * dist - 80,
        sx: Math.cos(a) >= 0 ? 1 : -1, delay: i * 55,
      });
    }
    setBirds(b => [...b, ...flock]);
  };
  const handleStageClick = (e) => {
    const el = stageRef.current;
    if (!el || leaving) return;
    const r = el.getBoundingClientRect();
    spawnBirds((e.clientX - r.left) * (2560 / r.width),
               (e.clientY - r.top) * (1600 / r.height), 5);
  };
  const handleTap = (mod) => {
    if (leaving) return;
    setLeaving(mod.id);
    setTimeout(() => navigate(mod.route), 600);
  };

  const hhmm = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  const dateStr = now.toLocaleDateString('en-GB', { weekday:'short', day:'2-digit', month:'short', year:'numeric' }).toUpperCase();

  // tree image geometry — FULL-BLEED: oversized past the stage on left/right/
  // top so no background shows and the gentle bend never reveals an edge.
  const TREE_W = 2760, TREE_H = Math.round(2760 * 1428 / 2560), TREE_TOP = -70;

  return (
    <div ref={stageRef} onClick={handleStageClick} style={{
      position:'absolute', inset:0, overflow:'hidden',
      background:'linear-gradient(180deg, #c3ccaa 0%, #d6d2b2 40%, #e4ddc0 70%, #ece3c6 100%)',
      opacity: leaving ? 0 : 1,
      transition:'opacity 420ms ease',
    }}>

      {/* ====== SCENE: the full-bleed painted tree, bending in the wind, with
                 real SVG leaves waving along its canopy ====== */}
      <div style={{
        position:'absolute', inset:0,
        transform:`translateY(${canopyY}px) rotate(${canopyLean}deg) scale(${leaving?1.06:1})`,
        transformOrigin:'50% 100%',
        transition: leaving ? 'transform 560ms cubic-bezier(.4,0,.2,1)' : 'none',
        animation: mounted ? 'ltSceneIn 1100ms cubic-bezier(.2,.7,.2,1) both' : 'none',
        willChange:'transform',
      }}>
        {/* the painted tree — full-bleed, covers the stage edge to edge */}
        <img src="assets/brand/hometree.png" alt=""
          style={{
            position:'absolute', left:'50%', top:TREE_TOP, marginLeft:-TREE_W/2,
            width:TREE_W, height:TREE_H, display:'block', pointerEvents:'none',
            filter:'saturate(1.06)',
          }}/>
        {/* waving leaves — overlaid on the canopy silhouette */}
        {WAVE_SEEDS.map((seed, i) => (
          <WavingLeaf key={i} seed={seed} idx={i} t={t} g={g}/>
        ))}
      </div>

      {/* ====== THE TOWNSHIP — the real Living Tree development, blended as a
                 contained band at the FOOT of the tree (the tree rises out of
                 the project). Warm-graded to the golden-hour palette and
                 feathered top + sides so it melts into the meadow. ====== */}
      <div style={{
        position:'absolute', left:-80, right:-80, bottom:262, height:418,
        zIndex:7, pointerEvents:'none', overflow:'hidden',
        WebkitMaskImage:'radial-gradient(ellipse 90% 152% at 50% 100%, #000 46%, transparent 90%)',
        maskImage:'radial-gradient(ellipse 90% 152% at 50% 100%, #000 46%, transparent 90%)',
      }}>
        <img src="assets/brand/township.jpg" alt=""
          style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 44%',
            display:'block',
            filter:'saturate(0.82) sepia(0.16) brightness(1.06) contrast(0.93)' }}/>
        {/* warm wash fusing the render into the golden scene */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          background:'linear-gradient(180deg, rgba(236,223,182,0.66) 0%, rgba(232,200,120,0.16) 40%, rgba(34,44,24,0.20) 100%)' }}/>
      </div>
      {/* soft gold horizon thread + project label where township meets the tree */}
      <div style={{ position:'absolute', left:0, right:0, bottom:686, zIndex:8,
        pointerEvents:'none', textAlign:'center' }}>
        <div style={{ height:1, margin:'0 auto 12px', width:'62%',
          background:'linear-gradient(90deg, transparent, rgba(201,168,101,0.6) 30%, rgba(201,168,101,0.6) 70%, transparent)' }}/>
        <div className="mono" style={{ fontSize:11, letterSpacing:'0.44em', textTransform:'uppercase',
          color:'rgba(78,86,50,0.78)' }}>
          The Living Tree Township · 25 Acres · 10 Towers
        </div>
      </div>

      {/* ====== ATMOSPHERE ====== */}
      <div style={{ position:'absolute', left:'50%', top:'28%', width:1400, height:1400,
        marginLeft:-700, marginTop:-700, pointerEvents:'none',
        background:'radial-gradient(circle, rgba(255,238,190,0.42) 0%, rgba(232,200,120,0.13) 34%, transparent 64%)' }}/>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse 78% 60% at 50% 40%, transparent 60%, rgba(36,44,24,0.26) 100%)' }}/>
      <div style={{ position:'absolute', left:0, right:0, top:0, height:200, pointerEvents:'none',
        background:'linear-gradient(180deg, rgba(28,36,22,0.34) 0%, transparent 100%)' }}/>

      {/* ====== AMBIENT BIRDS ====== */}
      <div style={{ position:'absolute', left:0, top:150, pointerEvents:'none', zIndex:8,
        animation:'ltBirdR 30s linear infinite' }}>
        <div style={{ animation:'ltBirdBob 1.1s ease-in-out infinite' }}>
          <img src="assets/brand/bird.gif" alt="" style={{ width:94, height:94*(449/468), opacity:0.9 }}/>
        </div>
      </div>
      <div style={{ position:'absolute', left:0, top:84, pointerEvents:'none', zIndex:8,
        animation:'ltBirdL 44s linear infinite 6s' }}>
        <div style={{ animation:'ltBirdBob 1.35s ease-in-out infinite' }}>
          <img src="assets/brand/bird.gif" alt="" style={{ width:68, height:68*(449/468), opacity:0.78 }}/>
        </div>
      </div>

      {/* ====== TAP-SPAWNED BIRDS ====== */}
      {birds.map(b => (
        <div key={b.key}
          onAnimationEnd={() => setBirds(list => list.filter(x => x.key !== b.key))}
          style={{ position:'absolute', left:b.x-45, top:b.y-45, zIndex:34, pointerEvents:'none',
            '--dx':b.dx+'px', '--dy':b.dy+'px', '--bsx':b.sx,
            animation:`ltTapBird 1350ms ${b.delay||0}ms ease-in forwards` }}>
          <img src="assets/brand/bird.gif" alt="" style={{ width:90, height:90*(449/468) }}/>
        </div>
      ))}

      {/* ====== TOP CHROME ====== */}
      <div style={{ position:'absolute', left:72, top:50, display:'flex', alignItems:'center', gap:24,
        zIndex:40, animation: mounted ? 'ltChromeDrop 600ms 160ms both' : 'none' }}>
        <img src="assets/brand/livingtree-mark-2x.png" alt="LivingTree"
          style={{ width:230, height:'auto', display:'block',
            filter:'drop-shadow(0 3px 14px rgba(20,32,18,0.4))' }}/>
        <div style={{ width:1, height:54, background:'rgba(46,74,44,0.28)' }}/>
        <div className="mono" style={{ fontSize:12, letterSpacing:'0.3em', lineHeight:1.7,
          color:'rgba(46,62,40,0.78)' }}>
          SALES STUDIO<br/>NORTH BENGALURU
        </div>
      </div>

      <div style={{ position:'absolute', right:72, top:50, display:'flex', alignItems:'center', gap:22,
        zIndex:40, animation: mounted ? 'ltChromeDrop 600ms 240ms both' : 'none' }}>
        <div style={{ textAlign:'right' }}>
          <div className="mono" style={{ fontSize:30, lineHeight:1, color:'#2c3a26' }}>{hhmm}</div>
          <div className="mono" style={{ fontSize:11, letterSpacing:'0.26em', marginTop:5,
            color:'rgba(46,62,40,0.62)' }}>{dateStr}</div>
        </div>
        <div style={{ width:1, height:54, background:'rgba(46,74,44,0.28)' }}/>
        <div style={{ background:'var(--ivory)', padding:7, borderRadius:5,
          boxShadow:'0 4px 14px rgba(0,0,0,0.14)' }}>
          <KalyaniTriangle size={46}/>
        </div>
      </div>

      {/* ====== TITLE — sits in the clear sky above the canopy ====== */}
      <div style={{ position:'absolute', left:0, right:0, top:62, textAlign:'center', zIndex:20,
        pointerEvents:'none', animation: mounted ? 'ltChromeDrop 700ms 340ms both' : 'none' }}>
        <div className="serif" style={{ fontSize:34, fontStyle:'italic', color:'#3a4a2c',
          letterSpacing:'0.01em' }}>
          A living home for four generations
        </div>
      </div>

      {/* ====== BOTTOM DOCK STRIP — 11 modules, even ordered row ====== */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:0, height:262, zIndex:38,
        background:'linear-gradient(180deg, #25402a 0%, #1c3322 60%, #162a1b 100%)',
        boxShadow:'0 -18px 50px rgba(20,32,16,0.32)',
        animation: mounted ? 'ltStripRise 720ms 200ms cubic-bezier(.2,.7,.2,1) both' : 'none',
      }}>
        {/* gold hairline cap */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2,
          background:'linear-gradient(90deg, transparent, var(--gold-deep) 12%, var(--gold) 50%, var(--gold-deep) 88%, transparent)',
          boxShadow:'0 0 14px rgba(201,168,101,0.5)' }}/>
        {/* a soft sprig of leaves resting on the strip's top edge, left + right */}
        <div style={{ position:'absolute', top:-26, left:120, opacity:0.9, pointerEvents:'none',
          transform:`rotate(${-18 + Math.sin(t*0.8)*4*(0.5+g)}deg)`, transformOrigin:'50% 100%' }}>
          <LeafGlyph idx={2} size={56} gradId="dock-l"/>
        </div>
        <div style={{ position:'absolute', top:-24, right:124, opacity:0.9, pointerEvents:'none',
          transform:`scaleX(-1) rotate(${-16 + Math.sin(t*0.7+1)*4*(0.5+g)}deg)`, transformOrigin:'50% 100%' }}>
          <LeafGlyph idx={8} size={50} gradId="dock-r"/>
        </div>

        {/* the 11 buttons row */}
        <div style={{ position:'absolute', left:56, right:56, top:14, height:184,
          display:'flex', alignItems:'stretch' }}>
          {MODULES.map((mod, i) => (
            <React.Fragment key={mod.id}>
              {i > 0 && (
                <div style={{ width:1, alignSelf:'center', height:96,
                  background:'linear-gradient(180deg, transparent, rgba(232,216,168,0.22) 30%, rgba(232,216,168,0.22) 70%, transparent)' }}/>
              )}
              <DockButton mod={mod} idx={i} t={t} mounted={mounted}
                hovered={hovered} onHover={setHovered} onTap={handleTap}
                dimmed={leaving && leaving !== mod.id}/>
            </React.Fragment>
          ))}
        </div>

        {/* thin footer line inside the strip */}
        <div style={{ position:'absolute', left:56, right:56, bottom:14,
          display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span className="mono" style={{ fontSize:10, letterSpacing:'0.3em', color:'rgba(232,216,168,0.5)' }}>RERA</span>
            <span className="mono" style={{ fontSize:10, letterSpacing:'0.12em', color:'rgba(232,216,168,0.8)' }}>
              {(window.PROJECT && PROJECT.rera) || 'PRM/KA/RERA/1251/309/PR/260924/007084'}
            </span>
          </div>
          <div className="serif" style={{ fontSize:18, fontStyle:'italic', color:'rgba(232,216,168,0.7)' }}>
            Rooted in Luxury, Branching into the Future
          </div>
          <div className="mono" style={{ fontSize:10, letterSpacing:'0.22em', color:'rgba(232,216,168,0.62)' }}>
            A KALYANI DEVELOPERS PROJECT
          </div>
        </div>
      </div>
    </div>
  );
}

window.HomeV1 = Home;
})();
