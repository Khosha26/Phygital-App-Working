// NORTH BANGALORE — investment thesis screen.
//
// Layout (2560 × 1600):
//   • Top section (~830h): "5 Reasons to Invest in North Bangalore" as a
//     swipeable horizontal card. Big serif numeral + title + body. Step dots
//     and arrow buttons for tap navigation.
//   • Bottom section (~530h): "The KIADB Advantage" — 4 forest-green pillar
//     cards (kiadb / design / roots / double) with icon + title + bullet list.
//
// Ambient: LeafField only (heavier screen — no TreeSketch). BurstLayer for
// tap reward when user advances a reason or taps a pillar.

function NorthBangalore() {
  const t = useLoop();
  const headerH = 150;
  const [idx, setIdx] = React.useState(0);
  const [bursts, fireBurst] = useBurst();
  const total = NORTH_REASONS.length;

  const next = () => setIdx(i => (i + 1) % total);
  const prev = () => setIdx(i => (i - 1 + total) % total);

  const fireAt = (e) => {
    const host = e.currentTarget.closest('[data-north-root]');
    if (!host) return;
    const r = host.getBoundingClientRect();
    const x = (e.clientX - r.left) / (r.width / 2560);
    const y = (e.clientY - r.top)  / (r.height / 1600);
    fireBurst(x, y, { count: 11 });
  };

  const swipeHandlers = useSwipe({
    onLeft:  () => { setIdx(i => (i + 1) % total); },
    onRight: () => { setIdx(i => (i - 1 + total) % total); },
    threshold: 50,
  });

  return (
    <div data-north-root style={{position:'absolute', inset:0, background:'var(--parchment)', color:'var(--ink)', overflow:'hidden'}}>
      <LeafField count={14} opacity={0.42} goldRatio={0.3}/>

      {/* faint warm glow under the reasons block */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex: 1,
        background:'radial-gradient(ellipse at 50% 38%, rgba(232,216,168,0.22) 0%, transparent 55%)',
      }}/>

      <ScreenHeader title="North Bangalore" sub="5 Reasons + The KIADB Advantage"/>

      {/* ============ TOP — 5 reasons swipeable carousel ============ */}
      <div style={{
        position:'absolute', top: headerH + 22, left: 96, right: 96,
        height: 760, zIndex: 3,
      }}>
        {/* section eyebrow */}
        <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 18}}>
          <div>
            <div className="eyebrow" style={{color:'var(--gold-deep)', fontSize: 14, letterSpacing:'0.34em'}}>
              FIVE REASONS TO INVEST
            </div>
            <div className="serif" style={{
              fontSize: 56, fontWeight: 400, color:'var(--forest-deep)',
              letterSpacing:'-0.018em', lineHeight: 1, marginTop: 8,
            }}>
              Why <em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>North Bangalore</em> is the city’s next centre.
            </div>
          </div>
          <div className="mono" style={{fontSize: 14, letterSpacing:'0.32em', color:'var(--slate)'}}>
            {String(idx+1).padStart(2,'0')} / {String(total).padStart(2,'0')}
          </div>
        </div>

        {/* swipeable card stage */}
        <div
          {...swipeHandlers}
          style={{
            position:'relative', height: 580, marginTop: 12,
            borderRadius: 28, overflow:'hidden',
            background:'linear-gradient(180deg, var(--ivory) 0%, var(--parchment-2) 100%)',
            border:'1px solid var(--line)',
            boxShadow:'0 22px 56px rgba(46,74,44,0.16), inset 0 1px 0 rgba(255,255,255,0.6)',
            cursor:'grab',
          }}>
          {/* watermark numeral - very faint */}
          <div className="serif" style={{
            position:'absolute', right: -40, top: -120,
            fontSize: 720, fontWeight: 300, color:'var(--gold)',
            opacity: 0.06, lineHeight: 1, pointerEvents:'none',
            letterSpacing:'-0.06em',
          }}>{NORTH_REASONS[idx].n}</div>

          {/* slide content */}
          {NORTH_REASONS.map((r, i) => {
            const active = i === idx;
            return (
              <div key={r.n} style={{
                position:'absolute', inset:0,
                padding:'68px 80px',
                display:'flex', flexDirection:'column', justifyContent:'space-between',
                opacity: active ? 1 : 0,
                transform: active ? 'translateX(0)' : `translateX(${(i - idx) * 60}px)`,
                transition:'opacity 420ms cubic-bezier(0.22,1,0.36,1), transform 420ms cubic-bezier(0.22,1,0.36,1)',
                pointerEvents: active ? 'auto' : 'none',
              }}>
                <div style={{display:'flex', alignItems:'flex-start', gap: 64}}>
                  <div className="serif" style={{
                    fontSize: 360, fontWeight: 300, lineHeight: 0.82,
                    color:'var(--gold-deep)', letterSpacing:'-0.045em',
                    fontVariantNumeric:'tabular-nums',
                  }}>{r.n}</div>

                  <div style={{flex:1, paddingTop: 36}}>
                    <div className="eyebrow forest" style={{fontSize: 14, letterSpacing:'0.34em', marginBottom: 18}}>
                      REASON {r.n}
                    </div>
                    <div className="serif" style={{
                      fontSize: 96, fontWeight: 400, lineHeight: 1.0,
                      color:'var(--forest-deep)', letterSpacing:'-0.025em', maxWidth: 1200,
                    }}>{r.title}</div>
                    <div style={{
                      fontSize: 26, lineHeight: 1.55, color:'var(--graphite)',
                      marginTop: 28, maxWidth: 1180, fontWeight: 400,
                    }}>{r.body}</div>
                  </div>
                </div>

                {/* footer controls inside the card */}
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <button onClick={(e) => { prev(); fireAt(e); }}
                    style={{
                      pointerEvents:'auto',
                      display:'inline-flex', alignItems:'center', gap: 14,
                      padding:'18px 28px', borderRadius: 999,
                      border:'1px solid var(--line)', background:'transparent',
                      color:'var(--forest-deep)', fontFamily:'JetBrains Mono, ui-monospace, monospace',
                      fontSize: 16, letterSpacing:'0.18em', textTransform:'uppercase',
                    }}>
                    <span style={{display:'inline-flex', width: 22, height: 22}}><Icons.back/></span>
                    Prev
                  </button>

                  {/* step dots */}
                  <div style={{display:'flex', gap: 14, alignItems:'center'}}>
                    {NORTH_REASONS.map((_, j) => (
                      <button key={j} onClick={() => setIdx(j)}
                        aria-label={`Reason ${j+1}`}
                        style={{
                          pointerEvents:'auto',
                          width: j === idx ? 36 : 10, height: 10, borderRadius: 999,
                          background: j === idx ? 'var(--gold-deep)' : 'rgba(46,74,44,0.18)',
                          border:'none', padding: 0, cursor:'pointer',
                          transition:'all 280ms cubic-bezier(0.22,1,0.36,1)',
                          boxShadow: j === idx ? '0 0 14px rgba(201,168,101,0.45)' : 'none',
                        }}/>
                    ))}
                  </div>

                  <button onClick={(e) => { next(); fireAt(e); }}
                    style={{
                      pointerEvents:'auto',
                      display:'inline-flex', alignItems:'center', gap: 14,
                      padding:'20px 32px', borderRadius: 999,
                      border:'1px solid var(--gold-deep)',
                      background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
                      color:'#1a1f17', fontFamily:'JetBrains Mono, ui-monospace, monospace',
                      fontSize: 16, letterSpacing:'0.2em', textTransform:'uppercase', fontWeight: 700,
                      boxShadow:'0 14px 30px rgba(176,142,69,0.35), inset 0 1px 0 rgba(255,255,255,0.42)',
                    }}>
                    Next
                    <span style={{display:'inline-flex', width: 22, height: 22}}><Icons.arrow/></span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============ BOTTOM — The KIADB Advantage : 4 pillars ============ */}
      <div style={{
        position:'absolute', top: headerH + 22 + 760 + 32, left: 96, right: 96, bottom: 56,
        zIndex: 3, display:'flex', flexDirection:'column',
      }}>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 18}}>
          <div className="serif" style={{
            fontSize: 52, fontWeight: 400, color:'var(--forest-deep)',
            letterSpacing:'-0.015em', lineHeight: 1,
          }}>
            The <em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>KIADB</em> Advantage.
          </div>
          <div className="eyebrow" style={{color:'var(--slate)', fontSize: 13, letterSpacing:'0.34em'}}>
            FOUR PILLARS · WHY LIVINGTREE
          </div>
        </div>

        <div style={{
          flex:1,
          display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 22,
        }}>
          {USPS.map((u, i) => {
            const local = clamp((t - 0.2 - i*0.12)/0.6, 0, 1);
            const e = ease.outQuart(local);
            const Ico = Icons[u.icon] || Icons.shield;
            return (
              <div key={u.id}
                onClick={fireAt}
                style={{
                  position:'relative', cursor:'pointer',
                  borderRadius: 22, overflow:'hidden',
                  background:'linear-gradient(165deg, var(--tile) 0%, var(--tile-deep) 100%)',
                  border:'1px solid rgba(201,168,101,0.28)',
                  boxShadow:'0 18px 42px rgba(20,30,18,0.32), inset 0 1px 0 rgba(255,246,224,0.16)',
                  padding:'34px 30px 28px',
                  display:'flex', flexDirection:'column', gap: 16,
                  color:'var(--on-tile)',
                  opacity: e, transform:`translateY(${(1-e)*22}px)`,
                  transition:'transform 240ms ease, box-shadow 240ms ease',
                }}>
                {/* number marker top-right */}
                <div className="mono" style={{
                  position:'absolute', top: 22, right: 26,
                  fontSize: 13, letterSpacing:'0.32em', color:'rgba(232,216,168,0.55)',
                }}>0{i+1}</div>

                <div style={{
                  width: 56, height: 56, color:'var(--gold-soft)',
                }}>
                  <Ico/>
                </div>

                <div className="serif" style={{
                  fontSize: 38, fontWeight: 500, lineHeight: 1.05,
                  color:'var(--on-tile)', letterSpacing:'-0.012em',
                  borderBottom:'1px solid rgba(232,216,168,0.18)', paddingBottom: 14,
                  maxWidth: '92%',
                }}>{u.title}</div>

                <ul style={{
                  margin: 0, padding: 0, listStyle:'none',
                  display:'flex', flexDirection:'column', gap: 10,
                  flex: 1,
                }}>
                  {u.points.map((p, j) => (
                    <li key={j} style={{
                      display:'flex', alignItems:'flex-start', gap: 12,
                      fontSize: 15.5, lineHeight: 1.45,
                      color:'rgba(245,239,217,0.88)',
                    }}>
                      <span style={{
                        flexShrink: 0, marginTop: 8,
                        width: 6, height: 6, borderRadius:'50%',
                        background:'var(--gold)',
                        boxShadow:'0 0 0 3px rgba(201,168,101,0.18)',
                      }}/>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <BurstLayer bursts={bursts}/>
    </div>
  );
}

window.NorthBangalore = NorthBangalore;
