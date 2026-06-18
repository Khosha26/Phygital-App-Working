// LivingTree · Sales Suite — shared hooks, helpers, icons, brand marks

// requestAnimationFrame loop, returns elapsed seconds
function useLoop() {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf, start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      setT((ts - start) / 1000);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

const ease = {
  linear:    t => t,
  outQuad:   t => t*(2-t),
  inOutQuad: t => t<0.5 ? 2*t*t : -1+(4-2*t)*t,
  outCubic:  t => 1 - Math.pow(1-t,3),
  inOutCubic:t => t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2,
  outQuart:  t => 1 - Math.pow(1-t,4),
  outQuint:  t => 1 - Math.pow(1-t,5),
  inOutQuint:t => t<0.5 ? 16*t*t*t*t*t : 1-Math.pow(-2*t+2,5)/2,
  outBack:   (t, s=1.70158) => 1 + (s+1)*Math.pow(t-1,3) + s*Math.pow(t-1,2),
  outExpo:   t => t === 1 ? 1 : 1 - Math.pow(2, -10*t),
  inOutExpo: t => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20*t-10)/2 : (2-Math.pow(2,-20*t+10))/2,
};

const clamp = (v, mn=0, mx=1) => Math.max(mn, Math.min(mx, v));
const lerp  = (a, b, t) => a + (b-a)*t;
const mod   = (a, b) => ((a%b)+b)%b;

// hash router
function useRoute() {
  const [route, setRoute] = React.useState(() => parseHash());
  React.useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return [route, navigate];
}
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '') || 'splash';
  const [path, ...rest] = h.split('/');
  return { path, params: rest };
}
function navigate(path) {
  location.hash = '/' + path;
}

function useRouteTransition(route) {
  const [phase, setPhase] = React.useState('in');
  const [displayed, setDisplayed] = React.useState(route);
  const prevRef = React.useRef(route);

  React.useEffect(() => {
    if (route.path === prevRef.current.path && JSON.stringify(route.params) === JSON.stringify(prevRef.current.params)) return;
    setPhase('out');
    const t = setTimeout(() => {
      setDisplayed(route);
      prevRef.current = route;
      setPhase('in');
    }, 220);
    return () => clearTimeout(t);
  }, [route]);

  return { route: displayed, phase };
}

// Auto-fit 2560x1600 canvas into viewport
function useFitScale(W=2560, H=1600, bezelPad=40) {
  const [state, setState] = React.useState({ scale: 1, tight: false });
  React.useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const sxBezel = vw / (W + bezelPad*2);
      const syBezel = vh / (H + bezelPad*2);
      const sBezel = Math.min(sxBezel, syBezel);
      const sxRaw = vw / W;
      const syRaw = vh / H;
      const sRaw = Math.min(sxRaw, syRaw);
      const tight = sBezel < 0.98 && (vw/W < 1.05 || vh/H < 1.05);
      setState({ scale: tight ? sRaw : sBezel, tight });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, [W, H, bezelPad]);
  return state;
}

