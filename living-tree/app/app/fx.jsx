// LivingTree · FX library — shared interactive visual primitives
//
// Exports (window.*):
//   ForestAurora     — drifting green/gold blobs ambience for parchment ground
//   LeafField        — drifting + twirling leaf particles (forest atmosphere)
//   FilmGrain        — SVG noise overlay (paper texture)
//   Magnetic         — wraps a child to pull it toward cursor (kept for mouse demos)
//   TiltCard / ShimmerSweep / CounterFlip / Donut — universal primitives
//   ConfettiCannon   — gold + green confetti burst at coords
//   useRipple / RippleLayer — gold ring ripple on tap
//   useBurst / BurstLayer   — chunky tap-particle burst (tablet tap reward)
//   TreeSketch       — pencil-drawn tree silhouette, loops draw-and-fade
//   LightRays        — diagonal god-rays warmth
//   SparkleField     — slow gold sparkle pulses

// ----- 1. ForestAurora ---------------------------------------------------
function ForestAurora({ intensity = 1, dark = false }) {
  React.useEffect(() => {
    if (document.getElementById('lt-aurora-keys')) return;
    const s = document.createElement('style');
    s.id = 'lt-aurora-keys';
    s.textContent = `
      @keyframes ltAuroraA { 0%{transform:translate3d(0,0,0) scale(1) rotate(0deg)} 25%{transform:translate3d(220px,160px,0) scale(1.14) rotate(6deg)} 50%{transform:translate3d(60px,300px,0) scale(0.94) rotate(10deg)} 75%{transform:translate3d(-200px,170px,0) scale(1.08) rotate(4deg)} 100%{transform:translate3d(0,0,0) scale(1) rotate(0deg)} }
      @keyframes ltAuroraB { 0%{transform:translate3d(0,0,0) scale(1.02) rotate(0deg)} 25%{transform:translate3d(-140px,-200px,0) scale(0.92) rotate(-5deg)} 50%{transform:translate3d(-280px,80px,0) scale(1.20) rotate(-9deg)} 75%{transform:translate3d(-110px,250px,0) scale(1.04) rotate(-4deg)} 100%{transform:translate3d(0,0,0) scale(1.02) rotate(0deg)} }
      @keyframes ltAuroraC { 0%{transform:translate3d(0,0,0) scale(1) rotate(0deg)} 25%{transform:translate3d(200px,-140px,0) scale(1.10) rotate(5deg)} 50%{transform:translate3d(40px,-280px,0) scale(0.90) rotate(8deg)} 75%{transform:translate3d(-220px,-110px,0) scale(1.06) rotate(3deg)} 100%{transform:translate3d(0,0,0) scale(1) rotate(0deg)} }
      @keyframes ltAuroraD { 0%{transform:translate3d(0,0,0) scale(1.05) rotate(0deg)} 25%{transform:translate3d(180px,-100px,0) scale(0.96) rotate(-4deg)} 50%{transform:translate3d(240px,140px,0) scale(1.18) rotate(-7deg)} 75%{transform:translate3d(70px,230px,0) scale(1.02) rotate(-3deg)} 100%{transform:translate3d(0,0,0) scale(1.05) rotate(0deg)} }
    `;
    document.head.appendChild(s);
  }, []);

  const blob = (extra) => ({
    position:'absolute', borderRadius:'50%',
    filter:'blur(160px)', mixBlendMode: dark ? 'screen' : 'multiply',
    pointerEvents:'none', willChange:'transform', opacity: 0.65 * intensity,
    ...extra,
  });
  return (
    <div style={{position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0}}>
      <div style={blob({ width:'62vw', height:'62vw', top:'-18%', left:'-12%',
        background:'radial-gradient(circle at center, #4d6a44 0%, #2e4a2c 55%, transparent 75%)',
        animation:'ltAuroraA 38s ease-in-out infinite',
      })}/>
      <div style={blob({ width:'72vw', height:'72vw', top:'8%', right:'-18%',
        background:'radial-gradient(circle at center, #c9a865 0%, #b08e45 55%, transparent 75%)',
        animation:'ltAuroraB 46s ease-in-out infinite', opacity: 0.5 * intensity,
      })}/>
      <div style={blob({ width:'46vw', height:'46vw', bottom:'-12%', left:'28%',
        background:'radial-gradient(circle at center, #6a8a5b 0%, #4d6a44 55%, transparent 75%)',
        animation:'ltAuroraC 34s ease-in-out infinite', opacity: 0.55 * intensity,
      })}/>
      <div style={blob({ width:'54vw', height:'54vw', top:'22%', left:'36%',
        background:'radial-gradient(circle at center, #e8d8a8 0%, #c9a865 55%, transparent 75%)',
        animation:'ltAuroraD 42s ease-in-out infinite', mixBlendMode: dark ? 'screen' : 'soft-light', opacity: 0.45 * intensity,
      })}/>
    </div>
  );
}

