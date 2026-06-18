// DASHBOARD — Mini live-numbers panel for the GRE manager
//
// Four hero KPI cards on top, inventory-by-tower (real TOWERS data) on the
// left, 7-day walk-ins sparkline on the right, then a recent-activity feed
// at the bottom. Sparkline is a hand-rolled SVG path — no chart library.
// All non-tower numbers are demo data; the tower availability does pull
// from data.jsx for verisimilitude but the "today / this week" deltas are
// placeholders. Honest footer note.

const DASH_SPARK = [4, 7, 6, 11, 9, 13, 12]; // last-7-day walk-ins (demo)
const DASH_SPARK_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const DASH_ACTIVITY = [
  { t:'10:42', who:'Rohan B.',       what:'logged a walk-in',                    kind:'walk-in'  },
  { t:'10:18', who:'Anika R.',       what:'received brochure via WhatsApp',      kind:'message'  },
  { t:'09:55', who:'Sneha K.',       what:'confirmed site-visit appointment',    kind:'booking'  },
  { t:'09:31', who:'Karthik I.',     what:'requested 3 BHK Smart cost sheet',    kind:'message'  },
  { t:'09:02', who:'Vivek M.',       what:'completed property tour · Aspen',    kind:'tour'     },
];

const DASH_KIND_STYLE = {
  'walk-in':  { dot:'var(--available)', label:'WALK-IN'  },
  'message':  { dot:'var(--gold)',      label:'MESSAGE'  },
  'booking':  { dot:'var(--gold-deep)', label:'BOOKING'  },
  'tour':     { dot:'var(--forest-mid)',label:'TOUR'     },
};

function Dashboard() {
  // demo "live" timestamp — pinned at render so screenshots are deterministic-ish
  const now = new Date();
  const stamp = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:false });

  // tower aggregate
  const totalUnits = (typeof TOWERS !== 'undefined')
    ? TOWERS.reduce((s,t) => s + t.units, 0) : 2522;
  const soldUnits = (typeof TOWERS !== 'undefined')
    ? TOWERS.reduce((s,t) => s + t.sold, 0) : 2226;

  return (
    <div style={{
      position:'absolute', inset:0,
      background:'linear-gradient(180deg, var(--forest-deep) 0%, #182a1c 100%)',
      color:'var(--on-tile)', overflow:'hidden',
    }}>
      <div style={{position:'absolute', inset:0, opacity:0.18, pointerEvents:'none'}}>
        <LeafField count={16} opacity={0.55} color="rgba(120,160,110," goldRatio={0.4}/>
      </div>

      <DashHeader stamp={stamp}/>

      {/* === Hero KPI strip ============================================ */}
      <div style={{
        position:'absolute', top:210, left:60, right:60,
        display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:22,
      }}>
        <KpiCard
          eyebrow="Units Sold"
          number={soldUnits.toLocaleString('en-IN')}
          denom={'/ ' + totalUnits.toLocaleString('en-IN')}
          progress={soldUnits / totalUnits}
          accent
        />
        <KpiCard
          eyebrow="Walk-ins Today"
          number="12"
          delta="+3 vs avg"
          deltaDir="up"
        />
        <KpiCard
          eyebrow="Active Prospects"
          number="87"
          delta="14 hot"
          deltaDir="neutral"
        />
        <KpiCard
          eyebrow="Bookings · Week"
          number="9"
          delta="+2 vs last wk"
          deltaDir="up"
        />
      </div>

      {/* === Middle: inventory + sparkline ============================= */}
      <div style={{
        position:'absolute', top:520, left:60, right:60, height:580,
        display:'grid', gridTemplateColumns:'1.35fr 1fr', gap:28,
      }}>
        <InventoryByTower/>
        <SparkPanel data={DASH_SPARK} labels={DASH_SPARK_LABELS}/>
      </div>

      {/* === Bottom: recent activity =================================== */}
      <div style={{
        position:'absolute', bottom:80, left:60, right:60, height:340,
      }}>
        <RecentActivity items={DASH_ACTIVITY}/>
      </div>

      <DashFooter/>
    </div>
  );
}

