// Towers — "The Tree Collection". 10 tree-named towers arranged as a grove of
// forest-green tiles; tapping one expands the detail panel below with live
// availability counters + typology chips + reservation CTA. Coral is sold out
// (sienna overlay). Swipe left/right on the bottom panel pages through towers.

function Towers() {
  const t = useLoop();
  const [route] = useRoute();
  const [bursts, fire] = useBurst();

  // Pick the initial tower: route param overrides; otherwise first non-sold-out.
  const initial = (() => {
    const routeId = route.params && route.params[0];
    if (routeId) {
      const m = TOWERS.find(tw => tw.id === routeId);
      if (m) return m.id;
    }
    return TOWERS.find(tw => tw.available > 0)?.id || TOWERS[0].id;
  })();
  const [pickedId, setPickedId] = React.useState(initial);
  const picked = TOWERS.find(tw => tw.id === pickedId) || TOWERS[0];
  const pickedIdx = TOWERS.findIndex(tw => tw.id === picked.id);

  // Swipe through towers on the bottom panel.
  const swipeHandlers = useSwipe({
    onLeft:  () => setPickedId(TOWERS[(pickedIdx + 1) % TOWERS.length].id),
    onRight: () => setPickedId(TOWERS[(pickedIdx - 1 + TOWERS.length) % TOWERS.length].id),
    threshold: 50,
  });

  const projectTotals = React.useMemo(() => TOWERS.reduce((acc, tw) => ({
    units:     acc.units     + tw.units,
    available: acc.available + tw.available,
    sold:      acc.sold      + tw.sold,
    hold:      acc.hold      + tw.hold,
  }), { units:0, available:0, sold:0, hold:0 }), []);

  // Tile click — set picked + burst
  const onTilePick = (twId, ev) => {
    setPickedId(twId);
    const rect = ev.currentTarget.getBoundingClientRect();
    fire(rect.left + rect.width / 2, rect.top + rect.height / 2, { count: 9 });
  };

  return (
    <div style={{position:'absolute', inset:0, background:'var(--parchment)', color:'var(--ink)', overflow:'hidden'}}>
      {/* ambient ground */}
      <div style={{position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% -10%, rgba(168,194,147,0.18), transparent 55%), radial-gradient(ellipse at 50% 110%, rgba(201,168,101,0.10), transparent 50%)', pointerEvents:'none', zIndex:0}}/>
      <LeafField count={18} opacity={0.32}/>
      <FilmGrain opacity={0.06}/>

      <ScreenHeader title="The Tree Collection" sub="10 towers · named after India's trees"/>

      {/* === TOWER GROVE (top half) === */}
      <div style={{position:'absolute', top:200, left:60, right:60, height:760, zIndex:5}}>
        {/* eyebrow row */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:24, paddingRight:6}}>
          <div className="eyebrow forest">The Grove · {projectTotals.units.toLocaleString('en-IN')} residences across {TOWERS.length} trees</div>
          <div className="eyebrow gold">Tap a tree to inspect</div>
        </div>

        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(4, 1fr)',
          gridAutoRows:'minmax(220px, 1fr)',
          gap:18,
          height:'calc(100% - 50px)',
        }}>
          {TOWERS.map((tw) => {
            const isPicked = tw.id === picked.id;
            const isSoldOut = tw.available === 0;
            const pct = tw.available / tw.units;
            const pulse = 0.5 + 0.5 * Math.sin(t * 1.4 + tw.no * 0.7);
            return (
              <button
                key={tw.id}
                onClick={(e) => onTilePick(tw.id, e)}
                style={{
                  position:'relative',
                  background: isPicked
                    ? 'linear-gradient(180deg, var(--tile-light) 0%, var(--tile) 60%, var(--tile-deep) 100%)'
                    : 'linear-gradient(180deg, var(--tile) 0%, var(--tile-deep) 100%)',
                  color:'var(--on-tile)',
                  border: isPicked ? '2px solid var(--gold)' : '1px solid rgba(201,168,101,0.18)',
                  borderRadius:18,
                  padding:'24px 22px',
                  textAlign:'left',
                  cursor:'pointer',
                  overflow:'hidden',
                  boxShadow: isPicked
                    ? '0 18px 50px rgba(20,30,18,0.45), inset 0 1px 0 rgba(255,255,255,0.12)'
                    : '0 6px 20px rgba(20,30,18,0.25)',
                  transition:'all 280ms cubic-bezier(0.22,1,0.36,1)',
                  transform: isPicked ? 'translateY(-4px)' : 'translateY(0)',
                  minHeight:0,
                }}>
                {/* leaf silhouette background */}
                <svg viewBox="0 0 200 200" style={{
                  position:'absolute', top:-30, right:-30, width:200, height:200,
                  opacity: isPicked ? 0.20 : 0.10,
                  transform:`rotate(${(tw.no * 27) % 360}deg)`,
                  pointerEvents:'none',
                }}>
                  <path d="M 100 20 C 60 40 30 80 30 130 C 30 160 50 180 100 180 C 150 180 170 160 170 130 C 170 80 140 40 100 20 Z M 100 30 L 100 175"
                        fill="var(--gold-soft)" stroke="var(--gold)" strokeWidth="0.6"/>
                </svg>

                {/* tower number badge */}
                <div style={{
                  position:'absolute', top:18, left:18,
                  width:42, height:42, borderRadius:'50%',
                  background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
                  color:'#1a130a',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'JetBrains Mono, monospace', fontWeight:700, fontSize:18,
                  boxShadow:'0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
                  zIndex:2,
                }}>{tw.no.toString().padStart(2,'0')}</div>

                {/* sold-out overlay */}
                {isSoldOut && (
                  <div style={{
                    position:'absolute', inset:0,
                    background:'linear-gradient(135deg, rgba(184,85,71,0.78) 0%, rgba(120,50,40,0.85) 100%)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    flexDirection:'column', gap:6,
                    zIndex:3, borderRadius:18,
                    backdropFilter:'blur(1px)',
                  }}>
                    <div className="mono" style={{fontSize:11, letterSpacing:'0.35em', color:'rgba(255,235,220,0.85)'}}>STATUS</div>
                    <div className="serif" style={{fontSize:30, fontWeight:500, color:'#f5e6dc', letterSpacing:'-0.01em'}}>Sold Out</div>
                  </div>
                )}

                {/* tower content */}
                <div style={{position:'absolute', bottom:20, left:22, right:22, zIndex:2}}>
                  <div className="serif" style={{fontSize:34, fontWeight:500, lineHeight:1, letterSpacing:'-0.015em', color:'var(--on-tile)'}}>{tw.name}</div>
                  <div className="mono" style={{fontSize:10, letterSpacing:'0.22em', color:'rgba(232,216,168,0.7)', marginTop:6, textTransform:'uppercase'}}>{tw.cluster} · {tw.side}</div>

                  <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop:14, gap:8}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex', gap:10, fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:'0.08em', color:'rgba(232,216,168,0.85)'}}>
                        <span><span style={{opacity:0.55}}>FL</span> {tw.floors}</span>
                        <span style={{opacity:0.4}}>·</span>
                        <span><span style={{opacity:0.55}}>UN</span> {tw.units}</span>
                      </div>
                      <div className="mono" style={{fontSize:10, letterSpacing:'0.12em', color:'rgba(232,216,168,0.55)', marginTop:5, lineHeight:1.25}}>{tw.view.length > 22 ? tw.view.slice(0,22) + '…' : tw.view}</div>
                    </div>
                    {!isSoldOut && (
                      <div style={{flexShrink:0}}>
                        <Donut value={tw.available} total={tw.units} size={56} stroke={4} color="var(--gold)" track="rgba(232,216,168,0.18)"/>
                      </div>
                    )}
                  </div>
                </div>

                {/* active glow on picked */}
                {isPicked && (
                  <div style={{
                    position:'absolute', inset:-1, borderRadius:18,
                    boxShadow:`inset 0 0 30px rgba(232,216,168,${0.25 + 0.12 * pulse})`,
                    pointerEvents:'none',
                  }}/>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* === DETAIL PANEL (bottom half) === */}
      <div
        {...swipeHandlers}
        style={{
          position:'absolute', bottom:30, left:60, right:60, height:540,
          background:'linear-gradient(180deg, var(--ivory) 0%, var(--parchment-2) 100%)',
          border:'1px solid var(--line)',
          borderRadius:22,
          padding:'34px 44px',
          display:'grid',
          gridTemplateColumns:'1.2fr 1fr',
          gap:40,
          zIndex:6,
          boxShadow:'0 24px 60px rgba(20,30,18,0.18), inset 0 1px 0 rgba(255,255,255,0.6)',
          overflow:'hidden',
        }}>

        {/* === LEFT: identity === */}
        <div style={{display:'flex', flexDirection:'column', justifyContent:'space-between', minWidth:0}}>
          <div>
            <div style={{display:'flex', alignItems:'baseline', gap:18, marginBottom:8}}>
              <div className="eyebrow forest">Tree {picked.no.toString().padStart(2,'0')}</div>
              <div className="mono" style={{fontSize:11, letterSpacing:'0.28em', color:'var(--slate)', textTransform:'uppercase'}}>{picked.cluster}</div>
              <div className="mono" style={{fontSize:11, letterSpacing:'0.18em', color:'var(--gold-deep)', textTransform:'uppercase'}}>Side {picked.side}</div>
            </div>
            <div className="serif" style={{fontSize:84, fontWeight:500, lineHeight:0.95, color:'var(--forest)', letterSpacing:'-0.025em'}}>
              {picked.name}
              {picked.available === 0 && (
                <span className="mono" style={{fontSize:14, marginLeft:18, color:'var(--sold)', letterSpacing:'0.28em', verticalAlign:'middle'}}>SOLD OUT</span>
              )}
            </div>
            <div className="serif" style={{fontSize:22, marginTop:14, color:'var(--graphite)', fontStyle:'italic', lineHeight:1.3, maxWidth:540}}>
              {picked.view}.
            </div>

            <div style={{display:'flex', gap:32, marginTop:24, alignItems:'baseline'}}>
              <div>
                <div className="mono" style={{fontSize:11, letterSpacing:'0.28em', color:'var(--slate)'}}>FLOORS</div>
                <div className="serif" style={{fontSize:44, fontWeight:300, color:'var(--ink)', letterSpacing:'-0.01em', marginTop:2}}>{picked.floors}</div>
              </div>
              <div style={{width:1, height:44, background:'var(--line)', alignSelf:'center'}}/>
              <div>
                <div className="mono" style={{fontSize:11, letterSpacing:'0.28em', color:'var(--slate)'}}>RESIDENCES</div>
                <div className="serif" style={{fontSize:44, fontWeight:300, color:'var(--ink)', letterSpacing:'-0.01em', marginTop:2}}>{picked.units}</div>
              </div>
            </div>
          </div>

          {/* typology chips */}
          <div>
            <div className="mono" style={{fontSize:11, letterSpacing:'0.28em', color:'var(--slate)', marginBottom:12, textTransform:'uppercase'}}>Available Typologies</div>
            <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
              {picked.typologies.map((typName) => {
                // Match by name; fall back to first.
                const ty = TYPOLOGIES.find(tt => tt.name === typName) || TYPOLOGIES.find(tt => typName.includes(tt.name.split(' ')[0])) || TYPOLOGIES[0];
                return (
                  <button key={typName} onClick={() => navigate('residences/' + ty.code)} style={{
                    display:'inline-flex', alignItems:'center', gap:10,
                    padding:'14px 22px',
                    background:'var(--surface)',
                    border:'1px solid var(--line)',
                    borderRadius:999,
                    cursor:'pointer',
                    fontFamily:'Cormorant Garamond, serif',
                    fontSize:20,
                    color:'var(--ink)',
                    transition:'all 220ms cubic-bezier(0.22,1,0.36,1)',
                    minHeight:56,
                  }}
                  onMouseEnter={(e)=>{ e.currentTarget.style.background='var(--parchment-2)'; e.currentTarget.style.borderColor='var(--gold)'; }}
                  onMouseLeave={(e)=>{ e.currentTarget.style.background='var(--surface)'; e.currentTarget.style.borderColor='var(--line)'; }}>
                    <span>{typName}</span>
                    <span className="mono" style={{fontSize:11, letterSpacing:'0.22em', color:'var(--gold-deep)', textTransform:'uppercase'}}>plan →</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* === RIGHT: counters + CTA === */}
        <div style={{display:'flex', flexDirection:'column', gap:22, minWidth:0}}>
          {/* counters */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14}}>
            <CounterTile
              label="Available"
              value={picked.available}
              accent="var(--available)"
              accentSoft="var(--available-soft)"
            />
            <CounterTile
              label="On Hold"
              value={picked.hold}
              accent="var(--gold-deep)"
              accentSoft="rgba(201,168,101,0.18)"
            />
            <CounterTile
              label="Sold"
              value={picked.sold}
              accent="var(--sold)"
              accentSoft="var(--sold-soft)"
            />
          </div>

          {/* availability bar */}
          <div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:8, alignItems:'baseline'}}>
              <div className="mono" style={{fontSize:11, letterSpacing:'0.24em', color:'var(--slate)', textTransform:'uppercase'}}>Inventory Mix</div>
              <div className="mono" style={{fontSize:11, letterSpacing:'0.18em', color:'var(--slate)'}}>
                {Math.round((picked.available / picked.units) * 100)}% free
              </div>
            </div>
            <div style={{
              height:14, borderRadius:8, overflow:'hidden',
              background:'var(--parchment-3)',
              display:'flex', border:'1px solid var(--line)',
            }}>
              <div style={{width: (picked.available / picked.units * 100) + '%', background:'linear-gradient(90deg, var(--available) 0%, #6fb877 100%)', transition:'width 800ms ease-out'}}/>
              <div style={{width: (picked.hold / picked.units * 100) + '%', background:'var(--gold-deep)', transition:'width 800ms ease-out'}}/>
              <div style={{width: (picked.sold / picked.units * 100) + '%', background:'linear-gradient(90deg, #a04839 0%, var(--sold) 100%)', transition:'width 800ms ease-out'}}/>
            </div>
          </div>

          {/* CTA stack */}
          <div style={{marginTop:'auto', display:'flex', flexDirection:'column', gap:14}}>
            {picked.available > 0 ? (
              <button onClick={() => navigate('booking')} className="mono" style={{
                padding:'24px 32px', borderRadius:999,
                border:'1px solid var(--gold-deep)',
                background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
                color:'#1a130a',
                fontSize:16, letterSpacing:'0.22em', textTransform:'uppercase', cursor:'pointer',
                fontWeight:700,
                boxShadow:'0 14px 32px rgba(176,138,63,0.40), inset 0 1px 0 rgba(255,255,255,0.42)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:14,
              }}>Reserve a unit in {picked.name} <span style={{fontSize:20}}>→</span></button>
            ) : (
              <div style={{
                padding:'24px 32px', borderRadius:999,
                border:'1px solid var(--sold)',
                background:'rgba(184,85,71,0.10)',
                color:'var(--sold)',
                fontFamily:'JetBrains Mono, monospace',
                fontSize:14, letterSpacing:'0.22em', textTransform:'uppercase',
                textAlign:'center',
              }}>Cluster sold out — join the waitlist</div>
            )}
            <button onClick={() => {
              const next = TOWERS[(pickedIdx + 1) % TOWERS.length];
              setPickedId(next.id);
            }} className="mono" style={{
              padding:'18px 28px', borderRadius:999,
              border:'1px solid var(--line)',
              background:'transparent',
              color:'var(--graphite)',
              fontSize:13, letterSpacing:'0.22em', textTransform:'uppercase', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:12,
            }}>
              <Icons.swipe width={20} height={20}/>
              Swipe through trees
              <span style={{opacity:0.5}}>· {(pickedIdx+1).toString().padStart(2,'0')}/{TOWERS.length}</span>
            </button>
          </div>
        </div>
      </div>

      <BurstLayer bursts={bursts} zIndex={40}/>
    </div>
  );
}

// Counter tile — small ivory card with serif counter + colored accent strip
function CounterTile({ label, value, accent, accentSoft }) {
  return (
    <div style={{
      position:'relative',
      background:'var(--ivory)',
      border:'1px solid var(--line)',
      borderRadius:14,
      padding:'18px 18px 16px',
      overflow:'hidden',
      minHeight:120,
    }}>
      <div style={{position:'absolute', top:0, left:0, bottom:0, width:4, background:accent}}/>
      <div className="mono" style={{fontSize:10, letterSpacing:'0.28em', color:'var(--slate)', textTransform:'uppercase', marginLeft:6}}>{label}</div>
      <div className="serif" style={{fontSize:62, fontWeight:300, color: accent, lineHeight:1, letterSpacing:'-0.025em', marginLeft:6, marginTop:6, fontVariantNumeric:'tabular-nums'}}>
        <CounterFlip value={value} duration={1.2}/>
      </div>
      <div style={{position:'absolute', right:14, top:18, padding:'4px 8px', background:accentSoft, borderRadius:8}}>
        <span className="mono" style={{fontSize:9, letterSpacing:'0.2em', color: accent, textTransform:'uppercase'}}>units</span>
      </div>
    </div>
  );
}

window.Towers = Towers;
