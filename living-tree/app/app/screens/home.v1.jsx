// LivingTree · Home — Tree of Life
// ---------------------------------------------------------------------------
// Adapts the Universe orbital home into a tree-of-life branching pattern.
//
//   LEFT  — editorial title block: eyebrow, giant serif headline
//           ("Designed for Four Generations"), pitch paragraph, then 4 inline
//           KPI tiles with CounterFlip serif numerals.
//   RIGHT — central LivingTreeMonogram (the "trunk"). 10 branches radiate
//           outward in a fan from -110° to +110° (top hemisphere + slightly
//           past horizontal — the tree "reaches"). Each branch is an SVG
//           quadratic curve whose control-point sits between the trunk and
//           leaf, pulled tangentially → the arc has natural sway, not a
//           straight spoke. Branch terminates in a leaf-shaped tile holding
//           the module icon + label.
//
// Tap a leaf → BurstLayer at the tile, leaf grows + rotates + flies along
// its branch into the trunk, trunk pulses gold, navigate(module.id).
//
// Ambient: TreeSketch pencil-drawn tree behind everything at low opacity,
// LeafField drifting on top, parchment ground throughout. Daylight forest.

const HOME_KEYS_ID = 'lt-home-tree-keys';
function ensureHomeKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(HOME_KEYS_ID)) return;
  const s = document.createElement('style');
  s.id = HOME_KEYS_ID;
  s.textContent = `
    /* Leaf flight — anticipation grow → spin → glide to trunk.
       --dx/--dy set per-instance on tap (vector from leaf to trunk).
       Ends at scale 0.25 + full opacity drop so the trunk's flash reads
       as the new focal point of the screen. */
    @keyframes ltLeafFly {
      0%   { transform: translate(0,0) scale(1)    rotate(0deg);
             filter: drop-shadow(0 0 0 transparent); opacity: 1; }
      18%  { transform: translate(0,0) scale(1.18) rotate(-12deg);
             filter: drop-shadow(0 10px 24px rgba(201,168,101,0.55))
                     drop-shadow(0 0 20px rgba(232,216,168,0.6)); opacity: 1; }
      55%  { transform: translate(calc(var(--dx,0) * 0.55), calc(var(--dy,0) * 0.55 - 18px)) scale(1.12) rotate(220deg);
             filter: drop-shadow(0 0 38px rgba(255,238,180,0.95)); opacity: 1; }
      100% { transform: translate(var(--dx,0), var(--dy,0)) scale(0.25) rotate(540deg);
             filter: drop-shadow(0 0 14px rgba(255,238,180,0.55)); opacity: 0; }
    }
    /* Gold halo "coin" rides under the leaf during flight so the icon
       never disappears against the parchment. */
    @keyframes ltLeafHalo {
      0%   { transform: scale(0);   opacity: 0; }
      22%  { transform: scale(1);   opacity: 0.95; }
      80%  { transform: scale(1);   opacity: 0.78; }
      100% { transform: scale(0.5); opacity: 0; }
    }
    /* Trunk pulse — gold flash when a leaf lands. */
    @keyframes ltTrunkFlash {
      0%   { box-shadow: 0 0 0 0 rgba(232,216,168,0),
                          0 0 80px 20px rgba(232,216,168,0),
                          inset 0 0 0 rgba(201,168,101,0); }
      30%  { box-shadow: 0 0 0 14px rgba(232,216,168,0.35),
                          0 0 120px 38px rgba(232,216,168,0.65),
                          inset 0 0 60px rgba(255,238,180,0.45); }
      100% { box-shadow: 0 0 0 28px rgba(232,216,168,0),
                          0 0 160px 56px rgba(232,216,168,0); }
    }
    /* Trunk ring expansion on landing — 3 staggered concentric gold rings. */
    @keyframes ltTrunkRing {
      0%   { transform: translate(-50%,-50%) scale(0.5); opacity: 0.9;  border-width: 3px; }
      100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0;    border-width: 0.5px; }
    }
    /* Branch draw-in — strokeDashoffset hand-animated via CSS so each
       branch unfurls from trunk to leaf during entry. */
    @keyframes ltBranchGrow {
      0%   { stroke-dashoffset: var(--branch-len, 600); opacity: 0; }
      20%  { opacity: 1; }
      100% { stroke-dashoffset: 0; opacity: 1; }
    }
    /* Sap flicker — when a leaf is tapped, a single gold dot races along
       the branch back toward the trunk. */
    @keyframes ltSapRace {
      0%   { offset-distance: 100%; opacity: 0; }
      10%  { opacity: 1; }
      100% { offset-distance: 0%;   opacity: 0; }
    }
    /* Cinematic blur-to-clear lift for editorial text on entry. */
    @keyframes ltCinematicIn {
      0%   { opacity: 0; transform: translateY(14px); filter: blur(10px); }
      100% { opacity: 1; transform: translateY(0);    filter: blur(0); }
    }
    /* tap-pulse on the swipe hint */
    @keyframes ltHintFloat {
      0%, 100% { transform: translateX(0);    opacity: 0.7; }
      50%      { transform: translateX(8px);  opacity: 1;   }
    }
  `;
  document.head.appendChild(s);
}

