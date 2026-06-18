// LivingTree · Splash v3 — Real Leaf Pile
// ---------------------------------------------------------------------------
// Uses 16 REAL leaf bunches extracted from the client SVG via spatial clustering
// (leaf_bank.jsx). Each leaf is rendered as a group of overlapping path parts
// preserving the source's lobed silhouette + central vein + side veins.
// 220 leaves are stamped edge-to-edge across the 2560×1600 canvas using
// jittered 14×10 grid + 60 center-bias extras for pile depth around the reveal.
// Sweep radius 420px; reveal threshold 0.50 (1–2 swipes clear the centre).
// On reveal, the transparent crisp logo PNG fades in centered with gold halo;
// tap anywhere → gold burst + navigate('home').

function Splash() {
  const W = 2560, H = 1600;
  const t = useLoop();

  // ---------- 1 · GENERATE LEAVES ONCE ON MOUNT ----------
  const leavesRef = React.useRef(null);
  if (leavesRef.current === null) {
    const bank = (window.LEAF_BANK && window.LEAF_BANK.length >= 4) ? window.LEAF_BANK : null;
    if (bank) {
      const arr = [];
      let id = 0;
      // Even coverage grid 14×10 → 140 cells, 1-2 leaves per cell
      const cols = 14, rows = 10;
      const cw = W / cols, rh = H / rows;
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const n = 1 + (Math.random() < 0.65 ? 1 : 0);
          for (let k = 0; k < n; k++) {
            const tplIdx = Math.floor(Math.random() * bank.length);
            const x = cx * cw + Math.random() * cw;
            const y = cy * rh + Math.random() * rh;
            arr.push(makeLeaf(id++, tplIdx, x, y));
          }
        }
      }
      // 60 extra center-biased for pile depth
      for (let i = 0; i < 60; i++) {
        const tplIdx = Math.floor(Math.random() * bank.length);
        // Gaussian via mean-of-3
        const r = ((Math.random()+Math.random()+Math.random())/3) * 0.7;
        const ang = Math.random() * Math.PI * 2;
        const x = W/2 + Math.cos(ang) * r * Math.min(W, H) * 0.5;
        const y = H/2 + Math.sin(ang) * r * Math.min(W, H) * 0.5;
        arr.push(makeLeaf(id++, tplIdx, x, y));
      }
      // Sort by depth so back leaves render first
      arr.sort((a, b) => a.depth - b.depth);
      leavesRef.current = arr;
    } else {
      leavesRef.current = [];
    }
  }

  function makeLeaf(id, tplIdx, x, y) {
    return {
      id, tplIdx,
      settleX: x, settleY: y,
      introStartX: lerp(W/2, x, 0.20) + (Math.random()-0.5) * 80,
      introStartY: lerp(H/2, y, 0.20) + (Math.random()-0.5) * 80,
      rot: Math.random() * 360,
      scale: 0.6 + Math.random() * 1.2,   // 0.6–1.8 — big variation for natural pile
      wobbleSeed: Math.random() * 6.283,
      wobbleAmpX: 4 + Math.random() * 9,
      wobbleAmpY: 4 + Math.random() * 9,
      wobbleRot:  2 + Math.random() * 5,
      depth: Math.random(),
      tint: Math.random() < 0.08 ? 'gold' : (Math.random() < 0.5 ? 'fresh' : 'deep'),
      status: 'alive',
      blownStartT: 0, blownDirX: 0, blownDirY: 0, blownSpeed: 0, blownSpin: 0,
    };
  }
  const leaves = leavesRef.current;

  // ---------- 2 · STATE MACHINE ----------
  const [phase, setPhase] = React.useState('intro');
  const [clearance, setClearance] = React.useState(1.0);
  const [bursts, fireBurst] = useBurst(900);
  const [hint, setHint] = React.useState(false);
  const swipedRef = React.useRef(false);

  React.useEffect(() => {
    const tm = setTimeout(() => setPhase(p => p === 'intro' ? 'idle' : p), 1500);
    return () => clearTimeout(tm);
  }, []);

  React.useEffect(() => {
    if (phase !== 'idle') return;
    const tm = setTimeout(() => {
      if (!swipedRef.current) setHint(true);
    }, 2500);
    return () => clearTimeout(tm);
  }, [phase]);

  // ---------- 3 · SWIPE PHYSICS ----------
  const containerRef = React.useRef(null);
  const downRef = React.useRef(false);
  const lastRef = React.useRef(null);

  const canvasToContainer = (evX, evY) => {
    const el = containerRef.current;
    if (!el) return [evX, evY];
    const rect = el.getBoundingClientRect();
    return [
      (evX - rect.left) * (W / rect.width),
      (evY - rect.top)  * (H / rect.height),
    ];
  };

  const distToSegment = (px, py, ax, ay, bx, by) => {
    const vx = bx - ax, vy = by - ay;
    const wx = px - ax, wy = py - ay;
    const c1 = vx*wx + vy*wy;
    if (c1 <= 0) return Math.hypot(px - ax, py - ay);
    const c2 = vx*vx + vy*vy;
    if (c2 <= c1) return Math.hypot(px - bx, py - by);
    const b = c1 / c2;
    return Math.hypot(px - (ax + b * vx), py - (ay + b * vy));
  };

  const blowAlong = (ax, ay, bx, by, m) => {
    const dirX = (bx - ax) / (m || 1);
    const dirY = (by - ay) / (m || 1);
    const baseSpeed = Math.max(950, m * 75);
    const RADIUS = 420;
    let did = false;
    for (const l of leaves) {
      if (l.status !== 'alive') continue;
      const d = distToSegment(l.settleX, l.settleY, ax, ay, bx, by);
      if (d < RADIUS) {
        const k = 1 - d / RADIUS;
        l.status = 'blown';
        l.blownStartT = performance.now() / 1000;
        const jx = (Math.random()-0.5) * 0.55;
        const jy = (Math.random()-0.5) * 0.55;
        let nx = dirX + jx, ny = dirY + jy;
        const n = Math.hypot(nx, ny) || 1;
        l.blownDirX = nx / n; l.blownDirY = ny / n;
        l.blownSpeed = baseSpeed * (0.75 + 0.55 * k);
        l.blownSpin = (Math.random() - 0.5) * 1620;
        did = true;
      }
    }
    return did;
  };

  const onPointerDown = (e) => {
    if (phase === 'exiting') return;
    const [x, y] = canvasToContainer(e.clientX, e.clientY);
    if (phase === 'revealed') {
      fireBurst(x, y, { count: 22 });
      setPhase('exiting');
      setTimeout(() => navigate('home'), 320);
      return;
    }
    downRef.current = true;
    lastRef.current = { x, y };
    setHint(false);
  };
  const onPointerMove = (e) => {
    if (!downRef.current || phase === 'exiting') return;
    const [x, y] = canvasToContainer(e.clientX, e.clientY);
    const last = lastRef.current;
    if (last) {
      const dx = x - last.x, dy = y - last.y;
      const m = Math.hypot(dx, dy);
      if (m > 16) {
        if (blowAlong(last.x, last.y, x, y, m)) {
          swipedRef.current = true;
          setHint(false);
        }
        lastRef.current = { x, y };
      }
    } else {
      lastRef.current = { x, y };
    }
  };
  const onPointerUp = () => {
    downRef.current = false;
    lastRef.current = null;
  };

  // ---------- 4 · CLEARANCE CHECK ----------
  const centerCountRef = React.useRef(null);
  if (centerCountRef.current === null && leaves.length) {
    const R = 640;
    centerCountRef.current = leaves.filter(l =>
      Math.hypot(l.settleX - W/2, l.settleY - H/2) < R
    ).length;
  }
  React.useEffect(() => {
    const id = setInterval(() => {
      if (phase === 'exiting') return;
      const R = 640;
      let alive = 0;
      for (const l of leaves) {
        if (l.status === 'alive' && Math.hypot(l.settleX - W/2, l.settleY - H/2) < R) alive++;
      }
      const ratio = (centerCountRef.current || 1) > 0 ? alive / centerCountRef.current : 0;
      setClearance(ratio);
      if (phase === 'idle' && ratio <= 0.50) setPhase('revealed');
    }, 80);
    return () => clearInterval(id);
  }, [phase, leaves]);

  // ---------- 5 · RENDER ----------
  const introP = clamp((t - 0) / 1.5);
  const introE = ease.outCubic(introP);
  const revealP = (phase === 'revealed' || phase === 'exiting') ? 1 : 0;
  const haloIntensity = phase === 'revealed' ? 1 : (1 - clearance) * 0.8;
  const nowSec = t;

  const renderLeaves = [];
  for (const l of leaves) {
    if (l.status === 'gone') continue;
    let x = l.settleX, y = l.settleY, r = l.rot, s = l.scale, a = 1;
    if (l.status === 'blown') {
      const p = clamp((nowSec - l.blownStartT) / 0.9);
      if (p >= 1) { l.status = 'gone'; continue; }
      const pe = ease.outQuart(p);
      x = l.settleX + l.blownDirX * l.blownSpeed * 0.9 * pe;
      y = l.settleY + l.blownDirY * l.blownSpeed * 0.9 * pe;
      r = l.rot + l.blownSpin * p;
      s = l.scale * (1 + 0.45 * p);
      a = p < 0.55 ? 1 : 1 - (p - 0.55) / 0.45;
    } else if (phase === 'intro') {
      x = lerp(l.introStartX, l.settleX, introE);
      y = lerp(l.introStartY, l.settleY, introE);
      a = introE;
    } else {
      x += Math.sin((nowSec + l.wobbleSeed) * 0.4) * l.wobbleAmpX;
      y += Math.cos((nowSec + l.wobbleSeed) * 0.32) * l.wobbleAmpY;
      r += Math.sin((nowSec + l.wobbleSeed) * 0.5) * l.wobbleRot;
    }
    renderLeaves.push({ l, x, y, r, s, a });
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{
        position:'absolute', inset:0,
        background:'radial-gradient(ellipse 92% 80% at 50% 50%, #2a4329 0%, #1f3522 55%, #0c1a0e 100%)',
        overflow:'hidden',
        touchAction:'none',
        cursor: phase === 'revealed' ? 'pointer' : 'grab',
        opacity: phase === 'exiting' ? 0 : 1,
        transition: 'opacity 320ms ease',
      }}
    >
      {/* Ambient gold dust */}
      <SparkleField count={40} opacity={0.5}/>

      {/* Gold halo behind hidden logo */}
      <div style={{
        position:'absolute', left:'50%', top:'50%',
        width: 1700, height: 1700, marginLeft:-850, marginTop:-850,
        background:'radial-gradient(circle, rgba(232,216,168,0.34) 0%, rgba(201,168,101,0.16) 30%, transparent 65%)',
        opacity: 0.30 + 0.70 * haloIntensity,
        filter: `blur(${22 + 32 * (1 - haloIntensity)}px)`,
        transition: 'opacity 480ms ease, filter 480ms ease',
        pointerEvents:'none', zIndex: 1,
      }}/>

      {/* ============================================================
          THE LEAF PILE — 220 real leaves from the source SVG
          ============================================================ */}
      <svg
        width={W} height={H} viewBox={`0 0 ${W} ${H}`}
        style={{position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex: 2}}
      >
        <defs>
          <linearGradient id="leafGradFresh" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0"      stopColor="#98DDBC"/>
            <stop offset="0.6089" stopColor="#56A67F"/>
            <stop offset="1"      stopColor="#1C4C3E"/>
          </linearGradient>
          <linearGradient id="leafGradDeep" x1="0.2" y1="0.1" x2="0.8" y2="0.9">
            <stop offset="0"      stopColor="#7fcaa6"/>
            <stop offset="0.55"   stopColor="#3d8462"/>
            <stop offset="1"      stopColor="#0e2c23"/>
          </linearGradient>
          <linearGradient id="leafGradGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0"   stopColor="#f0d9a0"/>
            <stop offset="0.55" stopColor="#c9a865"/>
            <stop offset="1"   stopColor="#7a5a26"/>
          </linearGradient>
        </defs>
        {renderLeaves.map(({ l, x, y, r, s, a }) => {
          const tpl = window.LEAF_BANK[l.tplIdx];
          if (!tpl) return null;
          const bb = tpl.bbox;
          const grad = l.tint === 'gold' ? 'leafGradGold'
                     : l.tint === 'fresh' ? 'leafGradFresh'
                     : 'leafGradDeep';
          // Source-SVG units are tiny (504×288 viewBox). Scale ×3.8 maps a 50-unit leaf to ~190px before per-instance scale.
          const k = s * 3.8;
          return (
            <g
              key={l.id}
              transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`}
              opacity={a}
            >
              <g transform={`translate(${-bb[0] - bb[2]/2} ${-bb[1] - bb[3]/2})`}>
                {tpl.parts.map((d, i) => (
                  <path key={i} d={d} fill={`url(#${grad})`} stroke="rgba(15,30,18,0.18)" strokeWidth="0.25"/>
                ))}
              </g>
            </g>
          );
        })}
      </svg>

      {/* ============================================================
          REVEAL — clean transparent logo
          ============================================================ */}
      <div style={{
        position:'absolute', inset:0,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        opacity: revealP,
        transition: 'opacity 760ms ease',
        zIndex: 4,
        pointerEvents:'none',
      }}>
        <img
          src="assets/brand/livingtree-mark-2x.png"
          width={920}
          height={920 * (176/438)}
          draggable="false"
          alt="LivingTree"
          style={{
            display:'block',
            filter:'drop-shadow(0 8px 36px rgba(232,216,168,0.55)) drop-shadow(0 0 90px rgba(201,168,101,0.40))',
            transform: `scale(${0.92 + 0.08 * revealP})`,
            transition: 'transform 760ms cubic-bezier(.2,.7,.2,1)',
          }}
        />
        <div className="serif" style={{
          marginTop: 44, fontSize: 46, fontStyle:'italic', fontWeight: 400,
          color:'var(--gold-soft)', letterSpacing:'0.01em',
          textShadow:'0 2px 22px rgba(0,0,0,0.45)',
          opacity: 0.55 + 0.45 * Math.sin(t * 2),
          transition: 'opacity 480ms ease',
        }}>
          Tap to enter
        </div>
        <div className="mono" style={{
          marginTop: 20, fontSize: 14, letterSpacing:'0.48em',
          color:'rgba(232,216,168,0.55)', textTransform:'uppercase',
        }}>
          A Kalyani Developers Project
        </div>
      </div>

      {/* ============================================================
          AFFORDANCE HINT
          ============================================================ */}
      {hint && phase === 'idle' && (
        <div style={{
          position:'absolute', left:0, right:0, bottom: 220,
          display:'flex', alignItems:'center', justifyContent:'center', gap: 24,
          color:'rgba(232,216,168,0.78)',
          zIndex: 5,
          pointerEvents:'none',
          animation: 'pulseHint 2.6s ease-in-out infinite',
        }}>
          <SwipeArrow t={t} dir={-1}/>
          <div className="mono" style={{fontSize: 17, letterSpacing:'0.48em', textTransform:'uppercase'}}>
            Swipe to reveal
          </div>
          <SwipeArrow t={t} dir={1}/>
        </div>
      )}
      <style>{`@keyframes pulseHint { 0%,100%{opacity:0.55} 50%{opacity:1} }`}</style>

      {/* BOTTOM-LEFT CHROME */}
      <div style={{
        position:'absolute', left: 80, bottom: 80,
        zIndex: 6, pointerEvents:'none',
        opacity: phase === 'intro' ? 0 : (phase === 'exiting' ? 0 : 1),
        transition: 'opacity 520ms ease 200ms',
      }}>
        <div style={{display:'flex', flexDirection:'column', gap: 12}}>
          <LivingTreeWordmark size={44} color="#e8d8a8" tight/>
          <div className="mono" style={{
            fontSize: 12, letterSpacing:'0.34em',
            color:'rgba(232,216,168,0.55)', textTransform:'uppercase',
          }}>North Bengaluru · KIADB Aerospace Park</div>
        </div>
      </div>

      {/* BOTTOM-RIGHT CHROME */}
      <div style={{
        position:'absolute', right: 80, bottom: 80,
        zIndex: 6, pointerEvents:'none',
        opacity: phase === 'intro' ? 0 : (phase === 'exiting' ? 0 : 1),
        transition: 'opacity 520ms ease 200ms',
        display:'flex', alignItems:'center', gap: 18,
      }}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap: 4}}>
          <div className="mono" style={{fontSize: 11, letterSpacing:'0.34em', color:'rgba(232,216,168,0.55)', textTransform:'uppercase'}}>
            A Kalyani Developers Project
          </div>
          <div className="serif" style={{fontSize: 18, fontStyle:'italic', color:'rgba(232,216,168,0.7)'}}>
            30+ years rooted
          </div>
        </div>
        <div style={{
          background:'rgba(245,239,217,0.92)',
          padding: 8, borderRadius: 4,
          boxShadow:'0 6px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(232,216,168,0.5)',
        }}>
          <KalyaniTriangle size={56}/>
        </div>
      </div>

      <BurstLayer bursts={bursts} zIndex={20}/>
    </div>
  );
}

function SwipeArrow({ t, dir }) {
  const x = dir * (Math.sin(t * 2.4) * 14);
  return (
    <svg width={60} height={20} viewBox="0 0 60 20" style={{transform:`translateX(${x}px)`, transition:'transform 80ms linear'}}>
      <path d={dir < 0
        ? 'M56 10 L4 10 M14 4 L4 10 L14 16'
        : 'M4 10 L56 10 M46 4 L56 10 L46 16'}
        fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

window.Splash = Splash;
