// LivingTree · Splash
// ---------------------------------------------------------------------------
// Forest-green ground. The brand reveal is choreographed in three soft beats:
//
//   0.0–1.6s   monogram wreath unfurls top-to-bottom (clip-path animated via
//              the built-in `progress` prop on LivingTreeMonogram).
//   1.6–2.6s   "Designed for Life." headline blurs-to-clear under the wreath.
//   2.4–3.2s   italic sub-line settles in.
//   3.0–4.2s   chrome (wordmark + Kalyani lockup + skip hint) breathes in.
//   4.2s       auto-advance → /home.
//
// Tap anywhere at any time → instant skip with a gold burst at the tap point.
// LeafField + LightRays + SparkleField run continuously in the background;
// the ground is the same forest-green substrate the brochure cover uses so
// the splash reads as "the brochure opens, then dissolves into the suite."

function Splash() {
  const t = useLoop();
  const [exiting, setExiting] = React.useState(false);
  const [bursts, fireBurst]   = useBurst(900);

  // ---------- timing ----------
  // Monogram clip-path reveal — eased so the leaves seem to grow in.
  const wreathRaw = clamp((t - 0.0) / 1.6);
  const wreathP   = ease.outQuart(wreathRaw);

  const headP    = clamp((t - 1.6) / 1.0);   // "Designed for Life."
  const headBlur = (1 - headP) * 14;         // px
  const headLift = (1 - headP) * 22;         // translateY

  const subP     = clamp((t - 2.4) / 0.8);   // italic underline
  const chromeP  = clamp((t - 3.0) / 1.2);   // wordmark + Kalyani + skip hint

  // Auto-advance timer (only fires if user hasn't skipped first).
  React.useEffect(() => {
    const id = setTimeout(() => {
      if (!exiting) { setExiting(true); setTimeout(() => navigate('home'), 280); }
    }, 4200);
    return () => clearTimeout(id);
  }, [exiting]);

  // Tap-anywhere → burst + skip
  const handleTap = (ev) => {
    if (exiting) return;
    const bezelEl = document.querySelector('.tablet-bezel');
    if (!bezelEl) return;
    const root = bezelEl.getBoundingClientRect();
    const scale = root.width / 2560;
    const x = (ev.clientX - root.left) / scale;
    const y = (ev.clientY - root.top)  / scale;
    fireBurst(x, y, { count: 14 });
    setExiting(true);
    setTimeout(() => navigate('home'), 300);
  };

  // Bottom-of-screen tap hint pulse (gentle "press anywhere" cue once chrome is in)
  const tapHintPulse = 0.55 + 0.45 * Math.sin(t * 2.4);

  return (
    <div
      onClick={handleTap}
      style={{
        position:'absolute', inset:0,
        background: 'radial-gradient(ellipse 90% 78% at 50% 46%, #2a4329 0%, #1f3522 55%, #0e1b10 100%)',
        color:'var(--gold-soft)',
        overflow:'hidden',
        cursor:'pointer',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 280ms ease-out',
      }}
    >
      {/* ============================================================
          AMBIENT LAYERS — drift behind everything.
          - LeafField: dark-green + gold leaves drifting across.
            We invert its blend so it reads on the dark ground.
          - LightRays: soft beam of warm light from upper-left.
          - SparkleField: gold dust glints.
          ============================================================ */}
      <div style={{position:'absolute', inset:0, opacity: 0.75, mixBlendMode:'screen'}}>
        <LeafField count={36} opacity={0.7} color="rgba(168,194,147," goldRatio={0.4}/>
      </div>
      <LightRays opacity={0.34}/>
      <SparkleField count={26} opacity={0.55}/>

      {/* warm gold halo behind the wreath — grows with the reveal */}
      <div style={{
        position:'absolute', left:'50%', top:'46%',
        width: 1400, height: 1400, marginLeft:-700, marginTop:-700,
        background: 'radial-gradient(circle, rgba(232,216,168,0.22) 0%, rgba(201,168,101,0.10) 28%, transparent 62%)',
        opacity: 0.4 + 0.6 * wreathP,
        filter: `blur(${20 + 24 * (1 - wreathP)}px)`,
        transition: 'opacity 320ms ease-out',
        pointerEvents:'none', zIndex: 1,
      }}/>

      {/* fine horizon line — gold thread at logo midline, opens with the wreath */}
      <div style={{
        position:'absolute', left:'50%', top: 720,
        width: 2200 * wreathP, height: 1, marginLeft: -1100 * wreathP,
        background: 'linear-gradient(90deg, transparent, rgba(232,216,168,0.5) 20%, rgba(232,216,168,0.85) 50%, rgba(232,216,168,0.5) 80%, transparent)',
        boxShadow: '0 0 12px rgba(232,216,168,0.35)',
        opacity: 0.5 * wreathP * (1 - headP * 0.5),
        pointerEvents:'none', zIndex: 1,
      }}/>

      {/* ============================================================
          MONOGRAM — leaf wreath ring with LT centre. The built-in
          clip-path makes it reveal top → bottom from progress 0 → 1.
          Sized big so it reads as the focal point of the splash.
          ============================================================ */}
      <div style={{
        position:'absolute', left:'50%', top: 720,
        transform: `translate(-50%, -50%) scale(${0.94 + 0.06 * wreathP})`,
        filter: `drop-shadow(0 0 ${36 * wreathP}px rgba(232,216,168,${0.55 * wreathP}))`,
        zIndex: 5,
        pointerEvents:'none',
      }}>
        <LivingTreeMonogram size={420} progress={wreathP} color="#e8d8a8"/>
      </div>

      {/* ============================================================
          HEADLINE — "Designed for Life." gold serif.
          Blur-to-clear + slight lift, anchored below the wreath.
          ============================================================ */}
      <div style={{
        position:'absolute', left:0, right:0,
        top: 980,
        textAlign:'center',
        opacity: headP,
        filter: `blur(${headBlur}px)`,
        transform: `translateY(${headLift}px)`,
        transition: 'opacity 380ms ease, filter 380ms ease, transform 380ms ease',
        zIndex: 5,
        pointerEvents:'none',
      }}>
        <div className="serif" style={{
          fontSize: 220, fontWeight: 400, lineHeight: 1,
          letterSpacing: '-0.02em',
          color: '#e8d8a8',
          textShadow: '0 4px 40px rgba(232,216,168,0.35), 0 0 80px rgba(201,168,101,0.25)',
        }}>
          Designed for <span style={{fontStyle:'italic'}}>Life.</span>
        </div>
      </div>

      {/* ============================================================
          SUB-LINE — italic serif tagline. Hairline divider on either
          side gives the line a small "frame" so it reads as a
          deliberate caption, not floating copy.
          ============================================================ */}
      <div style={{
        position:'absolute', left:0, right:0, top: 1210,
        display:'flex', alignItems:'center', justifyContent:'center', gap:32,
        opacity: subP,
        transform: `translateY(${(1 - subP) * 14}px)`,
        transition: 'opacity 320ms ease, transform 320ms ease',
        zIndex: 5,
        pointerEvents:'none',
      }}>
        <div style={{width: 80 * subP, height:1, background:'rgba(232,216,168,0.55)'}}/>
        <div className="serif" style={{
          fontSize: 38, fontStyle:'italic', fontWeight: 300,
          color: 'rgba(232,216,168,0.85)',
          letterSpacing: '0.01em',
          textShadow: '0 0 24px rgba(201,168,101,0.20)',
        }}>
          Rooted in Luxury, Branching into the Future
        </div>
        <div style={{width: 80 * subP, height:1, background:'rgba(232,216,168,0.55)'}}/>
      </div>

      {/* ============================================================
          BOTTOM-LEFT — LivingTree wordmark + RERA hairline.
          ============================================================ */}
      <div style={{
        position:'absolute', left: 80, bottom: 80,
        opacity: chromeP,
        transform: `translateY(${(1 - chromeP) * 12}px)`,
        transition: 'opacity 480ms ease, transform 480ms ease',
        zIndex: 6,
        pointerEvents:'none',
      }}>
        <div style={{display:'flex', flexDirection:'column', gap: 14}}>
          <LivingTreeWordmark size={48} color="#e8d8a8" tight/>
          <div className="mono" style={{
            fontSize: 14, letterSpacing:'0.3em',
            color:'rgba(232,216,168,0.55)', textTransform:'uppercase',
          }}>
            North Bengaluru · KIADB Aerospace Park
          </div>
        </div>
      </div>

      {/* ============================================================
          BOTTOM-RIGHT — Kalyani triangle + credit lockup.
          ============================================================ */}
      <div style={{
        position:'absolute', right: 80, bottom: 80,
        opacity: chromeP,
        transform: `translateY(${(1 - chromeP) * 12}px)`,
        transition: 'opacity 480ms ease, transform 480ms ease',
        zIndex: 6,
        pointerEvents:'none',
        display:'flex', alignItems:'center', gap: 22,
      }}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap: 8}}>
          <div className="mono" style={{
            fontSize: 13, letterSpacing:'0.32em',
            color:'rgba(232,216,168,0.55)', textTransform:'uppercase',
          }}>A Kalyani Developers Project</div>
          <div style={{display:'flex', alignItems:'center', gap: 12}}>
            <div style={{height:1, width: 48, background:'rgba(232,216,168,0.4)'}}/>
            <span className="serif" style={{
              fontSize: 22, fontStyle:'italic', color:'rgba(232,216,168,0.7)',
            }}>30+ years rooted</span>
          </div>
        </div>
        <div style={{
          background:'rgba(245,239,217,0.92)',
          padding: 10, borderRadius: 6,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(232,216,168,0.5)',
        }}>
          <KalyaniTriangle size={72}/>
        </div>
      </div>

      {/* ============================================================
          SKIP HINT — bottom-centre. Pulses gently once chrome is in.
          ============================================================ */}
      <div style={{
        position:'absolute', left:0, right:0, bottom: 200,
        textAlign:'center',
        opacity: chromeP * tapHintPulse,
        transition: 'opacity 480ms ease',
        zIndex: 6,
        pointerEvents:'none',
      }}>
        <div className="mono" style={{
          fontSize: 15, letterSpacing:'0.5em',
          color:'rgba(232,216,168,0.7)', textTransform:'uppercase',
        }}>Tap anywhere to enter</div>
      </div>

      {/* ============================================================
          BURST LAYER — tap reward.
          ============================================================ */}
      <BurstLayer bursts={bursts} zIndex={20}/>
    </div>
  );
}

window.Splash = Splash;
