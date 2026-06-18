// Shared header — back-to-home pill + module breadcrumb + Kalyani credit
// Used by every non-splash, non-home screen.

function ScreenHeader({ title, sub, accent = 'forest', onBack }) {
  const goBack = () => {
    if (onBack) onBack();
    else navigate('home');
  };
  return (
    <div style={{
      position:'absolute', top:0, left:0, right:0, zIndex:20,
      padding:'40px 60px 0',
      display:'flex', alignItems:'flex-start', justifyContent:'space-between',
      pointerEvents:'none',
    }}>
      {/* back pill */}
      <button onClick={goBack} style={{
        pointerEvents:'auto',
        display:'inline-flex', alignItems:'center', gap:14,
        background:'rgba(46,74,44,0.92)', color:'var(--on-tile)',
        padding:'18px 28px', borderRadius:999,
        border:'1px solid rgba(201,168,101,0.5)',
        fontFamily:'JetBrains Mono, ui-monospace, monospace',
        fontSize:18, letterSpacing:'0.18em', textTransform:'uppercase',
        boxShadow:'0 10px 30px rgba(20,30,18,0.32)',
      }}>
        <span style={{display:'inline-flex', width:22, height:22}}><Icons.back/></span>
        Home
      </button>

      {/* title block */}
      <div style={{textAlign:'right'}}>
        <div className={`eyebrow ${accent}`} style={{marginBottom:8}}>{sub || PROJECT.brand}</div>
        <div className="serif" style={{fontSize:54, lineHeight:1, color:'var(--forest)', fontWeight:500}}>{title}</div>
      </div>
    </div>
  );
}

window.ScreenHeader = ScreenHeader;
