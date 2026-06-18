// GRE — Guest Relations Executive workspace
//
// Salesperson's daily cockpit at the sales lounge: today's appointments
// (left), active prospect detail (center), quick-action stack (right).
// Substrate is forest-deep to read as "back-of-house" tooling and contrast
// the customer-facing parchment chapters. All names/notes are demo data;
// per Nischal's brief, button payloads are unfinished — buttons render but
// don't fire backend calls yet. Footer carries an honest "demo data" note.

(function ensureGreKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('lt-gre-keys')) return;
  const s = document.createElement('style');
  s.id = 'lt-gre-keys';
  s.textContent = `
    .gre-row { transition: background 180ms ease, border-color 180ms ease, transform 180ms ease; }
    .gre-row:hover { background: rgba(232,216,168,0.10); }
    .gre-row.on { background: rgba(232,216,168,0.16); border-color: rgba(201,168,101,0.55); }
    .gre-action { transition: background 180ms ease, transform 120ms ease; }
    .gre-action:hover { background: rgba(232,216,168,0.10); }
    .gre-action:active { transform: scale(0.985); }
  `;
  document.head.appendChild(s);
})();

const GRE_APPOINTMENTS = [
  { id:'a01', time:'10:30', name:'Rohan Bhatia',       source:'Walk-in',  status:'Touring',    interest:'3 BHK Optimal · East · Floor 14+', phone:'+91 98450 12233', email:'rohan.b@gmail.com',        lastTouch:'today, 09:48',  notes:'Came in with spouse. Wants Aspen if budget allows. Cross-check Wipro Aerospace employer ID for HR rate.' },
  { id:'a02', time:'11:15', name:'Anika Reddy',        source:'Phone',    status:'Confirmed',  interest:'2 BHK + Study · West',              phone:'+91 99000 41087', email:'anika.reddy@outlook.com',  lastTouch:'yesterday',     notes:'Phone enquiry from Justdial. Asked specifically about Juliet balconies and Vastu compliance.' },
  { id:'a03', time:'12:45', name:'Karthik Iyer',       source:'Referral', status:'Awaiting',   interest:'3 BHK Smart · East · mid-floor',    phone:'+91 80422 99811', email:'k.iyer.bgr@gmail.com',     lastTouch:'2 days ago',    notes:'Referred by existing Aspen booking (LT-2026-1148). Wife is a paediatrician — school proximity matters.' },
  { id:'a04', time:'14:00', name:'Mr. & Mrs. Pranesh', source:'Walk-in',  status:'Awaiting',   interest:'3 BHK Luxe · Aspen (signature)',    phone:'+91 88800 71224', email:'pranesh.cv@protonmail.com',lastTouch:'last week',     notes:'Returning visit. Last time saw the masterplan only. Walk them through Tower Aspen this round.' },
  { id:'a05', time:'15:30', name:'Sneha Kulkarni',     source:'Phone',    status:'Confirmed',  interest:'3 BHK Optimal · East · Floor 18+', phone:'+91 90360 55621', email:'sneha.k.work@gmail.com',   lastTouch:'today, 11:02',  notes:'Boeing employee. Pre-approved home loan letter on file. Booking-amount-ready per phone call.' },
  { id:'a06', time:'17:00', name:'Vivek Menon',        source:'Walk-in',  status:'Done',       interest:'3 BHK Smart · West · Floor 8-12',  phone:'+91 73499 88102', email:'vivek.menon@yahoo.in',     lastTouch:'today, 16:42',  notes:'Visit closed. Sent brochure + cost sheet via WhatsApp. Follow up Monday for site visit confirmation.' },
];

const GRE_STATUS_STYLE = {
  Confirmed: { fg: '#e9f3d8', bg: 'rgba(74,139,82,0.22)',  bd: 'rgba(74,139,82,0.55)' },
  Touring:   { fg: '#f7e6b8', bg: 'rgba(201,168,101,0.22)', bd: 'rgba(201,168,101,0.55)' },
  Awaiting:  { fg: '#efe6cd', bg: 'rgba(245,239,217,0.10)', bd: 'rgba(245,239,217,0.28)' },
  Done:      { fg: '#cdb6a6', bg: 'rgba(184,85,71,0.20)',   bd: 'rgba(184,85,71,0.50)' },
};

