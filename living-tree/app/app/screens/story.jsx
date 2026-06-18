// THE STORY — editorial narrative for LivingTree by Kalyani Developers.
//
// Layout (2560 × 1600, header consumes top ~150):
//   • Hero block (left ~1500w): italic eyebrow → towering serif headline →
//     two-column body paragraph anchored by a left gold rule.
//   • Right column (~880w): three large CounterFlip stat cards stacked.
//   • Mid band: chip rail of KALYANI_DOMAINS — leaf-shaped pill chips.
//   • Footer: hanging-branch timeline — Founded · Diversified · LivingTree.
//
// Ambient: LeafField (18 leaves) over parchment. No TreeSketch (Story already
// dense enough; the canopy lives on the home screen). Tapping a stat fires a
// BurstLayer reward.

function Story() {
  const t = useLoop();
  const [bursts, fireBurst] = useBurst();
  const headerH = 150;

  const onStatTap = (e) => {
    const host = e.currentTarget.closest('[data-story-root]');
    if (!host) return;
    const r = host.getBoundingClientRect();
    const x = (e.clientX - r.left) / (r.width / 2560);
    const y = (e.clientY - r.top)  / (r.height / 1600);
    fireBurst(x, y, { count: 13, palette: ['#c9a865','#e8d8a8','#a8c293','#4d6a44','#fbf6ea'] });
  };

  return (
    <div data-story-root style={{position:'absolute', inset:0, background:'var(--parchment)', color:'var(--ink)', overflow:'hidden'}}>
      {/* ambient leaf drift */}
      <LeafField count={18} opacity={0.55} goldRatio={0.28}/>

      {/* faint parchment vignette so the editorial column has a soft ground */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:1,
        background:'radial-gradient(ellipse at 30% 35%, rgba(251,246,234,0.55) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(232,216,168,0.18) 0%, transparent 60%)',
      }}/>

      <ScreenHeader title="The Story" sub="Kalyani Developers · 30+ years rooted"/>

      {/* ============ EDITORIAL CANVAS ============ */}
      <div style={{
        position:'absolute', top: headerH + 30, left: 96, right: 96, bottom: 0,
        display:'grid', gridTemplateColumns:'1.55fr 1fr', gap: 88, zIndex: 3,
      }}>

        {/* ===== LEFT COLUMN — eyebrow + headline + 2-col body + tagline ===== */}
        <div style={{display:'flex', flexDirection:'column', justifyContent:'flex-start', paddingTop: 24}}>
          <div className="eyebrow" style={{
            color:'var(--gold-deep)', fontStyle:'italic', fontFamily:"'Cormorant Garamond', serif",
            fontSize: 26, letterSpacing:'0.18em', textTransform:'none', fontWeight: 400,
          }}>
            — Designed for Four Generations
          </div>

          <h1 className="serif" style={{
            fontSize: 178, fontWeight: 300, lineHeight: 0.92, letterSpacing:'-0.035em',
            color:'var(--forest-deep)', margin: '24px 0 0',
          }}>
            Rooted in <em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>luxury,</em>
            <span style={{display:'block', marginTop: 4}}>branching into</span>
            <span style={{display:'block', marginTop: 4}}>the future.</span>
          </h1>

          {/* body — two columns of editorial prose */}
          <div style={{
            marginTop: 64,
            display:'grid', gridTemplateColumns:'1fr 1fr', gap: 56,
            paddingLeft: 24, borderLeft:'2px solid var(--gold)',
            maxWidth: 1380,
          }}>
            <p style={{margin:0, fontSize: 24, lineHeight: 1.62, color:'var(--graphite)'}}>
              For three decades Kalyani Developers has shaped the everyday rituals of South India — homes that hold families,
              offices where industries grow up, and showrooms where the country buys its first car.
              <span style={{fontStyle:'italic', color:'var(--forest)'}}> Twelve million square feet</span> of work, built by hand and held to standard.
            </p>
            <p style={{margin:0, fontSize: 24, lineHeight: 1.62, color:'var(--graphite)'}}>
              LivingTree is the next chapter — a 25-acre community in the Hitech Defence &amp; Aerospace Park,
              named after ten trees, watered by twenty acres of open green, and designed so that grandparents,
              parents, children and grandchildren can all find a corner of their own.
            </p>
          </div>

          {/* italic pull-quote */}
          <div style={{marginTop: 56, paddingLeft: 24}}>
            <div className="serif" style={{
              fontSize: 36, fontStyle:'italic', fontWeight: 400, lineHeight: 1.35,
              color:'var(--forest-deep)', letterSpacing:'-0.005em', maxWidth: 1180,
            }}>
              “Every project we build is one more ring in the trunk —
              <span style={{color:'var(--gold-deep)'}}> proof that we’ve been here, quietly, for a long time.</span>”
            </div>
            <div className="mono" style={{
              fontSize: 14, letterSpacing:'0.32em', color:'var(--slate)',
              marginTop: 18, textTransform:'uppercase',
            }}>— The Kalyani philosophy</div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN — three large stat cards ===== */}
        <div style={{display:'flex', flexDirection:'column', gap: 28, paddingTop: 24}}>
          <div className="eyebrow forest" style={{fontSize: 14, letterSpacing:'0.34em', marginBottom: 4}}>
            BY THE NUMBERS
          </div>

          {KALYANI_STATS.map((s, i) => {
            const local = clamp((t - 0.25 - i*0.18)/0.7, 0, 1);
            const e = ease.outQuart(local);
            // parse stat: numeric token + suffix
            const m = s.value.match(/^([\d.,]+)(.*)$/);
            const numeric = m ? parseFloat(m[1].replace(/,/g,'')) : null;
            const suffix  = m ? m[2] : '';

            return (
              <div key={i}
                onClick={onStatTap}
                style={{
                  position:'relative', cursor:'pointer',
                  padding:'40px 42px 36px',
                  borderRadius: 22,
                  background:'linear-gradient(180deg, var(--ivory) 0%, var(--parchment-2) 100%)',
                  border:'1px solid var(--line)',
                  boxShadow:'0 14px 38px rgba(46,74,44,0.10), inset 0 1px 0 rgba(255,255,255,0.6)',
                  opacity: e, transform:`translateX(${(1-e)*32}px)`,
                  transition:'transform 240ms ease, box-shadow 240ms ease',
                }}>
                {/* corner leaf accent */}
                <div style={{
                  position:'absolute', top: 16, right: 18,
                  width: 28, height: 28, color:'var(--gold)', opacity: 0.55,
                }}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 C 16 6 16 14 12 22 C 8 14 8 6 12 2 Z"/></svg>
                </div>

                <div className="serif" style={{
                  fontSize: 96, fontWeight: 400, lineHeight: 0.95,
                  color:'var(--forest-deep)', letterSpacing:'-0.03em',
                  fontVariantNumeric:'tabular-nums',
                }}>
                  {numeric != null ? (
                    <>
                      <CounterFlip value={Math.floor(numeric)} duration={1.4} delay={0.15 + i*0.18}/>
                      <span style={{fontStyle:'italic', color:'var(--gold-deep)', fontSize: 56, marginLeft: 8, fontWeight: 300}}>{suffix}</span>
                    </>
                  ) : s.value}
                </div>

                <div style={{
                  fontSize: 20, color:'var(--graphite)', lineHeight: 1.45,
                  marginTop: 14, maxWidth: 540,
                }}>
                  {s.label}
                </div>
              </div>
            );
          })}

          {/* domain chip rail */}
          <div style={{marginTop: 12}}>
            <div className="eyebrow forest" style={{fontSize: 13, letterSpacing:'0.34em', marginBottom: 16}}>
              ACROSS SIX DOMAINS
            </div>
            <div style={{display:'flex', flexWrap:'wrap', gap: 12}}>
              {KALYANI_DOMAINS.map((d, i) => {
                const local = clamp((t - 0.9 - i*0.07)/0.5, 0, 1);
                const e = ease.outQuart(local);
                return (
                  <div key={d} style={{
                    display:'inline-flex', alignItems:'center', gap: 10,
                    padding:'14px 22px 14px 18px',
                    borderRadius: '999px 4px 999px 4px',
                    background:'var(--tile)', color:'var(--on-tile)',
                    border:'1px solid rgba(201,168,101,0.35)',
                    boxShadow:'0 6px 14px rgba(31,53,34,0.18)',
                    fontSize: 16, letterSpacing:'0.04em',
                    opacity: e, transform:`translateY(${(1-e)*10}px)`,
                  }}>
                    <span style={{
                      display:'inline-block', width: 8, height: 8, borderRadius:'50%',
                      background:'var(--gold)',
                    }}/>
                    {d}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ============ FOOTER TIMELINE — branch with 3 milestones ============ */}
      <div style={{
        position:'absolute', left: 96, right: 96, bottom: 56,
        zIndex: 3, pointerEvents:'none',
      }}>
        <TimelineBranch t={t}/>
      </div>

      <BurstLayer bursts={bursts}/>
    </div>
  );
}

// ===== Timeline as a hanging branch with three fruits =====
function TimelineBranch({ t }) {
  const milestones = [
    { yr: '1992', title: 'Founded', body: 'Kalyani begins building in South India.' },
    { yr: '2008', title: 'Diversified', body: 'Offices, automobile retail, hospitality, green energy.' },
    { yr: '2024', title: 'LivingTree', body: '25-acre flagship in North Bangalore.' },
  ];
  return (
    <div style={{position:'relative', height: 130}}>
      {/* horizontal branch */}
      <svg viewBox="0 0 2360 60" preserveAspectRatio="none" style={{position:'absolute', top: 0, left: 0, width:'100%', height: 60, opacity: 0.6}}>
        <path d="M 20 30 C 600 12 1200 48 1760 28 C 2000 20 2160 32 2340 26"
              stroke="var(--gold-deep)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        {/* tiny leaves along the branch */}
        {[0.18, 0.42, 0.68, 0.88].map((p, i) => (
          <g key={i} transform={`translate(${2340*p}, 22) rotate(${i*22 - 18})`}>
            <path d="M 0 -8 C 4 -4 4 4 0 8 C -4 4 -4 -4 0 -8 Z" fill="var(--forest-soft)" opacity="0.75"/>
          </g>
        ))}
      </svg>

      {/* hanging milestones */}
      <div style={{
        position:'absolute', top: 28, left: 0, right: 0,
        display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 64,
      }}>
        {milestones.map((m, i) => {
          const local = clamp((t - 1.2 - i*0.18)/0.7, 0, 1);
          const e = ease.outQuart(local);
          return (
            <div key={i} style={{
              display:'flex', flexDirection:'column', alignItems:'flex-start', gap: 4,
              opacity: e, transform:`translateY(${(1-e)*16}px)`,
              paddingLeft: i === 0 ? 0 : i === 2 ? 'auto' : 60,
              justifySelf: i === 0 ? 'start' : i === 1 ? 'center' : 'end',
              textAlign: i === 2 ? 'right' : 'left',
            }}>
              {/* hanging stem + fruit */}
              <div style={{display:'flex', flexDirection:'column', alignItems: i === 2 ? 'flex-end' : 'flex-start'}}>
                <div style={{
                  width: 1.5, height: 22,
                  background:'linear-gradient(180deg, var(--gold-deep), var(--gold))',
                }}/>
                <div style={{
                  width: 12, height: 12, borderRadius:'50%',
                  background:'var(--gold-deep)',
                  boxShadow:'0 0 0 4px rgba(201,168,101,0.22)',
                  marginTop: -2,
                }}/>
              </div>
              <div className="mono" style={{
                fontSize: 13, letterSpacing:'0.34em', color:'var(--gold-deep)',
                marginTop: 8, textTransform:'uppercase',
              }}>{m.yr}</div>
              <div className="serif" style={{
                fontSize: 36, fontWeight: 500, color:'var(--forest-deep)',
                letterSpacing:'-0.01em', lineHeight: 1.05,
              }}>{m.title}</div>
              <div style={{fontSize: 16, color:'var(--slate)', lineHeight: 1.45, maxWidth: 320, marginTop: 2}}>
                {m.body}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.Story = Story;
