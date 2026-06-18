// LivingTree · Location
//
// Two-pane brochure-style location screen.
//
//   LEFT (60%)  — assets/maps/location-02.png as the canvas. SVG overlay with
//                 a gold-pulsing LivingTree pin at the project coords (centre-
//                 right of the green stylised brochure map) + small dots in
//                 plausible cluster positions for the currently-active
//                 landmark category. Pin lives inside the map; nothing else
//                 is drawn over the existing brochure imagery.
//
//   RIGHT (40%) — tabbed landmark list. Tabs across the top (one per unique
//                 category in LOCATION_ADVANTAGES). Below: scrollable rows
//                 showing icon · label · distance pill. Swipe left/right on
//                 the right panel cycles between tabs.
//
//   Bottom strip (full width) — 4 "Connectivity highlights" cards filtered
//   from LOCATION_ADVANTAGES.
//
//   Footer — address line from PROJECT.location.
//
// Embodied: a luxury-realty UX designer doesn't try to compete with the
// brochure map — the map IS the hero. The overlay is one glowing pin and one
// faint dot cluster, nothing more. The right rail does the heavy lifting.

const LT_LOC_KEYS_ID = 'lt-loc-screen-keys';
function ensureLtLocKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(LT_LOC_KEYS_ID)) return;
  const s = document.createElement('style');
  s.id = LT_LOC_KEYS_ID;
  s.textContent = `
    @keyframes ltLocPinRing {
      0%   { transform: translate(-50%,-50%) scale(0.6); opacity: 0.85; }
      100% { transform: translate(-50%,-50%) scale(3.2); opacity: 0; }
    }
    @keyframes ltLocPinBob {
      0%, 100% { transform: translate(-50%, -100%) scale(1); }
      50%      { transform: translate(-50%, -100%) scale(1.04); }
    }
    @keyframes ltLocDotPulse {
      0%, 100% { opacity: 0.55; transform: scale(1); }
      50%      { opacity: 1;    transform: scale(1.18); }
    }
    @keyframes ltLocRowIn {
      0%   { opacity: 0; transform: translateX(22px); }
      100% { opacity: 1; transform: translateX(0); }
    }
    @keyframes ltLocTabSlide {
      0%   { opacity: 0; transform: translateY(8px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(s);
}

// Plausible cluster positions of landmarks on the brochure map (0..100% of
// the map image). Eyeballed against location-02.png so categories cluster
// roughly in the right zones (airport NW, tech parks east, etc.).
// Anything missing from this map just shows in the right-rail list without
// a corresponding dot on the map — and the map stays uncluttered.
const LT_LOC_POS = {
  // Connectivity — airport NW, ORR & Hebbal SW, Bagalur cross close
  'Kempegowda International Airport': { x: 22, y: 18 },
  'Hebbal Flyover':                   { x: 24, y: 78 },
  'Bagalur Cross':                    { x: 56, y: 38 },
  'Outer Ring Road':                  { x: 18, y: 60 },

  // Tech Parks — aerospace ring east, north
  'Wipro Aerospace':                  { x: 62, y: 32 },
  'Boeing':                           { x: 70, y: 38 },
  'Foxconn':                          { x: 78, y: 26 },
  'Thyssenkrupp':                     { x: 66, y: 22 },
  'L&T Tech Park':                    { x: 80, y: 46 },
  'Manyata Tech Park':                { x: 30, y: 84 },
  'Shell Technology Centre':          { x: 84, y: 60 },
  'Karle Town Centre SEZ':            { x: 32, y: 88 },
  'Kirloskar Business Park':          { x: 24, y: 82 },
  'Financial City':                   { x: 88, y: 70 },
  'Brigade Magnum':                   { x: 22, y: 76 },

  // Schools / Colleges
  'Reva University':                  { x: 30, y: 56 },
  'CMR University':                   { x: 22, y: 62 },
  'Delhi Public School':              { x: 42, y: 52 },
  'Greenfield International':         { x: 44, y: 58 },
  'Canadian International':           { x: 18, y: 72 },
  'Chrysalis School':                 { x: 46, y: 48 },
  'National Public School':           { x: 26, y: 68 },
  'Presidency College':               { x: 30, y: 72 },
  'Presidency University':            { x: 32, y: 76 },
  'Presidency School':                { x: 28, y: 66 },

  // Hospitals — central/west
  'Aster Hospital':                   { x: 40, y: 64 },
  'Columbia Asia':                    { x: 50, y: 70 },
  'Regal Hospital':                   { x: 52, y: 58 },

  // Shopping
  'Mall of Asia':                     { x: 36, y: 36 },
  'Esteem Mall':                      { x: 28, y: 50 },
  'Elements Mall':                    { x: 32, y: 30 },
  'Bhartiya Mall':                    { x: 50, y: 28 },
  'Galleria Mall':                    { x: 38, y: 86 },
  'Lulu Vasa Mart':                   { x: 22, y: 44 },
  'Big Bewaki':                       { x: 56, y: 84 },
  'Decathlon':                        { x: 60, y: 76 },
};

// Project pin position on the brochure map (the LivingTree logo on the
// brochure sits roughly centre-right). Hand-tuned against location-02.png.
const LT_PROJECT_PIN = { x: 49, y: 38 };

function LocationScreen() {
  ensureLtLocKeys();
  const t = useLoop();
  const cats = React.useMemo(
    () => Array.from(new Set(LOCATION_ADVANTAGES.map(p => p.cat))),
    []
  );
  const [activeCat, setActiveCat] = React.useState(cats[0]);

  const itemsForCat = React.useMemo(
    () => LOCATION_ADVANTAGES.filter(p => p.cat === activeCat),
    [activeCat]
  );

  // Bottom strip — exactly 4 connectivity highlights.
  const connectivityHighlights = React.useMemo(
    () => LOCATION_ADVANTAGES.filter(p => p.cat === 'Connectivity').slice(0, 4),
    []
  );

  // Swipe between tabs on the right panel
  const panelSwipe = useSwipe({
    onLeft:  () => {
      const i = cats.indexOf(activeCat);
      setActiveCat(cats[(i + 1) % cats.length]);
    },
    onRight: () => {
      const i = cats.indexOf(activeCat);
      setActiveCat(cats[(i - 1 + cats.length) % cats.length]);
    },
    threshold: 50,
  });

  // Layout constants (2560 × 1600)
  const headerH = 150;
  const padX = 64;
  const stripH = 156;       // bottom connectivity strip
  const footerH = 64;       // address line
  const gap = 24;
  const topY = headerH + 20;
  const bodyBottom = stripH + footerH + 20;     // distance from canvas bottom
  const bodyH = 1600 - topY - bodyBottom;
  const leftW = Math.round((2560 - padX*2 - gap) * 0.60);
  const rightW = (2560 - padX*2 - gap) - leftW;

  // Subtle pulse for the project pin (uses useLoop)
  const pulsePhases = [0, 0.6, 1.2];

  return (
    <div style={{position:'absolute', inset:0, background:'var(--parchment)', color:'var(--ink)', overflow:'hidden'}}>
      {/* very subtle ambient drifting leaves at low opacity behind everything */}
      <LeafField count={10} opacity={0.28} goldRatio={0.4}/>

      <ScreenHeader title="Location" sub="Hitech Defence & Aerospace Park"/>

      {/* ============================================================ */}
      {/* LEFT — brochure map canvas with project pin + dot overlay     */}
      {/* ============================================================ */}
      <div style={{
        position:'absolute',
        top: topY, left: padX, width: leftW, height: bodyH,
        borderRadius: 26, overflow:'hidden',
        background:'var(--forest-deep)',
        border:'1px solid rgba(232,216,168,0.30)',
        boxShadow:'0 26px 60px rgba(20,30,18,0.32), 0 0 0 1px rgba(232,216,168,0.10) inset',
      }}>
        {/* The brochure map fills the canvas */}
        <img
          src="assets/maps/location-02.png"
          alt="LivingTree — neighbourhood map"
          style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover',
            objectPosition:'right center',
            display:'block',
          }}
        />

        {/* SOFT VIGNETTE so HUD elements stay readable */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          background:'radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(20,30,18,0.28) 100%)',
        }}/>

        {/* HUD · top-left — title / coords (sits over the dark green map) */}
        <div style={{
          position:'absolute', top: 26, left: 26, zIndex: 3,
          display:'flex', flexDirection:'column', gap: 8,
        }}>
          <div className="mono" style={{
            fontSize: 14, letterSpacing:'0.40em', color:'rgba(232,216,168,0.78)', textTransform:'uppercase',
          }}>You are here · Plot 7, KIADB Aerospace Park</div>
          <div className="serif" style={{
            fontSize: 56, lineHeight: 1, color:'#fbf6ea', fontWeight: 400, letterSpacing:'-0.012em',
          }}>North Bangalore</div>
          <div className="mono" style={{
            fontSize: 13, letterSpacing:'0.30em', color:'rgba(232,216,168,0.55)',
          }}>
            {PROJECT.location.coords.lat.toFixed(4)}°N · {PROJECT.location.coords.lng.toFixed(4)}°E · {PROJECT.location.pincode}
          </div>
        </div>

        {/* HUD · top-right — KIA pill */}
        <div style={{
          position:'absolute', top: 30, right: 28, zIndex: 3,
          padding:'14px 22px', borderRadius: 999,
          background:'rgba(20,30,18,0.62)',
          border:'1px solid rgba(232,216,168,0.40)',
          backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
          display:'inline-flex', alignItems:'center', gap: 12,
          boxShadow:'0 10px 24px rgba(20,30,18,0.32)',
        }}>
          <span style={{display:'inline-flex', width: 22, height: 22, color:'var(--gold-soft)'}}>
            <Icons.plane/>
          </span>
          <span className="mono" style={{
            fontSize: 13, letterSpacing:'0.30em', color:'var(--gold-soft)', textTransform:'uppercase',
          }}>15 min · KIA</span>
        </div>

        {/* Dot overlay for landmarks in active category */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none"
          style={{position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:2}}>
          {itemsForCat.map((p, i) => {
            const pos = LT_LOC_POS[p.label];
            if (!pos) return null;
            return (
              <g key={p.label} style={{transformOrigin:`${pos.x}% ${pos.y}%`}}>
                <circle cx={pos.x} cy={pos.y} r="0.9"
                  fill="rgba(232,216,168,0.95)"
                  style={{
                    transformOrigin:`${pos.x}px ${pos.y}px`,
                    animation: `ltLocDotPulse 2.6s ease-in-out ${i*0.12}s infinite`,
                  }}/>
                <circle cx={pos.x} cy={pos.y} r="2.2"
                  fill="none" stroke="rgba(201,168,101,0.65)" strokeWidth="0.18"/>
              </g>
            );
          })}
        </svg>

        {/* PROJECT PIN — gold pulsing leaf mark at project coords on the map */}
        <div style={{
          position:'absolute',
          left: `${LT_PROJECT_PIN.x}%`,
          top:  `${LT_PROJECT_PIN.y}%`,
          width: 0, height: 0,
          zIndex: 4, pointerEvents:'none',
        }}>
          {/* expanding ring pulses */}
          {pulsePhases.map((delay, i) => (
            <span key={i} style={{
              position:'absolute', left: 0, top: 0,
              width: 70, height: 70, borderRadius:'50%',
              border:'2px solid #e8d8a8',
              boxShadow:'0 0 18px rgba(232,216,168,0.7)',
              animation:`ltLocPinRing 2.8s cubic-bezier(0.22,1,0.36,1) ${delay}s infinite`,
              willChange:'transform, opacity',
            }}/>
          ))}

          {/* pin body — gold leaf-like teardrop with LT centre */}
          <div style={{
            position:'absolute', left: 0, top: 0,
            transformOrigin:'center bottom',
            animation: 'ltLocPinBob 3.2s ease-in-out infinite',
            filter:'drop-shadow(0 8px 14px rgba(20,30,18,0.55))',
          }}>
            <svg width="76" height="98" viewBox="0 0 76 98" style={{display:'block'}}>
              <defs>
                <radialGradient id="ltLocPinGrad" cx="0.5" cy="0.4" r="0.65">
                  <stop offset="0%"  stopColor="#fff4d2"/>
                  <stop offset="55%" stopColor="#e8d8a8"/>
                  <stop offset="100%" stopColor="#b08e45"/>
                </radialGradient>
              </defs>
              {/* teardrop */}
              <path d="M 38 4 C 18 4 6 18 6 36 C 6 56 38 94 38 94 C 38 94 70 56 70 36 C 70 18 58 4 38 4 Z"
                fill="url(#ltLocPinGrad)" stroke="#b08e45" strokeWidth="2"/>
              {/* inner ring */}
              <circle cx="38" cy="34" r="16" fill="#1f3522" stroke="#e8d8a8" strokeWidth="1.2"/>
              {/* LT monogram */}
              <text x="38" y="40" textAnchor="middle"
                fontFamily="Cormorant Garamond, serif" fontSize="18" fontWeight="600"
                fill="#e8d8a8" letterSpacing="-1">LT</text>
            </svg>
          </div>

          {/* pill label below pin */}
          <div style={{
            position:'absolute', left: '50%', top: 102,
            transform:'translateX(-50%)',
            padding:'8px 16px', borderRadius: 999,
            background:'#1f3522',
            border:'1px solid rgba(232,216,168,0.55)',
            boxShadow:'0 8px 18px rgba(20,30,18,0.5)',
            whiteSpace:'nowrap',
          }}>
            <span className="mono" style={{
              fontSize: 11, letterSpacing:'0.30em', color:'var(--gold-soft)', textTransform:'uppercase',
            }}>LivingTree</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT — tabbed landmark list                                  */}
      {/* ============================================================ */}
      <div {...panelSwipe} style={{
        position:'absolute',
        top: topY, left: padX + leftW + gap, width: rightW, height: bodyH,
        borderRadius: 26, overflow:'hidden',
        background:'var(--ivory)',
        border:'1px solid var(--line)',
        boxShadow:'0 20px 50px rgba(20,30,18,0.10), 0 0 0 1px rgba(232,216,168,0.20) inset',
        display:'flex', flexDirection:'column',
      }}>
        {/* RIGHT-PANEL HEADER */}
        <div style={{
          padding:'28px 32px 16px',
          borderBottom:'1px solid var(--line)',
          background:'linear-gradient(180deg, var(--ivory) 0%, #f8f1dc 100%)',
        }}>
          <div className="mono" style={{
            fontSize: 13, letterSpacing:'0.32em', color:'var(--gold-deep)', textTransform:'uppercase',
          }}>Nearby Landmarks</div>
          <div className="serif" style={{
            fontSize: 38, lineHeight: 1.05, color:'var(--forest)', fontWeight: 500,
            marginTop: 6, letterSpacing:'-0.012em',
          }}>
            What's <em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>around</em> LivingTree
          </div>
        </div>

        {/* CATEGORY TAB ROW */}
        <div className="scroll" style={{
          padding:'18px 18px 14px',
          borderBottom:'1px solid var(--line)',
          display:'flex', gap: 10, overflowX:'auto', whiteSpace:'nowrap',
        }}>
          {cats.map((c) => {
            const isActive = c === activeCat;
            const count = LOCATION_ADVANTAGES.filter(p => p.cat === c).length;
            // Use a representative icon for each tab
            const iconKey = (LOCATION_ADVANTAGES.find(p => p.cat === c) || {}).icon || 'location';
            const IconC = Icons[iconKey] || Icons.location;
            return (
              <button key={c} onClick={() => setActiveCat(c)} style={{
                flexShrink: 0,
                display:'inline-flex', alignItems:'center', gap: 10,
                padding:'14px 20px', borderRadius: 999,
                minHeight: 68,
                border: '1.5px solid ' + (isActive ? 'var(--gold-deep)' : 'var(--line)'),
                background: isActive
                  ? 'linear-gradient(180deg, var(--forest) 0%, var(--forest-deep) 100%)'
                  : 'var(--ivory)',
                color: isActive ? 'var(--on-tile)' : 'var(--ink)',
                cursor:'pointer',
                boxShadow: isActive
                  ? '0 12px 26px rgba(20,30,18,0.26), 0 0 0 4px rgba(201,168,101,0.18)'
                  : '0 3px 10px rgba(20,30,18,0.05)',
                transition:'all 240ms cubic-bezier(0.22,1,0.36,1)',
              }}>
                <span style={{display:'inline-flex', width: 22, height: 22, color: isActive ? 'var(--gold-soft)' : 'var(--forest)'}}>
                  <IconC/>
                </span>
                <span className="serif" style={{fontSize: 20, fontWeight: 500, letterSpacing:'-0.005em'}}>{c}</span>
                <span className="mono" style={{
                  fontSize: 12, letterSpacing:'0.16em', fontWeight: 600,
                  padding:'3px 9px', borderRadius: 999,
                  background: isActive ? 'rgba(232,216,168,0.20)' : 'var(--parchment-3)',
                  color: isActive ? 'var(--gold-soft)' : 'var(--slate)',
                }}>{String(count).padStart(2,'0')}</span>
              </button>
            );
          })}
        </div>

        {/* SCROLLABLE LANDMARK ROWS */}
        <div className="scroll" key={activeCat} style={{
          flex: 1, overflowY: 'auto', padding:'10px 24px 24px',
          animation:'ltLocTabSlide 360ms ease both',
        }}>
          {itemsForCat.map((p, i) => {
            const IconC = Icons[p.icon] || Icons.location;
            const hasDot = !!LT_LOC_POS[p.label];
            return (
              <div key={p.label} style={{
                display:'flex', alignItems:'center', gap: 18,
                padding:'18px 18px', marginTop: i === 0 ? 0 : 10,
                borderRadius: 16,
                background: i % 2 === 0 ? 'transparent' : 'rgba(244,237,218,0.4)',
                border:'1px solid transparent',
                animation:`ltLocRowIn 360ms cubic-bezier(0.22,1,0.36,1) ${Math.min(i, 14) * 35}ms both`,
              }}>
                {/* category icon disc */}
                <div style={{
                  flexShrink: 0,
                  width: 54, height: 54, borderRadius: 14,
                  background:'linear-gradient(180deg, var(--parchment) 0%, var(--parchment-2) 100%)',
                  border:'1px solid var(--line)',
                  color:'var(--forest)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 4px 10px rgba(20,30,18,0.06)',
                }}>
                  <span style={{display:'inline-flex', width: 28, height: 28}}><IconC/></span>
                </div>

                {/* label */}
                <div style={{flex: 1, minWidth: 0}}>
                  <div className="serif" style={{
                    fontSize: 24, fontWeight: 500, lineHeight: 1.2, letterSpacing:'-0.005em',
                    color:'var(--ink)',
                  }}>
                    {p.label}
                  </div>
                  {hasDot && (
                    <div className="mono" style={{
                      fontSize: 11, letterSpacing:'0.26em', textTransform:'uppercase',
                      color:'var(--gold-deep)', marginTop: 4,
                    }}>· marked on map</div>
                  )}
                </div>

                {/* distance pill */}
                <div style={{
                  flexShrink: 0,
                  padding:'10px 18px', borderRadius: 999,
                  background: 'linear-gradient(180deg, var(--gold-soft) 0%, var(--gold) 100%)',
                  color:'#1a1206',
                  fontFamily:'JetBrains Mono, monospace',
                  fontSize: 16, letterSpacing:'0.10em', fontWeight: 700,
                  boxShadow:'0 4px 10px rgba(201,168,101,0.32)',
                  whiteSpace:'nowrap',
                }}>{p.dist}</div>
              </div>
            );
          })}
        </div>

        {/* SWIPE-HINT FOOTER */}
        <div style={{
          padding:'12px 24px 14px',
          borderTop:'1px solid var(--line)',
          display:'flex', alignItems:'center', justifyContent:'center', gap: 10,
          background:'var(--parchment)',
        }}>
          <span className="touch-pulse" style={{display:'inline-flex', width: 22, height: 22, color:'var(--gold-deep)'}}>
            <Icons.swipe/>
          </span>
          <span className="mono" style={{
            fontSize: 11, letterSpacing:'0.32em', color:'var(--slate)', textTransform:'uppercase',
          }}>Swipe to switch category</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM STRIP — 4 connectivity highlight cards                  */}
      {/* ============================================================ */}
      <div style={{
        position:'absolute',
        bottom: footerH + 12, left: padX, right: padX, height: stripH,
        display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 18,
        zIndex: 5,
      }}>
        {connectivityHighlights.map((p, i) => {
          const IconC = Icons[p.icon] || Icons.road;
          return (
            <div key={p.label} style={{
              borderRadius: 22,
              padding:'22px 26px',
              background:'linear-gradient(180deg, var(--forest) 0%, var(--forest-deep) 100%)',
              color:'var(--on-tile)',
              border:'1px solid rgba(232,216,168,0.30)',
              boxShadow:'0 16px 36px rgba(20,30,18,0.28), 0 0 0 1px rgba(232,216,168,0.08) inset',
              display:'flex', alignItems:'center', gap: 22,
              animation:`ltLocRowIn 480ms cubic-bezier(0.22,1,0.36,1) ${i * 80}ms both`,
            }}>
              {/* big distance numeral */}
              <div style={{
                flexShrink: 0, textAlign:'center', minWidth: 110,
                padding:'10px 14px', borderRadius: 14,
                background:'rgba(232,216,168,0.10)',
                border:'1px solid rgba(232,216,168,0.28)',
              }}>
                <div className="serif" style={{
                  fontSize: 44, lineHeight: 0.95, fontWeight: 400, color:'var(--gold-soft)',
                  letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums',
                }}>{p.dist.split(' ')[0]}</div>
                <div className="mono" style={{
                  fontSize: 10, letterSpacing:'0.32em', color:'rgba(232,216,168,0.65)',
                  textTransform:'uppercase', marginTop: 2,
                }}>{p.dist.split(' ').slice(1).join(' ') || 'min'}</div>
              </div>

              <div style={{flex: 1, minWidth: 0}}>
                <div className="mono" style={{
                  fontSize: 11, letterSpacing:'0.32em', color:'rgba(232,216,168,0.65)', textTransform:'uppercase',
                }}>Connectivity</div>
                <div className="serif" style={{
                  fontSize: 22, fontWeight: 500, color:'var(--on-tile)', marginTop: 4,
                  lineHeight: 1.16, letterSpacing:'-0.005em',
                }}>
                  {p.label}
                </div>
              </div>

              <div style={{
                flexShrink: 0,
                width: 46, height: 46, borderRadius: 12,
                background:'rgba(232,216,168,0.14)',
                border:'1px solid rgba(232,216,168,0.32)',
                color:'var(--gold-soft)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <span style={{display:'inline-flex', width: 26, height: 26}}><IconC/></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* FOOTER — full address line                                     */}
      {/* ============================================================ */}
      <div style={{
        position:'absolute', bottom: 0, left: 0, right: 0, height: footerH,
        background:'var(--forest-deep)',
        borderTop:'1px solid rgba(232,216,168,0.28)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 64px', zIndex: 6,
      }}>
        <div style={{display:'flex', alignItems:'center', gap: 14}}>
          <span style={{display:'inline-flex', width: 22, height: 22, color:'var(--gold-soft)'}}>
            <Icons.location/>
          </span>
          <span style={{fontSize: 17, color:'rgba(245,239,217,0.92)', letterSpacing:'0.005em'}}>
            {PROJECT.location.address}
          </span>
        </div>
        <div className="mono" style={{
          fontSize: 12, letterSpacing:'0.32em', color:'rgba(232,216,168,0.62)', textTransform:'uppercase',
        }}>RERA · {PROJECT.rera.split('/').slice(-2).join('/')}</div>
      </div>
    </div>
  );
}

window.LocationScreen = LocationScreen;
