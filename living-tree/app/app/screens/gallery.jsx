// GALLERY — image-led screen. Renders / Masterplan / Landscape / Floor Plans / Brochure.
//
// Layout (2560 × 1600, header consumes top ~150):
//   • Category tabs row at top (All + 5 cats from GALLERY_CATS).
//   • Responsive 3-column grid of image cards (4:3). Each card: image, tag chip,
//     title overlay.
//   • Tap card → full-screen lightbox. Swipe LEFT/RIGHT cycles through the
//     same-category subset. Tap outside the image OR close button to dismiss.
//
// Embodied: a luxury-realty UX designer keeps the background restrained on
// image-heavy screens — the images ARE the design. No aurora / no leaf field
// behind the grid; just clean parchment so the renders shine.

function Gallery() {
  const headerH = 150;
  const cats = ['All', ...GALLERY_CATS];
  const [active, setActive] = React.useState('All');
  const [openIdx, setOpenIdx] = React.useState(null);   // index within `filtered`
  const t = useLoop();

  const filtered = React.useMemo(
    () => active === 'All' ? GALLERY_ITEMS : GALLERY_ITEMS.filter(it => it.cat === active),
    [active]
  );

  // Close lightbox when the category changes
  React.useEffect(() => { setOpenIdx(null); }, [active]);

  const catCount = (c) => c === 'All'
    ? GALLERY_ITEMS.length
    : GALLERY_ITEMS.filter(x => x.cat === c).length;

  // Keyboard hooks for the lightbox (escape + arrows)
  React.useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape')                            setOpenIdx(null);
      else if (e.key === 'ArrowLeft')                    setOpenIdx(i => i === null ? null : (i - 1 + filtered.length) % filtered.length);
      else if (e.key === 'ArrowRight' || e.key === ' ')  setOpenIdx(i => i === null ? null : (i + 1) % filtered.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIdx, filtered]);

  return (
    <div data-gallery-root style={{
      position:'absolute', inset:0, background:'var(--parchment)', color:'var(--ink)', overflow:'hidden',
    }}>
      {/* very faint parchment gradient — sets the ground without competing with imagery */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
        background:'radial-gradient(ellipse at 30% 12%, rgba(251,246,234,0.62) 0%, transparent 55%), radial-gradient(ellipse at 78% 92%, rgba(232,216,168,0.20) 0%, transparent 60%)',
      }}/>

      <ScreenHeader title="Gallery" sub="Renders · Masterplan · Landscape · Floor Plans · Brochure"/>

      {/* === CATEGORY TABS ROW ====================================== */}
      <div style={{
        position:'absolute', top: headerH + 30, left: 0, right: 0,
        zIndex: 5,
      }}>
        <div className="scroll" style={{
          display:'flex', gap: 16, padding:'4px 64px 16px',
          overflowX:'auto', whiteSpace:'nowrap', alignItems:'center',
        }}>
          {cats.map((c) => {
            const isActive = c === active;
            return (
              <button key={c} onClick={() => setActive(c)} style={{
                flexShrink: 0,
                minHeight: 70,
                display:'inline-flex', alignItems:'center', gap: 14,
                padding:'18px 32px', borderRadius: 999,
                border:'1.5px solid ' + (isActive ? 'var(--gold-deep)' : 'var(--line)'),
                background: isActive
                  ? 'linear-gradient(180deg, var(--forest) 0%, var(--forest-deep) 100%)'
                  : 'var(--ivory)',
                color: isActive ? 'var(--on-tile)' : 'var(--ink)',
                cursor:'pointer',
                boxShadow: isActive
                  ? '0 12px 28px rgba(20,30,18,0.24), 0 0 0 4px rgba(201,168,101,0.16)'
                  : '0 4px 12px rgba(20,30,18,0.06)',
                transition:'all 240ms cubic-bezier(0.22,1,0.36,1)',
              }}>
                <span className="serif" style={{
                  fontSize: 26, fontWeight: 500, letterSpacing:'-0.005em',
                }}>{c}</span>
                <span className="mono" style={{
                  fontSize: 13, letterSpacing:'0.18em', fontWeight: 600,
                  padding:'4px 10px', borderRadius: 999,
                  background: isActive ? 'rgba(232,216,168,0.18)' : 'var(--parchment-3)',
                  color: isActive ? 'var(--gold-soft)' : 'var(--slate)',
                }}>{String(catCount(c)).padStart(2,'0')}</span>
              </button>
            );
          })}

          {/* counter at the right end of the row */}
          <div style={{flex: 1}}/>
          <div className="mono" style={{
            paddingRight: 16,
            fontSize: 18, letterSpacing:'0.28em', color:'var(--gold-deep)',
            display:'flex', alignItems:'baseline', gap: 8,
          }}>
            <span className="serif" style={{fontSize: 28, color:'var(--forest)', fontWeight: 600, letterSpacing:'-0.01em'}}>
              {String(filtered.length).padStart(2,'0')}
            </span>
            <span style={{opacity: 0.5}}>·</span>
            <span style={{textTransform:'uppercase'}}>items</span>
          </div>
        </div>
      </div>

      {/* === IMAGE GRID ============================================ */}
      <div className="scroll" style={{
        position:'absolute', top: headerH + 30 + 100, left: 64, right: 64, bottom: 56,
        overflowY:'auto', zIndex: 3,
      }}>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(3, 1fr)',
          gap: 28,
          paddingBottom: 24,
        }}>
          {filtered.map((it, i) => {
            const local = clamp((t - 0.04 * (i % 12)) / 0.55, 0, 1);
            const e = ease.outCubic(local);
            return (
              <button key={it.id} onClick={() => setOpenIdx(i)} style={{
                position:'relative',
                aspectRatio:'4 / 3',
                borderRadius: 20,
                overflow:'hidden',
                padding: 0,
                border:'1.5px solid var(--line)',
                background:'#1a1f17',
                cursor:'pointer',
                opacity: e,
                transform: `translateY(${(1 - e) * 14}px)`,
                boxShadow:'0 14px 32px rgba(20,30,18,0.18), 0 4px 10px rgba(20,30,18,0.10)',
                transition:'transform 280ms cubic-bezier(0.22,1,0.36,1), box-shadow 280ms',
              }}
              onMouseEnter={(ev) => {
                ev.currentTarget.style.transform = `translateY(${(1 - e) * 14 - 4}px)`;
                ev.currentTarget.style.boxShadow = '0 22px 48px rgba(20,30,18,0.30), 0 0 0 2px rgba(201,168,101,0.42)';
              }}
              onMouseLeave={(ev) => {
                ev.currentTarget.style.transform = `translateY(${(1 - e) * 14}px)`;
                ev.currentTarget.style.boxShadow = '0 14px 32px rgba(20,30,18,0.18), 0 4px 10px rgba(20,30,18,0.10)';
              }}>
                <img src={it.src} alt={it.title} loading="lazy"
                  style={{
                    width:'100%', height:'100%', objectFit:'cover', display:'block',
                    pointerEvents:'none',
                  }}
                  onError={(ev) => {
                    ev.currentTarget.style.display = 'none';
                    ev.currentTarget.parentElement.style.background = 'linear-gradient(135deg, var(--forest-soft), var(--forest-deep))';
                  }}
                />

                {/* tag chip — top-left */}
                <div style={{
                  position:'absolute', top: 16, left: 16,
                  padding:'8px 14px', borderRadius: 999,
                  background:'rgba(20, 30, 18, 0.62)',
                  backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
                  border:'1px solid rgba(232,216,168,0.30)',
                  color:'var(--gold-soft)',
                  fontFamily:'JetBrains Mono, monospace',
                  fontSize: 12, letterSpacing:'0.24em', textTransform:'uppercase',
                  fontWeight: 600,
                }}>{it.tag}</div>

                {/* gradient + title — bottom */}
                <div style={{
                  position:'absolute', left:0, right:0, bottom:0,
                  background:'linear-gradient(180deg, transparent 0%, rgba(15, 20, 14, 0.92) 100%)',
                  padding:'48px 22px 18px',
                  pointerEvents:'none',
                }}>
                  <div className="serif" style={{
                    fontSize: 24, fontWeight: 500, lineHeight: 1.14, letterSpacing:'-0.012em',
                    color:'#fbf6ea',
                    textShadow:'0 2px 8px rgba(0,0,0,0.5)',
                  }}>{it.title}</div>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div style={{
              gridColumn:'1 / -1', textAlign:'center', padding:'80px 0',
              color:'var(--slate)', fontStyle:'italic', fontFamily:'Cormorant Garamond, serif',
              fontSize: 28,
            }}>No imagery in this category yet.</div>
          )}
        </div>
      </div>

      {/* === LIGHTBOX OVERLAY ====================================== */}
      {openIdx !== null && filtered[openIdx] && (
        <Lightbox
          item={filtered[openIdx]}
          index={openIdx}
          total={filtered.length}
          onPrev={() => setOpenIdx(i => (i - 1 + filtered.length) % filtered.length)}
          onNext={() => setOpenIdx(i => (i + 1) % filtered.length)}
          onClose={() => setOpenIdx(null)}
        />
      )}
    </div>
  );
}