// ============================================================================
// Header
// ============================================================================
function DashHeader({ stamp }) {
  return (
    <div style={{
      position:'absolute', top:0, left:0, right:0, zIndex:20,
      padding:'40px 60px 0',
      display:'flex', alignItems:'flex-start', justifyContent:'space-between',
    }}>
      <button onClick={() => navigate('home')} style={{
        display:'inline-flex', alignItems:'center', gap:14,
        background:'rgba(245,239,217,0.06)', color:'var(--on-tile)',
        padding:'18px 28px', borderRadius:999,
        border:'1px solid rgba(201,168,101,0.40)',
        fontFamily:'JetBrains Mono, ui-monospace, monospace',
        fontSize:18, letterSpacing:'0.18em', textTransform:'uppercase',
        cursor:'pointer',
      }}>
        <span style={{display:'inline-flex', width:22, height:22}}><Icons.back/></span>
        Home
      </button>

      <div style={{textAlign:'right'}}>
        <div className="mono" style={{
          fontSize:14, letterSpacing:'0.30em', textTransform:'uppercase',
          color:'var(--gold-soft)', marginBottom:8,
        }}>Sales Suite · Live</div>
        <div className="serif" style={{
          fontSize:62, lineHeight:1, color:'var(--on-tile)', fontWeight:400, letterSpacing:'-0.02em',
        }}>Mini Dashboard</div>
        <div style={{display:'inline-flex', alignItems:'center', gap:10, marginTop:14}}>
          <span style={{
            width:8, height:8, borderRadius:'50%',
            background:'var(--available)',
            boxShadow:'0 0 12px rgba(74,139,82,0.65)',
          }}/>
          <span className="mono" style={{
            fontSize:12, letterSpacing:'0.28em', textTransform:'uppercase',
            color:'rgba(245,239,217,0.60)',
          }}>Updated {stamp} · Demo Mode</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// KPI hero card
// ============================================================================
function KpiCard({ eyebrow, number, denom, progress, delta, deltaDir, accent }) {
  return (
    <div style={{
      padding:'26px 28px 22px', borderRadius:18,
      background: accent
        ? 'linear-gradient(160deg, rgba(232,216,168,0.16) 0%, rgba(201,168,101,0.08) 100%)'
        : 'rgba(245,239,217,0.05)',
      border:'1px solid ' + (accent ? 'rgba(201,168,101,0.45)' : 'rgba(245,239,217,0.12)'),
      boxShadow: accent ? '0 14px 30px rgba(10,18,12,0.36)' : 'none',
      display:'flex', flexDirection:'column', gap:10,
      minHeight:230,
    }}>
      <div className="mono" style={{
        fontSize:12, letterSpacing:'0.30em', textTransform:'uppercase',
        color: accent ? 'var(--gold-soft)' : 'rgba(245,239,217,0.55)',
      }}>{eyebrow}</div>

      <div style={{display:'flex', alignItems:'baseline', gap:10, flexWrap:'wrap'}}>
        <div className="serif" style={{
          fontSize:80, fontWeight:400, lineHeight:1, letterSpacing:'-0.025em',
          color: accent ? 'var(--gold-soft)' : 'var(--on-tile)',
          fontVariantNumeric:'tabular-nums',
        }}>{number}</div>
        {denom && (
          <div className="serif" style={{
            fontSize:22, fontStyle:'italic', color:'rgba(245,239,217,0.45)',
            fontVariantNumeric:'tabular-nums',
          }}>{denom}</div>
        )}
      </div>

      {/* progress bar — only if `progress` provided */}
      {typeof progress === 'number' && (
        <div style={{marginTop:8}}>
          <div style={{
            height:6, borderRadius:999,
            background:'rgba(245,239,217,0.10)',
            overflow:'hidden',
          }}>
            <div style={{
              height:'100%', borderRadius:999,
              width: (Math.min(1, Math.max(0, progress)) * 100).toFixed(1) + '%',
              background:'linear-gradient(90deg, var(--gold-deep) 0%, var(--gold) 100%)',
              boxShadow:'0 0 14px rgba(201,168,101,0.55)',
            }}/>
          </div>
          <div className="mono" style={{
            fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase',
            color:'var(--gold-soft)', marginTop:8, fontVariantNumeric:'tabular-nums',
          }}>{(progress * 100).toFixed(1)}% sold</div>
        </div>
      )}

      {/* delta chip */}
      {delta && (
        <div style={{marginTop:'auto', display:'flex', alignItems:'center', gap:8}}>
          <span className="mono" style={{
            fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase',
            color: deltaDir === 'up' ? 'var(--available)'
                 : deltaDir === 'down' ? 'var(--sold)'
                 : 'rgba(245,239,217,0.55)',
            padding:'5px 10px', borderRadius:999,
            background:'rgba(245,239,217,0.06)',
            border:'1px solid rgba(245,239,217,0.14)',
            fontWeight:600,
          }}>{deltaDir === 'up' ? '↑ ' : deltaDir === 'down' ? '↓ ' : '· '}{delta}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Inventory by tower
// ============================================================================
function InventoryByTower() {
  const towers = (typeof TOWERS !== 'undefined') ? TOWERS : [];
  return (
    <Panel title="Inventory by Tower" sub={`${towers.length} towers · live`}>
      <div className="scroll" style={{
        display:'flex', flexDirection:'column', gap:10, overflow:'auto',
        flex:'1 1 auto', paddingRight:6,
      }}>
        {towers.map(t => {
          const pct = t.units ? (t.sold / t.units) : 0;
          const isSoldOut = t.available === 0;
          const statusKind = isSoldOut ? 'sold' : (t.available < 20 ? 'hold' : 'available');
          const statusLabel = isSoldOut ? 'SOLD OUT' : (t.available < 20 ? 'NEARLY FULL' : 'AVAILABLE');
          const dot = statusKind === 'sold' ? 'var(--sold)'
                    : statusKind === 'hold' ? 'var(--hold)'
                    : 'var(--available)';
          return (
            <div key={t.id} style={{
              display:'grid', gridTemplateColumns:'170px 1fr 130px',
              gap:18, alignItems:'center',
              padding:'14px 18px', borderRadius:12,
              background:'rgba(245,239,217,0.04)',
              border:'1px solid rgba(245,239,217,0.08)',
            }}>
              <div>
                <div className="serif" style={{
                  fontSize:21, fontWeight:500, color:'var(--on-tile)',
                  letterSpacing:'-0.005em', lineHeight:1.1,
                }}>{t.name}</div>
                <div className="mono" style={{
                  fontSize:10.5, letterSpacing:'0.20em', textTransform:'uppercase',
                  color:'rgba(245,239,217,0.45)', marginTop:4,
                }}>Tower {String(t.no).padStart(2,'0')} · {t.cluster}</div>
              </div>

              <div>
                <div style={{
                  height:8, borderRadius:999,
                  background:'rgba(245,239,217,0.08)',
                  overflow:'hidden', position:'relative',
                }}>
                  <div style={{
                    height:'100%', borderRadius:999,
                    width: (pct * 100).toFixed(1) + '%',
                    background: isSoldOut
                      ? 'linear-gradient(90deg, rgba(184,85,71,0.7), var(--sold))'
                      : 'linear-gradient(90deg, var(--forest-mid), var(--gold))',
                  }}/>
                </div>
                <div style={{
                  display:'flex', justifyContent:'space-between', marginTop:6,
                  fontFamily:'JetBrains Mono, ui-monospace, monospace',
                  fontSize:11, color:'rgba(245,239,217,0.55)',
                  letterSpacing:'0.18em', textTransform:'uppercase',
                }}>
                  <span>{t.available} avail</span>
                  <span>{t.sold} / {t.units} sold</span>
                </div>
              </div>

              <div className="mono" style={{
                justifySelf:'end',
                fontSize:10.5, letterSpacing:'0.22em', textTransform:'uppercase',
                color: dot, padding:'6px 12px', borderRadius:999,
                background:'rgba(245,239,217,0.05)',
                border:`1px solid ${dot}`,
                fontWeight:600, whiteSpace:'nowrap',
                display:'inline-flex', alignItems:'center', gap:8,
              }}>
                <span style={{width:6, height:6, borderRadius:'50%', background:dot}}/>
                {statusLabel}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ============================================================================
// Sparkline panel — 7-day walk-ins
// ============================================================================
function SparkPanel({ data, labels }) {
  const W = 540, H = 230, padX = 18, padY = 22;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const stepX = (W - padX*2) / (data.length - 1);
  const points = data.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + (H - padY*2) * (1 - (v - min) / span);
    return { x, y, v };
  });
  const path = points.map((p,i) => (i===0?'M':'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
  const areaPath = path + ` L ${points[points.length-1].x},${H-padY} L ${points[0].x},${H-padY} Z`;
  const total = data.reduce((s,n) => s+n, 0);
  const last = data[data.length - 1];

  return (
    <Panel title="Walk-ins · 7-Day" sub={`Total ${total}`}>
      <div style={{display:'flex', flexDirection:'column', gap:14, flex:'1 1 auto'}}>
        <div style={{display:'flex', alignItems:'baseline', gap:14}}>
          <div className="serif" style={{
            fontSize:64, fontWeight:400, lineHeight:1, letterSpacing:'-0.02em',
            color:'var(--gold-soft)', fontVariantNumeric:'tabular-nums',
          }}>{total}</div>
          <div className="serif" style={{
            fontSize:18, fontStyle:'italic', color:'rgba(245,239,217,0.55)',
          }}>walk-ins · last 7 days</div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{
          width:'100%', height:160, display:'block',
        }}>
          <defs>
            <linearGradient id="dash-spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(201,168,101,0.32)"/>
              <stop offset="100%" stopColor="rgba(201,168,101,0)"/>
            </linearGradient>
          </defs>
          {/* baseline */}
          <line x1={padX} y1={H-padY} x2={W-padX} y2={H-padY}
            stroke="rgba(245,239,217,0.12)" strokeWidth="1"/>
          {/* area */}
          <path d={areaPath} fill="url(#dash-spark-fill)"/>
          {/* line */}
          <path d={path} fill="none" stroke="var(--gold)" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"/>
          {/* dots */}
          {points.map((p, i) => {
            const isLast = i === points.length - 1;
            return (
              <circle key={i} cx={p.x} cy={p.y}
                r={isLast ? 5.5 : 3}
                fill={isLast ? 'var(--gold-soft)' : 'var(--gold)'}
                stroke={isLast ? 'var(--gold-deep)' : 'none'}
                strokeWidth={isLast ? 1.5 : 0}/>
            );
          })}
        </svg>

        <div style={{
          display:'grid', gridTemplateColumns:`repeat(${labels.length}, 1fr)`,
          gap:0, fontFamily:'JetBrains Mono, ui-monospace, monospace',
          fontSize:11, color:'rgba(245,239,217,0.50)',
          letterSpacing:'0.18em', textTransform:'uppercase',
        }}>
          {labels.map((l, i) => (
            <div key={l} style={{
              textAlign:'center',
              color: i === labels.length-1 ? 'var(--gold-soft)' : undefined,
              fontWeight: i === labels.length-1 ? 700 : 500,
            }}>{l}<br/><span style={{
              color:'rgba(245,239,217,0.35)', fontWeight:400, fontSize:10,
            }}>{data[i]}</span></div>
          ))}
        </div>

        <div className="mono" style={{
          marginTop:'auto', fontSize:11, letterSpacing:'0.22em',
          color:'rgba(245,239,217,0.45)', textTransform:'uppercase',
          display:'flex', justifyContent:'space-between',
        }}>
          <span>Peak · Sat {max}</span>
          <span>Today · {last}</span>
        </div>
      </div>
    </Panel>
  );
}

// ============================================================================
// Recent activity feed
// ============================================================================
function RecentActivity({ items }) {
  return (
    <Panel title="Recent Activity" sub="Live feed">
      <div style={{display:'flex', flexDirection:'column', gap:6, flex:'1 1 auto'}}>
        {items.map((it, i) => {
          const k = DASH_KIND_STYLE[it.kind] || DASH_KIND_STYLE['message'];
          return (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'90px 110px 1fr',
              gap:18, alignItems:'center',
              padding:'12px 6px',
              borderBottom: i < items.length - 1 ? '1px solid rgba(245,239,217,0.06)' : 'none',
            }}>
              <div className="mono" style={{
                fontSize:14, letterSpacing:'0.12em',
                color:'rgba(245,239,217,0.62)', fontVariantNumeric:'tabular-nums',
              }}>{it.t}</div>

              <div style={{display:'inline-flex', alignItems:'center', gap:9}}>
                <span style={{width:7, height:7, borderRadius:'50%', background:k.dot}}/>
                <span className="mono" style={{
                  fontSize:10.5, letterSpacing:'0.22em',
                  color: k.dot, fontWeight:600,
                }}>{k.label}</span>
              </div>

              <div style={{
                fontSize:18, color:'var(--on-tile)', lineHeight:1.3,
              }}>
                <span className="serif" style={{fontWeight:500}}>{it.who}</span>
                <span style={{color:'rgba(245,239,217,0.65)'}}> {it.what}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ============================================================================
// Shared
// ============================================================================
function Panel({ title, sub, children }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column', minHeight:0,
      background:'rgba(245,239,217,0.04)',
      border:'1px solid rgba(245,239,217,0.10)',
      borderRadius:18, padding:'22px 24px 20px',
    }}>
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'baseline',
        borderBottom:'1px solid rgba(201,168,101,0.24)', paddingBottom:12, marginBottom:16,
      }}>
        <div className="mono" style={{
          fontSize:13, letterSpacing:'0.30em', textTransform:'uppercase',
          color:'var(--gold-soft)', fontWeight:600,
        }}>{title}</div>
        {sub && <div className="mono" style={{
          fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase',
          color:'rgba(245,239,217,0.45)',
        }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function DashFooter() {
  return (
    <div style={{
      position:'absolute', bottom:24, left:60, right:60,
      display:'flex', justifyContent:'space-between', alignItems:'center',
      pointerEvents:'none',
    }}>
      <div className="mono" style={{
        fontSize:11, letterSpacing:'0.28em', textTransform:'uppercase',
        color:'rgba(245,239,217,0.42)',
      }}>Demo data — replace with real CRM feed.</div>
      <KalyaniCredit light size={11}/>
    </div>
  );
}

window.Dashboard = Dashboard;
