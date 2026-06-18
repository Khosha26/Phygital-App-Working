// AMENITIES — 65 amenities across two clubhouses, organised by 5 categories.
//
// Layout (2560 × 1600, header consumes top ~150):
//   • Hero callout band ("Double Everything") in deep forest, gold rule, with
//     the masterplan-legend hint anchoring the reader.
//   • Category chips row: All / Sport / Social / Wellness / Family / Water.
//     Each chip shows category icon + live count. Selected chip = gold band.
//     Swipe LEFT/RIGHT on chip row cycles through categories.
//   • Tile grid below: every amenity in the active category gets a leaf-style
//     card. Each card carries the masterplan-legend NUMBER (top-left, gold)
//     so the rep can say "amenity 36 — infinity edge — here on the plan."
//   • Bottom CTA strip: jump to masterplan.
//
// Embodied: a luxury-realty UX designer would resist filling space with stock
// photos here. The masterplan number IS the connective tissue — show it loud.

function Amenities() {
  const t = useLoop();
  const [active, setActive] = React.useState('All');
  const [bursts, fireBurst] = useBurst(900);
  const [tapped, setTapped] = React.useState(null);    // amenity n that was last tapped (for the gold highlight)
  const headerH = 150;

  const CATS = ['All', ...AMENITIES.map(a => a.cat)];

  // Flattened pool used for "All" view + counts.
  const allItems = React.useMemo(() => {
    const out = [];
    AMENITIES.forEach(a => a.items.forEach(it => out.push({ ...it, cat: a.cat, icon: a.icon })));
    return out;
  }, []);

  const tiles = React.useMemo(() => {
    if (active === 'All') return allItems;
    const grp = AMENITIES.find(a => a.cat === active);
    return grp ? grp.items.map(it => ({ ...it, cat: grp.cat, icon: grp.icon })) : [];
  }, [active, allItems]);

  const totalAcross = allItems.length;

  // Chip swipe
  const chipSwipe = useSwipe({
    onLeft: () => {
      const i = CATS.indexOf(active);
      setActive(CATS[(i + 1) % CATS.length]);
    },
    onRight: () => {
      const i = CATS.indexOf(active);
      setActive(CATS[(i - 1 + CATS.length) % CATS.length]);
    },
  });

  const onTileTap = (e, n) => {
    const host = e.currentTarget.closest('[data-amenities-root]');
    if (host) {
      const r = host.getBoundingClientRect();
      const x = (e.clientX - r.left) / (r.width / 2560);
      const y = (e.clientY - r.top)  / (r.height / 1600);
      fireBurst(x, y, { count: 11 });
    }
    setTapped(n);
    window.setTimeout(() => setTapped(curr => (curr === n ? null : curr)), 1200);
  };

  const catCount = (c) => c === 'All' ? totalAcross
    : (AMENITIES.find(a => a.cat === c)?.items.length || 0);

  return (
    <div data-amenities-root style={{
      position:'absolute', inset:0, background:'var(--parchment)', color:'var(--ink)', overflow:'hidden',
    }}>
      {/* ambient drifting leaves — kept low so it sits behind the tiles */}
      <LeafField count={14} opacity={0.42} goldRatio={0.32}/>

      <ScreenHeader title="Amenities" sub="65 across both clubhouses · double everything"/>

      {/* === HERO BAND — Double Everything =========================== */}
      <div style={{
        position:'absolute', top: headerH + 36, left: 64, right: 64, height: 192,
        background:'linear-gradient(98deg, var(--forest-deep) 0%, var(--forest) 60%, var(--forest-soft) 100%)',
        color:'var(--on-tile)',
        borderRadius: 28,
        border:'1px solid rgba(232,216,168,0.32)',
        boxShadow:'0 28px 60px rgba(20,30,18,0.32), 0 0 0 1px rgba(232,216,168,0.10) inset',
        padding:'34px 56px',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap: 56,
        zIndex: 3,
      }}>
        <div style={{display:'flex', flexDirection:'column', gap: 14}}>
          <div className="mono" style={{
            fontSize: 16, letterSpacing:'0.42em', color:'var(--gold-soft)', textTransform:'uppercase',
          }}>Double Everything</div>
          <div className="serif" style={{
            fontSize: 64, fontWeight: 400, lineHeight: 1.02, letterSpacing:'-0.018em',
            color:'var(--on-tile)',
          }}>
            Two clubhouses. Two pools.
            <em style={{fontStyle:'italic', color:'var(--gold-soft)'}}> Sixty-five reasons.</em>
          </div>
        </div>

        {/* live counter — the "65" number is the whole point */}
        <div style={{display:'flex', alignItems:'center', gap: 34}}>
          <div style={{width: 1, height: 130, background:'rgba(232,216,168,0.28)'}}/>
          <div style={{textAlign:'right'}}>
            <div className="serif" style={{
              fontSize: 132, lineHeight: 0.9, fontWeight: 300, color:'var(--gold-soft)',
              letterSpacing:'-0.04em', fontVariantNumeric:'tabular-nums',
            }}>
              <CounterFlip value={totalAcross} duration={1.4} delay={0.2}/>
            </div>
            <div className="mono" style={{
              fontSize: 14, letterSpacing:'0.36em', color:'rgba(245,239,217,0.7)',
              textTransform:'uppercase', marginTop: 6,
            }}>amenities mapped</div>
          </div>
        </div>
      </div>

      {/* === CATEGORY CHIP ROW ====================================== */}
      <div {...chipSwipe} style={{
        position:'absolute', top: headerH + 36 + 192 + 28, left: 0, right: 0,
        zIndex: 5,
      }}>
        <div className="scroll" style={{
          display:'flex', gap: 18, padding:'8px 64px 18px',
          overflowX:'auto', whiteSpace:'nowrap',
        }}>
          {CATS.map((c) => {
            const isActive = c === active;
            const IconC = c === 'All' ? Icons.amenities : (Icons[(AMENITIES.find(a => a.cat === c) || {}).icon] || Icons.amenities);
            return (
              <button key={c} onClick={() => setActive(c)} style={{
                flexShrink: 0,
                minHeight: 72,
                display:'inline-flex', alignItems:'center', gap: 14,
                padding:'18px 30px', borderRadius: 999,
                border:'1.5px solid ' + (isActive ? 'var(--gold-deep)' : 'var(--line)'),
                background: isActive
                  ? 'linear-gradient(180deg, var(--forest) 0%, var(--forest-deep) 100%)'
                  : 'var(--ivory)',
                color: isActive ? 'var(--on-tile)' : 'var(--ink)',
                cursor:'pointer',
                boxShadow: isActive ? '0 14px 32px rgba(20,30,18,0.26), 0 0 0 4px rgba(201,168,101,0.18)'
                                    : '0 4px 12px rgba(20,30,18,0.06)',
                transition:'all 240ms cubic-bezier(0.22,1,0.36,1)',
              }}>
                <span style={{display:'inline-flex', width: 28, height: 28, color: isActive ? 'var(--gold-soft)' : 'var(--forest)'}}>
                  <IconC/>
                </span>
                <span className="serif" style={{
                  fontSize: 26, fontWeight: 500, letterSpacing:'-0.005em',
                }}>{c}</span>
                <span className="mono" style={{
                  fontSize: 14, letterSpacing:'0.18em', fontWeight: 600,
                  padding:'4px 10px', borderRadius: 999,
                  background: isActive ? 'rgba(232,216,168,0.18)' : 'var(--parchment-3)',
                  color: isActive ? 'var(--gold-soft)' : 'var(--slate)',
                }}>{String(catCount(c)).padStart(2,'0')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* === TILE GRID ============================================== */}
      <div className="scroll" style={{
        position:'absolute', top: headerH + 36 + 192 + 28 + 110, left: 64, right: 64, bottom: 140,
        overflowY:'auto', zIndex: 3,
      }}>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(4, 1fr)',
          gap: 22,
          paddingBottom: 24,
        }}>
          {tiles.map((it, i) => {
            const IconC = Icons[it.icon] || Icons.amenities;
            const isHot = tapped === it.n;
            const local = clamp((t - 0.04 * (i % 16)) / 0.5, 0, 1);
            const e = ease.outCubic(local);
            return (
              <button key={`${it.cat}-${it.n}`} onClick={(ev) => onTileTap(ev, it.n)} style={{
                position:'relative',
                minHeight: 168,
                textAlign:'left',
                padding:'24px 26px 22px',
                borderRadius: 22,
                background: isHot
                  ? 'linear-gradient(180deg, var(--gold-soft) 0%, #fff4d3 100%)'
                  : 'var(--ivory)',
                border: '1.5px solid ' + (isHot ? 'var(--gold-deep)' : 'var(--line)'),
                boxShadow: isHot
                  ? '0 22px 44px rgba(176,142,69,0.32), 0 0 0 4px rgba(232,216,168,0.45)'
                  : '0 6px 18px rgba(20,30,18,0.06)',
                cursor:'pointer',
                opacity: e,
                transform: `translateY(${(1 - e) * 14}px)`,
                transition:'background 280ms, border-color 280ms, box-shadow 320ms',
                display:'flex', flexDirection:'column', justifyContent:'space-between', gap: 14,
                overflow:'hidden',
              }}>
                {/* Masterplan-legend number — top-left gold badge */}
                <div style={{
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  width: 54, height: 54, borderRadius:'50%',
                  background: isHot ? 'var(--forest)' : 'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
                  color: isHot ? 'var(--gold-soft)' : '#1a1206',
                  fontFamily:'Cormorant Garamond, serif',
                  fontSize: 26, fontWeight: 600, letterSpacing:'-0.02em',
                  boxShadow: '0 4px 10px rgba(20,30,18,0.18), 0 0 0 3px rgba(255,250,232,0.78) inset',
                }}>{it.n}</div>

                {/* Faded category icon — top-right */}
                <div style={{
                  position:'absolute', top: 22, right: 22,
                  width: 38, height: 38,
                  color: isHot ? 'var(--forest)' : 'var(--leaf-light)',
                  opacity: isHot ? 0.85 : 0.55,
                }}>
                  <IconC/>
                </div>

                {/* Amenity label in serif */}
                <div className="serif" style={{
                  fontSize: 26, lineHeight: 1.16, letterSpacing:'-0.012em',
                  color: isHot ? 'var(--forest-deep)' : 'var(--ink)',
                  fontWeight: 500,
                }}>
                  {it.label}
                </div>

                {/* Tiny meta strip — category name only on All view */}
                {active === 'All' && (
                  <div className="mono" style={{
                    fontSize: 11, letterSpacing:'0.26em', textTransform:'uppercase',
                    color: isHot ? 'var(--forest)' : 'var(--slate)',
                    fontWeight: 600,
                  }}>{it.cat}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* === FOOTER CTA — jump to masterplan ======================== */}
      <button onClick={() => navigate('masterplan')} style={{
        position:'absolute', bottom: 36, left: '50%', transform:'translateX(-50%)',
        minHeight: 76, padding:'22px 42px', borderRadius: 999,
        background:'linear-gradient(180deg, var(--forest) 0%, var(--forest-deep) 100%)',
        color:'var(--on-tile)',
        border:'1px solid rgba(232,216,168,0.42)',
        boxShadow:'0 18px 40px rgba(20,30,18,0.30), 0 0 0 4px rgba(201,168,101,0.18)',
        display:'inline-flex', alignItems:'center', gap: 18,
        cursor:'pointer', zIndex: 6,
      }}>
        <span className="mono" style={{fontSize: 14, letterSpacing:'0.32em', color:'var(--gold-soft)', textTransform:'uppercase'}}>Tap any amenity to find it on</span>
        <span className="serif" style={{fontSize: 26, fontWeight: 500, color:'var(--on-tile)', letterSpacing:'-0.005em'}}>the masterplan</span>
        <span style={{display:'inline-flex', width: 22, height: 22, color:'var(--gold-soft)'}}>
          <Icons.arrow/>
        </span>
      </button>

      <BurstLayer bursts={bursts} zIndex={20}/>
    </div>
  );
}

window.Amenities = Amenities;