// ----- 2. LeafField — drifting leaves, the LivingTree signature ambient ----
// Each leaf has a base position, slow downward drift, gentle horizontal sway
// (sin wave), and rotation. Painted as small SVG leaves so they hold detail
// against the parchment ground.
function LeafField({ count = 32, opacity = 0.85, color = 'rgba(60,90,55,', goldRatio = 0.25 }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const W = 2560, H = 1600;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    const leaves = Array.from({length: count}, (_, i) => {
      const seed = i + 1;
      return {
        baseX: (seed * 91) % W,
        baseY: (seed * 137) % H,
        vy:    18 + ((seed * 7) % 20),
        swayAmp: 40 + ((seed * 11) % 80),
        swayFreq: 0.25 + ((seed * 3) % 10) * 0.05,
        rotSpeed: 0.4 + ((seed * 5) % 16) * 0.08,
        size: 12 + ((seed * 13) % 14),
        phase: (seed * 1.7) % 6.283,
        gold: (seed % 4) < goldRatio * 4,
      };
    });

    let raf = 0, mounted = true;
    const start = performance.now();
    const drawLeaf = (x, y, rot, size, gold) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      // simple oval leaf with a midrib
      const w = size * 0.7;
      const h = size;
      const fill = gold ? 'rgba(201,168,101,' : color;
      ctx.fillStyle = fill + (gold ? 0.65 : 0.55) + ')';
      ctx.beginPath();
      ctx.moveTo(0, -h);
      ctx.bezierCurveTo(w, -h*0.4, w, h*0.4, 0, h);
      ctx.bezierCurveTo(-w, h*0.4, -w, -h*0.4, 0, -h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = fill + '0.4)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, -h);
      ctx.lineTo(0, h);
      ctx.stroke();
      ctx.restore();
    };
    const tick = () => {
      if (!mounted) return;
      const t = (performance.now() - start) / 1000;
      ctx.clearRect(0, 0, W, H);
      for (const l of leaves) {
        const driftY = (l.baseY + l.vy * t) % (H + 80);
        const y = driftY < -40 ? driftY + H + 80 : driftY;
        const x = ((l.baseX + Math.sin(t * l.swayFreq + l.phase) * l.swayAmp) % W + W) % W;
        const rot = t * l.rotSpeed + l.phase;
        drawLeaf(x, y, rot, l.size, l.gold);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { mounted = false; cancelAnimationFrame(raf); };
  }, [count, color, goldRatio]);

  return <canvas ref={ref} style={{
    position:'absolute', inset:0, width:'100%', height:'100%',
    pointerEvents:'none', opacity, zIndex: 2,
    mixBlendMode:'multiply',
  }}/>;
}

// ----- 3. FilmGrain ------------------------------------------------------
function FilmGrain({ opacity = 0.08, blend = 'overlay' }) {
  const url = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.05' numOctaves='2' stitchTiles='stitch' seed='3'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";
  return <div style={{position:'absolute', inset:0, opacity, mixBlendMode: blend, backgroundImage:`url("${url}")`, pointerEvents:'none', zIndex:2}}/>;
}

