// SPECIFICATIONS — factsheet page 13. 12 build-spec areas, list-detail layout.
//
// Layout (2560 × 1600, header consumes top ~150):
//   LEFT  (28%) — vertical rail of all 12 spec areas. Each row = category icon
//                 + area name. Selected = gold border + leaf-pale fill, forest
//                 text. Default = Structure (first).
//   RIGHT (72%) — selected area's spec items as a checklist (gold tick + serif
//                 text). Big area title with circular icon at top.
//                 Swipe UP/DOWN on the right pane to walk through areas.
//   BOTTOM      — "Industry-leading materials · Triple-tested" credentials strip.
//
// Embodied: a luxury-realty UX designer treats spec sheets as proof, not
// fine-print. The serif checklist + gold ticks turn each line into a promise.
// Background is hushed — Leaf field + aurora at low intensity so the parchment
// reads as paper, not noise.

const SPEC_KEYS_ID = 'lt-spec-fx-keys';
function ensureSpecKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SPEC_KEYS_ID)) return;
  const s = document.createElement('style');
  s.id = SPEC_KEYS_ID;
  s.textContent = `
    @keyframes ltSpecRowIn {
      0%   { opacity: 0; transform: translateY(14px); filter: blur(4px); }
      100% { opacity: 1; transform: translateY(0);    filter: blur(0); }
    }
    @keyframes ltSpecTickIn {
      0%   { transform: scale(0.4) rotate(-10deg); opacity: 0; }
      55%  { transform: scale(1.15) rotate(4deg); opacity: 1; }
      100% { transform: scale(1)    rotate(0deg);  opacity: 1; }
    }
    @keyframes ltSpecRailHint {
      0%, 100% { transform: translateX(0); }
      50%      { transform: translateX(3px); }
    }
  `;
  document.head.appendChild(s);
}

