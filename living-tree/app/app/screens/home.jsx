// LivingTree · Home — VERSION SWITCHER
// ---------------------------------------------------------------------------
// The home screen has two saved design versions:
//   v1  "The Living Tree"  — the painted tree scene + bottom dock (home_v1.jsx)
//   v2  "Sales OS"         — the modern futuristic dark UI      (home_v2.jsx)
// This file just picks which one to render. A discreet pill at the top lets
// the client flip between them; the choice persists in localStorage.
// ---------------------------------------------------------------------------
function Home() {
  const [ver, setVer] = React.useState(() => {
    try { return localStorage.getItem('lt-home-ver') || 'v2'; } catch (e) { return 'v2'; }
  });
  const pick = (v) => {
    try { localStorage.setItem('lt-home-ver', v); } catch (e) {}
    setVer(v);
  };

  const Active = ver === 'v1' ? window.HomeV1 : window.HomeV2;

  const VERSIONS = [
    { v:'v1', label:'The Living Tree' },
    { v:'v2', label:'Sales OS' },
  ];

  return (
    <div style={{ position:'absolute', inset:0 }}>
      {Active
        ? <Active/>
        : <div style={{ position:'absolute', inset:0, display:'flex',
            alignItems:'center', justifyContent:'center', color:'var(--slate)' }}
            className="mono">loading version…</div>}

      {/* ---- discreet version switcher (top-centre, above both layouts) ---- */}
      <div style={{
        position:'absolute', left:'50%', top:12, transform:'translateX(-50%)',
        display:'flex', alignItems:'center', gap:4, zIndex:9999,
        padding:4, borderRadius:22,
        background:'rgba(12,20,14,0.82)',
        border:'1px solid rgba(232,216,168,0.28)',
        boxShadow:'0 6px 20px rgba(0,0,0,0.45)',
        backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
      }}>
        <span className="mono" style={{ fontSize:9, letterSpacing:'0.2em',
          color:'rgba(232,216,168,0.5)', padding:'0 8px 0 10px' }}>DESIGN</span>
        {VERSIONS.map(({ v, label }) => {
          const on = ver === v;
          return (
            <button key={v} onClick={() => pick(v)}
              style={{
                display:'flex', alignItems:'center', gap:7,
                padding:'7px 14px', borderRadius:18, cursor:'pointer', border:'none',
                background: on ? 'linear-gradient(120deg,#e8d8a8,#c9a865)' : 'transparent',
                color: on ? '#1a2b17' : 'rgba(232,216,168,0.7)',
                transition:'background 200ms ease, color 200ms ease',
              }}>
              <span className="mono" style={{ fontSize:10, letterSpacing:'0.12em', fontWeight:600 }}>
                {v.toUpperCase()}
              </span>
              <span className="serif" style={{ fontSize:14, fontStyle:'italic' }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

window.Home = Home;