// ----- 4. Magnetic --------------------------------------------------------
function Magnetic({ children, radius = 140, strength = 0.22, tilt = 0, className, style, onClick, ...rest }) {
  const ref = React.useRef(null);
  const [tr, setTr] = React.useState({ x: 0, y: 0, rx: 0, ry: 0, hot: false });
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const target = { x: 0, y: 0, rx: 0, ry: 0 };
    let cur = { x: 0, y: 0, rx: 0, ry: 0 };
    let hot = false;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.hypot(dx, dy);
      if (d < radius) {
        target.x = dx * strength;
        target.y = dy * strength;
        if (tilt) {
          target.ry = (dx / r.width)  * tilt;
          target.rx = -(dy / r.height) * tilt;
        }
        hot = true;
      } else {
        target.x = 0; target.y = 0; target.rx = 0; target.ry = 0; hot = false;
      }
    };
    const onLeave = () => { target.x = 0; target.y = 0; target.rx = 0; target.ry = 0; hot = false; };
    document.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.18;
      cur.y += (target.y - cur.y) * 0.18;
      cur.rx += (target.rx - cur.rx) * 0.18;
      cur.ry += (target.ry - cur.ry) * 0.18;
      setTr({ x: cur.x, y: cur.y, rx: cur.rx, ry: cur.ry, hot });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { document.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); cancelAnimationFrame(raf); };
  }, [radius, strength, tilt]);
  const transform = tilt
    ? `translate3d(${tr.x}px, ${tr.y}px, 0) rotateX(${tr.rx}deg) rotateY(${tr.ry}deg)`
    : `translate3d(${tr.x}px, ${tr.y}px, 0)`;
  return (
    <div ref={ref} data-magnet
      className={className}
      style={{ ...style, transform, transformStyle:'preserve-3d', willChange:'transform' }}
      onClick={onClick}
      {...rest}>
      {typeof children === 'function' ? children(tr) : children}
    </div>
  );
}

// ----- 5. ShimmerSweep ---------------------------------------------------
function ShimmerSweep({ children, speed = 900, color = 'rgba(232,216,168,0.32)', radius = 100 }) {
  React.useEffect(() => {
    if (document.getElementById('lt-shimmer-keys')) return;
    const s = document.createElement('style');
    s.id = 'lt-shimmer-keys';
    s.textContent = `
      .lt-shimmer { position:relative; overflow:hidden; isolation:isolate; }
      .lt-shimmer::after {
        content: ''; position:absolute; top:0; bottom:0;
        left:-60%; width:60%;
        background: linear-gradient(90deg, transparent 0%, var(--lt-shimmer-color) 50%, transparent 100%);
        transform: skewX(-18deg); pointer-events:none; opacity:0; z-index:5;
      }
      .lt-shimmer:hover::after {
        animation: ltShimmer var(--lt-shimmer-speed, 900ms) cubic-bezier(0.22,1,0.36,1) forwards;
      }
      @keyframes ltShimmer { 0% { left:-60%; opacity:0; } 30% { opacity:1; } 100% { left:120%; opacity:0; } }
    `;
    document.head.appendChild(s);
  }, []);
  return (
    <div className="lt-shimmer" style={{ '--lt-shimmer-speed': speed + 'ms', '--lt-shimmer-color': color, borderRadius: radius }}>
      {children}
    </div>
  );
}

// ----- 6. CounterFlip ----------------------------------------------------
function CounterFlip({ value, duration = 1.4, delay = 0, suffix = '', prefix = '' }) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    let raf, start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const t = Math.min((ts - start - delay*1000) / (duration*1000), 1);
      if (t < 0) { raf = requestAnimationFrame(step); return; }
      const e = 1 - Math.pow(1 - t, 4);
      setN(Math.round(value * e));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay]);
  return <>{prefix}{n.toLocaleString('en-IN')}{suffix}</>;
}

