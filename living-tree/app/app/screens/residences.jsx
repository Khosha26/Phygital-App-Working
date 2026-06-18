// Residences — the showstopper. Soil-and-scroll treatment:
// • Top: typology chips (6 unit types — 1/2/2.5 BHK + 3 BHK Smart/Optimal/Luxe)
// • Stage: rich earthy ground built from CSS, parchment scroll holds the
//   floor-plan image, with garden props (rolled scroll, basil sprigs, trowel)
//   scattered around. Gold-line callouts annotate 4 rooms per typology.
// • East ⟷ West toggle above the scroll.
// • Interactive zoom: pinch (2-finger), tap-to-zoom, double-tap reset,
//   drag-to-pan when zoomed, + bottom-right slider.
// • Right card: typology stats. Bottom: Compare modal (pin 2 plans side-by-side).
//
// The plan PNGs contain East + West side-by-side; we crop one half via
// transform: scale(2) translateX(±25%) and use the zoom transform as a wrapper.

function Residences() {
  const t = useLoop();
  const [route] = useRoute();

  // Resolve initial typology from route param (typology code or tower id).
  const initialCode = (() => {
    const p = route.params && route.params[0];
    if (!p) return TYPOLOGIES.find(ty => !ty.soldOut)?.code || TYPOLOGIES[0].code;
    const byCode = TYPOLOGIES.find(ty => ty.code === p);
    if (byCode) return byCode.code;
    return TYPOLOGIES.find(ty => !ty.soldOut)?.code || TYPOLOGIES[0].code;
  })();

  const [pickedCode, setPickedCode] = React.useState(initialCode);
  const picked = TYPOLOGIES.find(ty => ty.code === pickedCode) || TYPOLOGIES[0];
  const [variant, setVariant] = React.useState('east'); // 'east' | 'west'
  const activeVariant = picked[variant];

  // Zoom / pan state
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [hintFaded, setHintFaded] = React.useState(false);

  // Compare-mode state
  const [compareOn, setCompareOn] = React.useState(false);
  const [compareCode, setCompareCode] = React.useState(null);

  const scrollRef = React.useRef(null);
  const gestureRef = React.useRef({
    active: false, mode: null,
    startD: 0, startZoom: 1,
    startPanX: 0, startPanY: 0,
    dragStartX: 0, dragStartY: 0,
    lastTapAt: 0, lastTapX: 0, lastTapY: 0,
  });

  // Reset zoom when typology or variant changes.
  React.useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, [pickedCode, variant]);

  // Clamp pan so the scroll never slides off-screen.
  const clampPan = (p, z) => {
    const el = scrollRef.current;
    if (!el) return p;
    const r = el.getBoundingClientRect();
    const maxX = Math.max(0, ((z - 1) / 2) * r.width) + 60;
    const maxY = Math.max(0, ((z - 1) / 2) * r.height) + 60;
    return {
      x: Math.max(-maxX, Math.min(maxX, p.x)),
      y: Math.max(-maxY, Math.min(maxY, p.y)),
    };
  };

  const fadeHint = () => { if (!hintFaded) setHintFaded(true); };

  // ----- TOUCH gestures -----
  const onTouchStart = (ev) => {
    const g = gestureRef.current;
    const ts = ev.touches;
    const el = scrollRef.current;
    const rect = el ? el.getBoundingClientRect() : { left: 0, top: 0 };
    if (ts.length === 2) {
      const [a, b] = [ts[0], ts[1]];
      const dx = b.clientX - a.clientX, dy = b.clientY - a.clientY;
      g.mode = 'pinch';
      g.active = true;
      g.startD = Math.hypot(dx, dy) || 1;
      g.startZoom = zoom;
      g.startPanX = pan.x; g.startPanY = pan.y;
      fadeHint();
    } else if (ts.length === 1) {
      const now = performance.now();
      const t0 = ts[0];
      const tx = t0.clientX, ty = t0.clientY;
      // Double-tap → reset
      if (now - g.lastTapAt < 320 && Math.hypot(tx - g.lastTapX, ty - g.lastTapY) < 40) {
        setZoom(1); setPan({ x: 0, y: 0 });
        g.lastTapAt = 0; g.active = false; g.mode = null;
        fadeHint();
        return;
      }
      g.lastTapAt = now; g.lastTapX = tx; g.lastTapY = ty;
      if (zoom > 1) {
        g.mode = 'pan-touch';
        g.active = true;
        g.dragStartX = tx; g.dragStartY = ty;
        g.startPanX = pan.x; g.startPanY = pan.y;
        fadeHint();
      } else {
        // Single tap on un-zoomed scroll = zoom in to 2x centered on tap point
        g.mode = 'single-tap';
        g.active = true;
        g.dragStartX = tx; g.dragStartY = ty;
        g.startPanX = pan.x; g.startPanY = pan.y;
      }
    }
  };

  const onTouchMove = (ev) => {
    const g = gestureRef.current;
    if (!g.active) return;
    if (ev.cancelable) ev.preventDefault();
    const ts = ev.touches;
    if (g.mode === 'pinch' && ts.length === 2) {
      const [a, b] = [ts[0], ts[1]];
      const dx = b.clientX - a.clientX, dy = b.clientY - a.clientY;
      const newD = Math.hypot(dx, dy) || 1;
      const ratio = newD / g.startD;
      const newZoom = Math.max(0.8, Math.min(3.5, g.startZoom * ratio));
      setZoom(newZoom);
      setPan(clampPan(pan, newZoom));
    } else if (g.mode === 'pan-touch' && ts.length === 1) {
      const t0 = ts[0];
      const dx = t0.clientX - g.dragStartX;
      const dy = t0.clientY - g.dragStartY;
      setPan(clampPan({ x: g.startPanX + dx, y: g.startPanY + dy }, zoom));
    } else if (g.mode === 'single-tap' && ts.length === 1) {
      // promoted to drag if moved enough — convert to pan if zoomed
      const t0 = ts[0];
      const dx = t0.clientX - g.dragStartX;
      const dy = t0.clientY - g.dragStartY;
      if (Math.hypot(dx, dy) > 10) {
        g.mode = null; // it was a swipe, not a tap; ignore for zoom purposes
      }
    }
  };

  const onTouchEnd = (ev) => {
    const g = gestureRef.current;
    if (g.mode === 'single-tap' && ev.changedTouches.length === 1) {
      // it was a tap (no significant move) → zoom in to 2x centered on tap
      const el = scrollRef.current;
      const rect = el ? el.getBoundingClientRect() : { left: 0, top: 0, width: 1, height: 1 };
      const cx = g.dragStartX - rect.left - rect.width / 2;
      const cy = g.dragStartY - rect.top - rect.height / 2;
      const newZoom = 2;
      const k = newZoom / zoom;
      setZoom(newZoom);
      setPan(clampPan({ x: -cx * (k - 1), y: -cy * (k - 1) }, newZoom));
      fadeHint();
    }
    if (ev.touches.length === 0) {
      g.active = false; g.mode = null;
    }
  };

  // ----- MOUSE drag-to-pan -----
  const onMouseDown = (ev) => {
    if (zoom <= 1) return;
    const g = gestureRef.current;
    g.mode = 'pan-mouse';
    g.active = true;
    g.dragStartX = ev.clientX; g.dragStartY = ev.clientY;
    g.startPanX = pan.x; g.startPanY = pan.y;
    fadeHint();
  };
  const onMouseMove = (ev) => {
    const g = gestureRef.current;
    if (!g.active || g.mode !== 'pan-mouse') return;
    const dx = ev.clientX - g.dragStartX;
    const dy = ev.clientY - g.dragStartY;
    setPan(clampPan({ x: g.startPanX + dx, y: g.startPanY + dy }, zoom));
  };
  const onMouseUp = () => {
    const g = gestureRef.current;
    if (g.mode === 'pan-mouse') { g.active = false; g.mode = null; }
  };

  // ----- WHEEL (trackpad / mouse wheel) -----
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const tm = (ev) => onTouchMove(ev);
    const wh = (ev) => {
      if (ev.cancelable) ev.preventDefault();
      fadeHint();
      const delta = ev.deltaY > 0 ? -0.08 : 0.08;
      const newZoom = Math.max(0.8, Math.min(3.5, zoom * (1 + delta)));
      setZoom(newZoom);
      setPan(clampPan(pan, newZoom));
    };
    el.addEventListener('touchmove', tm, { passive: false });
    el.addEventListener('wheel', wh, { passive: false });
    return () => {
      el.removeEventListener('touchmove', tm);
      el.removeEventListener('wheel', wh);
    };
  }, [zoom, pan.x, pan.y, hintFaded]);

  // ----- Zoom controls -----
  const stepZoom = (delta) => {
    fadeHint();
    const newZoom = Math.max(0.8, Math.min(3.5, zoom + delta));
    setZoom(newZoom);
    setPan(clampPan(pan, newZoom));
  };
  const resetZoom = () => { fadeHint(); setZoom(1); setPan({ x: 0, y: 0 }); };

  // Callouts — 4 hardcoded rooms per typology, approx % positions on the scroll.
  // Positions assume East variant centered in the scroll viewport.
  const callouts = CALLOUTS[picked.code] || CALLOUTS['3BHK-OPTIMAL'];
  const calloutsVisible = zoom <= 1.4;

  return (
    <div style={{position:'absolute', inset:0, overflow:'hidden', color:'var(--ink)'}}>
      <ScreenHeader title="Residences" sub="1 · 2 · 2.5 · 3 BHK · East + West"/>

      {/* === TYPOLOGY CHIPS === */}
      <div style={{
        position:'absolute', top:170, left:60, right:60, zIndex:10,
        display:'flex', gap:10, flexWrap:'wrap',
      }}>
        {TYPOLOGIES.map(ty => {
          const isPicked = ty.code === pickedCode;
          return (
            <button key={ty.code}
              onClick={() => { setPickedCode(ty.code); setCompareCode(null); }}
              style={{
                padding:'18px 26px',
                minHeight:72,
                borderRadius:999,
                border: '1px solid ' + (isPicked ? 'var(--gold-deep)' : 'var(--line)'),
                background: isPicked
                  ? 'linear-gradient(180deg, var(--tile-light) 0%, var(--tile) 100%)'
                  : 'var(--ivory)',
                color: isPicked ? 'var(--on-tile)' : 'var(--ink)',
                fontFamily:'Cormorant Garamond, serif',
                fontSize:22, fontWeight:isPicked ? 600 : 400,
                cursor:'pointer',
                display:'inline-flex', alignItems:'center', gap:14,
                boxShadow: isPicked ? '0 10px 26px rgba(20,30,18,0.35)' : 'none',
                transition:'all 240ms cubic-bezier(0.22,1,0.36,1)',
                position:'relative',
              }}>
              <span className="mono" style={{
                fontSize:11, letterSpacing:'0.22em',
                color: isPicked ? 'var(--gold)' : 'var(--gold-deep)',
                textTransform:'uppercase',
              }}>{ty.bhk === 2.5 ? '2.5' : ty.bhk.toFixed(0)} BHK</span>
              <span style={{
                textDecoration: ty.soldOut ? 'line-through' : 'none',
                textDecorationColor: 'var(--sold)',
                textDecorationThickness: '2px',
                opacity: ty.soldOut ? 0.55 : 1,
              }}>{ty.name.replace(/^[\d\.]+ BHK\s*·?\s*/i, '').replace(/^[\d\.]+ BHK\s+/i, '') || ty.name}</span>
              {ty.soldOut && (
                <span className="mono" style={{
                  fontSize:9, letterSpacing:'0.24em', textTransform:'uppercase',
                  padding:'4px 8px', borderRadius:6,
                  background: 'rgba(184,85,71,0.15)',
                  color: 'var(--sold)',
                  border: '1px solid rgba(184,85,71,0.3)',
                }}>Sold</span>
              )}
            </button>
          );
        })}
      </div>

      {/* === SOIL STAGE === */}
      <div style={{
        position:'absolute', top:280, left:0, right:0, bottom:0,
        background: `
          radial-gradient(ellipse at 50% 40%, rgba(110,80,50,0.35), transparent 65%),
          radial-gradient(ellipse at 20% 80%, rgba(58,42,24,0.55), transparent 50%),
          radial-gradient(ellipse at 80% 30%, rgba(74,62,40,0.4), transparent 55%),
          linear-gradient(180deg, #3a2a18 0%, #2a1f14 40%, #1a1410 100%)
        `,
        overflow:'hidden',
      }}>
        {/* Edge hint of forest green so it doesn't read as pure brown */}
        <div style={{
          position:'absolute', inset:0,
          background:`
            radial-gradient(ellipse at 0% 0%,   rgba(46,74,44,0.35), transparent 30%),
            radial-gradient(ellipse at 100% 0%, rgba(46,74,44,0.30), transparent 30%),
            radial-gradient(ellipse at 0% 100%, rgba(46,74,44,0.25), transparent 25%),
            radial-gradient(ellipse at 100% 100%, rgba(46,74,44,0.30), transparent 30%)
          `,
          pointerEvents:'none',
        }}/>
        {/* Noise/grain for tactile soil */}
        <FilmGrain opacity={0.18} blend="overlay"/>
        {/* Soil scatter dots */}
        <SoilScatter/>

        {/* === EAST/WEST TOGGLE — top center, above scroll === */}
        <div style={{
          position:'absolute', top:30, left:'50%', transform:'translateX(-50%)',
          display:'inline-flex', gap:0,
          background:'rgba(20,16,11,0.78)',
          border:'1px solid rgba(232,216,168,0.30)',
          borderRadius:999,
          padding:5,
          zIndex:20,
          boxShadow:'0 12px 28px rgba(0,0,0,0.45)',
          backdropFilter:'blur(8px)',
        }}>
          {['east','west'].map(side => {
            const isActive = side === variant;
            return (
              <button key={side} onClick={() => setVariant(side)} className="mono" style={{
                padding:'12px 24px',
                minHeight:54,
                borderRadius:999,
                border:'none',
                background: isActive
                  ? 'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)'
                  : 'transparent',
                color: isActive ? '#1a130a' : 'rgba(232,216,168,0.85)',
                fontSize:13, letterSpacing:'0.3em', textTransform:'uppercase',
                fontWeight: isActive ? 700 : 500,
                cursor:'pointer',
                transition:'all 220ms cubic-bezier(0.22,1,0.36,1)',
                minWidth:130,
              }}>{side} facing</button>
            );
          })}
        </div>

        {/* === ROLLED SCROLL PROP (left) === */}
        <RolledScrollProp style={{position:'absolute', top:'40%', left:30, transform:'rotate(-12deg) translateY(-50%)'}}/>

        {/* === SHOVEL PROP (right) === */}
        <ShovelProp style={{position:'absolute', bottom:120, right:80, transform:'rotate(28deg)'}}/>

        {/* === HERB SPRIGS (scattered) === */}
        <HerbSprig style={{position:'absolute', bottom:90, left:'25%', transform:'rotate(-20deg) scale(1.1)'}}/>
        <HerbSprig style={{position:'absolute', top:120, right:'18%', transform:'rotate(18deg) scale(0.85)'}}/>
        <HerbSprig style={{position:'absolute', bottom:180, right:'30%', transform:'rotate(35deg) scale(0.7)'}}/>
        <HerbSprig style={{position:'absolute', top:'45%', left:'18%', transform:'rotate(75deg) scale(0.6)'}}/>

        {/* === THE SCROLL (parchment with floor plan) === */}
        <div style={{
          position:'absolute',
          top:'50%', left:'50%',
          transform:'translate(-58%, -50%) rotate(-1.5deg)',
          width:1080, height:1040,
          zIndex:5,
        }}>
          {/* Scroll back-shadow on soil */}
          <div style={{
            position:'absolute', inset:'-30px -40px',
            background:'radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0.55), transparent 65%)',
            filter:'blur(20px)',
            zIndex:-1,
          }}/>

          {/* Scroll body */}
          <div ref={scrollRef}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            style={{
              position:'absolute', inset:0,
              background:`
                radial-gradient(ellipse at 50% 50%, #f0e4c5 0%, #e8d9b0 60%, #c9b481 95%, #a89568 100%)
              `,
              borderRadius:'18px 22px 16px 24px',
              boxShadow: `
                0 28px 80px rgba(0,0,0,0.65),
                0 8px 24px rgba(0,0,0,0.4),
                inset 0 0 60px rgba(120,90,50,0.25),
                inset 0 2px 0 rgba(255,250,230,0.4)
              `,
              overflow:'hidden',
              cursor: zoom > 1 ? (gestureRef.current.mode==='pan-mouse' ? 'grabbing' : 'grab') : 'zoom-in',
              touchAction:'none',
            }}>
            {/* Parchment texture overlay */}
            <div style={{position:'absolute', inset:0, opacity:0.35, mixBlendMode:'multiply', pointerEvents:'none',
              backgroundImage:`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2' seed='5'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.30  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23p)'/></svg>")`,
            }}/>

            {/* Floor plan IMAGE — source PNG is East + West side-by-side.
                We render the image at 200% width inside the scroll, then translate
                left to show east-half (translateX 0%) or west-half (translateX -50%).
                User zoom + pan applied on the wrapper. */}
            <div style={{
              position:'absolute', inset:0,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin:'center',
              transition: gestureRef.current.active ? 'none' : 'transform 360ms cubic-bezier(0.22,1,0.36,1)',
            }}>
              <div style={{
                position:'absolute', inset:'5% 10% 9% 10%',
                overflow:'hidden',
              }}>
                <img
                  src={`assets/plans/${picked.plan}.png`}
                  alt={picked.name + ' ' + variant}
                  draggable={false}
                  style={{
                    position:'absolute',
                    top:0, left:0,
                    width:'200%',
                    height:'100%',
                    objectFit:'contain',
                    transform: `translateX(${variant === 'east' ? '0%' : '-50%'})`,
                    transition:'transform 400ms cubic-bezier(0.22,1,0.36,1)',
                    pointerEvents:'none',
                    userSelect:'none',
                    filter:'sepia(0.12) contrast(1.04) brightness(0.98) saturate(0.92)',
                    mixBlendMode:'multiply',
                  }}
                  onError={(e)=>{ e.currentTarget.style.display='none'; }}
                />
              </div>
            </div>

            {/* Deckle / torn edges */}
            <DeckleEdges/>

            {/* === CALLOUTS overlay — gold lines + icon chip + label.
                SVG viewBox sized to scroll body in px so stroke-widths are clean. === */}
            {calloutsVisible && (
              <svg viewBox="0 0 1080 1040" preserveAspectRatio="none"
                   style={{position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', overflow:'visible'}}>
                {callouts.map((c, i) => {
                  const delay = 0.4 + i * 0.18;
                  const local = clamp((t - delay) / 0.7, 0, 1);
                  const e = ease.outQuart(local);
                  // c.fx,c.fy and c.lx,c.ly are in %; scale to viewBox.
                  const fx = c.fx * 10.8, fy = c.fy * 10.4;
                  const lx = c.lx * 10.8, ly = c.ly * 10.4;
                  // animate dash for elegant draw-in
                  const dist = Math.hypot(lx - fx, ly - fy);
                  return (
                    <g key={i} opacity={e}>
                      <line x1={fx} y1={fy} x2={lx} y2={ly}
                            stroke="var(--gold-deep)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray={dist}
                            strokeDashoffset={dist * (1 - e)}/>
                      <circle cx={fx} cy={fy} r="5" fill="var(--gold)" stroke="#5a3a18" strokeWidth="1.4"/>
                    </g>
                  );
                })}
              </svg>
            )}
            {calloutsVisible && callouts.map((c, i) => {
              const delay = 0.5 + i * 0.18;
              const local = clamp((t - delay) / 0.7, 0, 1);
              const e = ease.outQuart(local);
              return (
                <div key={'lbl' + i} style={{
                  position:'absolute',
                  left: `${c.lx}%`,
                  top: `${c.ly}%`,
                  transform: c.anchor === 'right' ? `translate(-100%, -50%) translateX(${(1-e)*-12}px)` : `translate(0, -50%) translateX(${(1-e)*12}px)`,
                  opacity: e,
                  display:'inline-flex', alignItems:'center', gap:10,
                  pointerEvents:'none',
                }}>
                  {c.anchor === 'right' ? (
                    <>
                      <div style={labelStyle}>
                        <div className="serif" style={{fontSize:18, fontWeight:600, color:'#3a2a14', lineHeight:1.1}}>{c.name}</div>
                        <div className="mono" style={{fontSize:11, color:'#6b4a22', letterSpacing:'0.08em', marginTop:2, fontVariantNumeric:'tabular-nums'}}>{c.dim}</div>
                      </div>
                      <div style={iconChipStyle}><c.icon width={20} height={20}/></div>
                    </>
                  ) : (
                    <>
                      <div style={iconChipStyle}><c.icon width={20} height={20}/></div>
                      <div style={labelStyle}>
                        <div className="serif" style={{fontSize:18, fontWeight:600, color:'#3a2a14', lineHeight:1.1}}>{c.name}</div>
                        <div className="mono" style={{fontSize:11, color:'#6b4a22', letterSpacing:'0.08em', marginTop:2, fontVariantNumeric:'tabular-nums'}}>{c.dim}</div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* Artistic Impression label (bottom-left) */}
            <div className="serif" style={{
              position:'absolute', bottom:18, left:24,
              fontStyle:'italic', fontSize:14,
              color:'rgba(90,60,30,0.65)',
              letterSpacing:'0.02em',
              pointerEvents:'none',
            }}>Artistic Impression</div>
          </div>

          {/* RERA vertical — right edge, rotated */}
          <div style={{
            position:'absolute', top:'50%', right:-44,
            transform:'translateY(-50%) rotate(-90deg)',
            transformOrigin:'center',
            zIndex:6,
            pointerEvents:'none',
          }}>
            <div className="mono" style={{
              fontSize:10, letterSpacing:'0.18em',
              color:'rgba(232,216,168,0.55)',
              whiteSpace:'nowrap',
              textTransform:'uppercase',
            }}>{PROJECT.rera}</div>
          </div>
        </div>

        {/* === ZOOM CONTROL — bottom-right pill === */}
        <div style={{
          position:'absolute', bottom:30, right:30,
          display:'inline-flex', alignItems:'center', gap:8,
          background:'rgba(20,16,11,0.88)',
          border:'1px solid rgba(232,216,168,0.30)',
          borderRadius:999,
          padding:'8px 10px',
          zIndex:30,
          boxShadow:'0 12px 28px rgba(0,0,0,0.45)',
          backdropFilter:'blur(8px)',
        }}>
          <button onClick={() => stepZoom(-0.25)} style={zoomBtnStyle}>
            <Icons.minus width={20} height={20}/>
          </button>
          <div className="mono" style={{
            minWidth:88, textAlign:'center',
            fontSize:13, letterSpacing:'0.16em',
            color:'rgba(232,216,168,0.95)',
            padding:'10px 4px',
            fontVariantNumeric:'tabular-nums',
          }}>{zoom.toFixed(1)}×</div>
          <button onClick={() => stepZoom(0.25)} style={zoomBtnStyle}>
            <Icons.plus width={20} height={20}/>
          </button>
          <div style={{width:1, height:32, background:'rgba(232,216,168,0.20)', margin:'0 4px'}}/>
          <button onClick={resetZoom} className="mono" style={{
            ...zoomBtnStyle, width:'auto', padding:'10px 16px',
            fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase',
          }}>Reset</button>
        </div>

        {/* Pinch hint (fades after first interaction) */}
        <div className="mono" style={{
          position:'absolute', bottom:42, left:'50%', transform:'translateX(-50%)',
          padding:'10px 22px', borderRadius:999,
          background:'rgba(20,16,11,0.78)', border:'1px solid rgba(232,216,168,0.32)',
          fontSize:12, letterSpacing:'0.28em', color:'var(--gold)',
          opacity: hintFaded ? 0 : 1,
          transition:'opacity 540ms ease',
          pointerEvents:'none', zIndex:20,
          whiteSpace:'nowrap', textTransform:'uppercase',
        }}>Tap · pinch · drag to explore</div>

        {/* === RIGHT STATS CARD === */}
        <div style={{
          position:'absolute', top:60, right:30, width:380,
          background:'rgba(244,237,218,0.95)',
          border:'1px solid rgba(232,216,168,0.42)',
          borderRadius:18,
          padding:'30px 28px',
          zIndex:15,
          boxShadow:'0 20px 50px rgba(0,0,0,0.55)',
          backdropFilter:'blur(4px)',
        }}>
          <div className="mono" style={{fontSize:11, letterSpacing:'0.28em', color:'var(--gold-deep)', textTransform:'uppercase'}}>
            Typology · {variant} facing
          </div>
          <div className="serif" style={{fontSize:42, fontWeight:500, color:'var(--forest)', letterSpacing:'-0.02em', lineHeight:1.05, marginTop:10}}>
            {picked.name}
          </div>
          <div className="serif" style={{fontSize:16, fontStyle:'italic', color:'var(--graphite)', marginTop:10, lineHeight:1.4}}>
            {picked.summary}
          </div>

          <div style={{height:1, background:'var(--line)', margin:'20px 0'}}/>

          <div>
            <div className="mono" style={{fontSize:10, letterSpacing:'0.28em', color:'var(--slate)', textTransform:'uppercase'}}>Starting at</div>
            <div className="serif" style={{fontSize:44, fontWeight:400, color:'var(--gold-deep)', letterSpacing:'-0.01em', marginTop:4}}>
              {formatINR(picked.priceFrom, { decimals: 2 })}
            </div>
            <div className="mono" style={{fontSize:10, letterSpacing:'0.2em', color:'var(--slate)', marginTop:2, textTransform:'uppercase'}}>
              All inclusive · {picked.tower.split(' · ').length > 2 ? picked.tower.split(' · ').slice(0,2).join(' · ') + ' …' : picked.tower}
            </div>
          </div>

          <div style={{height:1, background:'var(--line)', margin:'20px 0'}}/>

          {/* Stats grid */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
            <StatCell label="Saleable" value={activeVariant.saleable} unit="sft"/>
            <StatCell label="Carpet"   value={activeVariant.carpet}   unit="sft"/>
            <StatCell label="Balcony+Utility" value={activeVariant.balcony} unit="sft" small/>
            <StatCell label="View" value={activeVariant.view} unit="" text/>
          </div>

          {/* CTA */}
          {!picked.soldOut && (
            <button onClick={() => navigate('booking')} className="mono" style={{
              width:'100%', marginTop:22,
              padding:'18px 24px', borderRadius:999,
              border:'1px solid var(--gold-deep)',
              background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
              color:'#1a130a',
              fontSize:13, letterSpacing:'0.22em', textTransform:'uppercase', cursor:'pointer',
              fontWeight:700,
              boxShadow:'0 10px 24px rgba(176,138,63,0.40), inset 0 1px 0 rgba(255,255,255,0.42)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:12,
            }}>Reserve this residence <span style={{fontSize:18}}>→</span></button>
          )}
        </div>

        {/* === COMPARE PILL bottom-left === */}
        <button onClick={() => setCompareOn(true)} className="mono" style={{
          position:'absolute', bottom:30, left:30,
          padding:'14px 22px', borderRadius:999,
          background:'rgba(20,16,11,0.78)',
          border:'1px solid rgba(232,216,168,0.30)',
          color:'rgba(232,216,168,0.95)',
          fontSize:12, letterSpacing:'0.28em', textTransform:'uppercase',
          cursor:'pointer', zIndex:20,
          display:'inline-flex', alignItems:'center', gap:10,
          backdropFilter:'blur(8px)',
          minHeight:48,
        }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="4" width="8" height="16" rx="1"/>
            <rect x="13" y="4" width="8" height="16" rx="1"/>
          </svg>
          Compare plans
        </button>
      </div>

      {/* === COMPARE MODAL === */}
      {compareOn && (
        <CompareModal
          baseCode={pickedCode}
          baseVariant={variant}
          compareCode={compareCode}
          setCompareCode={setCompareCode}
          onClose={() => { setCompareOn(false); setCompareCode(null); }}
        />
      )}
    </div>
  );
}

// === COMPARE MODAL ===========================================================
function CompareModal({ baseCode, baseVariant, compareCode, setCompareCode, onClose }) {
  const base = TYPOLOGIES.find(ty => ty.code === baseCode);
  const compare = TYPOLOGIES.find(ty => ty.code === compareCode);
  return (
    <div style={{
      position:'absolute', inset:0, zIndex:200,
      background:'rgba(16,12,8,0.88)', backdropFilter:'blur(10px)',
      display:'flex', flexDirection:'column', padding:60,
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:30}}>
        <div>
          <div className="eyebrow" style={{color:'var(--gold)'}}>Compare</div>
          <div className="serif" style={{fontSize:52, color:'var(--parchment)', fontWeight:500, letterSpacing:'-0.02em'}}>Two plans, side by side</div>
        </div>
        <button onClick={onClose} style={{
          width:64, height:64, borderRadius:'50%',
          background:'rgba(232,216,168,0.12)',
          border:'1px solid rgba(232,216,168,0.32)',
          color:'var(--gold)', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}><Icons.close width={26} height={26}/></button>
      </div>

      <div style={{flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:30, minHeight:0}}>
        {/* LEFT — base */}
        <CompareScroll typology={base} variant={baseVariant} locked/>
        {/* RIGHT — compare picker or scroll */}
        {compare ? (
          <CompareScroll typology={compare} variant="east"/>
        ) : (
          <div style={{
            background:'rgba(232,216,168,0.06)',
            border:'1.5px dashed rgba(232,216,168,0.3)',
            borderRadius:18,
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            padding:40,
          }}>
            <div className="serif" style={{fontSize:32, color:'var(--gold)', fontWeight:400, letterSpacing:'-0.02em', marginBottom:20}}>Pick a second plan</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center', maxWidth:480}}>
              {TYPOLOGIES.filter(ty => ty.code !== baseCode).map(ty => (
                <button key={ty.code} onClick={() => setCompareCode(ty.code)} className="mono" style={{
                  padding:'14px 22px', borderRadius:999,
                  border:'1px solid rgba(232,216,168,0.32)',
                  background:'rgba(20,16,11,0.5)',
                  color:'var(--gold)',
                  fontSize:12, letterSpacing:'0.22em', textTransform:'uppercase',
                  cursor:'pointer', minHeight:50,
                }}>{ty.name}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CompareScroll({ typology, variant, locked }) {
  const v = typology[variant];
  return (
    <div style={{
      background:'#f0e4c5',
      borderRadius:14,
      padding:24,
      display:'flex', flexDirection:'column', minHeight:0,
      boxShadow:'0 18px 50px rgba(0,0,0,0.5)',
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14}}>
        <div>
          <div className="mono" style={{fontSize:11, letterSpacing:'0.28em', color:'var(--gold-deep)', textTransform:'uppercase'}}>
            {variant} facing {locked && '· anchor'}
          </div>
          <div className="serif" style={{fontSize:30, fontWeight:500, color:'var(--forest)', letterSpacing:'-0.02em', marginTop:4}}>{typology.name}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div className="mono" style={{fontSize:10, letterSpacing:'0.22em', color:'var(--slate)', textTransform:'uppercase'}}>Starting</div>
          <div className="serif" style={{fontSize:26, color:'var(--gold-deep)', fontWeight:500}}>{formatINR(typology.priceFrom, { decimals:2 })}</div>
        </div>
      </div>
      <div style={{flex:1, position:'relative', overflow:'hidden', borderRadius:8, background:'#e8d9b0'}}>
        <img src={`assets/plans/${typology.plan}.png`} alt={typology.name}
          style={{
            position:'absolute', top:0, left:0,
            height:'100%', width:'200%',
            objectFit:'contain',
            transform: `translateX(${variant === 'east' ? '0%' : '-50%'})`,
            filter:'sepia(0.14) contrast(1.04) saturate(0.92)',
            mixBlendMode:'multiply',
          }}/>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginTop:14}}>
        <CompareStat label="Saleable" value={v.saleable + ' sft'}/>
        <CompareStat label="Carpet"   value={v.carpet + ' sft'}/>
        <CompareStat label="Balcony"  value={v.balcony + ' sft'}/>
      </div>
    </div>
  );
}
function CompareStat({ label, value }) {
  return (
    <div style={{background:'rgba(20,16,11,0.06)', borderRadius:8, padding:'10px 12px'}}>
      <div className="mono" style={{fontSize:9, letterSpacing:'0.22em', color:'var(--slate)', textTransform:'uppercase'}}>{label}</div>
      <div className="serif" style={{fontSize:20, color:'var(--ink)', fontWeight:500, marginTop:2}}>{value}</div>
    </div>
  );
}

// === Soil scatter — small dirt specks for tactile floor =========================
function SoilScatter() {
  const dots = React.useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => {
      const seed = i * 91;
      return {
        x: (seed * 13) % 100,
        y: (seed * 17) % 100,
        size: 1 + (seed % 4),
        opacity: 0.15 + ((seed * 3) % 30) / 100,
        color: ['#1a1208','#2a1a0e','#3a2818','#4a3424'][seed % 4],
      };
    });
  }, []);
  return (
    <div style={{position:'absolute', inset:0, pointerEvents:'none'}}>
      {dots.map((d, i) => (
        <div key={i} style={{
          position:'absolute',
          left: d.x + '%', top: d.y + '%',
          width: d.size, height: d.size,
          borderRadius:'50%',
          background: d.color,
          opacity: d.opacity,
        }}/>
      ))}
    </div>
  );
}

// === Rolled scroll prop (CSS) ===================================================
function RolledScrollProp({ style }) {
  return (
    <div style={{ width:130, height:340, ...style, pointerEvents:'none' }}>
      {/* Main scroll cylinder */}
      <div style={{
        position:'absolute', inset:0,
        background:`
          linear-gradient(90deg,
            #8a7048 0%, #b8965f 8%, #d8b878 18%,
            #e8c888 30%, #d4b270 50%, #b8965a 70%,
            #8e7448 85%, #6a5430 100%)
        `,
        borderRadius:'30px / 14px',
        boxShadow:`
          0 14px 30px rgba(0,0,0,0.6),
          inset 0 0 30px rgba(60,40,20,0.4),
          inset 4px 0 12px rgba(255,240,200,0.35),
          inset -4px 0 12px rgba(40,24,10,0.6)
        `,
      }}/>
      {/* Inner roll (visible at top end) */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:34,
        background:'radial-gradient(ellipse at 50% 100%, #c9a865 0%, #8a7048 50%, #5a4028 100%)',
        borderRadius:'30px / 18px',
        boxShadow:'inset 0 -4px 8px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,240,200,0.4)',
      }}/>
      {/* Dirt clinging to scroll */}
      <div style={{position:'absolute', top:60, left:10, width:18, height:14, borderRadius:'50%', background:'#3a2818', opacity:0.55, filter:'blur(2px)'}}/>
      <div style={{position:'absolute', top:120, left:35, width:12, height:9, borderRadius:'50%', background:'#2a1a0e', opacity:0.6, filter:'blur(1.5px)'}}/>
      <div style={{position:'absolute', top:200, left:5, width:22, height:16, borderRadius:'50%', background:'#3a2818', opacity:0.5, filter:'blur(2.5px)'}}/>
      <div style={{position:'absolute', top:260, left:45, width:14, height:11, borderRadius:'50%', background:'#2a1a0e', opacity:0.55, filter:'blur(2px)'}}/>
      {/* Gold strap binding the scroll */}
      <div style={{
        position:'absolute', top:140, left:-6, right:-6, height:14,
        background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
        borderRadius:4,
        boxShadow:'0 2px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)',
      }}/>
    </div>
  );
}

// === Shovel/trowel prop (CSS+SVG) ===============================================
function ShovelProp({ style }) {
  return (
    <div style={{ width:80, height:220, ...style, pointerEvents:'none' }}>
      {/* Wooden handle */}
      <div style={{
        position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
        width:14, height:140,
        background:`
          linear-gradient(90deg,
            #5a3a18 0%, #8a5a28 20%, #b8884a 50%,
            #8a5a28 80%, #5a3a18 100%)
        `,
        borderRadius:7,
        boxShadow:'0 4px 10px rgba(0,0,0,0.6), inset 0 0 6px rgba(60,30,8,0.4)',
      }}/>
      {/* Gold grip wrap */}
      <div style={{
        position:'absolute', top:18, left:'50%', transform:'translateX(-50%)',
        width:20, height:24,
        background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
        borderRadius:3,
        boxShadow:'0 2px 4px rgba(0,0,0,0.5)',
      }}/>
      {/* Metal blade */}
      <svg viewBox="0 0 80 100" width="80" height="100" style={{position:'absolute', top:130, left:0}}>
        <defs>
          <linearGradient id="bladeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor="#9a9a96"/>
            <stop offset="40%" stopColor="#c8c8c2"/>
            <stop offset="100%" stopColor="#5a5a54"/>
          </linearGradient>
        </defs>
        {/* socket joint */}
        <rect x="32" y="0" width="16" height="20" fill="#3a2818" rx="2"/>
        {/* blade */}
        <path d="M 18 16 L 62 16 L 70 50 L 50 95 Q 40 100 30 95 L 10 50 Z"
              fill="url(#bladeGrad)"
              stroke="#3a3a36" strokeWidth="1.2"/>
        {/* highlight */}
        <path d="M 22 20 L 58 20 L 64 48 L 48 88 L 32 88 L 16 48 Z"
              fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8"/>
      </svg>
      {/* Dirt on blade */}
      <div style={{position:'absolute', bottom:10, left:30, width:18, height:10, borderRadius:'50%', background:'#3a2818', opacity:0.6, filter:'blur(2px)'}}/>
    </div>
  );
}

// === Herb / basil sprig (SVG) ==================================================
function HerbSprig({ style }) {
  return (
    <svg viewBox="0 0 60 80" width="60" height="80" style={{...style, pointerEvents:'none', filter:'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'}}>
      {/* Stem */}
      <path d="M 30 78 Q 28 50 32 24 Q 33 12 30 4" stroke="#4a6a38" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      {/* Leaves — paired oval leaves */}
      <g>
        {/* Bottom pair */}
        <path d="M 30 60 Q 14 56 10 44 Q 16 42 24 50 Q 28 54 30 60 Z" fill="#5a8048" stroke="#3a5028" strokeWidth="0.6"/>
        <path d="M 30 60 Q 46 56 50 44 Q 44 42 36 50 Q 32 54 30 60 Z" fill="#6a9054" stroke="#3a5028" strokeWidth="0.6"/>
        {/* Middle pair */}
        <path d="M 31 40 Q 18 36 14 24 Q 20 22 28 30 Q 30 35 31 40 Z" fill="#6a9054" stroke="#3a5028" strokeWidth="0.6"/>
        <path d="M 31 40 Q 44 36 48 24 Q 42 22 34 30 Q 32 35 31 40 Z" fill="#5a8048" stroke="#3a5028" strokeWidth="0.6"/>
        {/* Top pair (smallest) */}
        <path d="M 32 18 Q 24 14 22 6 Q 28 6 32 12 Z" fill="#7aa060" stroke="#3a5028" strokeWidth="0.5"/>
        <path d="M 32 18 Q 40 14 42 6 Q 36 6 32 12 Z" fill="#6a9054" stroke="#3a5028" strokeWidth="0.5"/>
      </g>
    </svg>
  );
}

// === Deckle / torn edges on the scroll =========================================
function DeckleEdges() {
  return (
    <>
      {/* top edge */}
      <svg viewBox="0 0 1320 24" preserveAspectRatio="none" style={{position:'absolute', top:-1, left:0, width:'100%', height:24, pointerEvents:'none'}}>
        <path d="M 0 24 L 0 12 Q 40 4 80 14 Q 130 24 180 10 Q 240 0 290 14 Q 350 22 420 8 Q 490 0 560 14 Q 640 22 720 8 Q 800 0 880 14 Q 960 22 1040 8 Q 1120 0 1200 14 Q 1270 22 1320 10 L 1320 24 Z"
              fill="#3a2a18" opacity="0.4"/>
      </svg>
      {/* bottom edge */}
      <svg viewBox="0 0 1320 24" preserveAspectRatio="none" style={{position:'absolute', bottom:-1, left:0, width:'100%', height:24, pointerEvents:'none'}}>
        <path d="M 0 0 L 0 12 Q 40 22 80 12 Q 140 0 200 14 Q 270 22 340 8 Q 410 0 480 14 Q 550 22 620 8 Q 700 0 780 14 Q 860 22 940 8 Q 1020 0 1100 14 Q 1180 22 1260 10 Q 1300 6 1320 12 L 1320 0 Z"
              fill="#3a2a18" opacity="0.4"/>
      </svg>
      {/* curling shadow on top-right (subtle paper roll) */}
      <div style={{
        position:'absolute', top:0, right:0, width:90, height:70,
        background:'radial-gradient(circle at 100% 0%, rgba(0,0,0,0.35), transparent 70%)',
        pointerEvents:'none',
      }}/>
      <div style={{
        position:'absolute', bottom:0, left:0, width:90, height:70,
        background:'radial-gradient(circle at 0% 100%, rgba(0,0,0,0.3), transparent 70%)',
        pointerEvents:'none',
      }}/>
    </>
  );
}

// === Stat cell on the right card ===============================================
function StatCell({ label, value, unit, small, text }) {
  return (
    <div style={{
      background:'rgba(255,255,255,0.5)',
      border:'1px solid rgba(232,216,168,0.4)',
      borderRadius:10,
      padding:'12px 14px',
    }}>
      <div className="mono" style={{fontSize:9, letterSpacing:'0.24em', color:'var(--slate)', textTransform:'uppercase'}}>{label}</div>
      {text ? (
        <div className="serif" style={{fontSize:15, color:'var(--ink)', fontWeight:500, marginTop:4, lineHeight:1.15}}>{value}</div>
      ) : (
        <div style={{display:'flex', alignItems:'baseline', gap:6, marginTop:4}}>
          <span className="serif" style={{fontSize: small ? 26 : 32, fontWeight:500, color:'var(--forest)', letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums'}}>{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</span>
          {unit && <span className="mono" style={{fontSize:11, color:'var(--slate)', letterSpacing:'0.1em'}}>{unit}</span>}
        </div>
      )}
    </div>
  );
}

// === Shared styles =============================================================
const zoomBtnStyle = {
  width: 48, height: 48, borderRadius: '50%',
  background: 'rgba(60,40,20,0.4)',
  border: '1px solid rgba(232,216,168,0.32)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'rgba(232,216,168,0.95)', cursor: 'pointer',
};

const labelStyle = {
  background: 'rgba(244,237,218,0.95)',
  border: '1px solid rgba(150,110,60,0.4)',
  borderRadius: 8,
  padding: '8px 12px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
  whiteSpace: 'nowrap',
};

const iconChipStyle = {
  width: 38, height: 38,
  borderRadius: 8,
  background: 'linear-gradient(180deg, var(--ivory) 0%, var(--parchment-2) 100%)',
  border: '1px solid var(--gold-deep)',
  color: 'var(--forest)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  flexShrink: 0,
};

// === Callouts library — approximate room positions per typology (% on scroll).
// fx,fy = anchor pin on the floor plan; lx,ly = label position. Tuned for east
// view. The visible plan-half occupies roughly x:25-75% and y:8-88% of the scroll.
const CALLOUTS = {
  '1BHK': [
    { name:'Living Room',    dim:`10'11" × 16'5"`,  fx:55, fy:55, lx:80, ly:18, anchor:'left',  icon: window.Icons.residences },
    { name:'Bedroom',        dim:`11'0" × 11'8"`,   fx:38, fy:40, lx:20, ly:22, anchor:'right', icon: window.Icons.residences },
    { name:'Kitchen',        dim:`7'5" × 8'0"`,     fx:46, fy:22, lx:80, ly:78, anchor:'left',  icon: window.Icons.kitchen   },
    { name:'Balcony',        dim:`5'0" × 6'5"`,     fx:42, fy:75, lx:20, ly:82, anchor:'right', icon: window.Icons.residences },
  ],
  '2BHK': [
    { name:'Living / Dining',dim:`12'0" × 18'3"`,   fx:55, fy:55, lx:80, ly:18, anchor:'left',  icon: window.Icons.residences },
    { name:'Master Bedroom', dim:`11'5" × 12'8"`,   fx:38, fy:40, lx:20, ly:22, anchor:'right', icon: window.Icons.residences },
    { name:'Kitchen',        dim:`8'0" × 10'2"`,    fx:46, fy:22, lx:80, ly:78, anchor:'left',  icon: window.Icons.kitchen   },
    { name:'Balcony',        dim:`10'11" × 5'7"`,   fx:42, fy:78, lx:20, ly:82, anchor:'right', icon: window.Icons.residences },
  ],
  '2.5BHK': [
    { name:'Living / Dining',dim:`13'0" × 18'0"`,   fx:55, fy:52, lx:80, ly:18, anchor:'left',  icon: window.Icons.residences },
    { name:'Master Bedroom', dim:`11'8" × 13'0"`,   fx:38, fy:38, lx:20, ly:22, anchor:'right', icon: window.Icons.residences },
    { name:'Study',          dim:`7'0" × 8'5"`,     fx:36, fy:70, lx:20, ly:82, anchor:'right', icon: window.Icons.specs     },
    { name:'Kitchen',        dim:`8'2" × 10'8"`,    fx:50, fy:25, lx:80, ly:78, anchor:'left',  icon: window.Icons.kitchen   },
  ],
  '3BHK-SMART': [
    { name:'Living Room',    dim:`13'8" × 16'5"`,   fx:55, fy:55, lx:80, ly:18, anchor:'left',  icon: window.Icons.residences },
    { name:'Master Bedroom', dim:`12'0" × 13'5"`,   fx:38, fy:40, lx:20, ly:22, anchor:'right', icon: window.Icons.residences },
    { name:'Kitchen',        dim:`9'0" × 11'0"`,    fx:48, fy:25, lx:80, ly:78, anchor:'left',  icon: window.Icons.kitchen   },
    { name:'Balcony',        dim:`11'5" × 5'9"`,    fx:42, fy:78, lx:20, ly:82, anchor:'right', icon: window.Icons.residences },
  ],
  '3BHK-OPTIMAL': [
    { name:'Living / Dining',dim:`15'0" × 19'8"`,   fx:55, fy:55, lx:80, ly:18, anchor:'left',  icon: window.Icons.residences },
    { name:'Master Bedroom', dim:`13'0" × 14'2"`,   fx:38, fy:38, lx:20, ly:22, anchor:'right', icon: window.Icons.residences },
    { name:'Kitchen',        dim:`9'5" × 11'8"`,    fx:48, fy:25, lx:80, ly:78, anchor:'left',  icon: window.Icons.kitchen   },
    { name:'Balcony+Utility',dim:`13'4" × 5'9"`,    fx:42, fy:78, lx:20, ly:82, anchor:'right', icon: window.Icons.residences },
  ],
  '3BHK-LUXE': [
    { name:'Living / Dining',dim:`17'0" × 22'5"`,   fx:55, fy:55, lx:80, ly:18, anchor:'left',  icon: window.Icons.residences },
    { name:'Master Suite',   dim:`14'8" × 16'0"`,   fx:38, fy:40, lx:20, ly:22, anchor:'right', icon: window.Icons.residences },
    { name:'Kitchen',        dim:`10'0" × 13'0"`,   fx:48, fy:25, lx:80, ly:78, anchor:'left',  icon: window.Icons.kitchen   },
    { name:'Wrap Balcony',   dim:`15'2" × 5'9"`,    fx:42, fy:78, lx:20, ly:82, anchor:'right', icon: window.Icons.residences },
  ],
};

window.Residences = Residences;