// ============================================================================
// Lightbox — full-bleed image with tag/title/category at the bottom.
// Swipe LEFT → next, RIGHT → prev. Tap outside image / close btn = dismiss.
// ============================================================================
function Lightbox({ item, index, total, onPrev, onNext, onClose }) {
  const t = useLoop();
  const fade = clamp(t / 0.32, 0, 1);

  // Swipe gestures bound to the image stage (not the backdrop, which is for dismiss)
  const swipe = useSwipe({
    onLeft:  onNext,
    onRight: onPrev,
    threshold: 60,
  });

  return (
    <div onClick={onClose} style={{
      position:'absolute', inset:0, zIndex: 60,
      background:`rgba(10, 14, 9, ${0.94 * fade})`,
      display:'flex', alignItems:'center', justifyContent:'center',
      cursor:'pointer',
    }}>
      {/* image stage — swallows clicks so the backdrop only fires on the edges */}
      <div
        {...swipe}
        onClick={(e) => e.stopPropagation()}
        style={{
          position:'relative',
          width: '82%', height: '84%',
          borderRadius: 20, overflow:'hidden',
          background:'#0a0e09',
          opacity: fade,
          transform: `scale(${0.96 + 0.04 * fade})`,
          transition:'transform 320ms cubic-bezier(0.22,1,0.36,1)',
          boxShadow:'0 60px 120px rgba(0,0,0,0.45), 0 0 0 1px rgba(232,216,168,0.18)',
          cursor:'default',
        }}>
        <img src={item.src} alt={item.title}
          style={{
            width:'100%', height:'100%', objectFit:'contain',
            background:'#0a0e09', display:'block',
          }}
          onError={(ev) => { ev.currentTarget.style.opacity = 0.2; }}
        />

        {/* top bar — counter + close */}
        <div style={{
          position:'absolute', top: 24, left: 28, right: 28,
          display:'flex', justifyContent:'space-between', alignItems:'center',
          pointerEvents:'none',
        }}>
          <div className="mono" style={{
            padding:'12px 22px', borderRadius: 999,
            background:'rgba(20, 30, 18, 0.62)',
            backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
            border:'1px solid rgba(232,216,168,0.32)',
            color:'var(--gold-soft)',
            fontSize: 14, letterSpacing:'0.32em', textTransform:'uppercase',
            fontWeight: 600,
            pointerEvents:'auto',
          }}>{item.cat} · {String(index + 1).padStart(2,'0')} / {String(total).padStart(2,'0')}</div>

          <button onClick={onClose} aria-label="close" style={{
            pointerEvents:'auto',
            width: 64, height: 64, borderRadius:'50%',
            background:'rgba(20, 30, 18, 0.72)',
            backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
            border:'1px solid rgba(232,216,168,0.42)',
            color:'var(--gold-soft)',
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer',
          }}>
            <span style={{display:'inline-flex', width: 26, height: 26}}><Icons.close/></span>
          </button>
        </div>

        {/* bottom caption — tag · title */}
        <div style={{
          position:'absolute', left:0, right:0, bottom:0,
          padding:'80px 56px 40px',
          background:'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.78) 100%)',
          color:'#fbf6ea',
          pointerEvents:'none',
        }}>
          <div className="mono" style={{
            fontSize: 14, letterSpacing:'0.34em', color:'var(--gold-soft)',
            textTransform:'uppercase', fontWeight: 600,
          }}>{item.tag}</div>
          <div className="serif" style={{
            marginTop: 14,
            fontSize: 52, fontWeight: 400, lineHeight: 1.04, letterSpacing:'-0.018em',
          }}>{item.title}</div>
        </div>

        {/* swipe hint — only first 4s */}
        {t < 4 && total > 1 && (
          <div style={{
            position:'absolute', top:'50%', left: '50%', transform:'translate(-50%, -50%)',
            display:'flex', alignItems:'center', gap: 14,
            padding:'14px 22px', borderRadius: 999,
            background:'rgba(20,30,18,0.55)',
            border:'1px solid rgba(232,216,168,0.30)',
            color:'var(--gold-soft)',
            opacity: clamp((4 - t) / 1.5, 0, 0.85),
            pointerEvents:'none',
          }}>
            <span style={{display:'inline-flex', width: 24, height: 24}}><Icons.swipe/></span>
            <span className="mono" style={{fontSize: 13, letterSpacing:'0.28em', textTransform:'uppercase'}}>Swipe to step</span>
          </div>
        )}
      </div>
    </div>
  );
}

window.Gallery = Gallery;