// ----- 7. Donut ----------------------------------------------------------
function Donut({ value, total = 100, size = 100, stroke = 6, color = 'var(--gold-deep)', track = 'var(--line)', label }) {
  const [progress, setProgress] = React.useState(0);
  const target = total > 0 ? value / total : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  React.useEffect(() => {
    let raf, start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const t = Math.min((ts - start) / 1100, 1);
      const e = 1 - Math.pow(1 - t, 4);
      setProgress(target * e);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return (
    <div style={{position:'relative', width:size, height:size, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - progress)}/>
      </svg>
      <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, fontFamily:'Cormorant Garamond, serif'}}>
        <div style={{fontSize: size * 0.32, fontWeight:400, lineHeight:1, color}}>{Math.round(progress * 100)}%</div>
        {label && <div className="mono" style={{fontSize:9, letterSpacing:'0.2em', color:'var(--slate)', textTransform:'uppercase'}}>{label}</div>}
      </div>
    </div>
  );
}

// ----- 8. ConfettiCannon -------------------------------------------------
function ConfettiCannon({ trigger, originX = '50%', originY = '40%' }) {
  const [bits, setBits] = React.useState([]);
  React.useEffect(() => {
    if (!trigger) return;
    const count = 56;
    const arr = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6 - 0.3;
      const speed = 380 + Math.random() * 320;
      const palette = ['#c9a865', '#e8d8a8', '#4d6a44', '#a8c293', '#fbf6ea'];
      return {
        id: i,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed * (0.6 + Math.random() * 0.4),
        rot: (Math.random() - 0.5) * 720,
        col: palette[i % palette.length],
        size: 6 + Math.random() * 6,
        delay: Math.random() * 80,
        shape: i % 3,
      };
    });
    setBits(arr);
    const t = setTimeout(() => setBits([]), 2200);
    return () => clearTimeout(t);
  }, [trigger]);
  React.useEffect(() => {
    if (document.getElementById('lt-confetti-keys')) return;
    const s = document.createElement('style');
    s.id = 'lt-confetti-keys';
    s.textContent = `
      @keyframes ltConfettiFly {
        0%   { transform: translate(0,0) rotate(0deg); opacity: 0; }
        14%  { opacity: 1; }
        100% { transform: translate(var(--dx), calc(var(--dy) + 380px)) rotate(var(--rot)); opacity: 0; }
      }
    `;
    document.head.appendChild(s);
  }, []);
  if (!bits.length) return null;
  return (
    <div style={{position:'absolute', inset:0, pointerEvents:'none', zIndex:50, overflow:'hidden'}}>
      {bits.map(b => (
        <span key={b.id} style={{
          position:'absolute', top: originY, left: originX,
          width: b.size, height: b.size,
          background: b.col,
          borderRadius: b.shape === 0 ? '50%' : b.shape === 1 ? '2px' : 0,
          transformOrigin: 'center',
          animation: `ltConfettiFly 1.6s cubic-bezier(0.18,0.7,0.4,1) ${b.delay}ms forwards`,
          '--dx': b.dx + 'px',
          '--dy': b.dy + 'px',
          '--rot': b.rot + 'deg',
          willChange: 'transform, opacity',
        }}/>
      ))}
    </div>
  );
}

// ----- 9. useRipple ------------------------------------------------------
function useRipple(maxAge = 1200) {
  const [ripples, setRipples] = React.useState([]);
  const fire = React.useCallback((x, y, opts = {}) => {
    const id = Date.now() + Math.random();
    setRipples(rs => [...rs, { id, x, y, color: opts.color || 'rgba(201,168,101,0.7)' }]);
    setTimeout(() => setRipples(rs => rs.filter(r => r.id !== id)), maxAge);
  }, [maxAge]);
  return [ripples, fire];
}

