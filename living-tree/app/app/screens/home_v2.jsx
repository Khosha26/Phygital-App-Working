// LivingTree · Home VERSION 2 — "SALES OS" (modern futuristic UI/UX)
// ---------------------------------------------------------------------------
// A complete departure from the tree scene: a premium dark real-estate sales
// console. Left = a cinematic project hero (real development render + brand +
// live project stats + a primary CTA). Right = the 11 modules as a precise
// glassmorphic card grid. Deep forest-charcoal ground with a fine tech grid,
// soft gold accent glows, crisp mono data labels, smooth staggered motion.
// Realistic, professional, shippable. Wrapped in an IIFE — only window.HomeV2
// leaks, so it never collides with v1 or the switcher.
// ---------------------------------------------------------------------------
(function () {

const V2_KEYS = 'lt-home-v2-keys';
function ensureV2Keys() {
  if (typeof document === 'undefined' || document.getElementById(V2_KEYS)) return;
  const s = document.createElement('style');
  s.id = V2_KEYS;
  s.textContent = `
    @keyframes v2Up   { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
    @keyframes v2Drop { 0%{opacity:0;transform:translateY(-14px)} 100%{opacity:1;transform:translateY(0)} }
    @keyframes v2Card { 0%{opacity:0;transform:translateY(26px) scale(.97)} 100%{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes v2Pulse{ 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.25)} }
    @keyframes v2Scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(900%)} }
    @keyframes v2Blob { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(60px,-40px) scale(1.15)} 100%{transform:translate(0,0) scale(1)} }
  `;
  document.head.appendChild(s);
}

// 11 modules — walkthrough order. The first (Project Overview) is the wide
// feature card; the rest fill a 2-column grid.
const MODS = [
  { id:'overview', route:'story',      n:'01', label:'Project Overview', sub:'The full Living Tree story',     icon:'story',      meta:'START HERE', feature:true },
  { id:'gallery',  route:'gallery',    n:'02', label:'Gallery',          sub:'Renders, films & walkthroughs',  icon:'gallery',    meta:'28 ASSETS' },
  { id:'master',   route:'masterplan', n:'03', label:'Masterplan',       sub:'Site plan · ten towers',         icon:'masterplan', meta:'25 ACRES' },
  { id:'location', route:'location',   n:'04', label:'Location',         sub:'KIADB · 15 min to airport',      icon:'location',   meta:'NORTH BLR' },
  { id:'amenity',  route:'amenities',  n:'05', label:'Amenities',        sub:'Across two clubhouses',          icon:'amenities',  meta:'65 FEATURES' },
  { id:'floor',    route:'residences', n:'06', label:'Floor Plan',       sub:'1 · 2 · 2.5 · 3 BHK',            icon:'residences', meta:'4 TYPES' },
  { id:'invent',   route:'towers',     n:'07', label:'Inventory',        sub:'Live unit availability',         icon:'towers',     meta:'LIVE', live:true },
  { id:'booking',  route:'booking',    n:'08', label:'Booking',          sub:'Reserve a residence',            icon:'booking',    meta:'OPEN', gold:true },
  { id:'email',    route:'saver',      n:'09', label:'Email Sender',     sub:'Brochure · quote · receipt',     icon:'tools',      meta:'STUDIO TOOL' },
  { id:'gre',      route:'gre',        n:'10', label:'GRE',              sub:'Guest Relations workspace',      icon:'pair',       meta:'STUDIO TOOL' },
  { id:'dash',     route:'dashboard',  n:'11', label:'Mini Dashboard',   sub:'Live project numbers',           icon:'specs',      meta:'STUDIO TOOL' },
];

// ----------------------------------------------------------------------------
// ModuleCard — one glassmorphic module tile.
// ----------------------------------------------------------------------------
function ModuleCard({ mod, idx, mounted, hovered, onHover, onTap, dimmed, tSec }) {
  const isHover = hovered === mod.id;
  const Icon = (window.Icons || {})[mod.icon] || window.Icons.story;
  const gold = mod.gold;
  const feature = mod.feature;
  const accent = gold ? '#e8c878' : '#c9a865';
  const pulse = 0.55 + 0.45 * Math.sin(tSec * 3);

  return (
    <button
      onPointerEnter={() => onHover(mod.id)}
      onPointerLeave={() => onHover(null)}
      onClick={() => onTap(mod)}
      style={{
        gridColumn: feature ? '1 / -1' : 'auto',
        position:'relative', textAlign:'left', cursor:'pointer',
        display:'flex', flexDirection: feature ? 'row' : 'column',
        alignItems: feature ? 'center' : 'flex-start',
        gap: feature ? 26 : 0,
        justifyContent:'flex-start',
        padding: feature ? '0 32px' : '24px 24px 22px',
        minHeight: feature ? 168 : 210,
        borderRadius:18,
        background: isHover
          ? 'linear-gradient(150deg, rgba(232,216,168,0.16), rgba(232,216,168,0.05))'
          : (feature ? 'linear-gradient(150deg, rgba(201,168,101,0.12), rgba(255,255,255,0.03))'
                     : 'rgba(255,255,255,0.045)'),
        border:`1px solid ${isHover ? 'rgba(232,216,168,0.55)' : (gold ? 'rgba(232,200,120,0.4)' : 'rgba(232,216,168,0.13)')}`,
        boxShadow: isHover
          ? '0 22px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(232,216,168,0.22), inset 0 1px 0 rgba(255,255,255,0.08)'
          : 'inset 0 1px 0 rgba(255,255,255,0.05)',
        backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
        opacity: dimmed ? 0.28 : 1,
        transform:`translateY(${isHover ? -6 : 0}px)`,
        transition:'background 220ms ease, border-color 220ms ease, box-shadow 240ms ease, transform 260ms cubic-bezier(.2,.7,.2,1), opacity 280ms ease',
        animation: mounted ? `v2Card 560ms ${300 + idx*60}ms cubic-bezier(.2,.7,.2,1) both` : 'none',
        overflow:'hidden',
      }}
    >
      {/* corner index */}
      <div className="mono" style={{
        position:'absolute', top:16, right:18, fontSize:12, letterSpacing:'0.2em',
        color: isHover ? accent : 'rgba(232,216,168,0.32)', transition:'color 200ms ease',
      }}>{mod.n}</div>

      {/* icon medallion */}
      <div style={{
        width: feature ? 92 : 56, height: feature ? 92 : 56, flexShrink:0,
        borderRadius: feature ? 20 : 14,
        display:'flex', alignItems:'center', justifyContent:'center',
        marginBottom: feature ? 0 : 'auto',
        background: gold
          ? 'radial-gradient(circle at 36% 30%, #fff3d4, #e7c074 72%, #ad8038)'
          : (isHover ? 'radial-gradient(circle at 36% 30%, #fbf6e6, #d4bf86 76%, #8f7440)'
                     : 'rgba(232,216,168,0.10)'),
        border:`1px solid ${gold||isHover ? 'rgba(232,216,168,0.7)' : 'rgba(232,216,168,0.2)'}`,
        color: gold||isHover ? '#1a2b17' : '#e8d8a8',
        transition:'background 240ms ease, color 240ms ease, border-color 240ms ease',
      }}>
        <Icon style={{ width: feature ? 44 : 28, height: feature ? 44 : 28 }}/>
      </div>

      {/* text block */}
      <div style={{ display:'flex', flexDirection:'column', gap:6,
        marginTop: feature ? 0 : 16, flex: feature ? 1 : 'none' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span className="serif" style={{
            fontSize: feature ? 40 : 27, fontWeight:600, lineHeight:1,
            color: isHover ? '#fffaeb' : '#f4ead0', letterSpacing:'-0.01em',
            transition:'color 200ms ease',
          }}>{mod.label}</span>
          {mod.live && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:6,
              padding:'3px 9px', borderRadius:20, background:'rgba(111,196,122,0.16)',
              border:'1px solid rgba(111,196,122,0.4)' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#6fc47a',
                opacity:pulse, boxShadow:`0 0 ${5+pulse*6}px #6fc47a` }}/>
              <span className="mono" style={{ fontSize:9, letterSpacing:'0.2em', color:'#bfe6c4' }}>LIVE</span>
            </span>
          )}
        </div>
        <div className="mono" style={{ fontSize: feature ? 13 : 11.5, letterSpacing:'0.12em',
          color:'rgba(244,234,208,0.55)', textTransform: feature ? 'none' : 'none' }}>
          {mod.sub}
        </div>
        {/* meta chip + arrow row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          marginTop: feature ? 12 : 14 }}>
          <span className="mono" style={{ fontSize:9.5, letterSpacing:'0.22em',
            padding:'4px 9px', borderRadius:5,
            background: gold ? 'rgba(232,200,120,0.16)' : 'rgba(232,216,168,0.08)',
            border:`1px solid ${gold ? 'rgba(232,200,120,0.32)' : 'rgba(232,216,168,0.14)'}`,
            color: gold ? '#f0d9a0' : 'rgba(232,216,168,0.7)' }}>
            {mod.meta}
          </span>
          <span style={{ display:'flex', alignItems:'center', gap:6,
            color: isHover ? accent : 'rgba(232,216,168,0.4)',
            transform:`translateX(${isHover ? 4 : 0}px)`, transition:'transform 240ms ease, color 200ms ease' }}>
            <span className="mono" style={{ fontSize:9.5, letterSpacing:'0.2em' }}>OPEN</span>
            {window.Icons && window.Icons.arrow && <window.Icons.arrow style={{ width:18, height:18 }}/>}
          </span>
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// HomeV2
// ============================================================================
function HomeV2() {
  ensureV2Keys();
  const tSec = useLoop();
  const [now, setNow] = React.useState(() => new Date());
  const [mounted, setMounted] = React.useState(false);
  const [hovered, setHovered] = React.useState(null);
  const [leaving, setLeaving] = React.useState(null);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    const clk = setInterval(() => setNow(new Date()), 15000);
    return () => { cancelAnimationFrame(id); clearInterval(clk); };
  }, []);

  const go = (route) => {
    if (leaving) return;
    setLeaving(route);
    setTimeout(() => navigate(route), 460);
  };

  const hhmm = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  const dateStr = now.toLocaleDateString('en-GB', { weekday:'long', day:'2-digit', month:'long' }).toUpperCase();
  const rera = (window.PROJECT && PROJECT.rera) || 'PRM/KA/RERA/1251/309/PR/260924/007084';

  const STATS = [
    { k:'25',    u:'Acres' },
    { k:'10',    u:'Towers' },
    { k:'2,522', u:'Residences' },
    { k:'65',    u:'Amenities' },
  ];

  return (
    <div style={{
      position:'absolute', inset:0, overflow:'hidden',
      background:'radial-gradient(ellipse 120% 90% at 70% 0%, #16271d 0%, #0e1a13 46%, #0a140f 100%)',
      color:'#f4ead0',
      opacity: leaving ? 0 : 1, transform: leaving ? 'scale(0.99)' : 'scale(1)',
      transition:'opacity 380ms ease, transform 380ms ease',
    }}>
      {/* ---- futuristic ground: fine tech grid + ambient glow blobs ---- */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.5,
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent 0 79px, rgba(232,216,168,0.035) 79px 80px),'+
          'repeating-linear-gradient(90deg, transparent 0 79px, rgba(232,216,168,0.035) 79px 80px)' }}/>
      <div style={{ position:'absolute', left:'58%', top:'-12%', width:1200, height:1200,
        borderRadius:'50%', pointerEvents:'none',
        background:'radial-gradient(circle, rgba(201,168,101,0.20) 0%, transparent 64%)',
        animation:'v2Blob 22s ease-in-out infinite' }}/>
      <div style={{ position:'absolute', left:'-8%', top:'40%', width:1000, height:1000,
        borderRadius:'50%', pointerEvents:'none',
        background:'radial-gradient(circle, rgba(74,120,86,0.22) 0%, transparent 66%)',
        animation:'v2Blob 28s ease-in-out infinite reverse' }}/>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse 80% 70% at 50% 46%, transparent 62%, rgba(6,12,8,0.7) 100%)' }}/>

      {/* ================= TOP BAR ================= */}
      <div style={{
        position:'absolute', left:56, right:56, top:46, height:96,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        animation: mounted ? 'v2Drop 560ms 80ms both' : 'none',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:24 }}>
          <LivingTreeWordmark size={42} color="#f4ead0" tight/>
          <div style={{ width:1, height:46, background:'rgba(232,216,168,0.2)' }}/>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            <div className="mono" style={{ fontSize:12, letterSpacing:'0.34em', color:'#c9a865' }}>SALES STUDIO</div>
            <div className="mono" style={{ fontSize:11, letterSpacing:'0.18em', color:'rgba(244,234,208,0.5)' }}>
              NORTH BENGALURU · KIADB AEROSPACE PARK
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:22 }}>
          {/* live status pill */}
          <div style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 16px',
            borderRadius:24, background:'rgba(111,196,122,0.12)',
            border:'1px solid rgba(111,196,122,0.32)' }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#6fc47a',
              animation:'v2Pulse 2s ease-in-out infinite',
              boxShadow:'0 0 8px #6fc47a' }}/>
            <span className="mono" style={{ fontSize:11, letterSpacing:'0.2em', color:'#bfe6c4' }}>
              PHASE 1 · SELLING
            </span>
          </div>
          <div style={{ width:1, height:46, background:'rgba(232,216,168,0.2)' }}/>
          <div style={{ textAlign:'right' }}>
            <div className="mono" style={{ fontSize:30, lineHeight:1, color:'#f4ead0' }}>{hhmm}</div>
            <div className="mono" style={{ fontSize:10, letterSpacing:'0.2em', marginTop:5,
              color:'rgba(244,234,208,0.5)' }}>{dateStr}</div>
          </div>
        </div>
      </div>
      <div style={{ position:'absolute', left:56, right:56, top:158, height:1,
        background:'linear-gradient(90deg, transparent, rgba(232,216,168,0.22) 8%, rgba(232,216,168,0.22) 92%, transparent)' }}/>

      {/* ================= MAIN: HERO + MODULE GRID ================= */}
      <div style={{ position:'absolute', left:56, right:56, top:190, bottom:52,
        display:'flex', gap:38 }}>

        {/* ---------- LEFT · PROJECT HERO ---------- */}
        <div style={{
          width:1360, flexShrink:0, position:'relative', borderRadius:24, overflow:'hidden',
          border:'1px solid rgba(232,216,168,0.16)',
          boxShadow:'0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          background:'#0c1610',
          animation: mounted ? 'v2Up 700ms 160ms both' : 'none',
        }}>
          {/* hero render */}
          <div style={{ position:'absolute', left:0, right:0, top:0, height:'62%', overflow:'hidden' }}>
            <img src="assets/brand/township.jpg" alt=""
              style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 40%',
                display:'block', filter:'saturate(0.92) brightness(0.96)',
                transform:`scale(${1.04 + 0.015*Math.sin(tSec*0.3)})`, transition:'transform 1s ease' }}/>
            {/* gradient fade into the panel */}
            <div style={{ position:'absolute', inset:0,
              background:'linear-gradient(180deg, rgba(8,16,10,0.32) 0%, transparent 26%, transparent 56%, #0c1610 100%)' }}/>
            {/* scan shimmer */}
            <div style={{ position:'absolute', left:0, right:0, top:0, height:'12%',
              background:'linear-gradient(180deg, rgba(232,216,168,0.14), transparent)',
              animation:'v2Scan 7s linear infinite', pointerEvents:'none' }}/>
            {/* top overlays */}
            <div style={{ position:'absolute', left:30, top:28, display:'flex', gap:12 }}>
              <span className="mono" style={{ fontSize:11, letterSpacing:'0.22em', padding:'8px 14px',
                borderRadius:6, background:'rgba(8,14,9,0.6)', border:'1px solid rgba(232,216,168,0.3)',
                color:'#e8d8a8', backdropFilter:'blur(6px)' }}>PHASE 1 · TOWERS BY 2029</span>
            </div>
            <div className="mono" style={{ position:'absolute', right:30, top:32, fontSize:10,
              letterSpacing:'0.14em', color:'rgba(244,234,208,0.7)', textAlign:'right',
              textShadow:'0 1px 6px rgba(0,0,0,0.8)' }}>
              RERA<br/>{rera}
            </div>
          </div>

          {/* hero content */}
          <div style={{ position:'absolute', left:0, right:0, bottom:0, height:'42%',
            padding:'0 48px 40px', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
            <div className="mono" style={{ fontSize:11, letterSpacing:'0.34em', color:'#c9a865',
              marginBottom:12 }}>A KALYANI DEVELOPERS PROJECT</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:18, marginBottom:6 }}>
              <span className="serif" style={{ fontSize:88, lineHeight:0.95, fontWeight:600,
                letterSpacing:'-0.02em', color:'#fbf3dc' }}>
                Living<span style={{ fontStyle:'italic', color:'#e8d8a8' }}>Tree</span>
              </span>
              <span className="serif" style={{ fontSize:26, fontStyle:'italic',
                color:'rgba(244,234,208,0.6)' }}>® residences</span>
            </div>
            <div className="serif" style={{ fontSize:30, fontStyle:'italic',
              color:'rgba(244,234,208,0.8)', marginBottom:24 }}>
              Designed for Four Generations
            </div>

            {/* stats ribbon */}
            <div style={{ display:'flex', alignItems:'stretch', gap:0, marginBottom:26,
              borderTop:'1px solid rgba(232,216,168,0.16)', borderBottom:'1px solid rgba(232,216,168,0.16)' }}>
              {STATS.map((s, i) => (
                <div key={s.u} style={{ flex:1, padding:'18px 0',
                  borderLeft: i ? '1px solid rgba(232,216,168,0.12)' : 'none',
                  display:'flex', flexDirection:'column', gap:4, alignItems:'flex-start',
                  paddingLeft: i ? 26 : 0 }}>
                  <span className="serif" style={{ fontSize:46, fontWeight:600, lineHeight:1,
                    color:'#e8d8a8' }}>{s.k}</span>
                  <span className="mono" style={{ fontSize:11, letterSpacing:'0.2em',
                    textTransform:'uppercase', color:'rgba(244,234,208,0.5)' }}>{s.u}</span>
                </div>
              ))}
            </div>

            {/* primary CTA */}
            <button onClick={() => go('story')}
              onPointerEnter={() => setHovered('cta')} onPointerLeave={() => setHovered(null)}
              style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:16,
                padding:'18px 32px', borderRadius:12, cursor:'pointer',
                background: hovered==='cta'
                  ? 'linear-gradient(120deg, #f0d9a0, #c9a865)'
                  : 'linear-gradient(120deg, #e8d8a8, #c9a865)',
                border:'none', color:'#1a2b17',
                boxShadow: hovered==='cta' ? '0 16px 40px rgba(201,168,101,0.4)' : '0 10px 28px rgba(0,0,0,0.4)',
                transform:`translateY(${hovered==='cta'?-3:0}px)`,
                transition:'transform 220ms ease, box-shadow 220ms ease, background 220ms ease' }}>
              <span className="serif" style={{ fontSize:24, fontWeight:600 }}>Begin the Walkthrough</span>
              {window.Icons && window.Icons.arrow &&
                <window.Icons.arrow style={{ width:24, height:24,
                  transform:`translateX(${hovered==='cta'?5:0}px)`, transition:'transform 220ms ease' }}/>}
            </button>
          </div>
        </div>

        {/* ---------- RIGHT · MODULE GRID ---------- */}
        <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
          {/* header */}
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between',
            marginBottom:20, animation: mounted ? 'v2Drop 560ms 220ms both' : 'none' }}>
            <div>
              <div className="mono" style={{ fontSize:11, letterSpacing:'0.34em', color:'#c9a865',
                marginBottom:7 }}>NAVIGATE</div>
              <div className="serif" style={{ fontSize:38, fontWeight:600, lineHeight:1,
                color:'#f4ead0' }}>Explore the Project</div>
            </div>
            <div className="mono" style={{ fontSize:12, letterSpacing:'0.2em',
              color:'rgba(244,234,208,0.45)' }}>11 MODULES</div>
          </div>

          {/* grid */}
          <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr',
            gridAutoRows:'1fr', gap:16, overflow:'hidden' }}>
            {MODS.map((mod, i) => (
              <ModuleCard key={mod.id} mod={mod} idx={i} mounted={mounted}
                hovered={hovered} onHover={setHovered} onTap={(m)=>go(m.route)}
                dimmed={leaving && leaving !== mod.route} tSec={tSec}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.HomeV2 = HomeV2;
})();