function Specifications() {
  ensureSpecKeys();
  const t = useLoop();
  const headerH = 150;

  const [activeIdx, setActiveIdx] = React.useState(0);
  const active = SPECIFICATIONS[activeIdx];
  const ActiveIcon = Icons[active.icon] || Icons.specs;

  // Swipe UP/DOWN on right pane → walk through areas
  const paneSwipe = useSwipe({
    onUp:   () => setActiveIdx(i => Math.min(SPECIFICATIONS.length - 1, i + 1)),
    onDown: () => setActiveIdx(i => Math.max(0, i - 1)),
    threshold: 50,
  });

  // Scroll the selected rail row into view when it changes via swipe
  const railRef = React.useRef(null);
  React.useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const row = rail.querySelector(`[data-spec-row="${activeIdx}"]`);
    if (!row) return;
    const railRect = rail.getBoundingClientRect();
    const rowRect  = row.getBoundingClientRect();
    if (rowRect.top < railRect.top || rowRect.bottom > railRect.bottom) {
      rail.scrollTo({
        top: row.offsetTop - rail.clientHeight / 2 + row.clientHeight / 2,
        behavior: 'smooth',
      });
    }
  }, [activeIdx]);

  return (
    <div data-specs-root style={{
      position:'absolute', inset:0, background:'var(--parchment)', color:'var(--ink)', overflow:'hidden',
    }}>
      {/* === BACKGROUND — very faint forest ambience ================== */}
      <ForestAurora intensity={0.32}/>
      <LeafField count={10} opacity={0.28} goldRatio={0.30}/>

      <ScreenHeader title="Specifications" sub="Vastu-compliant · built to last"/>

      {/* === LEFT RAIL — 12 spec areas =============================== */}
      <div style={{
        position:'absolute', top: headerH + 32, left: 64, bottom: 124,
        width: 'calc(28% - 80px)',
        display:'flex', flexDirection:'column', gap: 14,
        zIndex: 3,
      }}>
        {/* rail header */}
        <div style={{paddingLeft: 6, paddingBottom: 4}}>
          <div className="mono" style={{
            fontSize: 13, letterSpacing:'0.34em', color:'var(--gold-deep)',
            textTransform:'uppercase', fontWeight: 600,
          }}>Build spec · 12 areas</div>
          <div className="serif" style={{
            fontSize: 26, marginTop: 6, color:'var(--forest)', fontWeight: 500,
            letterSpacing:'-0.012em',
          }}>
            Every line, <em style={{color:'var(--gold-deep)'}}>a promise.</em>
          </div>
        </div>

        {/* the scrollable list */}
        <div ref={railRef} className="scroll" style={{
          flex: 1,
          overflowY: 'auto',
          display:'flex', flexDirection:'column', gap: 10,
          paddingRight: 6, paddingBottom: 12,
        }}>
          {SPECIFICATIONS.map((s, i) => {
            const isActive = i === activeIdx;
            const RowIcon = Icons[s.icon] || Icons.specs;
            const local = clamp((t - 0.03 * i) / 0.5, 0, 1);
            const e = ease.outCubic(local);
            return (
              <button
                key={s.area}
                data-spec-row={i}
                onClick={() => setActiveIdx(i)}
                style={{
                  minHeight: 76,
                  textAlign: 'left',
                  padding:'18px 22px',
                  borderRadius: 18,
                  border: '1.5px solid ' + (isActive ? 'var(--gold-deep)' : 'var(--line)'),
                  background: isActive
                    ? 'linear-gradient(180deg, var(--leaf-pale) 0%, var(--ivory) 100%)'
                    : 'var(--ivory)',
                  boxShadow: isActive
                    ? '0 14px 32px rgba(20,30,18,0.18), 0 0 0 4px rgba(201,168,101,0.18)'
                    : '0 4px 12px rgba(20,30,18,0.05)',
                  cursor:'pointer',
                  display:'flex', alignItems:'center', gap: 18,
                  opacity: e,
                  transform: `translateX(${(1 - e) * 14}px)`,
                  transition:'background 240ms, border-color 240ms, box-shadow 280ms, transform 200ms',
                  position:'relative',
                }}>
                {/* icon — circular badge */}
                <div style={{
                  flexShrink: 0,
                  width: 48, height: 48, borderRadius:'50%',
                  background: isActive
                    ? 'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)'
                    : 'var(--parchment-3)',
                  color: isActive ? '#1a1206' : 'var(--forest)',
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  boxShadow: isActive ? '0 4px 10px rgba(176,142,69,0.32), 0 0 0 3px rgba(255,250,232,0.78) inset' : 'none',
                  transition:'background 240ms, color 240ms',
                }}>
                  <span style={{display:'inline-flex', width: 26, height: 26}}><RowIcon/></span>
                </div>

                {/* label + meta */}
                <div style={{flex: 1, minWidth: 0, display:'flex', flexDirection:'column', gap: 2}}>
                  <div className="serif" style={{
                    fontSize: 22, fontWeight: 500, letterSpacing:'-0.012em',
                    color: isActive ? 'var(--forest-deep)' : 'var(--ink)',
                    lineHeight: 1.16, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                  }}>{s.area}</div>
                  <div className="mono" style={{
                    fontSize: 11, letterSpacing:'0.24em', textTransform:'uppercase',
                    color: isActive ? 'var(--gold-deep)' : 'var(--slate)',
                    fontWeight: 600,
                  }}>
                    {String(s.items.length).padStart(2,'0')} {s.items.length === 1 ? 'item' : 'items'}
                  </div>
                </div>

                {/* arrow on active */}
                {isActive && (
                  <span style={{
                    display:'inline-flex', width: 20, height: 20,
                    color:'var(--gold-deep)',
                    animation: 'ltSpecRailHint 1.6s ease-in-out infinite',
                  }}>
                    <Icons.arrow/>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* === RIGHT PANE — selected area's checklist ================== */}
      <div
        {...paneSwipe}
        style={{
          position:'absolute', top: headerH + 32, right: 64, bottom: 124,
          left: 'calc(28% + 0px)',
          borderRadius: 28,
          background: 'linear-gradient(170deg, var(--ivory) 0%, var(--parchment) 100%)',
          border:'1.5px solid var(--line)',
          boxShadow: '0 28px 60px rgba(20,30,18,0.10), 0 0 0 1px rgba(232,216,168,0.18) inset',
          padding:'42px 56px 36px',
          display:'flex', flexDirection:'column',
          overflow:'hidden',
          zIndex: 3,
        }}>
        {/* HEADER — area title + icon + counter */}
        <div style={{
          display:'flex', alignItems:'center', gap: 28, paddingBottom: 26,
          borderBottom:'1px solid var(--line)',
        }}>
          {/* big circular area icon */}
          <div style={{
            width: 96, height: 96, borderRadius:'50%',
            background:'linear-gradient(180deg, var(--forest) 0%, var(--forest-deep) 100%)',
            color:'var(--gold-soft)',
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 14px 32px rgba(20,30,18,0.28), 0 0 0 4px rgba(232,216,168,0.22) inset',
            flexShrink: 0,
          }}>
            <span style={{display:'inline-flex', width: 50, height: 50}}>
              <ActiveIcon/>
            </span>
          </div>

          {/* title block */}
          <div style={{flex: 1, minWidth: 0}}>
            <div className="mono" style={{
              fontSize: 14, letterSpacing:'0.34em', color:'var(--gold-deep)',
              textTransform:'uppercase', fontWeight: 600,
            }}>
              Area {String(activeIdx + 1).padStart(2,'0')} of {String(SPECIFICATIONS.length).padStart(2,'0')}
            </div>
            <div className="serif" style={{
              fontSize: 64, lineHeight: 1.02, letterSpacing:'-0.022em', fontWeight: 500,
              color:'var(--forest-deep)', marginTop: 4,
            }}>
              {active.area}
            </div>
          </div>

          {/* item count pill */}
          <div style={{
            padding:'14px 22px', borderRadius: 999,
            background:'var(--leaf-pale)',
            border:'1px solid var(--gold-soft)',
            color:'var(--forest-deep)',
            display:'inline-flex', alignItems:'center', gap: 10,
            flexShrink: 0,
          }}>
            <span className="serif" style={{fontSize: 36, fontWeight: 500, lineHeight: 1, color:'var(--forest)'}}>
              {String(active.items.length).padStart(2,'0')}
            </span>
            <span className="mono" style={{
              fontSize: 12, letterSpacing:'0.28em', textTransform:'uppercase',
              color:'var(--slate)', fontWeight: 600,
            }}>
              {active.items.length === 1 ? 'detail' : 'details'}
            </span>
          </div>
        </div>

        {/* CHECKLIST — scrollable */}
        <div key={active.area /* re-mount → re-run stagger animation */}
          className="scroll" style={{
            flex: 1,
            overflowY: 'auto',
            marginTop: 26,
            paddingRight: 12,
            display:'flex', flexDirection:'column', gap: 14,
          }}>
          {active.items.map((line, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'flex-start', gap: 22,
              padding:'18px 22px',
              borderRadius: 16,
              background: i % 2 === 0 ? 'rgba(251,246,234,0.55)' : 'transparent',
              border:'1px solid ' + (i % 2 === 0 ? 'rgba(26,31,23,0.06)' : 'transparent'),
              animation: `ltSpecRowIn 540ms cubic-bezier(0.22,1,0.36,1) ${i * 60}ms both`,
            }}>
              {/* gold check */}
              <span style={{
                flexShrink: 0,
                width: 36, height: 36, borderRadius:'50%',
                background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
                color:'#1a1206',
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 10px rgba(176,142,69,0.32), 0 0 0 3px rgba(255,250,232,0.78) inset',
                marginTop: 3,
                animation: `ltSpecTickIn 540ms cubic-bezier(0.22,1.4,0.36,1) ${i * 60 + 120}ms both`,
              }}>
                <span style={{display:'inline-flex', width: 20, height: 20}}>
                  <Icons.check/>
                </span>
              </span>

              {/* line text */}
              <div className="serif" style={{
                flex: 1,
                fontSize: 26, fontWeight: 400, lineHeight: 1.42, letterSpacing:'-0.005em',
                color:'var(--ink)',
              }}>
                {line}
              </div>
            </div>
          ))}
        </div>

        {/* SWIPE HINT — small pill bottom-right, visible early */}
        {t < 5 && (
          <div style={{
            position:'absolute', right: 30, bottom: 22,
            display:'inline-flex', alignItems:'center', gap: 10,
            padding:'10px 16px', borderRadius: 999,
            background:'rgba(46,74,44,0.10)',
            border:'1px solid rgba(46,74,44,0.18)',
            color:'var(--forest)',
            opacity: clamp((5 - t) / 1.5, 0, 0.85),
            pointerEvents:'none',
          }}>
            <span style={{display:'inline-flex', width: 18, height: 18, transform:'rotate(90deg)'}}>
              <Icons.swipe/>
            </span>
            <span className="mono" style={{fontSize: 11, letterSpacing:'0.26em', textTransform:'uppercase', fontWeight: 600}}>
              Swipe to step
            </span>
          </div>
        )}
      </div>

      {/* === BOTTOM CREDENTIALS STRIP =============================== */}
      <div style={{
        position:'absolute', bottom: 36, left: 64, right: 64, height: 72,
        borderRadius: 999,
        background:'linear-gradient(98deg, var(--forest-deep) 0%, var(--forest) 60%, var(--forest-soft) 100%)',
        color:'var(--on-tile)',
        border:'1px solid rgba(232,216,168,0.32)',
        boxShadow:'0 18px 40px rgba(20,30,18,0.28), 0 0 0 1px rgba(232,216,168,0.10) inset',
        display:'flex', alignItems:'center', justifyContent:'center', gap: 40,
        padding:'0 44px',
        zIndex: 4,
      }}>
        <div style={{display:'inline-flex', alignItems:'center', gap: 14}}>
          <span style={{display:'inline-flex', width: 26, height: 26, color:'var(--gold-soft)'}}>
            <Icons.check/>
          </span>
          <span className="mono" style={{
            fontSize: 14, letterSpacing:'0.34em', color:'var(--gold-soft)',
            textTransform:'uppercase', fontWeight: 600,
          }}>Industry-leading materials</span>
        </div>

        <span style={{width: 1, height: 32, background:'rgba(232,216,168,0.32)'}}/>

        <div className="serif" style={{
          fontSize: 28, fontWeight: 500, letterSpacing:'-0.012em', color:'var(--on-tile)',
        }}>
          Triple-tested · <em style={{color:'var(--gold-soft)'}}>Vastu-compliant</em> · 30 years of Kalyani craft
        </div>

        <span style={{width: 1, height: 32, background:'rgba(232,216,168,0.32)'}}/>

        <div style={{display:'inline-flex', alignItems:'center', gap: 14}}>
          <KalyaniCredit light size={13}/>
        </div>
      </div>
    </div>
  );
}

window.Specifications = Specifications;