function RippleLayer({ ripples }) {
  React.useEffect(() => {
    if (document.getElementById('lt-ripple-keys')) return;
    const s = document.createElement('style');
    s.id = 'lt-ripple-keys';
    s.textContent = `
      @keyframes ltRipple { 0% { transform: translate(-50%,-50%) scale(0); opacity: 0.85; } 100% { transform: translate(-50%,-50%) scale(8); opacity: 0; } }
    `;
    document.head.appendChild(s);
  }, []);
  return (
    <div style={{position:'absolute', inset:0, pointerEvents:'none', zIndex:30}}>
      {ripples.map(r => (
        <span key={r.id} style={{
          position:'absolute', left: r.x, top: r.y,
          width: 80, height: 80, borderRadius:'50%',
          border: `1.5px solid ${r.color}`,
          animation: 'ltRipple 1.2s cubic-bezier(0.18,0.7,0.4,1) forwards',
          willChange: 'transform, opacity',
        }}/>
      ))}
    </div>
  );
}

// ----- 10. useBurst + BurstLayer -----------------------------------------
const BURST_COLORS = ['#c9a865', '#e8d8a8', '#a8c293', '#4d6a44', '#fbf6ea'];

function ensureBurstKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('lt-burst-keys')) return;
  const s = document.createElement('style');
  s.id = 'lt-burst-keys';
  s.textContent = `
    @keyframes ltBurstFly {
      0%   { transform: translate(-50%, -50%) rotate(0deg) scale(1); opacity: 1; }
      18%  { opacity: 1; }
      100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot)) scale(0.28); opacity: 0; }
    }
    @keyframes ltTapWave {
      0%   { transform: translate(-50%, -50%) scale(0.2); opacity: 0.55; }
      40%  { opacity: 0.45; }
      100% { transform: translate(-50%, -50%) scale(3.4); opacity: 0; }
    }
  `;
  document.head.appendChild(s);
}

function useBurst(maxAge = 900) {
  const [bursts, setBursts] = React.useState([]);
  const fire = React.useCallback((x, y, opts = {}) => {
    ensureBurstKeys();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const count = opts.count || 11;
    const palette = opts.palette || BURST_COLORS;
    const particles = Array.from({length: count}, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const dist  = 200 + Math.random() * 220;
      const size  = 16 + Math.random() * 18;
      const hollow = Math.random() < 0.28;
      return {
        dx:  Math.cos(angle) * dist,
        dy:  Math.sin(angle) * dist,
        rot: (Math.random() * 720) - 360,
        size,
        hollow,
        color: palette[Math.floor(Math.random() * palette.length)],
      };
    });
    setBursts(prev => [...prev, { id, x, y, particles }]);
    window.setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== id));
    }, maxAge);
  }, [maxAge]);
  return [bursts, fire];
}