// ============================================================================
// GEOMETRY — split-stage tree of life
// ============================================================================
// Canvas 2560 × 1600. LEFT block 80–1320 px; RIGHT trunk cluster centred at
// (1920, 820). Branches fan from -110° to +110° (0° = straight up = "north").
// Trunk monogram size 280; leaf tiles min touch target ≥160 px (well over 88).
const TRUNK_CX     = 1920;
const TRUNK_CY     = 820;
const TRUNK_R      = 240;       // halo + monogram footprint radius
const MONO_SIZE    = 280;       // visible monogram size
const TILE_W       = 180;       // leaf tile width
const TILE_H       = 200;       // leaf tile height (pointed-oval)
const BRANCH_MIN_R = 420;       // shortest branch length (vertical)
const BRANCH_MAX_R = 540;       // longest branch length (horizontal)

// Map 10 modules to a fan of branches. 0° = up. We sweep from -110° to +110°,
// distributed so the tree feels organic — wider gaps near top, tighter near
// the sides — and tiles have room to breathe at the horizon line.
// Per-branch radius varies subtly (BRANCH_MIN..MAX) so the silhouette has
// a natural canopy shape rather than a perfect arc.
const BRANCH_ANGLES = [-110, -85, -60, -32, -10, 14, 38, 64, 90, 115]; // 10 entries
function branchVector(i) {
  const deg = BRANCH_ANGLES[i % BRANCH_ANGLES.length];
  const a = (deg - 90) * Math.PI / 180; // -90 because we treat 0° as up
  // Radius: top branches longer (taller canopy), side branches shorter
  const verticality = Math.cos((deg) * Math.PI / 180); // 1 at top, 0 at sides
  const r = BRANCH_MIN_R + (BRANCH_MAX_R - BRANCH_MIN_R) * Math.max(0, verticality * 0.5 + 0.4);
  // Per-branch ± jitter for organic feel (deterministic from index)
  const jitter = ((i * 37) % 11 - 5) * 4;
  const len = r + jitter;
  const x = TRUNK_CX + Math.cos(a) * len;
  const y = TRUNK_CY + Math.sin(a) * len;
  // Anchor on trunk perimeter (so branch starts at trunk edge, not centre)
  const ax = TRUNK_CX + Math.cos(a) * (TRUNK_R - 16);
  const ay = TRUNK_CY + Math.sin(a) * (TRUNK_R - 16);
  // Quadratic control point — pushed perpendicular to the branch direction
  // for natural sway (alternating sides so adjacent branches don't collide).
  const perpX = -Math.sin(a);
  const perpY =  Math.cos(a);
  const sway = (i % 2 === 0 ? 1 : -1) * (80 + (i * 17) % 60);
  const midX = (ax + x) / 2 + perpX * sway;
  const midY = (ay + y) / 2 + perpY * sway;
  return { angle: a, deg, len, ax, ay, x, y, midX, midY };
}