const GRE_QUICK_ACTIONS = [
  { id:'call',      label:'Call',          sub:'Direct dial',                icon:'plane'  },
  { id:'whatsapp',  label:'WhatsApp',      sub:'Message + share docs',       icon:'social' },
  { id:'brochure',  label:'Send Brochure', sub:'PDF · cost sheet · floor',   icon:'specs'  },
  { id:'tour',      label:'Schedule Tour', sub:'Book site / showflat slot',  icon:'masterplan' },
  { id:'note',      label:'Add Note',      sub:'Quick observation',          icon:'rule'   },
  { id:'log',       label:'Log Visit',     sub:'Mark visit complete',        icon:'check'  },
];

function GRE() {
  const [selectedId, setSelectedId] = React.useState(GRE_APPOINTMENTS[0].id);
  const selected = GRE_APPOINTMENTS.find(a => a.id === selectedId) || GRE_APPOINTMENTS[0];

  return (
    <div style={{
      position:'absolute', inset:0,
      background:'linear-gradient(180deg, var(--forest-deep) 0%, #182a1c 100%)',
      color:'var(--on-tile)', overflow:'hidden',
    }}>
      {/* very low-opacity ambient leaves — subtle, not noisy */}
      <div style={{position:'absolute', inset:0, opacity:0.20, pointerEvents:'none'}}>
        <LeafField count={18} opacity={0.55} color="rgba(120,160,110," goldRatio={0.35}/>
      </div>

      <GreHeader/>

      {/* === Body grid: 40% / 35% / 25% =============================== */}
      <div style={{
        position:'absolute', top:200, left:60, right:60, bottom:80,
        display:'grid',
        gridTemplateColumns:'minmax(0, 40fr) minmax(0, 35fr) minmax(0, 25fr)',
        gap:36,
      }}>
        <AppointmentColumn selectedId={selectedId} onSelect={setSelectedId}/>
        <ProspectDetail prospect={selected}/>
        <QuickActions/>
      </div>

      <DemoFooter/>
    </div>
  );
}