// Touch + swipe — detects horizontal/vertical swipes on a wrapped child.
// Usage: const handlers = useSwipe({ onLeft, onRight, onUp, onDown, threshold: 60 });
//        return <div {...handlers}>...</div>
function useSwipe({ onLeft, onRight, onUp, onDown, threshold = 60 } = {}) {
  const startRef = React.useRef(null);
  return {
    onTouchStart: (e) => {
      const t = e.touches[0];
      startRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    },
    onTouchEnd: (e) => {
      if (!startRef.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startRef.current.x;
      const dy = t.clientY - startRef.current.y;
      const adx = Math.abs(dx), ady = Math.abs(dy);
      if (Math.max(adx, ady) < threshold) return;
      if (adx > ady) {
        if (dx < 0 && onLeft)  onLeft();
        if (dx > 0 && onRight) onRight();
      } else {
        if (dy < 0 && onUp)   onUp();
        if (dy > 0 && onDown) onDown();
      }
      startRef.current = null;
    },
    onMouseDown: (e) => {
      startRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    },
    onMouseUp: (e) => {
      if (!startRef.current) return;
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      const adx = Math.abs(dx), ady = Math.abs(dy);
      if (Math.max(adx, ady) < threshold) { startRef.current = null; return; }
      if (adx > ady) {
        if (dx < 0 && onLeft)  onLeft();
        if (dx > 0 && onRight) onRight();
      } else {
        if (dy < 0 && onUp)   onUp();
        if (dy > 0 && onDown) onDown();
      }
      startRef.current = null;
    },
  };
}

// ===== Icons — leaf-themed, all 48×48 viewBox, currentColor stroke =====
const Icons = {
  // module icons
  story: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M24 6 C 14 10 8 18 8 26 C 8 36 16 42 24 42 C 32 42 40 36 40 26 C 40 18 34 10 24 6 Z"/>
      <path d="M24 6 L24 42"/>
      <path d="M16 18 C 20 20 22 23 24 26"/>
      <path d="M32 18 C 28 20 26 23 24 26"/>
    </svg>
  ),
  north: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 38 L24 8 L38 38 Z"/>
      <path d="M24 8 L24 38"/>
      <path d="M16 26 L32 26"/>
    </svg>
  ),
  location: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M24 6 C16 6 11 12 11 19 C11 28 24 42 24 42 C24 42 37 28 37 19 C37 12 32 6 24 6 Z"/>
      <circle cx="24" cy="19" r="4.5"/>
    </svg>
  ),
  masterplan: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 42 L10 18 L18 12 L18 42 Z"/>
      <path d="M22 42 L22 14 L32 8 L32 42 Z"/>
      <path d="M36 42 L36 22 L42 18 L42 42 Z"/>
      <path d="M6 42 L44 42"/>
    </svg>
  ),
  towers: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="14" y="6" width="20" height="36"/>
      <path d="M18 12 L22 12 M26 12 L30 12 M18 18 L22 18 M26 18 L30 18 M18 24 L22 24 M26 24 L30 24 M18 30 L22 30 M26 30 L30 30"/>
      <path d="M24 2 L24 6"/>
    </svg>
  ),
  residences: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="8" y="8" width="32" height="32" rx="1"/>
      <path d="M8 22 L24 22 L24 8"/>
      <path d="M24 22 L40 22 M24 22 L24 40 M30 22 L30 30 L40 30"/>
    </svg>
  ),
  amenities: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M24 38 C 14 30 8 22 14 14 C 18 9 24 13 24 18 C 24 13 30 9 34 14 C 40 22 34 30 24 38 Z"/>
    </svg>
  ),
  gallery: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="8" y="12" width="32" height="24" rx="2"/>
      <circle cx="17" cy="20" r="2.4"/>
      <path d="M40 28 L31 22 L21 30 L13 26 L8 30"/>
    </svg>
  ),
  specs: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="8" y="6" width="32" height="36" rx="2"/>
      <path d="M14 14 L34 14 M14 22 L34 22 M14 30 L26 30"/>
    </svg>
  ),
  tools: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="8" y="10" width="32" height="28" rx="2"/>
      <path d="M14 18 L20 18 M14 24 L26 24 M14 30 L22 30"/>
      <circle cx="33" cy="22" r="3"/>
      <path d="M33 27 L33 32 M30 30 L36 30"/>
    </svg>
  ),
  booking: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 6 L12 42 L20 36 L28 42 L36 36 L36 6 Z"/>
      <path d="M18 16 L30 16 M18 22 L30 22 M18 28 L26 28"/>
    </svg>
  ),
  // navigation
  arrow: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12 L19 12 M13 6 L19 12 L13 18"/></svg>
  ),
  back: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 12 L5 12 M11 6 L5 12 L11 18"/></svg>
  ),
  close: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 6 L18 18 M18 6 L6 18"/></svg>
  ),
  plus:  (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...props}><path d="M12 5 L12 19 M5 12 L19 12"/></svg>,
  minus: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...props}><path d="M5 12 L19 12"/></svg>,
  check: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12 L10 17 L19 7"/></svg>,
  filter:(props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6 L21 6 M6 12 L18 12 M9 18 L15 18"/></svg>,
  swipe: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 24 L40 24"/>
      <path d="M14 18 L8 24 L14 30"/>
      <path d="M34 18 L40 24 L34 30"/>
    </svg>
  ),

  // landmark icons (used in Location screen)
  plane:  (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M24 4 L26 22 L44 28 L44 32 L26 28 L24 40 L28 42 L28 44 L20 44 L20 42 L24 40 L22 28 L4 32 L4 28 L22 22 Z"/></svg>,
  road:   (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 6 L8 42 M34 6 L40 42 M24 8 L24 14 M24 20 L24 26 M24 32 L24 40"/></svg>,
  flyover:(props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 38 L44 38 M6 22 L18 22 M30 22 L42 22 M18 22 C 22 22 22 32 30 32 C 38 32 38 22 42 22"/></svg>,
  office: (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="8" y="10" width="32" height="32"/><path d="M14 16 L20 16 M28 16 L34 16 M14 24 L20 24 M28 24 L34 24 M14 32 L20 32 M28 32 L34 32"/></svg>,
  school: (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 22 L24 12 L44 22 L24 32 Z"/><path d="M14 26 L14 36 C 14 38 18 40 24 40 C 30 40 34 38 34 36 L34 26"/><path d="M40 24 L40 36"/></svg>,
  cross:  (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="6" y="6" width="36" height="36" rx="4"/><path d="M24 16 L24 32 M16 24 L32 24"/></svg>,
  cart:   (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 8 L12 8 L18 32 L40 32 L44 14 L14 14"/><circle cx="20" cy="40" r="3"/><circle cx="36" cy="40" r="3"/></svg>,

  // amenity-category icons
  sport:    (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="24" cy="24" r="18"/><path d="M6 24 L42 24 M24 6 L24 42 M10 12 C 18 16 30 16 38 12 M10 36 C 18 32 30 32 38 36"/></svg>,
  social:   (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="16" cy="18" r="6"/><circle cx="32" cy="18" r="6"/><path d="M6 38 C 8 30 14 28 16 28 C 18 28 24 30 26 38 M22 38 C 24 30 30 28 32 28 C 34 28 40 30 42 38"/></svg>,
  wellness: (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M24 8 C 18 16 18 24 24 32 C 30 24 30 16 24 8 Z"/><path d="M24 32 L24 42"/><path d="M18 40 L30 40"/></svg>,
  family:   (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="14" cy="14" r="5"/><circle cx="34" cy="14" r="5"/><circle cx="24" cy="28" r="4"/><path d="M6 30 C 8 24 12 22 14 22 C 16 22 20 24 22 30 M26 30 C 28 24 32 22 34 22 C 36 22 40 24 42 30 M18 42 C 19 38 22 36 24 36 C 26 36 29 38 30 42"/></svg>,
  water:    (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M24 4 C 16 16 12 24 12 30 C 12 38 18 42 24 42 C 30 42 36 38 36 30 C 36 24 32 16 24 4 Z"/></svg>,

  // USP icons
  shield:   (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M24 4 L42 12 L42 24 C 42 34 34 42 24 44 C 14 42 6 34 6 24 L6 12 Z"/><path d="M16 24 L22 30 L34 18"/></svg>,
  rule:     (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10 4 L38 4 L38 44 L10 44 Z"/><path d="M10 12 L14 12 M10 20 L18 20 M10 28 L14 28 M10 36 L18 36"/></svg>,
  roots:    (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M24 4 L24 26"/><path d="M24 26 C 16 28 12 34 12 44 M24 26 C 32 28 36 34 36 44 M24 26 C 20 30 20 38 20 44 M24 26 C 28 30 28 38 28 44"/><path d="M16 12 C 20 14 22 18 24 22 M32 12 C 28 14 26 18 24 22"/></svg>,
  pair:     (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="16" cy="24" r="10"/><circle cx="32" cy="24" r="10"/></svg>,

  // spec-row icons
  struct:  (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="8" y="8" width="32" height="32"/><path d="M8 8 L40 40 M40 8 L8 40"/></svg>,
  lobby:   (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="8" y="6" width="32" height="36"/><path d="M16 42 L16 28 L32 28 L32 42 M22 28 L22 36 L26 36 L26 28"/></svg>,
  lift:    (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="10" y="6" width="28" height="36"/><path d="M24 6 L24 42 M16 16 L20 12 L24 16 M32 32 L28 36 L24 32"/></svg>,
  floor:   (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 32 L24 18 L44 32 L44 40 L4 40 Z"/><path d="M10 36 L18 36 M22 36 L30 36 M34 36 L40 36"/></svg>,
  kitchen: (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="6" y="14" width="36" height="28" rx="2"/><circle cx="16" cy="26" r="3"/><circle cx="32" cy="26" r="3"/><path d="M6 32 L42 32"/><path d="M14 14 L14 6 M34 14 L34 6"/></svg>,
  toilet:  (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 8 L34 8 L34 28 L30 36 L18 36 L14 28 Z"/><path d="M14 28 L34 28"/><path d="M22 36 L22 42 L26 42 L26 36"/></svg>,
  door:    (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="14" y="6" width="20" height="38"/><circle cx="29" cy="26" r="1.5"/></svg>,
  window:  (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="8" y="8" width="32" height="32"/><path d="M24 8 L24 40 M8 24 L40 24"/></svg>,
  paint:   (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="10" y="6" width="28" height="14"/><path d="M14 20 L14 30 L18 32 L18 42 L30 42 L30 32 L34 30 L34 20"/></svg>,
  bolt:    (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M28 4 L12 28 L24 28 L20 44 L36 20 L24 20 Z"/></svg>,
  lock:    (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="10" y="22" width="28" height="20" rx="2"/><path d="M16 22 L16 14 C 16 10 20 6 24 6 C 28 6 32 10 32 14 L32 22"/></svg>,
  power:   (props) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="24" cy="24" r="18"/><path d="M24 12 L24 24"/><path d="M24 24 L34 28"/></svg>,
};

// ===== LivingTree brand marks — uses the official client lockup PNG =====
// Source: assets/brand/livingtree-lockup.png (438×176, pale-green ground)
// The wreath circle sits in the LEFT ~140px of the lockup; we crop it via
// background-position so it appears as a circular "stamp" with the brand's
// own pale-green ground intact (reads as a wax-seal motif).

// Wreath-only mark — used as the primary monogram across the app.
// Renders as a square stamp showing only the leaf-wreath, with optional
// top-to-bottom reveal via `progress` (kept for splash animation).
function LivingTreeMonogram({ size = 200, progress = 1, color }) {
  const p = clamp(progress);
  // Original lockup: 438w × 176h. Wreath circle ≈ x:8..148 (140 wide),
  // vertically centred. To show the wreath at `size × size` we scale the
  // background so the wreath fills the height + crop horizontally.
  const scale = size / 140;
  const bgW = 438 * scale;
  const bgH = 176 * scale;
  return (
    <div
      role="img"
      aria-label="LivingTree"
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        backgroundImage: 'url(assets/brand/livingtree-lockup.png)',
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${-8 * scale}px center`,
        backgroundRepeat: 'no-repeat',
        borderRadius: '50%',
        clipPath: `inset(0 0 ${(1 - p) * 100}% 0)`,
        filter: `drop-shadow(0 ${size*0.03}px ${size*0.05}px rgba(46,74,44,${0.22*p}))`,
        transition: 'clip-path 240ms ease-out, filter 240ms ease-out',
      }}
    />
  );
}

// Full lockup — wreath + "LivingTree®" wordmark from the official PNG.
// Use this anywhere we want both pieces in the canonical proportions.
function LivingTreeLockup({ size = 360, progress = 1 }) {
  const p = clamp(progress);
  return (
    <img
      src="assets/brand/livingtree-lockup.png"
      width={size}
      height={size * (176/438)}
      draggable="false"
      alt="LivingTree by Kalyani Developers"
      style={{
        display: 'block',
        opacity: p,
        filter: `drop-shadow(0 ${size*0.014}px ${size*0.022}px rgba(46,74,44,${0.20*p}))`,
        transition: 'opacity 320ms ease-out, filter 320ms ease-out',
      }}
    />
  );
}

// Decorative wreath used as a watermark / corner-stamp motif.
// Same source PNG, sized down and pushed to low opacity so the leaf circle
// becomes a recurring brand seal — appears on the Saver certificate corner.
function LivingTreeWatermark({ size = 360, opacity = 0.07, rotation = -12 }) {
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        backgroundImage: 'url(assets/brand/livingtree-lockup.png)',
        backgroundSize: `${438 * (size/140)}px ${176 * (size/140)}px`,
        backgroundPosition: `${-8 * (size/140)}px center`,
        backgroundRepeat: 'no-repeat',
        opacity,
        transform: `rotate(${rotation}deg)`,
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
      }}
    />
  );
}

// "LivingTree" wordmark + ® mark
function LivingTreeWordmark({ size = 56, color = 'currentColor', tight = false }) {
  return (
    <div style={{display:'flex', alignItems:'baseline', gap: size*0.06, color, lineHeight:1, whiteSpace:'nowrap'}}>
      <span className="serif" style={{fontSize:size, fontWeight:500, letterSpacing: tight ? '-0.02em' : '-0.005em', fontStyle:'italic'}}>Living</span>
      <span className="serif" style={{fontSize:size, fontWeight:500, letterSpacing: tight ? '-0.02em' : '-0.005em'}}>Tree</span>
      <span style={{fontSize:size*0.25, marginLeft:size*0.08, opacity:0.6}}>®</span>
    </div>
  );
}

// Kalyani Developers wordmark
function KalyaniWordmark({ size = 28, color = 'var(--kalyani-red)' }) {
  return (
    <span style={{
      fontFamily:'Inter, system-ui, sans-serif',
      fontWeight: 700,
      fontSize: size,
      letterSpacing: '0.12em',
      color,
      lineHeight: 1,
      textTransform:'uppercase',
    }}>KALYANI</span>
  );
}

// Kalyani triangle mark (red/yellow/blue triangular K — derived from brochure logo)
function KalyaniTriangle({ size = 80 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{display:'block'}}>
      <polygon points="50,8 92,86 8,86" fill="var(--kalyani-red)"/>
      <polygon points="50,8 92,86 50,86" fill="var(--kalyani-yellow)" opacity="0.92"/>
      <text x="50" y="64" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="44" fontWeight="800" fill="var(--kalyani-blue)">K</text>
      <text x="50" y="98" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="6.5" fontWeight="600" fill="var(--kalyani-blue)" letterSpacing="3">DEVELOPERS</text>
    </svg>
  );
}

// "by Kalyani Developers" credit chip
function KalyaniCredit({ light = false, size = 13 }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:10}}>
      <span className="mono" style={{fontSize:size, letterSpacing:'0.28em', color: light ? 'rgba(245,239,217,0.55)' : 'var(--slate)', textTransform:'uppercase'}}>by</span>
      <KalyaniWordmark size={size + 6}/>
    </div>
  );
}

window.useLoop = useLoop;
window.ease = ease;
window.clamp = clamp;
window.lerp = lerp;
window.mod = mod;
window.useRoute = useRoute;
window.navigate = navigate;
window.useRouteTransition = useRouteTransition;
window.useFitScale = useFitScale;
window.useSwipe = useSwipe;
window.Icons = Icons;
window.LivingTreeMonogram = LivingTreeMonogram;
window.LivingTreeLockup   = LivingTreeLockup;
window.LivingTreeWatermark= LivingTreeWatermark;
window.LivingTreeWordmark = LivingTreeWordmark;
window.KalyaniWordmark = KalyaniWordmark;
window.KalyaniTriangle = KalyaniTriangle;
window.KalyaniCredit = KalyaniCredit;