function BurstLayer({ bursts, zIndex = 4 }) {
  return (
    <div style={{position:'absolute', inset:0, pointerEvents:'none', zIndex}}>
      {bursts.map(b => (
        <React.Fragment key={b.id}>
          <span style={{
            position:'absolute', left:b.x, top:b.y,
            width: 60, height: 60, borderRadius:'50%',
            border: '3px solid rgba(201,168,101,0.8)',
            boxShadow: '0 0 50px rgba(232,216,168,0.45)',
            animation: 'ltTapWave 850ms cubic-bezier(0.18,0.7,0.4,1) forwards',
          }}/>
          {b.particles.map((p, i) => (
            <span key={i} style={{
              position:'absolute', left:b.x, top:b.y,
              width: p.size,
              height: p.hollow ? p.size : p.size * 0.7,
              background: p.hollow ? 'transparent' : p.color,
              border: p.hollow ? `2px solid ${p.color}` : 'none',
              borderRadius: p.hollow ? '50%' : '2px',
              transform: 'translate(-50%, -50%)',
              '--dx':  `${p.dx}px`,
              '--dy':  `${p.dy}px`,
              '--rot': `${p.rot}deg`,
              animation: 'ltBurstFly 880ms cubic-bezier(0.2,0.7,0.3,1) forwards',
              willChange: 'transform, opacity',
            }}/>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

// ----- 11. TreeSketch — animated pencil-drawn tree on a loop -------------
// Visible behind the splash + idle screens. A stylized tall tree with broad
// crown and root system is drawn stroke-by-stroke, held, faded, looped.
function TreeSketch({ opacity = 0.55, period = 22, stroke = 'rgba(46,74,44' }) {
  const t = useLoop();
  const phase = ((t % period) / period);

  // viewBox 2560 × 1600, trunk centred near x=1280, roots at y~1500.
  const paths = [
    // ground line
    { d: 'M 240 1480 L 2320 1480', win: [0.00, 0.06], len: 2080 },
    // root system — five roots fanning outward
    { d: 'M 1280 1480 C 1100 1500 900 1540 760 1560',  win: [0.06, 0.12], len: 600 },
    { d: 'M 1280 1480 C 1180 1510 1080 1540 980 1560', win: [0.12, 0.16], len: 420 },
    { d: 'M 1280 1480 C 1380 1510 1480 1540 1580 1560', win: [0.16, 0.20], len: 420 },
    { d: 'M 1280 1480 C 1460 1500 1660 1540 1800 1560', win: [0.20, 0.24], len: 600 },
    { d: 'M 1280 1480 L 1280 1580',                    win: [0.24, 0.27], len: 100 },
    // trunk (going up)
    { d: 'M 1240 1480 L 1240 720',                     win: [0.27, 0.34], len: 760 },
    { d: 'M 1320 1480 L 1320 720',                     win: [0.27, 0.34], len: 760 },
    // canopy bezier silhouette — wide rounded crown
    { d: 'M 1240 720 C 760 700 700 360 1080 280 C 1140 160 1420 160 1480 280 C 1860 360 1800 700 1320 720',
      win: [0.34, 0.52], len: 2200 },
    // 6 large branches inside the crown
    { d: 'M 1280 720 L 980 480',  win: [0.52, 0.56], len: 380 },
    { d: 'M 1280 720 L 1580 480', win: [0.56, 0.60], len: 380 },
    { d: 'M 1280 720 L 880 380',  win: [0.60, 0.63], len: 460 },
    { d: 'M 1280 720 L 1680 380', win: [0.63, 0.66], len: 460 },
    { d: 'M 1280 720 L 1280 320', win: [0.66, 0.69], len: 400 },
    { d: 'M 1280 720 L 1080 300', win: [0.69, 0.72], len: 460 },
    // little leaf clusters (small circles painted as quick strokes)
    { d: 'M 940 460 a 26 22 0 1 0 1 0', win: [0.72, 0.74], len: 160 },
    { d: 'M 1620 460 a 26 22 0 1 0 1 0', win: [0.74, 0.76], len: 160 },
    { d: 'M 1280 280 a 30 24 0 1 0 1 0', win: [0.76, 0.78], len: 180 },
    { d: 'M 1080 300 a 22 20 0 1 0 1 0', win: [0.78, 0.80], len: 140 },
    { d: 'M 1480 300 a 22 20 0 1 0 1 0', win: [0.80, 0.82], len: 140 },
    // ground texture ticks
    { d: 'M 360 1496 L 380 1504 M 420 1496 L 440 1504', win: [0.82, 0.86], len: 80 },
    { d: 'M 2080 1496 L 2100 1504 M 2140 1496 L 2160 1504', win: [0.82, 0.86], len: 80 },
  ];

  const fadeOut = Math.max(0, Math.min(1, (phase - 0.92) / 0.08));
  const baseOp = 1 - fadeOut;

  return (
    <svg viewBox="0 0 2560 1600" preserveAspectRatio="xMidYMid meet"
      style={{
        position:'absolute', inset:0, width:'100%', height:'100%',
        pointerEvents:'none', opacity, zIndex: 0,
        mixBlendMode: 'multiply',
      }}>
      {paths.map((p, i) => {
        const [start, end] = p.win;
        const drawP = Math.max(0, Math.min(1, (phase - start) / (end - start)));
        return (
          <path key={i} d={p.d}
            stroke={`${stroke},0.78)`}
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={p.len}
            strokeDashoffset={p.len * (1 - drawP)}
            opacity={baseOp}
          />
        );
      })}
    </svg>
  );
}

// ----- 12. LightRays -----------------------------------------------------
function LightRays({ opacity = 0.42 }) {
  return (
    <div style={{position:'absolute', inset:0, pointerEvents:'none', zIndex:1, overflow:'hidden', mixBlendMode:'screen', opacity}}>
      <div style={{
        position:'absolute', top:'-40%', left:'-10%', width:'140%', height:'180%',
        background: 'linear-gradient(108deg, transparent 36%, rgba(255,240,200,0.55) 48%, rgba(255,248,220,0.30) 50%, rgba(255,240,200,0.55) 52%, transparent 64%)',
        filter: 'blur(60px)',
      }}/>
      <div style={{
        position:'absolute', top:'-30%', left:'10%', width:'120%', height:'160%',
        background: 'linear-gradient(72deg, transparent 32%, rgba(232,216,168,0.36) 50%, transparent 68%)',
        filter: 'blur(80px)',
      }}/>
    </div>
  );
}

// ----- 13. SparkleField --------------------------------------------------
function SparkleField({ count = 28, opacity = 0.75 }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = 2560; canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    const sparkles = Array.from({length: count}, (_, i) => {
      const seed = i + 1;
      return {
        baseX: (seed * 91) % 2560,
        baseY: (seed * 137) % 1600,
        vy: -10 - ((seed * 7) % 16),
        vx: ((seed * 13) % 9) - 4,
        size: 0.8 + ((seed * 5) % 16) * 0.14,
        twinkleFreq: 0.4 + ((seed * 3) % 10) * 0.13,
        phase: (seed * 1.7) % 6.283,
      };
    });
    let raf = 0, mounted = true;
    const start = performance.now();
    const tick = () => {
      if (!mounted) return;
      const t = (performance.now() - start) / 1000;
      ctx.clearRect(0, 0, 2560, 1600);
      for (const s of sparkles) {
        const x = ((s.baseX + s.vx * t) % 2560 + 2560) % 2560;
        const y = ((s.baseY + s.vy * t) % 1700 + 1700) % 1700 - 50;
        if (y < -10 || y > 1610) continue;
        const twinkle = Math.abs(Math.sin(t * s.twinkleFreq + s.phase));
        const alpha = 0.30 + twinkle * 0.65;
        const r = s.size;
        ctx.fillStyle = 'rgba(255,240,200,' + (alpha * 0.30) + ')';
        ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(255,250,225,' + alpha + ')';
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
        if (twinkle > 0.72) {
          const len = r * 6 * twinkle;
          ctx.globalAlpha = alpha * 0.75;
          ctx.fillRect(x - len/2, y - 0.5, len, 1);
          ctx.fillRect(x - 0.5, y - len/2, 1, len);
          ctx.globalAlpha = 1;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { mounted = false; cancelAnimationFrame(raf); };
  }, [count]);
  return <canvas ref={ref} style={{
    position:'absolute', inset:0, width:'100%', height:'100%',
    pointerEvents:'none', opacity, zIndex: 2,
    mixBlendMode:'screen',
  }}/>;
}

window.ForestAurora = ForestAurora;
window.LeafField = LeafField;
window.FilmGrain = FilmGrain;
window.Magnetic = Magnetic;
window.ShimmerSweep = ShimmerSweep;
window.CounterFlip = CounterFlip;
window.Donut = Donut;
window.ConfettiCannon = ConfettiCannon;
window.useRipple = useRipple;
window.RippleLayer = RippleLayer;
window.useBurst = useBurst;
window.BurstLayer = BurstLayer;
window.TreeSketch = TreeSketch;
window.LightRays = LightRays;
window.SparkleField = SparkleField;