// ============================================================================
// Header — back pill + "Guest Relations" title + Demo Mode tag
// ============================================================================
function GreHeader() {
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
        }}>Guest Relations · Workspace</div>
        <div className="serif" style={{
          fontSize:62, lineHeight:1, color:'var(--on-tile)', fontWeight:400, letterSpacing:'-0.02em',
        }}>Guest Relations</div>
        <div style={{display:'inline-flex', alignItems:'center', gap:10, marginTop:14}}>
          <span className="mono" style={{
            fontSize:11, letterSpacing:'0.30em', textTransform:'uppercase',
            color:'#1a130a', padding:'7px 14px',
            background:'var(--gold)', borderRadius:999,
            border:'1px solid var(--gold-deep)', fontWeight:700,
          }}>Demo Mode</span>
          <span className="mono" style={{
            fontSize:13, letterSpacing:'0.22em', color:'rgba(245,239,217,0.55)',
            textTransform:'uppercase',
          }}>{new Date().toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' })}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LEFT — Today's appointments list
// ============================================================================
function AppointmentColumn({ selectedId, onSelect }) {
  return (
    <div style={{display:'flex', flexDirection:'column', minHeight:0}}>
      <ColumnLabel k="Today · Appointments" count={`${GRE_APPOINTMENTS.length} expected`}/>
      <div className="scroll" style={{
        marginTop:18, display:'flex', flexDirection:'column', gap:14,
        overflow:'auto', flex:'1 1 auto',
      }}>
        {GRE_APPOINTMENTS.map(a => {
          const on = a.id === selectedId;
          const st = GRE_STATUS_STYLE[a.status];
          return (
            <button key={a.id} onClick={() => onSelect(a.id)} className={'gre-row' + (on ? ' on' : '')} style={{
              textAlign:'left', cursor:'pointer',
              padding:'22px 24px', borderRadius:16,
              background:'rgba(245,239,217,0.04)',
              border:'1px solid rgba(245,239,217,0.10)',
              color:'inherit',
              display:'grid', gridTemplateColumns:'auto 1fr auto', gap:18,
              alignItems:'center',
            }}>
              {/* time */}
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', minWidth:80}}>
                <div className="serif" style={{
                  fontSize:36, fontWeight:400, color:'var(--gold-soft)',
                  letterSpacing:'-0.01em', lineHeight:1, fontVariantNumeric:'tabular-nums',
                }}>{a.time}</div>
                <div className="mono" style={{
                  fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase',
                  color:'rgba(245,239,217,0.45)', marginTop:6,
                }}>{a.source}</div>
              </div>

              {/* name + interest */}
              <div style={{minWidth:0}}>
                <div className="serif" style={{
                  fontSize:23, fontWeight:500, color:'var(--on-tile)',
                  letterSpacing:'-0.005em', lineHeight:1.15,
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                }}>{a.name}</div>
                <div style={{
                  fontSize:14, color:'rgba(245,239,217,0.62)', marginTop:5, lineHeight:1.35,
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                }}>{a.interest}</div>
              </div>

              {/* status pill */}
              <div className="mono" style={{
                fontSize:11, letterSpacing:'0.20em', textTransform:'uppercase',
                color: st.fg, padding:'7px 13px', borderRadius:999,
                background: st.bg, border:`1px solid ${st.bd}`,
                fontWeight:600, whiteSpace:'nowrap',
              }}>{a.status}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// CENTER — Active prospect detail
// ============================================================================
function ProspectDetail({ prospect }) {
  const st = GRE_STATUS_STYLE[prospect.status];
  return (
    <div style={{display:'flex', flexDirection:'column', minHeight:0}}>
      <ColumnLabel k="Active Prospect" count="Tap a card to switch"/>

      <div key={prospect.id} className="scroll" style={{
        marginTop:18, flex:'1 1 auto', overflow:'auto',
        background:'var(--ivory)', color:'var(--ink)',
        borderRadius:18, padding:'30px 32px',
        border:'1px solid rgba(201,168,101,0.32)',
        boxShadow:'0 20px 44px rgba(10,18,12,0.42)',
        display:'flex', flexDirection:'column', gap:18,
        animation:'routeIn 280ms cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12}}>
          <div style={{minWidth:0, flex:1}}>
            <div className="mono" style={{
              fontSize:11, letterSpacing:'0.30em', textTransform:'uppercase',
              color:'var(--gold-deep)',
            }}>{prospect.source} · {prospect.time}</div>
            <div className="serif" style={{
              fontSize:42, fontWeight:500, color:'var(--ink)',
              letterSpacing:'-0.018em', lineHeight:1.05, marginTop:6,
            }}>{prospect.name}</div>
          </div>
          <div className="mono" style={{
            fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase',
            color:'#1a130a', padding:'7px 13px', borderRadius:999,
            background: st.bg, border:`1px solid ${st.bd}`,
            fontWeight:700, whiteSpace:'nowrap',
            // status pill on light surface — promote contrast
            color: 'var(--ink)',
          }}>{prospect.status}</div>
        </div>

        <div style={{
          padding:'18px 22px', background:'var(--parchment-2)',
          borderRadius:12, border:'1px solid var(--line)',
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:16,
        }}>
          <DetailRow k="Phone" v={prospect.phone}/>
          <DetailRow k="Email" v={prospect.email}/>
          <DetailRow k="Last Touch" v={prospect.lastTouch}/>
          <DetailRow k="Source" v={prospect.source}/>
        </div>

        <div style={{borderTop:'1px solid var(--gold)', paddingTop:18}}>
          <div className="mono" style={{
            fontSize:12, letterSpacing:'0.32em', textTransform:'uppercase',
            color:'var(--gold-deep)', marginBottom:9,
          }}>Configuration Interest</div>
          <div className="serif" style={{
            fontSize:24, fontWeight:400, color:'var(--ink)',
            letterSpacing:'-0.01em', lineHeight:1.25,
          }}>{prospect.interest}</div>
        </div>

        <div style={{flex:'1 1 auto', display:'flex', flexDirection:'column', minHeight:0}}>
          <div className="mono" style={{
            fontSize:12, letterSpacing:'0.32em', textTransform:'uppercase',
            color:'var(--gold-deep)', marginBottom:9,
          }}>Notes</div>
          <textarea
            readOnly
            value={prospect.notes}
            style={{
              flex:'1 1 auto', minHeight:140, resize:'none',
              fontFamily:'Cormorant Garamond, Georgia, serif', fontSize:19,
              lineHeight:1.45, color:'var(--graphite)',
              background:'var(--parchment-2)', border:'1px solid var(--line)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ k, v }) {
  return (
    <div>
      <div className="mono" style={{
        fontSize:10.5, letterSpacing:'0.26em', textTransform:'uppercase',
        color:'var(--slate)',
      }}>{k}</div>
      <div className="serif" style={{
        fontSize:18, fontWeight:400, color:'var(--ink)',
        letterSpacing:'-0.005em', lineHeight:1.2, marginTop:4,
      }}>{v}</div>
    </div>
  );
}

// ============================================================================
// RIGHT — Quick actions
// ============================================================================
function QuickActions() {
  return (
    <div style={{display:'flex', flexDirection:'column', minHeight:0}}>
      <ColumnLabel k="Quick Actions" count="Tap to begin"/>
      <div style={{
        marginTop:18, display:'flex', flexDirection:'column', gap:12,
        flex:'1 1 auto',
      }}>
        {GRE_QUICK_ACTIONS.map(a => {
          const Icon = Icons[a.icon] || Icons.arrow;
          return (
            <button key={a.id} className="gre-action" style={{
              textAlign:'left', cursor:'pointer',
              padding:'20px 22px', borderRadius:14,
              background:'rgba(245,239,217,0.05)',
              border:'1px solid rgba(245,239,217,0.12)',
              color:'inherit',
              display:'grid', gridTemplateColumns:'auto 1fr auto', gap:16,
              alignItems:'center',
            }}>
              <div style={{
                width:44, height:44, borderRadius:10,
                background:'rgba(201,168,101,0.14)',
                border:'1px solid rgba(201,168,101,0.30)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'var(--gold-soft)',
              }}>
                <Icon width={22} height={22}/>
              </div>
              <div style={{minWidth:0}}>
                <div className="serif" style={{
                  fontSize:22, fontWeight:500, color:'var(--on-tile)',
                  letterSpacing:'-0.005em', lineHeight:1.1,
                }}>{a.label}</div>
                <div className="mono" style={{
                  fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase',
                  color:'rgba(245,239,217,0.50)', marginTop:5,
                }}>{a.sub}</div>
              </div>
              <span style={{
                color:'rgba(245,239,217,0.45)', display:'inline-flex',
                width:18, height:18,
              }}><Icons.arrow/></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Shared bits
// ============================================================================
function ColumnLabel({ k, count }) {
  return (
    <div style={{
      display:'flex', justifyContent:'space-between', alignItems:'baseline',
      borderBottom:'1px solid rgba(201,168,101,0.28)', paddingBottom:14,
    }}>
      <div className="mono" style={{
        fontSize:13, letterSpacing:'0.32em', textTransform:'uppercase',
        color:'var(--gold-soft)', fontWeight:600,
      }}>{k}</div>
      <div className="mono" style={{
        fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase',
        color:'rgba(245,239,217,0.45)',
      }}>{count}</div>
    </div>
  );
}

function DemoFooter() {
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

window.GRE = GRE;