function Home() {
  ensureHomeKeys();
  const t = useLoop();
  const [hovered, setHovered]       = React.useState(null);
  const [jumping, setJumping]       = React.useState(null);
  const [exiting, setExiting]       = React.useState(false);
  const [trunkLand, setTrunkLand]   = React.useState(0);
  const [bursts, fireBurst]         = useBurst(900);
  const modules = PROJECT.modules;

  // Entry mode — first visit gets a longer reveal, return visits fast-forward.
  const isFirstVisit = React.useRef(
    typeof sessionStorage === 'undefined' || !sessionStorage.getItem('lt-home-seen')
  ).current;
  React.useEffect(() => {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('lt-home-seen', '1');
  }, []);

  // Phase clocks
  const tOffset = isFirstVisit ? 0 : 1.4;
  const eT      = t + tOffset;
  const titleP  = clamp((eT - 0.2) / 0.9);
  const paraP   = clamp((eT - 0.9) / 0.8);
  const statsP  = clamp((eT - 1.5) / 0.9);
  const trunkP  = clamp((eT - 0.5) / 1.1);
  const branchStartT = 1.4;            // when branches begin to unfurl
  const branchStep   = 0.10;           // per-leaf stagger
  const hintP   = clamp((eT - 3.2) / 0.8);

  // Tap handler — coordinate flight from leaf → trunk.
  const handleLeafTap = (ev, m, i, vec) => {
    if (jumping) return;
    const bezel = document.querySelector('.tablet-bezel');
    if (!bezel) return;
    const root  = bezel.getBoundingClientRect();
    const scale = root.width / 2560;
    const tapX  = (ev.clientX - root.left) / scale;
    const tapY  = (ev.clientY - root.top)  / scale;

    fireBurst(vec.x, vec.y, { count: 12 });

    const leafEl = ev.currentTarget.querySelector('.lt-leaf-icon');
    if (leafEl) {
      leafEl.style.setProperty('--dx', (TRUNK_CX - vec.x) + 'px');
      leafEl.style.setProperty('--dy', (TRUNK_CY - vec.y) + 'px');
    }

    setJumping(m.id);
    setTimeout(() => setTrunkLand(n => n + 1), 480);
    setTimeout(() => setExiting(true), 600);
    setTimeout(() => navigate(m.id), 720);
  };

  return (
    <div style={{
      position:'absolute', inset:0,
      background:'var(--parchment)',
      color:'var(--ink)',
      overflow:'hidden',
      opacity: exiting ? 0 : 1,
      transform: exiting ? 'scale(0.985)' : 'scale(1)',
      transition: 'opacity 360ms ease, transform 360ms ease',
    }}>

      {/* === AMBIENT — pencil tree silhouette behind everything (low op) === */}
      <div style={{position:'absolute', inset:0, opacity: 0.18, zIndex: 0}}>
        <TreeSketch opacity={1} period={32} stroke="rgba(46,74,44"/>
      </div>

      {/* warm radial halo favouring the right side (where the trunk lives) */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:1,
        background: `radial-gradient(ellipse 56% 50% at 75% 52%, rgba(232,216,168,0.32) 0%, rgba(232,216,168,0.10) 38%, transparent 70%)`,
      }}/>

      {/* leaf drift across the whole canvas */}
      <LeafField count={26} opacity={0.72} color="rgba(60,90,55," goldRatio={0.30}/>

      {/* === TOP BAR === */}
      <div style={{
        position:'absolute', top:48, left:80, right:80,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        opacity: titleP, zIndex: 8,
      }}>
        <div style={{display:'flex', alignItems:'center', gap:22}}>
          <LivingTreeLockup size={220} progress={1}/>
          <div style={{display:'flex', flexDirection:'column', gap:6, paddingTop:6}}>
            <KalyaniCredit size={12}/>
          </div>
        </div>
        <div style={{display:'flex', gap:20, alignItems:'center'}}>
          <div className="mono" style={{fontSize:13, letterSpacing:'0.28em', color:'var(--slate)'}}>
            RERA · {PROJECT.rera.split('/').slice(-2).join('/')}
          </div>
          <div style={{width:1, height:20, background:'var(--line)'}}/>
          <div className="mono" style={{fontSize:13, letterSpacing:'0.28em', color:'var(--slate)'}}>
            {new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase()}
          </div>
          <div style={{width:1, height:20, background:'var(--line)'}}/>
          <LiveDot t={t}/>
        </div>
      </div>

      {/* === LEFT EDITORIAL BLOCK === */}
      <LeftEditorial titleP={titleP} paraP={paraP} statsP={statsP} t={t}/>

      {/* === BURSTS — over everything === */}
      <BurstLayer bursts={bursts} zIndex={30}/>

      {/* === TREE — branches SVG layer (below tiles, above trunk halo) === */}
      <svg viewBox="0 0 2560 1600" preserveAspectRatio="none"
        style={{position:'absolute', inset:0, width:'100%', height:'100%', zIndex: 4, pointerEvents:'none'}}>
        <defs>
          <linearGradient id="lt-branch-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="var(--gold-deep)" stopOpacity="0.85"/>
            <stop offset="100%" stopColor="var(--gold)"     stopOpacity="0.40"/>
          </linearGradient>
        </defs>
        {modules.map((m, i) => {
          const v = branchVector(i);
          const focused = hovered === m.id || jumping === m.id;
          // Approximate quadratic path length (Bezier) — chord + control deflection
          const chord = Math.hypot(v.x - v.ax, v.y - v.ay);
          const ctrlD = Math.hypot(v.midX - (v.ax + v.x)/2, v.midY - (v.ay + v.y)/2);
          const pathLen = chord + ctrlD * 0.8;
          const startDelay = branchStartT + i * branchStep;
          return (
            <g key={m.id}>
              {/* Outer halo path — only on focus */}
              {focused && (
                <path d={`M ${v.ax} ${v.ay} Q ${v.midX} ${v.midY} ${v.x} ${v.y}`}
                  stroke="rgba(232,216,168,0.4)" strokeWidth="9"
                  fill="none" strokeLinecap="round"/>
              )}
              {/* The branch itself — strokeDashoffset hand-animated via CSS keyframe.
                  We set --branch-len on the element so the keyframe knows its length. */}
              <path d={`M ${v.ax} ${v.ay} Q ${v.midX} ${v.midY} ${v.x} ${v.y}`}
                stroke="url(#lt-branch-grad)"
                strokeWidth={focused ? 2.6 : 1.8}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={pathLen}
                strokeDashoffset={pathLen}
                style={{
                  '--branch-len': pathLen + 'px',
                  animation: `ltBranchGrow 1100ms ${startDelay}s cubic-bezier(0.25,1,0.4,1) forwards`,
                  transition: 'stroke-width 280ms',
                  filter: focused ? 'drop-shadow(0 0 6px rgba(232,216,168,0.7))' : 'none',
                }}/>
              {/* Tiny leaf bumps along the branch — three small ovals at 30/55/80% */}
              {[0.30, 0.55, 0.80].map((pct, j) => {
                // sample quadratic at pct
                const u = pct, iu = 1 - u;
                const lx = iu*iu * v.ax + 2*iu*u * v.midX + u*u * v.x;
                const ly = iu*iu * v.ay + 2*iu*u * v.midY + u*u * v.y;
                // tangent for leaf rotation
                const tx = 2*iu*(v.midX - v.ax) + 2*u*(v.x - v.midX);
                const ty = 2*iu*(v.midY - v.ay) + 2*u*(v.y - v.midY);
                const rot = Math.atan2(ty, tx) * 180 / Math.PI;
                const showByT = clamp((eT - startDelay - 0.6 - j*0.10) / 0.5);
                return (
                  <g key={j} transform={`translate(${lx} ${ly}) rotate(${rot + 90})`}
                     opacity={showByT * (focused ? 0.95 : 0.55)}
                     style={{transition: 'opacity 260ms'}}>
                    <ellipse cx="0" cy="0" rx="3.2" ry="6.5"
                      fill="var(--forest-soft)" opacity="0.75"/>
                  </g>
                );
              })}
              {/* Sap flicker — a gold dot races trunk-ward when this leaf is tapped */}
              {jumping === m.id && (
                <circle r="5" fill="var(--gold-soft)"
                  style={{
                    offsetPath: `path('M ${v.ax} ${v.ay} Q ${v.midX} ${v.midY} ${v.x} ${v.y}')`,
                    filter: 'drop-shadow(0 0 10px rgba(255,238,180,0.95))',
                    animation: 'ltSapRace 520ms cubic-bezier(0.4,0,0.2,1) forwards',
                  }}/>
              )}
            </g>
          );
        })}
      </svg>

      {/* === TRUNK — central monogram with halo, lands flash + ring on tap === */}
      <Trunk t={t} trunkP={trunkP} trunkLand={trunkLand}/>

      {/* === LEAF TILES — 10 of them, one per branch terminus === */}
      {modules.map((m, i) => {
        const v = branchVector(i);
        const startDelay = branchStartT + i * branchStep + 0.45; // appears after branch grows
        const local = clamp((eT - startDelay) / 0.7);
        const e = ease.outBack(local);
        const isHov   = hovered === m.id;
        const isJump  = jumping === m.id;
        const isOther = jumping && !isJump;
        return (
          <div key={m.id}
            style={{
              position:'absolute',
              left: v.x - TILE_W/2,
              top:  v.y - TILE_H/2,
              width: TILE_W, height: TILE_H,
              opacity: jumping ? (isJump ? 1 : 0.22) : e,
              transform: isJump ? 'translate(0,0) scale(1)' : `scale(${0.4 + 0.6*e})`,
              transformOrigin:'center',
              filter: isOther ? 'blur(2px)' : 'none',
              transition:'opacity 320ms ease, transform 320ms ease, filter 280ms',
              pointerEvents: jumping ? 'none' : 'auto',
              zIndex: 6,
            }}>
            <LeafTile
              m={m} i={i} t={t}
              hovered={isHov} jumping={isJump}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={(ev) => handleLeafTap(ev, m, i, v)}
            />
          </div>
        );
      })}

      {/* === BOTTOM HINT — tap a leaf to explore === */}
      <div style={{
        position:'absolute', bottom: 56, left: 80,
        display:'flex', alignItems:'center', gap: 18,
        opacity: hintP, zIndex: 9,
      }}>
        <div className="mono" style={{
          fontSize: 16, letterSpacing:'0.36em',
          color:'var(--gold-deep)', textTransform:'uppercase',
        }}>Tap a leaf to explore</div>
        <div style={{
          width:28, height:28, color:'var(--gold-deep)',
          animation:'ltHintFloat 2.4s ease-in-out infinite',
        }}>
          <Icons.swipe width="28" height="28"/>
        </div>
      </div>

      {/* === BOTTOM RIGHT — RERA + Kalyani credit === */}
      <div style={{
        position:'absolute', bottom: 48, right: 80,
        display:'flex', alignItems:'center', gap: 22,
        opacity: hintP, zIndex: 9,
      }}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap: 6}}>
          <KalyaniCredit size={11}/>
          <div className="mono" style={{fontSize:11, letterSpacing:'0.30em', color:'var(--slate)'}}>
            {PROJECT.rera}
          </div>
        </div>
        <div style={{
          background:'var(--ivory)', padding: 8, borderRadius: 6,
          boxShadow: '0 4px 18px rgba(50,32,12,0.18), 0 0 0 1px rgba(201,168,101,0.45)',
        }}>
          <KalyaniTriangle size={56}/>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LEFT EDITORIAL — eyebrow + headline + paragraph + 4 KPI tiles
