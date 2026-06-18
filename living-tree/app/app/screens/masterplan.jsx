// LivingTree · Master Plan
//
// Most interactive screen in the deck. Layout:
//
//   LEFT (75%)  — assets/renders/masterplan-03.png fills the canvas with
//                 SVG / DOM hotspots overlaid for each of the 10 TOWERS.
//                 Each hotspot is a tappable round dot showing the tower
//                 number; tap → popup card with name, floors, available
//                 / sold counts, typologies, view, and a "View details →"
//                 link that calls navigate('towers/' + tower.id).
//                 Tower hotspots are spread in plausible cluster positions
//                 that mimic the actual masterplan grouping.
//
//   RIGHT (25%) — legend panel:
//                   · top: 2 clubhouse pinpoint cards (Clubhouse 01 / 02)
//                   · mid: 5 amenity-category toggle chips (Sport, Social,
//                          Wellness, Family, Water) — tapping filters
//                          numbered amenity dots on the plan
//                   · bot: density toggle "Show numbers / Hide numbers"
//
//   Bottom hint: "Tap a tree to explore that tower" with touch-pulse.
//
// Embodied: a luxury-realty UX designer playing with a touchscreen — every
// tap target is generous (≥66px), the burst feedback says "yes, I heard you",
// and the masterplan image is the hero so overlays stay quiet until tapped.

const LT_MP_KEYS_ID = 'lt-mp-screen-keys';
function ensureLtMpKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(LT_MP_KEYS_ID)) return;
  const s = document.createElement('style');
  s.id = LT_MP_KEYS_ID;
  s.textContent = `
    @keyframes ltMpDotPulse {
      0%, 100% { box-shadow: 0 6px 16px rgba(20,30,18,0.30),
                              0 0 0 2px rgba(255,250,232,0.92),
                              0 0 0 0   rgba(201,168,101,0); }
      50%      { box-shadow: 0 8px 20px rgba(20,30,18,0.36),
                              0 0 0 2px rgba(255,250,232,0.92),
                              0 0 0 9px rgba(201,168,101,0.34); }
    }
    @keyframes ltMpCardIn {
      0%   { opacity: 0; transform: translateY(14px) scale(0.96); filter: blur(6px); }
      100% { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0);   }
    }
    @keyframes ltMpNumIn {
      0%   { opacity: 0; transform: scale(0.4); }
      100% { opacity: 1; transform: scale(1);   }
    }
    @keyframes ltMpClubPulse {
      0%, 100% { transform: scale(1);    opacity: 0.55; }
      50%      { transform: scale(1.18); opacity: 0.25; }
    }
  `;
  document.head.appendChild(s);
}

// Tower hotspot positions on the masterplan image (0..100% of image).
// Hand-tuned against assets/renders/masterplan-03.png so each hotspot lands
// in the actual tower cluster on the plan.  The plan has Clubhouse 01 at the
// top centre, Clubhouse 02 mid-lower centre, with towers ringing both.
// Layout (rough mental map):
//
//      [01 Aspen]   [02 Chestnut]                    [05 Coral]    [06 Mahogany]
//                       CLUB 01
//      [03 Deodar]                                                 [07 Laurel]
//      [04 Ashoka]      CLUB 02                                    [08 Walnut]
//
//      [09 Tamarind]                                               [10 Plumeria]
//
// (Numbers are tower.no from data.jsx — tree names are the tower.name.)
const LT_TOWER_POS = {
  aspen:    { x: 26, y: 22 },   // 01 — top-left cluster
  chestnut: { x: 38, y: 22 },   // 02
  deodar:   { x: 26, y: 40 },   // 03 — west spine
  ashoka:   { x: 26, y: 55 },   // 04
  coral:    { x: 60, y: 28 },   // 05 — central, sold out
  mahogany: { x: 78, y: 28 },   // 06 — east
  laurel:   { x: 78, y: 44 },   // 07
  walnut:   { x: 78, y: 60 },   // 08
  tamarind: { x: 38, y: 78 },   // 09 — south
  plumeria: { x: 70, y: 78 },   // 10
};

// Clubhouse positions on the masterplan
const LT_CLUB_POS = {
  c1: { x: 52, y: 22, label: 'Clubhouse 01', sub: '~1 lakh sft · north podium' },
  c2: { x: 52, y: 58, label: 'Clubhouse 02', sub: '~1 lakh sft · south podium' },
};

