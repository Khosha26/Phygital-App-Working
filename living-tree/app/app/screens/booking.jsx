// BOOKING — 3-step wizard for the sales agent to reserve a residence.
//
//   Step 1 — Customer KYC (6 inputs, pre-filled with SAMPLE_CUSTOMER)
//   Step 2 — Unit pick: typology · tower · floor · orientation
//   Step 3 — Confirm: summary + booking amount + payment mode
//
// On confirm: fire ConfettiCannon, mint LT-2026-XXXX token id,
// persist on window.__LT_LAST_BOOKING__, navigate to saver/tokenId.
//
// Embodied: a luxury-realty transactional UX designer. The wizard is
// graceful — not gamified arcade — because this is a real money moment.

function Booking() {
  const [step, setStep] = React.useState(1);
  const [customer, setCustomer] = React.useState({ ...SAMPLE_CUSTOMER, employer: 'Wipro Aerospace' });

  // Default unit pick — first non-sold-out typology, its first tower, mid floor, east
  const firstAvailable = TYPOLOGIES.find(x => !x.soldOut);
  const firstTowers = TOWERS.filter(t => firstAvailable.tower.includes(t.name));
  const [unit, setUnit] = React.useState({
    code: firstAvailable.code,
    towerId: firstTowers[0]?.id || TOWERS[0].id,
    floor: 12,
    variant: 'east',
  });

  const [payment, setPayment] = React.useState({
    amount: 200000,
    mode: 'UPI',
  });

  const [confettiTrigger, setConfettiTrigger] = React.useState(0);
  const [confirming, setConfirming] = React.useState(false);

  const ty = TYPOLOGIES.find(t => t.code === unit.code);
  const tower = TOWERS.find(t => t.id === unit.towerId);

  const next = () => setStep(s => Math.min(3, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  // Confirm booking → token, persist, fire confetti, navigate after delay
  const confirm = () => {
    if (confirming) return;
    setConfirming(true);
    setConfettiTrigger(t => t + 1);

    const token = 'LT-2026-' + Math.floor(1000 + Math.random() * 9000);
    const v = ty[unit.variant];

    // recompute price for the saver (mirror the cost calc logic)
    const basePrice = ty.priceFrom;
    const floorPremium = (unit.floor - 1) * 0.005;
    const variantPremium = unit.variant === 'east' ? 0.03 : 0;
    const bsp = Math.round(basePrice * (1 + floorPremium + variantPremium));
    const gst = Math.round(bsp * 0.05);
    const maintenance = Math.round(v.saleable * 100);
    const registration = Math.round(v.saleable * 250);
    const total = bsp + gst + maintenance + registration;

    window.__LT_LAST_BOOKING__ = {
      token,
      issuedAt: new Date().toISOString(),
      customer: { ...customer },
      unit: {
        code: ty.code, name: ty.name, bhk: ty.bhk,
        towerId: tower.id, towerName: tower.name, towerNo: tower.no, cluster: tower.cluster,
        floor: unit.floor, variant: unit.variant,
        saleable: v.saleable, carpet: v.carpet, balcony: v.balcony,
        view: v.view, plan: ty.plan,
      },
      price: { bsp, gst, maintenance, registration, total },
      payment: { ...payment },
    };

    setTimeout(() => navigate('saver/' + token), 1700);
  };

  return (
    <div style={{
      position:'absolute', inset:0,
      background:'var(--parchment)', color:'var(--ink)', overflow:'hidden',
    }}>
      <ScreenHeader title="Booking" sub="Reserve a residence"/>

      {/* === Step progress strip ===================================== */}
      <StepStrip step={step}/>

      {/* === Content body ========================================== */}
      <div key={step} style={{
        position:'absolute', top:340, left:64, right:64, bottom:160,
        animation:'routeIn 360ms cubic-bezier(0.22,1,0.36,1) both',
        overflow:'hidden',
      }}>
        {step === 1 && <StepCustomer customer={customer} setCustomer={setCustomer}/>}
        {step === 2 && <StepUnit unit={unit} setUnit={setUnit}/>}
        {step === 3 && <StepConfirm customer={customer} ty={ty} tower={tower} unit={unit} payment={payment} setPayment={setPayment}/>}
      </div>

      {/* === Footer nav ============================================ */}
      <div style={{
        position:'absolute', bottom:48, left:64, right:64,
        display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <button onClick={back} disabled={step === 1} className="mono" style={{
          padding:'20px 38px', borderRadius:999, background:'transparent',
          border:'1px solid var(--line)',
          color: step === 1 ? 'var(--muted)' : 'var(--ink)',
          fontSize:17, letterSpacing:'0.22em', textTransform:'uppercase',
          opacity: step === 1 ? 0.4 : 1, cursor: step === 1 ? 'default' : 'pointer',
        }}>← Back</button>

        <div className="mono" style={{fontSize:14, letterSpacing:'0.30em', color:'var(--slate)', textTransform:'uppercase'}}>
          Step {step} of 3
        </div>

        {step < 3 ? (
          <button onClick={next} className="mono" style={{
            padding:'22px 48px', borderRadius:999,
            border:'1px solid var(--gold-deep)',
            background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
            color:'#1a130a',
            fontSize:17, letterSpacing:'0.22em', textTransform:'uppercase',
            fontWeight:700, cursor:'pointer',
            boxShadow:'0 14px 32px rgba(176,142,69,0.42), inset 0 1px 0 rgba(255,255,255,0.42)',
          }}>{step === 1 ? 'Pick unit →' : 'Review & confirm →'}</button>
        ) : (
          <button onClick={confirm} disabled={confirming} className="mono" style={{
            padding:'22px 48px', borderRadius:999,
            border:'1px solid var(--forest)',
            background: confirming
              ? 'var(--forest-soft)'
              : 'linear-gradient(180deg, var(--forest-soft) 0%, var(--forest) 100%)',
            color:'var(--on-tile)',
            fontSize:17, letterSpacing:'0.22em', textTransform:'uppercase',
            fontWeight:700, cursor: confirming ? 'default' : 'pointer',
            boxShadow:'0 14px 32px rgba(31,53,34,0.42), inset 0 1px 0 rgba(255,246,224,0.18)',
            opacity: confirming ? 0.7 : 1,
          }}>{confirming ? 'Issuing token…' : 'Confirm booking ✓'}</button>
        )}
      </div>

      <ConfettiCannon trigger={confettiTrigger} originX="50%" originY="50%"/>
    </div>
  );
}

// ---- Top progress strip with 3 dots + connecting fill --------------
function StepStrip({ step }) {
  const LABELS = ['Customer', 'Unit', 'Confirm'];
  const fillPct = ((step - 1) / 2) * 100;
  return (
    <div style={{
      position:'absolute', top:230, left:64, right:64, zIndex:5,
    }}>
      {/* connector */}
      <div style={{
        position:'absolute', top:30, left:34, right:34, height:4, borderRadius:2,
        background:'rgba(176,142,69,0.18)',
      }}>
        <div style={{
          height:'100%', borderRadius:2,
          width: `${fillPct}%`,
          background:'linear-gradient(90deg, var(--gold-deep) 0%, var(--gold) 100%)',
          boxShadow:'0 0 16px rgba(201,168,101,0.55)',
          transition:'width 540ms cubic-bezier(0.22,1,0.36,1)',
        }}/>
      </div>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative'}}>
        {LABELS.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const cur = step === n;
          return (
            <div key={label} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:14}}>
              <div style={{
                width:64, height:64, borderRadius:'50%',
                background: done ? 'var(--gold-deep)' : (cur ? 'var(--gold)' : 'var(--ivory)'),
                border:'2px solid ' + (done ? 'var(--gold-deep)' : (cur ? 'var(--gold)' : 'rgba(176,142,69,0.30)')),
                display:'flex', alignItems:'center', justifyContent:'center',
                color: done ? 'var(--ivory)' : (cur ? '#1a130a' : 'var(--slate)'),
                fontFamily:'Cormorant Garamond, serif', fontSize:26, fontWeight:500,
                transition:'all 280ms cubic-bezier(0.22,1,0.36,1)',
                boxShadow: cur
                  ? '0 0 0 8px rgba(232,216,168,0.24), 0 8px 22px rgba(176,142,69,0.32)'
                  : done ? '0 5px 14px rgba(176,142,69,0.25)' : 'none',
              }}>
                {done ? <Icons.check width={26} height={26}/> : n}
              </div>
              <div className="mono" style={{
                fontSize:14, letterSpacing:'0.28em', textTransform:'uppercase',
                color: done || cur ? 'var(--ink)' : 'var(--muted)',
                transition:'color 240ms',
              }}>{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// STEP 1 — Customer KYC
// ============================================================================
function StepCustomer({ customer, setCustomer }) {
  const set = (k, v) => setCustomer({ ...customer, [k]: v });
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:56, height:'100%'}}>
      {/* editorial left */}
      <div style={{display:'flex', flexDirection:'column', gap:24}}>
        <div className="serif" style={{
          fontSize:72, fontWeight:300, lineHeight:1.05,
          letterSpacing:'-0.025em', color:'var(--ink)',
        }}>
          Tell us a little about <em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>you.</em>
        </div>
        <div style={{fontSize:22, color:'var(--graphite)', lineHeight:1.55}}>
          We use this to personalise your visit, your cost sheet,
          and your home-loan paperwork. Your details are stored on this tablet only.
        </div>
        <div style={{
          padding:'24px 28px', background:'var(--ivory)',
          border:'1px solid var(--line)', borderRadius:14, marginTop:8,
          display:'flex', flexDirection:'column', gap:11,
        }}>
          <div className="mono" style={{fontSize:13, letterSpacing:'0.30em', color:'var(--gold-deep)', textTransform:'uppercase'}}>Privacy</div>
          <div style={{fontSize:17, color:'var(--graphite)', lineHeight:1.55}}>
            Demo data has been pre-filled. Clear or edit before sending the booking
            to Kalyani's sales backend.
          </div>
        </div>
      </div>

      {/* form right */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignContent:'start'}}>
        <FormField label="Full Name" v={customer.name}  set={v=>set('name', v)} span={2}/>
        <FormField label="Phone"     v={customer.phone} set={v=>set('phone', v)}/>
        <FormField label="Email"     v={customer.email} set={v=>set('email', v)}/>
        <FormField label="PAN"       v={customer.pan || ''}  set={v=>set('pan', v)}/>
        <FormField label="Employer"  v={customer.employer || ''} set={v=>set('employer', v)}/>

        <div style={{
          gridColumn:'span 2', display:'flex', alignItems:'center', gap:18,
          padding:'22px 26px', borderRadius:14,
          background: customer.loanPreApproved ? 'rgba(232,216,168,0.22)' : 'var(--ivory)',
          border:'1px solid ' + (customer.loanPreApproved ? 'rgba(176,142,69,0.32)' : 'var(--line)'),
          transition:'all 220ms',
        }}>
          <input id="lt-loan" type="checkbox" checked={!!customer.loanPreApproved}
            onChange={e => set('loanPreApproved', e.target.checked)}
            style={{accentColor:'var(--gold-deep)'}}/>
          <label htmlFor="lt-loan" className="serif" style={{
            fontSize:22, color:'var(--ink)', cursor:'pointer', flex:1,
          }}>I have a home-loan pre-approval letter</label>
          {customer.loanPreApproved && (
            <span className="mono" style={{
              fontSize:11, letterSpacing:'0.28em', color:'var(--gold-deep)',
              textTransform:'uppercase', padding:'7px 14px',
              background:'var(--gold-soft)', borderRadius:999,
              border:'1px solid rgba(176,142,69,0.4)',
            }}>Pre-Approved ✓</span>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, v, set, span = 1 }) {
  const filled = v && v.toString().trim().length > 1;
  return (
    <div style={{gridColumn: 'span ' + span, position:'relative'}}>
      <div className="mono" style={{
        fontSize:12, letterSpacing:'0.30em', textTransform:'uppercase',
        color: filled ? 'var(--gold-deep)' : 'var(--slate)',
        transition:'color 240ms', marginBottom:9,
      }}>{label}</div>
      <div style={{position:'relative'}}>
        <input type="text" value={v} onChange={e=>set(e.target.value)} style={{
          width:'100%', paddingRight: 64,
          borderColor: filled ? 'rgba(176,142,69,0.40)' : 'var(--line)',
          background: filled ? 'rgba(232,216,168,0.10)' : 'var(--ivory)',
          transition:'border-color 240ms, background 240ms',
        }}/>
        {filled && (
          <div style={{
            position:'absolute', right:16, top:'50%', transform:'translateY(-50%)',
            width:36, height:36, borderRadius:'50%',
            background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', boxShadow:'0 4px 12px rgba(176,142,69,0.42)',
          }}>
            <Icons.check width={18} height={18}/>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STEP 2 — Unit pick (typology → tower → floor → orientation)
// ============================================================================
function StepUnit({ unit, setUnit }) {
  const available = TYPOLOGIES.filter(x => !x.soldOut);
  const ty = TYPOLOGIES.find(t => t.code === unit.code);
  const towerOptions = TOWERS.filter(t => ty.tower.includes(t.name));

  // hop tower if current isn't in the list when typology changes
  React.useEffect(() => {
    if (!towerOptions.find(t => t.id === unit.towerId)) {
      setUnit({ ...unit, towerId: towerOptions[0]?.id || TOWERS[0].id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit.code]);

  const tower = TOWERS.find(t => t.id === unit.towerId);
  const v = ty[unit.variant];

  // live price preview
  const basePrice = ty.priceFrom;
  const floorPremium = (unit.floor - 1) * 0.005;
  const variantPremium = unit.variant === 'east' ? 0.03 : 0;
  const bsp = Math.round(basePrice * (1 + floorPremium + variantPremium));

  const set = (k, val) => setUnit({ ...unit, [k]: val });

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1.1fr', gap:56, height:'100%'}}>
      {/* editorial + preview */}
      <div style={{display:'flex', flexDirection:'column', gap:22, minHeight:0}}>
        <div className="serif" style={{
          fontSize:60, fontWeight:300, lineHeight:1.08,
          letterSpacing:'-0.025em', color:'var(--ink)',
        }}>
          Which residence calls <em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>you home?</em>
        </div>

        {/* live preview card */}
        <div key={unit.code + unit.towerId + unit.floor + unit.variant} style={{
          padding:'30px 34px', borderRadius:18,
          background:'linear-gradient(160deg, var(--forest) 0%, var(--forest-deep) 100%)',
          color:'var(--on-tile)',
          boxShadow:'0 22px 50px rgba(15,30,18,0.38), inset 0 1px 0 rgba(255,246,224,0.18)',
          border:'1px solid rgba(201,168,101,0.28)',
          flex:'1 1 auto', minHeight:0, overflow:'hidden',
          display:'flex', flexDirection:'column', gap:14,
          animation:'routeIn 360ms cubic-bezier(0.22,1,0.36,1) both',
        }}>
          <div className="mono" style={{fontSize:13, letterSpacing:'0.32em', color:'var(--gold-soft)'}}>YOUR PICK</div>
          <div className="serif" style={{
            fontSize:44, fontWeight:400, lineHeight:1.05, letterSpacing:'-0.015em',
          }}>{ty.name}</div>
          <div className="serif" style={{fontSize:22, color:'rgba(245,239,217,0.72)', fontStyle:'italic'}}>
            {tower?.name} · Floor {unit.floor} · {unit.variant === 'east' ? 'East-facing' : 'West-facing'}
          </div>

          {/* small plan thumbnail */}
          <div style={{
            flex:'1 1 auto', minHeight:0,
            background:'linear-gradient(180deg, #fbf7ec 0%, #f0eadb 100%)',
            border:'1px solid rgba(201,168,101,0.32)', borderRadius:10,
            padding:14, position:'relative', overflow:'hidden',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <img src={`assets/plans/${ty.plan}.png`} alt={ty.name}
              onError={(e)=>{ e.currentTarget.style.display='none'; }}
              style={{
                maxWidth:'100%', maxHeight:'100%', objectFit:'contain',
                filter:'drop-shadow(0 4px 12px rgba(26,31,23,0.10))',
              }}/>
            <div className="mono" style={{
              position:'absolute', top:10, left:10,
              fontSize:10, letterSpacing:'0.28em', color:'var(--gold-deep)',
              padding:'5px 11px', borderRadius:999,
              background:'rgba(255,250,235,0.92)', border:'1px solid var(--gold)',
              textTransform:'uppercase',
            }}>{ty.plan}</div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, marginTop:6}}>
            <DetailDark k="SALEABLE" v={v.saleable.toLocaleString('en-IN') + ' sft'}/>
            <DetailDark k="CARPET"   v={v.carpet.toLocaleString('en-IN') + ' sft'}/>
            <DetailDark k="PRICE"    v={formatINR(bsp, {decimals:2})} accent/>
          </div>
        </div>
      </div>

      {/* pickers */}
      <div className="scroll" style={{display:'flex', flexDirection:'column', gap:24, overflow:'auto', paddingRight:8}}>
        {/* typology */}
        <div>
          <div className="mono" style={{fontSize:13, letterSpacing:'0.30em', color:'var(--slate)', textTransform:'uppercase'}}>Typology</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:10, marginTop:13}}>
            {available.map(t => {
              const on = t.code === unit.code;
              return (
                <button key={t.code} onClick={()=>set('code', t.code)} className="serif" style={{
                  padding:'12px 22px', borderRadius:999,
                  border:'1px solid ' + (on ? 'var(--gold-deep)' : 'var(--line)'),
                  background: on ? 'var(--gold-soft)' : 'var(--ivory)',
                  color: on ? 'var(--ink)' : 'var(--graphite)',
                  fontSize:19, fontWeight: on ? 600 : 400, cursor:'pointer',
                  letterSpacing:'-0.005em', transition:'all 200ms',
                }}>{t.name}</button>
              );
            })}
          </div>
        </div>

        {/* tower */}
        <div>
          <div className="mono" style={{fontSize:13, letterSpacing:'0.30em', color:'var(--slate)', textTransform:'uppercase'}}>Tower</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:10, marginTop:13}}>
            {towerOptions.map(t => {
              const on = t.id === unit.towerId;
              return (
                <button key={t.id} onClick={()=>set('towerId', t.id)} className="serif" style={{
                  padding:'12px 22px', borderRadius:12,
                  border:'1px solid ' + (on ? 'var(--forest)' : 'var(--line)'),
                  background: on ? 'var(--forest)' : 'var(--ivory)',
                  color: on ? 'var(--on-tile)' : 'var(--ink)',
                  fontSize:19, fontWeight: on ? 500 : 400, cursor:'pointer',
                  letterSpacing:'-0.005em', transition:'all 200ms',
                }}>{t.name} <span className="mono" style={{
                  fontSize:11, marginLeft:7, letterSpacing:'0.2em',
                  color: on ? 'rgba(245,239,217,0.55)' : 'var(--slate)',
                }}>{t.available} avail</span></button>
              );
            })}
          </div>
        </div>

        {/* floor */}
        <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10}}>
            <div className="mono" style={{fontSize:13, letterSpacing:'0.30em', color:'var(--gold-deep)', textTransform:'uppercase'}}>Floor</div>
            <div className="serif" style={{fontSize:38, fontWeight:400, color:'var(--ink)', fontVariantNumeric:'tabular-nums'}}>
              {unit.floor}<span style={{fontSize:18, color:'var(--graphite)', fontStyle:'italic', marginLeft:6}}>of {tower?.floors || 24}</span>
            </div>
          </div>
          <input className="lt-range" type="range" min={1} max={tower?.floors || 24} step={1}
            value={unit.floor} onChange={e=>set('floor', parseInt(e.target.value, 10))}
            style={{
              ['--lt-range-bg']: `linear-gradient(90deg, var(--gold-deep) 0%, var(--gold) ${((unit.floor-1)/((tower?.floors||24)-1))*100}%, var(--line) ${((unit.floor-1)/((tower?.floors||24)-1))*100}%, var(--line) 100%)`,
            }}/>
          <div style={{
            display:'flex', justifyContent:'space-between', marginTop:7,
            fontSize:11, color:'var(--slate)', fontFamily:'JetBrains Mono, monospace', letterSpacing:'0.22em',
          }}>
            <span>1ST</span>
            <span style={{color:'var(--gold-deep)'}}>+{((unit.floor-1)*0.5).toFixed(1)}% PREMIUM</span>
            <span>{tower?.floors || 24}TH</span>
          </div>
        </div>

        {/* orientation */}
        <div>
          <div className="mono" style={{fontSize:13, letterSpacing:'0.30em', color:'var(--slate)', textTransform:'uppercase'}}>Orientation</div>
          <div style={{display:'flex', gap:12, marginTop:13}}>
            {[
              { k:'east', label:'East', sub:ty.east.view },
              { k:'west', label:'West', sub:ty.west.view },
            ].map(o => {
              const on = o.k === unit.variant;
              return (
                <button key={o.k} onClick={()=>set('variant', o.k)} style={{
                  flex:1, padding:'20px 24px', borderRadius:14,
                  border:'1.5px solid ' + (on ? 'var(--gold-deep)' : 'var(--line)'),
                  background: on
                    ? 'linear-gradient(180deg, rgba(232,216,168,0.32) 0%, rgba(201,168,101,0.18) 100%)'
                    : 'var(--ivory)',
                  textAlign:'left', cursor:'pointer',
                  boxShadow: on ? '0 10px 24px rgba(176,142,69,0.18)' : 'none',
                  transition:'all 220ms cubic-bezier(0.22,1,0.36,1)',
                }}>
                  <div className="serif" style={{fontSize:26, fontWeight: on ? 600 : 400, letterSpacing:'-0.012em', color:'var(--ink)'}}>{o.label}-facing</div>
                  <div className="mono" style={{fontSize:12, letterSpacing:'0.18em', color: on ? 'var(--gold-deep)' : 'var(--slate)', marginTop:6, textTransform:'uppercase'}}>{o.sub}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailDark({ k, v, accent }) {
  return (
    <div>
      <div className="mono" style={{fontSize:11, letterSpacing:'0.26em', color:'rgba(245,239,217,0.55)', textTransform:'uppercase'}}>{k}</div>
      <div className="serif" style={{fontSize:24, fontWeight:400, marginTop:6, color: accent ? 'var(--gold-soft)' : 'var(--on-tile)', fontVariantNumeric:'tabular-nums'}}>{v}</div>
    </div>
  );
}

// ============================================================================
// STEP 3 — Confirm + booking amount + payment mode
// ============================================================================
function StepConfirm({ customer, ty, tower, unit, payment, setPayment }) {
  const v = ty[unit.variant];
  const basePrice = ty.priceFrom;
  const floorPremium = (unit.floor - 1) * 0.005;
  const variantPremium = unit.variant === 'east' ? 0.03 : 0;
  const bsp = Math.round(basePrice * (1 + floorPremium + variantPremium));
  const gst = Math.round(bsp * 0.05);
  const maintenance = Math.round(v.saleable * 100);
  const registration = Math.round(v.saleable * 250);
  const total = bsp + gst + maintenance + registration;

  return (
    <div style={{display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:48, height:'100%'}}>
      {/* === LEFT — summary === */}
      <div className="scroll" style={{
        padding:'28px 32px', borderRadius:18,
        background:'var(--ivory)', border:'1px solid var(--line)',
        boxShadow:'0 14px 32px rgba(26,31,23,0.10)',
        display:'flex', flexDirection:'column', gap:20, overflow:'auto',
      }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div>
            <div className="mono" style={{fontSize:12, letterSpacing:'0.32em', color:'var(--gold-deep)', textTransform:'uppercase'}}>Booking Summary</div>
            <div className="serif" style={{fontSize:42, fontWeight:400, marginTop:6, color:'var(--ink)', letterSpacing:'-0.015em', lineHeight:1.05}}>
              {customer.name}
            </div>
          </div>
          <KalyaniTriangle size={56}/>
        </div>

        <div style={{
          padding:'18px 22px', background:'var(--parchment-2)',
          borderRadius:12, border:'1px solid var(--line)',
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:14,
        }}>
          <SummaryRow k="PHONE" v={customer.phone}/>
          <SummaryRow k="EMAIL" v={customer.email}/>
          <SummaryRow k="PAN"   v={customer.pan || '—'}/>
          <SummaryRow k="LOAN"  v={customer.loanPreApproved ? 'Pre-approved' : 'Not yet'}/>
        </div>

        <div style={{borderTop:'1px solid var(--gold)', paddingTop:18}}>
          <div className="mono" style={{fontSize:12, letterSpacing:'0.32em', color:'var(--gold-deep)', textTransform:'uppercase', marginBottom:11}}>Reserved Residence</div>
          <div className="serif" style={{fontSize:32, fontWeight:500, color:'var(--ink)', letterSpacing:'-0.012em'}}>{ty.name}</div>
          <div className="serif" style={{fontSize:19, color:'var(--graphite)', fontStyle:'italic', marginTop:4}}>
            {tower?.name} (Tower #{tower?.no}) · Floor {unit.floor} · {unit.variant === 'east' ? 'East' : 'West'}-facing
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14, marginTop:14}}>
            <SummaryRow k="SALEABLE" v={v.saleable.toLocaleString('en-IN') + ' sft'}/>
            <SummaryRow k="CARPET"   v={v.carpet.toLocaleString('en-IN') + ' sft'}/>
            <SummaryRow k="VIEW"     v={v.view}/>
          </div>
        </div>

        <div style={{borderTop:'1px solid var(--gold)', paddingTop:18}}>
          <div className="mono" style={{fontSize:12, letterSpacing:'0.32em', color:'var(--gold-deep)', textTransform:'uppercase', marginBottom:11}}>All-Inclusive Price</div>
          <div style={{display:'flex', flexDirection:'column', gap:9}}>
            <PriceRow k="BSP"            v={bsp}/>
            <PriceRow k="GST (5%)"       v={gst}/>
            <PriceRow k="Maintenance"    v={maintenance}/>
            <PriceRow k="Registration"   v={registration}/>
            <div style={{
              display:'flex', justifyContent:'space-between', alignItems:'baseline',
              paddingTop:13, marginTop:6, borderTop:'2px solid var(--gold)',
            }}>
              <div className="serif" style={{fontSize:24, fontWeight:500, color:'var(--ink)'}}>Total Payable</div>
              <div className="serif" style={{fontSize:30, fontWeight:500, color:'var(--gold-deep)', fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em'}}>{formatINR(total, {decimals:2})}</div>
            </div>
          </div>
        </div>
      </div>

      {/* === RIGHT — payment === */}
      <div style={{display:'flex', flexDirection:'column', gap:22, minHeight:0}}>
        <div className="serif" style={{
          fontSize:52, fontWeight:300, lineHeight:1.05, letterSpacing:'-0.025em',
        }}>
          Booking <em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>amount.</em>
        </div>
        <div style={{fontSize:20, color:'var(--graphite)', lineHeight:1.55}}>
          A reservation amount holds the unit for 7 days. The full agreement
          schedule will follow within 48 hours.
        </div>

        {/* amount input */}
        <div style={{
          padding:'26px 32px', borderRadius:16,
          background:'linear-gradient(160deg, var(--forest) 0%, var(--forest-deep) 100%)',
          color:'var(--on-tile)',
          boxShadow:'0 22px 50px rgba(15,30,18,0.36), inset 0 1px 0 rgba(255,246,224,0.18)',
          border:'1px solid rgba(201,168,101,0.28)',
        }}>
          <div className="mono" style={{fontSize:12, letterSpacing:'0.32em', color:'var(--gold-soft)'}}>RESERVATION TOKEN AMOUNT</div>
          <div style={{display:'flex', alignItems:'baseline', gap:12, marginTop:10}}>
            <span className="serif" style={{fontSize:46, color:'var(--gold-soft)'}}>₹</span>
            <input
              type="number"
              value={payment.amount}
              onChange={e=>setPayment({ ...payment, amount: parseInt(e.target.value || '0', 10) })}
              style={{
                flex:1, background:'transparent', color:'var(--on-tile)',
                border:'none', borderBottom:'1.5px solid rgba(232,216,168,0.45)',
                borderRadius:0, padding:'10px 0',
                fontFamily:'Cormorant Garamond, serif', fontSize:54, fontWeight:400,
                letterSpacing:'-0.012em', minHeight:0,
              }}
            />
          </div>
          <div className="mono" style={{fontSize:12, letterSpacing:'0.24em', color:'rgba(245,239,217,0.55)', marginTop:8, textTransform:'uppercase'}}>
            {payment.amount.toLocaleString('en-IN')} · refundable within 24 hrs
          </div>

          {/* quick presets */}
          <div style={{display:'flex', gap:10, marginTop:18}}>
            {[100000, 200000, 500000].map(amt => {
              const on = payment.amount === amt;
              return (
                <button key={amt} onClick={()=>setPayment({...payment, amount: amt})} className="mono" style={{
                  padding:'12px 22px', borderRadius:999,
                  border:'1px solid ' + (on ? 'var(--gold)' : 'rgba(201,168,101,0.30)'),
                  background: on ? 'rgba(232,216,168,0.20)' : 'transparent',
                  color:'var(--on-tile)', fontSize:13, letterSpacing:'0.22em',
                  cursor:'pointer', textTransform:'uppercase', fontWeight: on ? 700 : 500,
                  transition:'all 200ms',
                }}>{formatINR(amt, {decimals:0})}</button>
              );
            })}
          </div>
        </div>

        {/* payment mode */}
        <div>
          <div className="mono" style={{fontSize:13, letterSpacing:'0.30em', color:'var(--slate)', textTransform:'uppercase', marginBottom:13}}>Mode of Payment</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12}}>
            {['UPI', 'Cheque', 'RTGS / NEFT'].map(mode => {
              const on = mode === payment.mode;
              return (
                <label key={mode} style={{
                  display:'flex', alignItems:'center', gap:14,
                  padding:'18px 22px', borderRadius:14,
                  border:'1.5px solid ' + (on ? 'var(--gold-deep)' : 'var(--line)'),
                  background: on
                    ? 'linear-gradient(180deg, rgba(232,216,168,0.30) 0%, rgba(201,168,101,0.16) 100%)'
                    : 'var(--ivory)',
                  cursor:'pointer', transition:'all 220ms',
                  boxShadow: on ? '0 8px 20px rgba(176,142,69,0.18)' : 'none',
                }}>
                  <input type="radio" name="lt-pay" checked={on}
                    onChange={()=>setPayment({...payment, mode})}
                    style={{accentColor:'var(--gold-deep)'}}/>
                  <span className="serif" style={{fontSize:21, color:'var(--ink)', fontWeight: on ? 600 : 400, letterSpacing:'-0.005em'}}>{mode}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ k, v }) {
  return (
    <div>
      <div className="mono" style={{fontSize:10.5, letterSpacing:'0.26em', color:'var(--slate)', textTransform:'uppercase'}}>{k}</div>
      <div className="serif" style={{fontSize:18, fontWeight:400, marginTop:4, color:'var(--ink)', letterSpacing:'-0.005em', lineHeight:1.2}}>{v}</div>
    </div>
  );
}

function PriceRow({ k, v }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
      <div className="serif" style={{fontSize:19, color:'var(--graphite)', letterSpacing:'-0.005em'}}>{k}</div>
      <div className="mono" style={{fontSize:17, color:'var(--ink)', fontVariantNumeric:'tabular-nums'}}>{formatINR(v, {decimals:2})}</div>
    </div>
  );
}

window.Booking = Booking;