// ============================================================================
function LeftEditorial({ titleP, paraP, statsP, t }) {
  const cursorOn = (Math.sin(t * 9) > 0) && titleP > 0.95 && titleP < 1;

  // 4 KPI tiles — numeric portion uses CounterFlip for the entry reveal.
  // Numeric values are extracted; units stay static in serif italic.
  const kpis = [
    { num: 25,  unit: 'acres',     label: 'TOTAL LAND' },
    { num: 10,  unit: 'trees',     label: 'TOWERS'     },
    { num: 65,  unit: 'amenities', label: 'ACROSS 2 CLUBS', suffix: '+' },
    { num: 15,  unit: 'min · KIA', label: 'AIRPORT'    },
  ];

  return (
    <div style={{
      position:'absolute',
      left: 110, top: '50%',
      transform: 'translateY(-50%)',
      width: 1180,
      zIndex: 5,
    }}>
      {/* eyebrow */}
      <div className="mono" style={{
        fontSize: 19, letterSpacing:'0.42em', color:'var(--gold-deep)',
        opacity: titleP, transform:`translateY(${(1-titleP)*8}px)`,
        textTransform:'uppercase',
      }}>
        By Kalyani Developers · 30+ Years Rooted
      </div>

      {/* headline — three-line serif, "Generations" italic gold */}
      <h1 className="serif" style={{
        margin:'30px 0 0', fontSize: 184, fontWeight: 300, lineHeight: 0.92,
        letterSpacing:'-0.035em',
        color: 'var(--forest)',
        filter: `drop-shadow(0 0 ${22 * titleP}px rgba(201,168,101,0.18))`,
      }}>
        <span style={{display:'block', opacity: titleP, transform:`translateY(${(1-titleP)*16}px)`}}>
          Designed for
        </span>
        <span style={{
          display:'block',
          color:'var(--gold-deep)', fontStyle:'italic',
          opacity: clamp((titleP - 0.35) / 0.65),
          transform:`translateY(${(1 - clamp((titleP - 0.35) / 0.65))*22}px)`,
        }}>
          Four Generations.
          {cursorOn && (
            <span style={{
              display:'inline-block', width:'0.06em', marginLeft:'0.06em',
              height:'0.85em', verticalAlign:'-0.06em',
              background:'var(--gold-deep)',
              boxShadow:'0 0 14px rgba(201,168,101,0.7)',
            }}/>
          )}
        </span>
      </h1>

      {/* gold hairline w/ leaf bead */}
      <svg viewBox="0 0 600 8" width="340" height="7" style={{marginTop:24, opacity: paraP}}>
        <path d="M 4 4 L 596 4" stroke="var(--gold-deep)" strokeWidth="1.2" fill="none"
          strokeDasharray="600" strokeDashoffset={600 * (1 - clamp((paraP) * 1.1))}/>
        <ellipse cx="300" cy="4" rx="3" ry="5" fill="var(--gold)" opacity={clamp((paraP - 0.6) / 0.4)}/>
      </svg>

      {/* pitch paragraph */}
      <div style={{
        marginTop: 32, maxWidth: 920,
        fontSize: 28, lineHeight: 1.5, color:'var(--graphite)',
        opacity: paraP, transform:`translateY(${(1-paraP)*10}px)`,
      }}>
        A twenty-five acre community in the green corridor of North Bengaluru —
        ten tree-named towers, sixty-five amenities and twenty acres of open
        ground, fifteen minutes from Kempegowda International Airport.
      </div>

      {/* italic tagline */}
      <div className="serif" style={{
        marginTop: 18, fontSize: 28, fontStyle:'italic',
        color: 'var(--forest-soft)', letterSpacing:'0.01em',
        opacity: paraP,
      }}>
        Rooted in Luxury · Branching into the Future
      </div>

      {/* === 4 KPI inline tiles — serif numeric + mono label === */}
      <div style={{
        marginTop: 48,
        display:'flex', alignItems:'stretch', gap: 28,
        opacity: statsP, transform:`translateY(${(1-statsP)*8}px)`,
      }}>
        {kpis.map((k, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <div style={{width:1, alignSelf:'stretch', background:'var(--line)', opacity:0.7}}/>
            )}
            <div style={{display:'flex', flexDirection:'column', gap:8, minWidth:0}}>
              <div className="mono" style={{
                fontSize:14, letterSpacing:'0.32em', color:'var(--slate)',
              }}>{k.label}</div>
              <div style={{display:'flex', alignItems:'baseline', gap:9}}>
                <div className="serif" style={{
                  fontSize: 52, fontWeight: 400, letterSpacing:'-0.01em',
                  color:'var(--forest)', lineHeight:1,
                }}>
                  {statsP > 0.05
                    ? <CounterFlip value={k.num} duration={1.2} delay={0.1 + i * 0.08} suffix={k.suffix || ''}/>
                    : '0'}
                </div>
                <div className="serif" style={{
                  fontSize: 22, fontStyle:'italic', color:'var(--forest-soft)',
                }}>{k.unit}</div>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TRUNK — central monogram with halo ring + landing flash on tap
// ============================================================================
function Trunk({ t, trunkP, trunkLand }) {
  const D = TRUNK_R * 2;
  return (
    <div style={{
      position:'absolute',
      left: TRUNK_CX - TRUNK_R - 32, top: TRUNK_CY - TRUNK_R - 32,
      width: D + 64, height: D + 64,
      zIndex: 5, pointerEvents:'none',
    }}>
      {/* outer ambient halo — soft gold glow */}
      <div style={{
        position:'absolute', inset:0, borderRadius:'50%',
        background:'radial-gradient(circle at center, rgba(232,216,168,0.32) 0%, rgba(201,168,101,0.12) 38%, transparent 68%)',
        opacity: trunkP, transform: `scale(${0.85 + trunkP*0.15})`,
        transition: 'opacity 540ms ease-out, transform 540ms ease-out',
      }}/>

      {/* concentric rings — drawn-in via strokeDashoffset */}
      <svg viewBox={`0 0 ${D + 64} ${D + 64}`} style={{position:'absolute', inset:0}}>
        {/* parchment fill disc — gives the monogram a clean ground */}
        <circle cx={D/2 + 32} cy={D/2 + 32} r={TRUNK_R - 4}
          fill="rgba(251,246,234,0.85)"
          stroke="var(--gold)" strokeWidth="1.6"
          strokeDasharray={Math.PI * D} strokeDashoffset={Math.PI * D * (1 - trunkP)}
          style={{filter:'drop-shadow(0 10px 32px rgba(46,74,44,0.18))'}}/>
        {/* faint outer dotted ring — slowly rotating */}
        <circle cx={D/2 + 32} cy={D/2 + 32} r={TRUNK_R + 18}
          fill="none" stroke="var(--gold-deep)" strokeOpacity={0.32 * trunkP}
          strokeWidth="0.7" strokeDasharray="2 7"
          transform={`rotate(${(t * 5) % 360} ${D/2 + 32} ${D/2 + 32})`}/>
        {/* 10 tick marks at branch angles — visual indicator of trunk's wired connections */}
        {BRANCH_ANGLES.map((deg, i) => {
          const a = (deg - 90) * Math.PI / 180;
          const r1 = TRUNK_R + 4, r2 = TRUNK_R + 12;
          const x1 = D/2 + 32 + r1*Math.cos(a), y1 = D/2 + 32 + r1*Math.sin(a);
          const x2 = D/2 + 32 + r2*Math.cos(a), y2 = D/2 + 32 + r2*Math.sin(a);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="var(--gold-deep)" strokeWidth="1.2" opacity={0.7 * trunkP}/>;
        })}
      </svg>

      {/* === LANDING FLASH + ring expansion when a leaf arrives === */}
      {trunkLand > 0 && (
        <React.Fragment key={'land-' + trunkLand}>
          <div style={{
            position:'absolute', left: 32, top: 32, width: D, height: D, borderRadius:'50%',
            animation:'ltTrunkFlash 800ms cubic-bezier(0.22,1,0.36,1) both',
            pointerEvents:'none', zIndex:6,
          }}/>
          {[0,1,2].map(i => (
            <div key={i} style={{
              position:'absolute', left: '50%', top:'50%',
              width: D, height: D, borderRadius:'50%',
              border:'2px solid var(--gold-soft)',
              animation: `ltTrunkRing 1100ms ${i*140}ms cubic-bezier(0.22,1,0.36,1) both`,
              pointerEvents:'none', zIndex:6,
            }}/>
          ))}
        </React.Fragment>
      )}

      {/* === The LivingTree monogram — focal mark === */}
      <div style={{
        position:'absolute', inset: 32,
        display:'flex', alignItems:'center', justifyContent:'center',
        zIndex: 5,
        opacity: clamp(trunkP * 1.2),
        filter: `drop-shadow(0 0 ${20 * trunkP}px rgba(232,216,168,0.55))`,
      }}>
        <LivingTreeMonogram size={MONO_SIZE} progress={trunkP} color="var(--gold-deep)"/>
      </div>
    </div>
  );
}

// ============================================================================
// LeafTile — leaf-shaped tile holding icon + label.
// Min touch target ~180×200 (well over 88).
// ============================================================================
function LeafTile({ m, i, t, hovered, jumping, onClick, onMouseEnter, onMouseLeave }) {
  const Glyph = Icons[m.id] || Icons.story;
  const active = hovered || jumping;
  // Leaf shape — pointed-oval. We draw it via SVG with a slight tip up.
  return (
    <div onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position:'relative', width:'100%', height:'100%',
        cursor:'pointer',
        transform: hovered && !jumping ? 'translateY(-6px) scale(1.05)' : 'translateY(0) scale(1)',
        transition: 'transform 320ms cubic-bezier(0.22,1,0.36,1)',
      }}>
      {/* leaf body — SVG shape, forest-green with gold rim */}
      <svg viewBox="0 0 180 200" width="100%" height="100%"
        style={{
          position:'absolute', inset:0, overflow:'visible',
          filter: active
            ? 'drop-shadow(0 20px 40px rgba(46,74,44,0.32)) drop-shadow(0 0 28px rgba(232,216,168,0.6))'
            : 'drop-shadow(0 12px 26px rgba(46,74,44,0.22))',
          transition: 'filter 320ms ease',
        }}>
        <defs>
          <linearGradient id={`leaf-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={active ? 'var(--tile-light)' : 'var(--tile)'} />
            <stop offset="100%" stopColor="var(--tile-deep)" />
          </linearGradient>
        </defs>
        {/* leaf silhouette — pointed top, rounded bottom */}
        <path d="M 90 4
                 C 150 30 168 80 168 110
                 C 168 156 132 192 90 196
                 C 48 192 12 156 12 110
                 C 12 80 30 30 90 4 Z"
          fill={`url(#leaf-grad-${i})`}
          stroke={active ? 'var(--gold-soft)' : 'rgba(201,168,101,0.5)'}
          strokeWidth={active ? 2 : 1.2}/>
        {/* leaf midrib — gold vein */}
        <line x1="90" y1="16" x2="90" y2="186"
          stroke="rgba(232,216,168,0.32)" strokeWidth="1"/>
        {/* secondary veins */}
        {[40, 70, 100, 130, 160].map((y, k) => {
          const side = (90 - 12) * 0.7;
          return (
            <React.Fragment key={k}>
              <path d={`M 90 ${y} Q ${90 - side*0.4} ${y + 12} ${90 - side*0.6} ${y + 22}`}
                stroke="rgba(232,216,168,0.18)" strokeWidth="0.7" fill="none"/>
              <path d={`M 90 ${y} Q ${90 + side*0.4} ${y + 12} ${90 + side*0.6} ${y + 22}`}
                stroke="rgba(232,216,168,0.18)" strokeWidth="0.7" fill="none"/>
            </React.Fragment>
          );
        })}
      </svg>

      {/* number badge — top of the leaf */}
      <div className="mono" style={{
        position:'absolute', top: 26, left: 0, right: 0, textAlign:'center',
        fontSize: 11, letterSpacing:'0.36em', color:'var(--on-tile)',
        opacity: active ? 1 : 0.78, transition:'opacity 280ms',
        zIndex: 2,
      }}>
        0{i + 1 < 10 ? i + 1 : i + 1}
      </div>

      {/* icon — flies on tap. Gold halo coin rides under it during flight. */}
      <div className="lt-leaf-icon" style={{
        position:'absolute', left: '50%', top: 56,
        width: 76, height: 76, marginLeft: -38,
        color: jumping ? '#1a130a' : 'var(--on-tile)',
        animation: jumping ? 'ltLeafFly 600ms cubic-bezier(0.34, 1.18, 0.4, 1) forwards' : 'none',
        willChange: 'transform, opacity, filter',
        transformOrigin:'center',
        zIndex: 3,
      }}>
        {jumping && (
          <div style={{
            position:'absolute', inset:-16, borderRadius:'50%',
            background:'radial-gradient(circle at center, #fff8e0 0%, #ead7a8 50%, #c9a05e 100%)',
            boxShadow:'0 0 36px rgba(255,238,180,0.95), 0 0 14px rgba(176,138,63,0.65)',
            animation:'ltLeafHalo 600ms cubic-bezier(0.34, 1.18, 0.4, 1) forwards',
            zIndex: -1,
          }}/>
        )}
        <div style={{position:'relative', zIndex:1, width:'100%', height:'100%'}}>
          <Glyph width="76" height="76"/>
        </div>
      </div>

      {/* label — serif, name of the module */}
      <div className="serif" style={{
        position:'absolute', bottom: 26, left: 8, right: 8,
        textAlign:'center', fontSize: 22, fontWeight: 500,
        color: active ? 'var(--gold-soft)' : 'var(--on-tile)',
        letterSpacing:'-0.005em', lineHeight: 1.1,
        transition: 'color 280ms',
        textShadow: active ? '0 0 12px rgba(232,216,168,0.5)' : 'none',
        zIndex: 2,
      }}>
        {m.label}
      </div>
    </div>
  );
}

// ============================================================================
// LiveDot — top-right pulsing indicator
// ============================================================================
function LiveDot({ t }) {
  const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
  return (
    <div style={{display:'flex', alignItems:'center', gap:9}}>
      <div style={{position:'relative', width:9, height:9}}>
        <div style={{position:'absolute', inset:0, borderRadius:'50%', background:'var(--available)'}}/>
        <div style={{position:'absolute', inset:-4, borderRadius:'50%',
          background:'var(--available)', opacity: 0.32 * pulse,
          transform:`scale(${1 + pulse * 0.6})`}}/>
      </div>
      <div className="mono" style={{fontSize:13, letterSpacing:'0.24em', color:'var(--available)'}}>
        LIVE INVENTORY
      </div>
    </div>
  );
}

window.Home = Home;