// Approximate positions for each numbered amenity on the masterplan. We
// don't need pixel-perfection — the dots just need to clearly cluster around
// the plan's amenity zones (pool, sport, gardens, etc.).
function ltAmenityPos(n) {
  // Stable pseudo-random distribution clustered by category. Each item's
  // position is derived from its legend number so dots stay put between
  // renders. We bias the placement to keep dots inside the inner ~70% of
  // the plan image (avoiding the legend column on the left).
  const seed = n * 9301 + 49297;
  const r1 = ((seed * 233280) & 0xffff) / 65535;
  const r2 = ((seed * 999983) & 0xffff) / 65535;
  // bias towards centre/right of plan; avoid extreme edges
  const x = 32 + r1 * 60;
  const y = 14 + r2 * 70;
  return { x, y };
}

function MasterPlan() {
  ensureLtMpKeys();
  const t = useLoop();
  const [activeTower, setActiveTower] = React.useState(null);
  const [activeCats, setActiveCats] = React.useState({}); // {Sport:true, ...}
  const [showNumbers, setShowNumbers] = React.useState(false);
  const [bursts, fireBurst] = useBurst(900);
  const [ripples, fireRipple] = useRipple(1200);

  // Layout constants (2560 × 1600)
  const headerH = 150;
  const padX = 64;
  const topY = headerH + 20;
  const bottomGap = 80; // bottom tap-hint band
  const bodyH = 1600 - topY - bottomGap;
  const gap = 24;
  const leftW = Math.round((2560 - padX*2 - gap) * 0.75);
  const rightW = (2560 - padX*2 - gap) - leftW;

  // Active amenities (union of selected categories)
  const visibleAmenities = React.useMemo(() => {
    const cats = Object.keys(activeCats).filter(c => activeCats[c]);
    if (cats.length === 0) return [];
    const out = [];
    AMENITIES.forEach(a => {
      if (cats.includes(a.cat)) {
        a.items.forEach(it => out.push({ ...it, cat: a.cat, icon: a.icon }));
      }
    });
    return out;
  }, [activeCats]);

  // Fire a tap burst at the hotspot's location (in canvas coords)
  const fireAt = (ev) => {
    const bezel = document.querySelector('.tablet-bezel');
    if (!bezel) return;
    const r = bezel.getBoundingClientRect();
    const scaleX = r.width / 2560, scaleY = r.height / 1600;
    const er = ev.currentTarget.getBoundingClientRect();
    const cx = (er.left + er.width/2 - r.left) / scaleX;
    const cy = (er.top  + er.height/2 - r.top)  / scaleY;
    fireBurst(cx, cy, { count: 12 });
    fireRipple(cx, cy);
  };

  const toggleCat = (c) => setActiveCats(s => ({ ...s, [c]: !s[c] }));

  return (
    <div style={{position:'absolute', inset:0, background:'var(--parchment)', color:'var(--ink)', overflow:'hidden'}}>
      {/* very subtle ambient leaves at ≤0.35 so the plan stays primary */}
      <LeafField count={9} opacity={0.22} goldRatio={0.35}/>

      <ScreenHeader title="Master Plan" sub="25 acres · 10 trees · 2 clubhouses · 65 amenities"/>

      {/* ============================================================ */}
      {/* LEFT 75% — masterplan canvas with tower hotspots              */}
      {/* ============================================================ */}
      <div style={{
        position:'absolute',
        top: topY, left: padX, width: leftW, height: bodyH,
        borderRadius: 26, overflow:'hidden',
        background:'linear-gradient(180deg, #f6efdc 0%, #e9e1c8 100%)',
        border:'1px solid rgba(232,216,168,0.40)',
        boxShadow:'0 26px 60px rgba(20,30,18,0.22), 0 0 0 1px rgba(232,216,168,0.10) inset',
      }}>
        {/* Plan image fills its container */}
        <img
          src="assets/renders/masterplan-03.png"
          alt="LivingTree — master plan with 65 amenities"
          style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'contain', objectPosition:'center',
            display:'block',
            filter:'contrast(1.05) saturate(1.05)',
          }}
        />

        {/* TOP-LEFT HUD — project totals */}
        <div style={{
          position:'absolute', top: 22, left: 22, zIndex: 5,
          padding:'16px 22px', borderRadius: 18,
          background:'rgba(255,250,232,0.92)',
          border:'1px solid rgba(176,142,69,0.25)',
          backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
          boxShadow:'0 14px 30px rgba(20,30,18,0.18)',
          display:'flex', alignItems:'center', gap: 22,
        }}>
          <div style={{display:'flex', flexDirection:'column'}}>
            <div className="mono" style={{
              fontSize: 12, letterSpacing:'0.36em', color:'var(--gold-deep)', textTransform:'uppercase',
            }}>The Site</div>
            <div className="serif" style={{
              fontSize: 32, lineHeight: 1, color:'var(--forest)', fontWeight: 500,
              marginTop: 4, letterSpacing:'-0.01em',
            }}>25 acres · 20 open</div>
          </div>
          <div style={{width: 1, height: 44, background:'var(--line)'}}/>
          <div style={{display:'flex', flexDirection:'column'}}>
            <div className="mono" style={{
              fontSize: 11, letterSpacing:'0.32em', color:'var(--slate)', textTransform:'uppercase',
            }}>2,522 apts · 10 towers</div>
            <div className="mono" style={{
              fontSize: 11, letterSpacing:'0.32em', color:'var(--gold-deep)', marginTop: 2, textTransform:'uppercase',
            }}>2 clubs · 65 amenities</div>
          </div>
        </div>

        {/* === TOWER HOTSPOTS ========================================= */}
        {TOWERS.map((tw, i) => {
          const pos = LT_TOWER_POS[tw.id];
          if (!pos) return null;
          const isActive = activeTower === tw.id;
          const local = clamp((t - 0.3 - i*0.06) / 0.7, 0, 1);
          const e = ease.outBack(local);
          const ratio = tw.available / tw.units;
          const statusDot = tw.available === 0 ? 'var(--sold)'
                          : ratio > 0.10 ? 'var(--available)' : 'var(--hold)';

          return (
            <button
              key={tw.id}
              onClick={(ev) => {
                fireAt(ev);
                setActiveTower(isActive ? null : tw.id);
              }}
              style={{
                position:'absolute',
                left: `calc(${pos.x}% - 36px)`,
                top:  `calc(${pos.y}% - 36px)`,
                width: 72, height: 72, borderRadius:'50%',
                padding: 0, cursor:'pointer',
                background: isActive
                  ? 'linear-gradient(155deg, #fff4d2 0%, var(--gold) 60%, var(--gold-deep) 100%)'
                  : 'linear-gradient(155deg, var(--forest) 0%, var(--forest-deep) 100%)',
                color: isActive ? '#1a1206' : 'var(--gold-soft)',
                border: '2px solid ' + (isActive ? '#fff4d2' : 'rgba(232,216,168,0.65)'),
                fontFamily:'Cormorant Garamond, serif', fontWeight: 600, fontSize: 26,
                letterSpacing:'-0.02em',
                zIndex: isActive ? 9 : 6,
                opacity: e,
                transform: `scale(${0.6 + 0.4*e})`,
                boxShadow: isActive
                  ? `0 18px 38px rgba(20,30,18,0.45),
                     0 0 0 5px rgba(255,250,232,0.92),
                     0 0 38px rgba(255,238,180,0.70)`
                  : `0 8px 18px rgba(20,30,18,0.32),
                     0 0 0 2px rgba(255,250,232,0.92)`,
                animation: !isActive
                  ? `ltMpDotPulse 2.8s ease-in-out ${i * 0.18}s infinite`
                  : 'none',
                transition: 'transform 360ms cubic-bezier(0.22,1,0.36,1), background 280ms, box-shadow 320ms, border-color 280ms',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}
              title={tw.name}
            >
              {tw.no}
              {/* status dot */}
              <span style={{
                position:'absolute', top: 6, right: 6,
                width: 12, height: 12, borderRadius:'50%',
                background: statusDot,
                border:'1.5px solid rgba(255,250,232,0.95)',
              }}/>
            </button>
          );
        })}

        {/* === CLUBHOUSE MARKERS (always-on, ornamental) =============== */}
        {Object.entries(LT_CLUB_POS).map(([k, c]) => (
          <div key={k} style={{
            position:'absolute',
            left: `${c.x}%`, top: `${c.y}%`,
            width: 0, height: 0, zIndex: 5, pointerEvents:'none',
          }}>
            <div style={{
              position:'absolute', left: -22, top: -22,
              width: 44, height: 44, borderRadius:'50%',
              background:'rgba(176,142,69,0.32)',
              animation:'ltMpClubPulse 3.4s ease-in-out infinite',
            }}/>
            <div style={{
              position:'absolute', left: -16, top: -16,
              width: 32, height: 32, borderRadius:'50%',
              background:'linear-gradient(155deg, var(--gold-soft) 0%, var(--gold) 50%, var(--gold-deep) 100%)',
              border:'2px solid #fff4d2',
              boxShadow:'0 6px 14px rgba(20,30,18,0.45)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#1a1206',
              fontFamily:'Cinzel, serif', fontWeight: 700, fontSize: 14,
              letterSpacing:'0.04em',
            }}>{k === 'c1' ? '01' : '02'}</div>
          </div>
        ))}

        {/* === FILTERED AMENITY DOTS ================================== */}
        {visibleAmenities.map((a, i) => {
          const pos = ltAmenityPos(a.n);
          const palette = {
            Sport: 'var(--leaf-light)',
            Social: 'var(--gold-soft)',
            Wellness: 'var(--forest-mid)',
            Family: 'var(--kalyani-yellow)',
            Water: '#7aa3c4',
          };
          const color = palette[a.cat] || 'var(--gold)';
          return (
            <div key={a.cat + '-' + a.n} style={{
              position:'absolute',
              left: `${pos.x}%`, top: `${pos.y}%`,
              width: 0, height: 0, zIndex: 4, pointerEvents:'none',
              animation:`ltMpNumIn 420ms cubic-bezier(0.22,1,0.36,1) ${Math.min(i, 30) * 16}ms both`,
            }}>
              <div style={{
                position:'absolute',
                left: -14, top: -14,
                width: 28, height: 28, borderRadius:'50%',
                background: color,
                border:'2px solid #fff4d2',
                boxShadow:'0 5px 12px rgba(20,30,18,0.40)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#1a1206',
                fontFamily:'JetBrains Mono, monospace',
                fontSize: showNumbers ? 11 : 0,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: 0,
                transition: 'font-size 200ms ease',
              }}>{a.n}</div>
            </div>
          );
        })}

        {/* === TOWER DETAIL POPUP ===================================== */}
        {activeTower && (() => {
          const tw = TOWERS.find(x => x.id === activeTower);
          if (!tw) return null;
          const pos = LT_TOWER_POS[tw.id];
          // anchor the popup near the hotspot, but flip to other side if too
          // close to an edge
          const flipX = pos.x > 60;
          const flipY = pos.y > 60;
          return (
            <div key={tw.id} style={{
              position:'absolute',
              left:  flipX ? `calc(${pos.x}% - 460px)` : `calc(${pos.x}% + 56px)`,
              top:   flipY ? `calc(${pos.y}% - 340px)` : `calc(${pos.y}% + 56px)`,
              width: 420, zIndex: 12,
              borderRadius: 22,
              background:'linear-gradient(180deg, #fbf6ea 0%, #f4edda 100%)',
              border:'1px solid rgba(176,142,69,0.42)',
              boxShadow:`
                0 28px 60px rgba(20,30,18,0.40),
                0 0 0 1px rgba(232,216,168,0.20) inset,
                0 0 60px rgba(232,216,168,0.36)
              `,
              animation:'ltMpCardIn 480ms cubic-bezier(0.22,1,0.36,1) both',
              overflow:'hidden',
            }}>
              {/* header strip with tree name + close */}
              <div style={{
                padding:'18px 22px',
                background:'linear-gradient(180deg, var(--forest) 0%, var(--forest-deep) 100%)',
                color:'var(--on-tile)',
                display:'flex', alignItems:'center', justifyContent:'space-between', gap: 16,
              }}>
                <div style={{display:'flex', alignItems:'center', gap: 14, minWidth: 0}}>
                  <div style={{
                    flexShrink: 0,
                    width: 50, height: 50, borderRadius:'50%',
                    background:'linear-gradient(155deg, var(--gold-soft) 0%, var(--gold) 60%, var(--gold-deep) 100%)',
                    color:'#1a1206',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'Cormorant Garamond, serif', fontWeight: 600, fontSize: 22,
                    boxShadow:'0 4px 10px rgba(20,30,18,0.32)',
                    border:'1.5px solid #fff4d2',
                  }}>{tw.no}</div>
                  <div style={{minWidth: 0}}>
                    <div className="mono" style={{
                      fontSize: 11, letterSpacing:'0.32em', color:'rgba(232,216,168,0.65)', textTransform:'uppercase',
                    }}>{tw.cluster}</div>
                    <div className="serif" style={{
                      fontSize: 36, lineHeight: 1, fontWeight: 500, letterSpacing:'-0.01em', marginTop: 2,
                    }}>
                      Tower <em style={{fontStyle:'italic', color:'var(--gold-soft)'}}>{tw.name}</em>
                    </div>
                  </div>
                </div>
                <button onClick={() => setActiveTower(null)} style={{
                  flexShrink: 0,
                  width: 40, height: 40, borderRadius:'50%',
                  background:'rgba(255,250,232,0.12)',
                  border:'1px solid rgba(232,216,168,0.45)',
                  color:'var(--gold-soft)',
                  display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                }}>
                  <Icons.close width={18} height={18}/>
                </button>
              </div>

              {/* body */}
              <div style={{padding:'22px 24px 24px'}}>
                {/* stat row: floors / available / sold */}
                <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 14}}>
                  <Stat label="FLOORS"    value={tw.floors}                color="var(--forest)"/>
                  <Stat label="AVAILABLE" value={tw.available}             color="var(--available)"/>
                  <Stat label="SOLD"      value={`${tw.sold}/${tw.units}`} color="var(--gold-deep)" small/>
                </div>

                {/* sold progress bar */}
                <div style={{marginTop: 18}}>
                  <div style={{
                    height: 8, borderRadius: 4, background:'var(--parchment-3)', overflow:'hidden',
                  }}>
                    <div style={{
                      height:'100%',
                      width: `${(tw.sold / tw.units) * 100}%`,
                      background:'linear-gradient(90deg, var(--gold-deep) 0%, var(--gold) 100%)',
                      borderRadius: 4,
                      transition:'width 720ms cubic-bezier(0.22,1,0.36,1)',
                    }}/>
                  </div>
                  <div className="mono" style={{
                    fontSize: 11, letterSpacing:'0.28em', color:'var(--slate)', textTransform:'uppercase', marginTop: 6,
                  }}>{Math.round((tw.sold / tw.units) * 100)}% sold</div>
                </div>

                {/* typologies hosted */}
                <div style={{marginTop: 18}}>
                  <div className="mono" style={{
                    fontSize: 11, letterSpacing:'0.32em', color:'var(--gold-deep)', textTransform:'uppercase',
                  }}>Typologies</div>
                  <div style={{display:'flex', flexWrap:'wrap', gap: 8, marginTop: 8}}>
                    {tw.typologies.map(t => (
                      <span key={t} style={{
                        padding:'8px 14px', borderRadius: 999,
                        background:'var(--parchment)',
                        border:'1px solid var(--line)',
                        fontSize: 14, color:'var(--ink)', fontWeight: 500,
                      }}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* view */}
                <div style={{
                  marginTop: 18, padding:'12px 14px', borderRadius: 12,
                  background:'rgba(232,216,168,0.18)',
                  border:'1px solid rgba(176,142,69,0.22)',
                }}>
                  <div className="mono" style={{
                    fontSize: 10, letterSpacing:'0.32em', color:'var(--gold-deep)', textTransform:'uppercase',
                  }}>View</div>
                  <div className="serif" style={{
                    fontSize: 18, color:'var(--forest)', marginTop: 2, fontStyle:'italic',
                  }}>{tw.view}</div>
                </div>

                {/* CTA */}
                <button onClick={() => navigate('towers/' + tw.id)} style={{
                  marginTop: 20, width:'100%',
                  padding:'18px 26px', borderRadius: 999,
                  background:'linear-gradient(180deg, var(--forest) 0%, var(--forest-deep) 100%)',
                  color:'var(--on-tile)',
                  border:'1px solid rgba(232,216,168,0.42)',
                  boxShadow:'0 12px 26px rgba(20,30,18,0.30), 0 0 0 4px rgba(201,168,101,0.18)',
                  display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 14,
                  cursor:'pointer',
                  fontFamily:'JetBrains Mono, monospace',
                  fontSize: 14, letterSpacing:'0.24em', textTransform:'uppercase', fontWeight: 700,
                }}>
                  View details
                  <span style={{display:'inline-flex', width: 18, height: 18, color:'var(--gold-soft)'}}>
                    <Icons.arrow/>
                  </span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* burst layer for tap reward */}
        <BurstLayer bursts={bursts} zIndex={20}/>
        <RippleLayer ripples={ripples}/>
      </div>

      {/* ============================================================ */}
      {/* RIGHT 25% — legend panel                                       */}
      {/* ============================================================ */}
      <div style={{
        position:'absolute',
        top: topY, left: padX + leftW + gap, width: rightW, height: bodyH,
        borderRadius: 26, overflow:'hidden',
        background:'var(--ivory)',
        border:'1px solid var(--line)',
        boxShadow:'0 20px 50px rgba(20,30,18,0.10)',
        display:'flex', flexDirection:'column',
      }}>
        {/* CLUBHOUSE BLOCK */}
        <div style={{padding:'24px 22px 16px'}}>
          <div className="mono" style={{
            fontSize: 12, letterSpacing:'0.34em', color:'var(--gold-deep)', textTransform:'uppercase',
          }}>The Two Clubs</div>
          <div className="serif" style={{
            fontSize: 24, lineHeight: 1.1, color:'var(--forest)', fontWeight: 500, marginTop: 4,
            letterSpacing:'-0.005em',
          }}>~1 lakh sft each</div>

          <div style={{marginTop: 14, display:'flex', flexDirection:'column', gap: 12}}>
            {Object.entries(LT_CLUB_POS).map(([k, c]) => (
              <div key={k} style={{
                display:'flex', alignItems:'center', gap: 14,
                padding:'14px 16px', borderRadius: 16,
                background:'linear-gradient(180deg, var(--forest) 0%, var(--forest-deep) 100%)',
                color:'var(--on-tile)',
                border:'1px solid rgba(232,216,168,0.32)',
                boxShadow:'0 10px 24px rgba(20,30,18,0.24)',
              }}>
                <div style={{
                  flexShrink: 0,
                  width: 46, height: 46, borderRadius:'50%',
                  background:'linear-gradient(155deg, var(--gold-soft) 0%, var(--gold) 60%, var(--gold-deep) 100%)',
                  color:'#1a1206',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'Cinzel, serif', fontWeight: 700, fontSize: 16,
                  border:'1.5px solid #fff4d2',
                  boxShadow:'0 4px 10px rgba(20,30,18,0.32)',
                }}>{k === 'c1' ? '01' : '02'}</div>
                <div style={{minWidth: 0}}>
                  <div className="serif" style={{
                    fontSize: 18, lineHeight: 1.15, fontWeight: 500, letterSpacing:'-0.005em',
                  }}>{c.label}</div>
                  <div className="mono" style={{
                    fontSize: 10, letterSpacing:'0.26em', color:'var(--gold-soft)', textTransform:'uppercase', marginTop: 3,
                  }}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CATEGORY CHIPS */}
        <div style={{
          padding:'14px 22px 16px',
          borderTop:'1px solid var(--line)',
          background:'linear-gradient(180deg, var(--ivory) 0%, #f8f1dc 100%)',
        }}>
          <div className="mono" style={{
            fontSize: 12, letterSpacing:'0.34em', color:'var(--gold-deep)', textTransform:'uppercase',
          }}>Filter Amenities</div>
          <div className="serif" style={{
            fontSize: 18, lineHeight: 1.15, color:'var(--slate)', marginTop: 2, fontStyle:'italic',
          }}>Tap to plot numbered dots →</div>

          <div style={{marginTop: 14, display:'flex', flexDirection:'column', gap: 10}}>
            {AMENITIES.map(a => {
              const isOn = !!activeCats[a.cat];
              const IconC = Icons[a.icon] || Icons.amenities;
              return (
                <button key={a.cat} onClick={() => toggleCat(a.cat)} style={{
                  minHeight: 68,
                  display:'flex', alignItems:'center', gap: 14,
                  padding:'14px 16px', borderRadius: 14,
                  border:'1.5px solid ' + (isOn ? 'var(--gold-deep)' : 'var(--line)'),
                  background: isOn
                    ? 'linear-gradient(180deg, var(--gold-soft) 0%, #fff4d2 100%)'
                    : 'var(--ivory)',
                  color:'var(--ink)',
                  cursor:'pointer',
                  boxShadow: isOn
                    ? '0 10px 22px rgba(176,142,69,0.30), 0 0 0 4px rgba(201,168,101,0.22)'
                    : '0 3px 10px rgba(20,30,18,0.05)',
                  transition:'all 220ms cubic-bezier(0.22,1,0.36,1)',
                }}>
                  <span style={{
                    flexShrink: 0,
                    display:'inline-flex', width: 32, height: 32, alignItems:'center', justifyContent:'center',
                    color: isOn ? 'var(--forest)' : 'var(--forest-soft)',
                  }}>
                    <IconC/>
                  </span>
                  <span style={{flex: 1, minWidth: 0, textAlign:'left'}}>
                    <span className="serif" style={{
                      fontSize: 20, fontWeight: 500, letterSpacing:'-0.005em',
                      color: isOn ? 'var(--forest-deep)' : 'var(--ink)',
                    }}>{a.cat}</span>
                  </span>
                  <span className="mono" style={{
                    flexShrink: 0,
                    fontSize: 12, letterSpacing:'0.16em', fontWeight: 700,
                    padding:'4px 10px', borderRadius: 999,
                    background: isOn ? 'var(--forest)' : 'var(--parchment-3)',
                    color: isOn ? 'var(--gold-soft)' : 'var(--slate)',
                  }}>{String(a.items.length).padStart(2,'0')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DENSITY TOGGLE */}
        <div style={{
          marginTop:'auto',
          padding:'18px 22px',
          borderTop:'1px solid var(--line)',
          background:'var(--parchment)',
        }}>
          <button onClick={() => setShowNumbers(s => !s)} style={{
            width:'100%', minHeight: 64,
            padding:'14px 18px', borderRadius: 14,
            border:'1.5px solid ' + (showNumbers ? 'var(--gold-deep)' : 'var(--line)'),
            background: showNumbers
              ? 'linear-gradient(180deg, var(--forest) 0%, var(--forest-deep) 100%)'
              : 'var(--ivory)',
            color: showNumbers ? 'var(--on-tile)' : 'var(--ink)',
            cursor:'pointer',
            boxShadow: showNumbers ? '0 10px 24px rgba(20,30,18,0.24)' : '0 3px 10px rgba(20,30,18,0.05)',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap: 12,
          }}>
            <span className="mono" style={{
              fontSize: 12, letterSpacing:'0.30em', textTransform:'uppercase',
              color: showNumbers ? 'var(--gold-soft)' : 'var(--slate)',
            }}>Show numbers</span>
            <span style={{
              width: 46, height: 26, borderRadius: 999,
              background: showNumbers ? 'var(--gold)' : 'var(--parchment-3)',
              position:'relative',
              transition:'background 220ms',
            }}>
              <span style={{
                position:'absolute', top: 3, left: showNumbers ? 23 : 3,
                width: 20, height: 20, borderRadius:'50%',
                background:'#fff4d2',
                boxShadow:'0 2px 6px rgba(20,30,18,0.3)',
                transition:'left 220ms cubic-bezier(0.22,1,0.36,1)',
              }}/>
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM TAP HINT                                                */}
      {/* ============================================================ */}
      <div style={{
        position:'absolute',
        bottom: 18, left: 0, right: 0, height: 60,
        display:'flex', alignItems:'center', justifyContent:'center', gap: 14,
        zIndex: 6, pointerEvents:'none',
      }}>
        <span className="touch-pulse" style={{
          display:'inline-flex', width: 22, height: 22, color:'var(--gold-deep)',
        }}>
          <Icons.towers/>
        </span>
        <span className="mono" style={{
          fontSize: 13, letterSpacing:'0.34em', color:'var(--slate)', textTransform:'uppercase',
        }}>Tap a tree to explore that tower</span>
      </div>
    </div>
  );
}

// Small helper component for the tower-popup stat row
function Stat({ label, value, color, small }) {
  return (
    <div style={{
      padding:'12px 12px', borderRadius: 12,
      background:'var(--parchment)',
      border:'1px solid var(--line)',
      display:'flex', flexDirection:'column', gap: 4, alignItems:'flex-start',
    }}>
      <div className="mono" style={{
        fontSize: 10, letterSpacing:'0.30em', color:'var(--slate)', textTransform:'uppercase',
      }}>{label}</div>
      <div className="serif" style={{
        fontSize: small ? 22 : 28, lineHeight: 1, fontWeight: 500, color,
        letterSpacing:'-0.01em', fontVariantNumeric:'tabular-nums',
      }}>{value}</div>
    </div>
  );
}

window.MasterPlan = MasterPlan;
