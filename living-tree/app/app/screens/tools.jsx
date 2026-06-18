// TOOLS — Cost Calculator · EMI Calculator · Compare Units
//
// Three sub-tools, tabbed at the top. Swipe to cycle. Tablet-first inputs,
// forest + gold + parchment palette throughout. Performance-first: the only
// FX is a single CounterFlip on the all-in total and a static donut chart.
//
// Embodied: a luxury-realty utility-screen designer. The output here is the
// numbers, not the chrome — large legible figures, generous whitespace, gold
// rules separating sections. No data slop.

// ---- One-time CSS injection for the gold slider track ------------------
const LT_TOOLS_KEYS = 'lt-tools-keys';
function ensureLtToolsKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(LT_TOOLS_KEYS)) return;
  const s = document.createElement('style');
  s.id = LT_TOOLS_KEYS;
  s.textContent = `
    input.lt-range {
      -webkit-appearance: none; appearance: none;
      width: 100%; background: transparent;
      height: 36px; cursor: pointer; outline: none;
      padding: 0; min-height: 0;
    }
    input.lt-range::-webkit-slider-runnable-track {
      height: 8px; border-radius: 999px;
      background: var(--lt-range-bg, var(--line));
      box-shadow: inset 0 1px 2px rgba(26,31,23,0.12);
    }
    input.lt-range::-moz-range-track {
      height: 8px; border-radius: 999px;
      background: var(--lt-range-bg, var(--line));
      box-shadow: inset 0 1px 2px rgba(26,31,23,0.12);
    }
    input.lt-range::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 34px; height: 34px; border-radius: 50%;
      margin-top: -13px;
      background: radial-gradient(circle at 35% 30%, #f3e0b1 0%, #c9a865 55%, #8b6f3d 100%);
      border: 2px solid #fbf6ea;
      box-shadow:
        0 6px 14px rgba(26,31,23,0.32),
        0 2px 4px rgba(26,31,23,0.20),
        inset 0 1px 0 rgba(255,246,224,0.55);
      cursor: grab;
      transition: transform 180ms cubic-bezier(0.22,1,0.36,1);
    }
    input.lt-range:active::-webkit-slider-thumb { transform: scale(1.10); cursor: grabbing; }
    input.lt-range::-moz-range-thumb {
      width: 34px; height: 34px; border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, #f3e0b1 0%, #c9a865 55%, #8b6f3d 100%);
      border: 2px solid #fbf6ea;
      box-shadow: 0 6px 14px rgba(26,31,23,0.32);
      cursor: grab;
    }
  `;
  document.head.appendChild(s);
}

// ---- Top-level Tools shell with swipeable tabs --------------------------
function Tools() {
  ensureLtToolsKeys();
  const [mode, setMode] = React.useState('cost'); // 'cost' | 'emi' | 'compare'
  const MODES = ['cost', 'emi', 'compare'];
  const swipe = useSwipe({
    onLeft:  () => setMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length]),
    onRight: () => setMode(MODES[(MODES.indexOf(mode) - 1 + MODES.length) % MODES.length]),
  });

  return (
    <div {...swipe} style={{
      position:'absolute', inset:0,
      background:'var(--parchment)', color:'var(--ink)',
      overflow:'hidden',
    }}>
      <ScreenHeader title="Tools" sub="Cost · EMI · Compare"/>

      {/* tab strip — sits below the header */}
      <div style={{
        position:'absolute', top:200, left:64, right:64,
        display:'flex', alignItems:'center', justifyContent:'flex-start', gap:14,
      }}>
        {[
          { k:'cost',    label:'Cost Calculator' },
          { k:'emi',     label:'EMI Calculator' },
          { k:'compare', label:'Compare Units'   },
        ].map(m => {
          const on = m.k === mode;
          return (
            <button key={m.k} onClick={()=>setMode(m.k)} className="mono" style={{
              padding:'18px 36px', borderRadius:999,
              border:'1px solid ' + (on ? 'var(--gold-deep)' : 'var(--line)'),
              background: on
                ? 'linear-gradient(180deg, var(--forest-soft) 0%, var(--forest) 100%)'
                : 'var(--ivory)',
              color: on ? 'var(--on-tile)' : 'var(--ink)',
              fontSize:17, letterSpacing:'0.22em', textTransform:'uppercase',
              fontWeight: on ? 700 : 500,
              boxShadow: on
                ? '0 12px 28px rgba(31,53,34,0.30), inset 0 1px 0 rgba(255,246,224,0.18)'
                : '0 4px 10px rgba(26,31,23,0.04)',
              cursor:'pointer',
              transition:'all 220ms cubic-bezier(0.22,1,0.36,1)',
            }}>{m.label}</button>
          );
        })}

        {/* tab indicator dots */}
        <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:9}}>
          {MODES.map(k => (
            <div key={k} style={{
              width: k === mode ? 26 : 8, height: 8, borderRadius: 999,
              background: k === mode ? 'var(--gold-deep)' : 'rgba(26,31,23,0.18)',
              transition:'all 220ms cubic-bezier(0.22,1,0.36,1)',
            }}/>
          ))}
          <div className="mono" style={{
            marginLeft:10, fontSize:13, letterSpacing:'0.28em',
            color:'var(--slate)', textTransform:'uppercase',
          }}>swipe to switch</div>
        </div>
      </div>

      {/* content area */}
      <div key={mode} style={{
        position:'absolute', top:296, left:64, right:64, bottom:64,
        animation:'routeIn 360ms cubic-bezier(0.22,1,0.36,1) both',
      }}>
        {mode === 'cost'    && <CostCalculator/>}
        {mode === 'emi'     && <EMICalculator/>}
        {mode === 'compare' && <CompareUnits/>}
      </div>
    </div>
  );
}

// ============================================================================
// COST CALCULATOR
// Inputs: typology · variant E/W · tower · floor slider (1..24)
// Output: BSP · GST · Maintenance · Registration · Total + donut breakdown
// ============================================================================
function CostCalculator() {
  // available typologies (exclude sold-out)
  const available = TYPOLOGIES.filter(x => !x.soldOut);
  const [code, setCode] = React.useState(available[0].code);
  const [variant, setVariant] = React.useState('east'); // east | west
  const ty = TYPOLOGIES.find(x => x.code === code);

  // available towers for this typology — match on tower name list
  const towerOptions = React.useMemo(() => {
    const names = ty.tower.split('·').map(s => s.trim().split(' ')[0]);
    return TOWERS.filter(t => names.includes(t.name) || ty.tower.includes(t.name));
  }, [ty]);
  const [towerId, setTowerId] = React.useState(towerOptions[0]?.id);

  // if typology changes, hop tower if not in new list
  React.useEffect(() => {
    if (!towerOptions.find(t => t.id === towerId)) {
      setTowerId(towerOptions[0]?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const [floor, setFloor] = React.useState(8);

  const v = ty[variant];
  const basePrice = ty.priceFrom;
  // floor premium: ~0.5% per floor over base. East variants get +3% premium.
  const floorPremium = (floor - 1) * 0.005;
  const variantPremium = variant === 'east' ? 0.03 : 0;
  const bsp = Math.round(basePrice * (1 + floorPremium + variantPremium));
  const gst = Math.round(bsp * 0.05);
  const maintenance = Math.round(v.saleable * 100);   // ₹100/sft × saleable
  const registration = Math.round(v.saleable * 250);   // ₹250/sft × saleable
  const total = bsp + gst + maintenance + registration;

  const tower = TOWERS.find(t => t.id === towerId) || towerOptions[0];

  const segments = [
    { k:'BSP',          label:'Base Selling Price',    value: bsp,          color:'#2e4a2c' },
    { k:'GST',          label:'GST (5%)',               value: gst,          color:'#6a8a5b' },
    { k:'MAINTENANCE',  label:'Maintenance · ₹100/sft', value: maintenance,  color:'#c9a865' },
    { k:'REGISTRATION', label:'Registration · ₹250/sft',value: registration, color:'#b08e45' },
  ];

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:56, height:'100%'}}>
      {/* === LEFT — inputs === */}
      <div className="scroll" style={{display:'flex', flexDirection:'column', gap:30, overflow:'auto', paddingRight:8}}>
        {/* typology chips */}
        <div>
          <div className="mono" style={{fontSize:14, letterSpacing:'0.30em', color:'var(--slate)', textTransform:'uppercase'}}>Typology</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:10, marginTop:14}}>
            {available.map(t => {
              const on = t.code === code;
              return (
                <button key={t.code} onClick={()=>setCode(t.code)} className="serif" style={{
                  padding:'14px 24px', borderRadius:999,
                  border:'1px solid ' + (on ? 'var(--gold-deep)' : 'var(--line)'),
                  background: on ? 'var(--gold-soft)' : 'var(--ivory)',
                  color: on ? 'var(--ink)' : 'var(--graphite)',
                  fontSize:21, fontWeight: on ? 600 : 400,
                  cursor:'pointer', letterSpacing:'-0.005em',
                  transition:'all 200ms',
                }}>{t.name}</button>
              );
            })}
          </div>
        </div>

        {/* E/W variant toggle */}
        <div>
          <div className="mono" style={{fontSize:14, letterSpacing:'0.30em', color:'var(--slate)', textTransform:'uppercase'}}>Orientation</div>
          <div style={{display:'flex', gap:14, marginTop:14}}>
            {[
              { k:'east', label:'East-Facing', sub:'+3% premium · ' + ty.east.view },
              { k:'west', label:'West-Facing', sub:ty.west.view },
            ].map(o => {
              const on = o.k === variant;
              return (
                <button key={o.k} onClick={()=>setVariant(o.k)} style={{
                  flex:1, padding:'20px 24px', borderRadius:14,
                  border:'1.5px solid ' + (on ? 'var(--gold-deep)' : 'var(--line)'),
                  background: on
                    ? 'linear-gradient(180deg, rgba(232,216,168,0.32) 0%, rgba(201,168,101,0.18) 100%)'
                    : 'var(--ivory)',
                  textAlign:'left', cursor:'pointer',
                  boxShadow: on ? '0 10px 24px rgba(176,142,69,0.18)' : 'none',
                  transition:'all 220ms cubic-bezier(0.22,1,0.36,1)',
                }}>
                  <div className="serif" style={{fontSize:24, color:'var(--ink)', fontWeight:on ? 600 : 400, letterSpacing:'-0.01em'}}>{o.label}</div>
                  <div className="mono" style={{fontSize:12, letterSpacing:'0.18em', color: on ? 'var(--gold-deep)' : 'var(--slate)', marginTop:6, textTransform:'uppercase'}}>{o.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* tower picker */}
        <div>
          <div className="mono" style={{fontSize:14, letterSpacing:'0.30em', color:'var(--slate)', textTransform:'uppercase'}}>Tower</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:10, marginTop:14}}>
            {towerOptions.map(t => {
              const on = t.id === towerId;
              return (
                <button key={t.id} onClick={()=>setTowerId(t.id)} className="serif" style={{
                  padding:'12px 22px', borderRadius:12,
                  border:'1px solid ' + (on ? 'var(--forest)' : 'var(--line)'),
                  background: on ? 'var(--forest)' : 'var(--ivory)',
                  color: on ? 'var(--on-tile)' : 'var(--ink)',
                  fontSize:20, fontWeight: on ? 500 : 400,
                  cursor:'pointer', letterSpacing:'-0.005em',
                  transition:'all 200ms',
                }}>{t.name} <span className="mono" style={{
                  fontSize:11, marginLeft:8, letterSpacing:'0.2em',
                  color: on ? 'rgba(245,239,217,0.55)' : 'var(--slate)',
                }}>#{t.no}</span></button>
              );
            })}
          </div>
        </div>

        {/* floor slider */}
        <SliderRow
          label="Floor Selection"
          value={floor}
          setValue={setFloor}
          min={1} max={24} step={1}
          suffix=""
          hint={'+' + ((floor-1)*0.5).toFixed(1) + '% over base · ' + (floor < 6 ? 'low floor' : floor < 16 ? 'mid floor' : 'high floor')}
        />

        {/* unit specs card */}
        <div style={{
          padding:'22px 26px', background:'var(--ivory)', border:'1px solid var(--line)', borderRadius:14,
          display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:18,
        }}>
          <Mini k="SALEABLE" v={v.saleable.toLocaleString('en-IN') + ' sft'}/>
          <Mini k="CARPET"   v={v.carpet.toLocaleString('en-IN') + ' sft'}/>
          <Mini k="BALCONY"  v={v.balcony.toFixed(2) + ' sft'}/>
        </div>
      </div>

      {/* === RIGHT — output card === */}
      <div style={{display:'flex', flexDirection:'column', gap:24, minHeight:0}}>
        {/* All-in total card */}
        <div style={{
          padding:'36px 40px', borderRadius:20,
          background:'linear-gradient(160deg, var(--forest) 0%, var(--forest-deep) 100%)',
          color:'var(--on-tile)',
          boxShadow:'0 26px 56px rgba(15,30,18,0.36), inset 0 1px 0 rgba(255,246,224,0.18)',
          border:'1px solid rgba(201,168,101,0.28)',
        }}>
          <div className="mono" style={{fontSize:14, letterSpacing:'0.32em', color:'var(--gold-soft)'}}>ALL-INCLUSIVE PRICE</div>
          <div className="serif" style={{
            fontSize:96, fontWeight:300, lineHeight:1, marginTop:14,
            letterSpacing:'-0.025em', fontVariantNumeric:'tabular-nums',
            color:'var(--on-tile)',
          }}>
            <span>₹ </span>
            <CounterFlip
              key={code + variant + towerId + floor}
              value={Math.round(total/100000)}
              duration={0.9}
            />
            <span className="serif" style={{
              fontSize:42, marginLeft:14, color:'var(--gold-soft)', fontStyle:'italic',
            }}>L</span>
          </div>
          <div style={{fontSize:19, color:'rgba(245,239,217,0.72)', marginTop:11, fontStyle:'italic'}}>
            {ty.name} · {variant === 'east' ? 'East' : 'West'} · {tower?.name} · Floor {floor}
          </div>

          {/* mini segmented bar — proportions */}
          <div style={{marginTop:28}}>
            <div className="mono" style={{fontSize:12, letterSpacing:'0.30em', color:'var(--gold-soft)', marginBottom:11}}>BREAKDOWN</div>
            <div style={{
              display:'flex', height:24, borderRadius:8, overflow:'hidden',
              border:'1px solid rgba(201,168,101,0.22)',
              boxShadow:'inset 0 1px 3px rgba(0,0,0,0.32)',
            }}>
              {segments.map((s, i) => (
                <div key={s.k} style={{
                  flex: s.value,
                  background: s.color,
                  borderRight: i < segments.length-1 ? '1px solid rgba(0,0,0,0.18)' : 'none',
                  transition:'flex 360ms cubic-bezier(0.22,1,0.36,1)',
                }}/>
              ))}
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, marginTop:13}}>
              {segments.map(s => (
                <div key={s.k} style={{display:'flex', alignItems:'center', gap:8}}>
                  <span style={{width:9, height:9, borderRadius:2, background:s.color}}/>
                  <span className="mono" style={{fontSize:11, letterSpacing:'0.18em', color:'rgba(245,239,217,0.78)'}}>{s.k}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* line-items + donut */}
        <div style={{
          display:'grid', gridTemplateColumns:'1.4fr auto', gap:30, alignItems:'center',
          padding:'22px 26px', background:'var(--ivory)', border:'1px solid var(--line)', borderRadius:14,
          flex:'1 1 auto', minHeight:0,
        }}>
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            {segments.map(s => {
              const pct = ((s.value/total)*100).toFixed(1);
              return (
                <div key={s.k} style={{
                  display:'grid', gridTemplateColumns:'1fr auto auto', gap:14, alignItems:'baseline',
                  paddingBottom:11, borderBottom:'1px solid var(--line-soft)',
                }}>
                  <div>
                    <div className="serif" style={{fontSize:22, color:'var(--ink)', fontWeight:400, letterSpacing:'-0.005em'}}>{s.label}</div>
                  </div>
                  <div className="mono" style={{fontSize:13, color:'var(--slate)', letterSpacing:'0.16em'}}>{pct}%</div>
                  <div className="mono" style={{
                    fontSize:21, color:'var(--ink)', fontVariantNumeric:'tabular-nums',
                    minWidth:160, textAlign:'right',
                  }}>{formatINR(s.value, {decimals:2})}</div>
                </div>
              );
            })}
          </div>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:10}}>
            <CostDonut segments={segments} total={total}/>
            <div className="mono" style={{fontSize:11, letterSpacing:'0.28em', color:'var(--slate)', textTransform:'uppercase'}}>composition</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// donut composed of the 4 segments, painted as arcs
function CostDonut({ segments, total }) {
  const size = 200, stroke = 26;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{position:'relative', width:size, height:size}}>
      <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke}/>
        {segments.map((s, i) => {
          const len = c * (s.value / total);
          const dash = `${len} ${c}`;
          const dashoffset = -offset;
          offset += len;
          return (
            <circle key={s.k}
              cx={size/2} cy={size/2} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={dash} strokeDashoffset={dashoffset}
              style={{transition:'stroke-dasharray 420ms cubic-bezier(0.22,1,0.36,1)'}}/>
          );
        })}
      </svg>
      <div style={{
        position:'absolute', inset:0, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:2,
      }}>
        <div className="serif" style={{fontSize:38, fontWeight:400, color:'var(--forest)', letterSpacing:'-0.01em', lineHeight:1}}>
          {formatINR(total, {decimals:1}).replace('₹ ', '')}
        </div>
        <div className="mono" style={{fontSize:10, letterSpacing:'0.24em', color:'var(--slate)'}}>ALL-IN</div>
      </div>
    </div>
  );
}

function Mini({ k, v }) {
  return (
    <div>
      <div className="mono" style={{fontSize:11, letterSpacing:'0.24em', color:'var(--slate)', textTransform:'uppercase'}}>{k}</div>
      <div className="serif" style={{fontSize:24, fontWeight:400, marginTop:6, color:'var(--ink)', fontVariantNumeric:'tabular-nums', letterSpacing:'-0.005em'}}>{v}</div>
    </div>
  );
}

// ============================================================================
// EMI CALCULATOR
// Inputs: loan ₹ slider (10L–3Cr), tenure (5–30y), ROI (7.5–11%)
// Output: EMI/month + total interest + total payable + amortization
// ============================================================================
function EMICalculator() {
  const [loan, setLoan]     = React.useState(8500000);   // 85L
  const [years, setYears]   = React.useState(20);
  const [rate, setRate]     = React.useState(8.5);

  const r = rate / 100 / 12;
  const n = years * 12;
  const emi = loan * r * Math.pow(1+r, n) / (Math.pow(1+r, n) - 1);
  const totalPay = emi * n;
  const totalInt = totalPay - loan;

  // year-by-year amortization
  const yearly = React.useMemo(() => {
    const arr = [];
    let bal = loan;
    for (let y = 1; y <= years; y++) {
      let pp = 0, ip = 0;
      for (let m = 0; m < 12; m++) {
        const iPay = bal * r;
        const pPay = emi - iPay;
        bal = Math.max(0, bal - pPay);
        pp += pPay; ip += iPay;
      }
      arr.push({ y, principal: pp, interest: ip, balance: bal });
    }
    return arr;
  }, [loan, r, emi, years]);
  const yMax = Math.max(...yearly.map(d => d.principal + d.interest), 1);

  const trackFill = (pct) =>
    `linear-gradient(90deg, var(--gold-deep) 0%, var(--gold) ${pct}%, var(--line) ${pct}%, var(--line) 100%)`;

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1.05fr', gap:56, height:'100%'}}>
      {/* === LEFT — sliders === */}
      <div className="scroll" style={{display:'flex', flexDirection:'column', gap:34, overflow:'auto', paddingRight:8}}>
        <SliderRow
          label="Loan Amount"
          value={loan} setValue={setLoan}
          min={1000000} max={30000000} step={100000}
          format={(v) => formatINR(v, {decimals: v >= 10000000 ? 2 : 1})}
          suffix=""
          trackBg={trackFill}
          hint={'from ₹ 10 L to ₹ 3 Cr'}
        />
        <SliderRow
          label="Tenure"
          value={years} setValue={setYears}
          min={5} max={30} step={1}
          suffix=" yrs"
          trackBg={trackFill}
          hint={years <= 10 ? 'shorter term · higher EMI · less interest' : years <= 20 ? 'balanced' : 'lower EMI · more interest paid'}
        />
        <SliderRow
          label="Interest Rate"
          value={rate} setValue={setRate}
          min={7.5} max={11} step={0.05}
          fixed={2}
          suffix=" % p.a."
          trackBg={trackFill}
          hint="floating · indicative current rate"
        />

        {/* stat row */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
          <Stat k="TOTAL INTEREST" v={formatINR(Math.round(totalInt), {decimals:2})} accent/>
          <Stat k="TOTAL PAYABLE" v={formatINR(Math.round(totalPay), {decimals:2})}/>
        </div>
      </div>

      {/* === RIGHT — EMI big + amortization === */}
      <div style={{display:'flex', flexDirection:'column', gap:22, minHeight:0}}>
        <div style={{
          padding:'36px 40px', borderRadius:20,
          background:'linear-gradient(160deg, var(--forest) 0%, var(--forest-deep) 100%)',
          color:'var(--on-tile)',
          boxShadow:'0 26px 56px rgba(15,30,18,0.36), inset 0 1px 0 rgba(255,246,224,0.18)',
          border:'1px solid rgba(201,168,101,0.28)',
        }}>
          <div className="mono" style={{fontSize:14, letterSpacing:'0.32em', color:'var(--gold-soft)'}}>MONTHLY EMI</div>
          <div className="serif" style={{
            fontSize:110, fontWeight:300, lineHeight:1, marginTop:14,
            letterSpacing:'-0.025em', fontVariantNumeric:'tabular-nums',
          }}>
            <span style={{fontSize:54, color:'var(--gold-soft)'}}>₹ </span>
            <CounterFlip
              key={loan + '-' + years + '-' + rate}
              value={Math.round(emi)}
              duration={0.7}
            />
          </div>
          <div style={{fontSize:19, color:'rgba(245,239,217,0.72)', marginTop:11, fontStyle:'italic'}}>
            for {n} months at {rate.toFixed(2)}% p.a. floating
          </div>

          <div style={{display:'flex', gap:24, marginTop:24}}>
            <div>
              <div className="mono" style={{fontSize:11, letterSpacing:'0.28em', color:'rgba(245,239,217,0.55)'}}>PRINCIPAL</div>
              <div className="serif" style={{fontSize:26, marginTop:5, fontVariantNumeric:'tabular-nums'}}>{formatINR(loan, {decimals:2})}</div>
            </div>
            <div>
              <div className="mono" style={{fontSize:11, letterSpacing:'0.28em', color:'rgba(245,239,217,0.55)'}}>INTEREST</div>
              <div className="serif" style={{fontSize:26, marginTop:5, color:'var(--gold-soft)', fontVariantNumeric:'tabular-nums'}}>{formatINR(Math.round(totalInt), {decimals:2})}</div>
            </div>
            <div>
              <div className="mono" style={{fontSize:11, letterSpacing:'0.28em', color:'rgba(245,239,217,0.55)'}}>RATIO</div>
              <div className="serif" style={{fontSize:26, marginTop:5, fontVariantNumeric:'tabular-nums'}}>{Math.round((totalInt/loan)*100)}%</div>
            </div>
          </div>
        </div>

        {/* amortization stacked bar chart */}
        <div style={{
          padding:'22px 26px', background:'var(--ivory)',
          border:'1px solid var(--line)', borderRadius:14,
          flex:'1 1 auto', minHeight:0, display:'flex', flexDirection:'column', gap:14,
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
            <div className="mono" style={{fontSize:13, letterSpacing:'0.30em', color:'var(--slate)', textTransform:'uppercase'}}>Amortization · year-wise</div>
            <div style={{display:'flex', gap:18, alignItems:'center'}}>
              <span style={{display:'flex', alignItems:'center', gap:7}}>
                <span style={{width:11, height:11, background:'var(--forest)', borderRadius:2}}/>
                <span className="mono" style={{fontSize:11, letterSpacing:'0.20em', color:'var(--slate)'}}>PRINCIPAL</span>
              </span>
              <span style={{display:'flex', alignItems:'center', gap:7}}>
                <span style={{width:11, height:11, background:'var(--gold)', borderRadius:2}}/>
                <span className="mono" style={{fontSize:11, letterSpacing:'0.20em', color:'var(--slate)'}}>INTEREST</span>
              </span>
            </div>
          </div>
          <div style={{
            flex:'1 1 auto', display:'flex', alignItems:'flex-end', gap:Math.max(2, Math.floor(36/years)),
            paddingTop:6,
          }}>
            {yearly.map((d, i) => {
              const totalH = ((d.principal + d.interest) / yMax) * 100;
              const pPct = (d.principal / (d.principal + d.interest)) * 100;
              return (
                <div key={i} style={{
                  flex:1, height:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end',
                  position:'relative',
                }}>
                  <div style={{height:`${totalH}%`, display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
                    <div style={{
                      flex: 100 - pPct,
                      background:'var(--gold)',
                      borderTop:'1px solid var(--ivory)',
                      borderRadius:'3px 3px 0 0',
                    }}/>
                    <div style={{
                      flex: pPct,
                      background:'var(--forest)',
                    }}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--slate)', fontFamily:'JetBrains Mono, monospace', letterSpacing:'0.20em'}}>
            <span>Y1</span><span>Y{Math.ceil(years/2)}</span><span>Y{years}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ k, v, accent }) {
  return (
    <div style={{
      padding:'18px 22px', borderRadius:12,
      background: accent ? 'rgba(201,168,101,0.16)' : 'var(--ivory)',
      border:'1px solid ' + (accent ? 'rgba(176,142,69,0.32)' : 'var(--line)'),
    }}>
      <div className="mono" style={{fontSize:12, letterSpacing:'0.28em', color:'var(--slate)', textTransform:'uppercase'}}>{k}</div>
      <div className="serif" style={{fontSize:28, fontWeight:400, marginTop:8, color: accent ? 'var(--gold-deep)' : 'var(--ink)', fontVariantNumeric:'tabular-nums', letterSpacing:'-0.005em', lineHeight:1.1}}>{v}</div>
    </div>
  );
}

// ============================================================================
// COMPARE UNITS
// Three columns, user picks up to 3 typologies from chip row.
// Each column shows typology name, tower, saleable, carpet, balcony, summary, priceFrom.
// Differences highlighted in --gold-deep.
// ============================================================================
function CompareUnits() {
  const available = TYPOLOGIES.filter(x => !x.soldOut);
  const [picked, setPicked] = React.useState([
    available[0]?.code,
    available[1]?.code,
    available[2]?.code,
  ].filter(Boolean));

  const togglePick = (code) => {
    if (picked.includes(code)) {
      if (picked.length === 1) return;     // can't go below 1
      setPicked(picked.filter(c => c !== code));
    } else if (picked.length < 3) {
      setPicked([...picked, code]);
    } else {
      // replace last
      setPicked([...picked.slice(0, 2), code]);
    }
  };

  const cols = picked.map(c => TYPOLOGIES.find(t => t.code === c)).filter(Boolean);

  // for each metric, find which column has the "winning" value
  // bigger wins: saleable, carpet, balcony
  // lower wins: priceFrom (better value)
  const metricsForVariant = (variant) => {
    const sal  = cols.map(t => t[variant].saleable);
    const car  = cols.map(t => t[variant].carpet);
    const bal  = cols.map(t => t[variant].balcony);
    const price = cols.map(t => t.priceFrom);
    return {
      saleable:  { values: sal,  winnerIdx: argMax(sal) },
      carpet:    { values: car,  winnerIdx: argMax(car) },
      balcony:   { values: bal,  winnerIdx: argMax(bal) },
      priceFrom: { values: price,winnerIdx: argMin(price) },
    };
  };

  const [variant, setVariant] = React.useState('east');
  const m = metricsForVariant(variant);

  return (
    <div style={{display:'flex', flexDirection:'column', gap:22, height:'100%'}}>
      {/* chip row */}
      <div style={{display:'flex', alignItems:'center', gap:14, flexWrap:'wrap'}}>
        <div className="mono" style={{fontSize:13, letterSpacing:'0.28em', color:'var(--slate)', textTransform:'uppercase'}}>Pick up to 3 · {picked.length}/3</div>
        {available.map(t => {
          const on = picked.includes(t.code);
          return (
            <button key={t.code} onClick={()=>togglePick(t.code)} className="serif" style={{
              padding:'10px 18px', borderRadius:999,
              border:'1px solid ' + (on ? 'var(--gold-deep)' : 'var(--line)'),
              background: on ? 'var(--gold-soft)' : 'var(--ivory)',
              color: on ? 'var(--ink)' : 'var(--graphite)',
              fontSize:18, fontWeight: on ? 600 : 400,
              cursor:'pointer', letterSpacing:'-0.005em',
              transition:'all 200ms',
            }}>
              {on && <span style={{color:'var(--gold-deep)', marginRight:8, fontWeight:700}}>✓</span>}
              {t.name}
            </button>
          );
        })}

        {/* E/W toggle on the right */}
        <div style={{marginLeft:'auto', display:'flex', gap:6, padding:4, borderRadius:999, background:'var(--ivory)', border:'1px solid var(--line)'}}>
          {[{k:'east', l:'East'}, {k:'west', l:'West'}].map(o => {
            const on = o.k === variant;
            return (
              <button key={o.k} onClick={()=>setVariant(o.k)} className="mono" style={{
                padding:'10px 22px', borderRadius:999, border:'none',
                background: on ? 'var(--forest)' : 'transparent',
                color: on ? 'var(--on-tile)' : 'var(--slate)',
                fontSize:13, letterSpacing:'0.28em', textTransform:'uppercase',
                fontWeight: on ? 700 : 500, cursor:'pointer',
                transition:'all 220ms',
              }}>{o.l}</button>
            );
          })}
        </div>
      </div>

      {/* three columns */}
      <div style={{display:'grid', gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap:22, flex:'1 1 auto', minHeight:0}}>
        {cols.map((t, idx) => {
          const v = t[variant];
          return (
            <div key={t.code} style={{
              display:'flex', flexDirection:'column', gap:14,
              padding:'26px 28px', borderRadius:18,
              background:'var(--ivory)', border:'1px solid var(--line)',
              boxShadow:'0 14px 32px rgba(26,31,23,0.10)',
              overflow:'hidden', minHeight:0,
            }}>
              {/* header */}
              <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:14}}>
                <div>
                  <div className="mono" style={{fontSize:11, letterSpacing:'0.30em', color:'var(--gold-deep)', textTransform:'uppercase'}}>Option {String.fromCharCode(65+idx)}</div>
                  <div className="serif" style={{fontSize:34, fontWeight:500, color:'var(--ink)', letterSpacing:'-0.015em', marginTop:6, lineHeight:1.05}}>{t.name}</div>
                </div>
                <div style={{
                  width:44, height:44, borderRadius:'50%',
                  background:'var(--forest)', color:'var(--on-tile)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'Cormorant Garamond, serif', fontSize:23, fontWeight:500,
                }}>{t.bhk}</div>
              </div>

              {/* tower meta */}
              <div className="mono" style={{
                fontSize:11, letterSpacing:'0.22em', color:'var(--slate)',
                textTransform:'uppercase', lineHeight:1.5,
              }}>
                Tower · {t.tower}
              </div>

              {/* metric rows — saleable / carpet / balcony / price */}
              <div style={{display:'flex', flexDirection:'column', gap:0, marginTop:6}}>
                <MetricRow
                  k="SALEABLE"
                  v={v.saleable.toLocaleString('en-IN') + ' sft'}
                  isWinner={m.saleable.winnerIdx === idx}
                  winnerNote="largest"
                />
                <MetricRow
                  k="CARPET"
                  v={v.carpet.toLocaleString('en-IN') + ' sft'}
                  isWinner={m.carpet.winnerIdx === idx}
                  winnerNote="most usable"
                />
                <MetricRow
                  k="BALCONY"
                  v={v.balcony.toFixed(2) + ' sft'}
                  isWinner={m.balcony.winnerIdx === idx}
                  winnerNote="most outdoor"
                />
                <MetricRow
                  k="PRICE FROM"
                  v={formatINR(t.priceFrom, {decimals:2})}
                  isWinner={m.priceFrom.winnerIdx === idx}
                  winnerNote="best value"
                />
                <MetricRow
                  k="PER SFT"
                  v={'₹ ' + Math.round(t.priceFrom / v.saleable).toLocaleString('en-IN')}
                  isWinner={false}
                />
                <MetricRow
                  k="VIEW"
                  v={v.view}
                  isWinner={false}
                />
              </div>

              {/* summary */}
              <div style={{
                marginTop:'auto',
                padding:'14px 16px', background:'var(--parchment-2)',
                borderRadius:10, border:'1px solid var(--line)',
                fontSize:15, fontStyle:'italic', color:'var(--graphite)',
                lineHeight:1.5,
              }}>
                {t.summary}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricRow({ k, v, isWinner, winnerNote }) {
  return (
    <div style={{
      display:'flex', justifyContent:'space-between', alignItems:'baseline',
      padding:'14px 0', borderBottom:'1px solid var(--line-soft)',
    }}>
      <div className="mono" style={{
        fontSize:11, letterSpacing:'0.26em', color:'var(--slate)', textTransform:'uppercase',
      }}>{k}</div>
      <div style={{textAlign:'right'}}>
        <div className="serif" style={{
          fontSize: isWinner ? 24 : 20,
          fontWeight: isWinner ? 600 : 400,
          color: isWinner ? 'var(--gold-deep)' : 'var(--ink)',
          fontVariantNumeric:'tabular-nums',
          letterSpacing:'-0.005em', lineHeight:1.1,
          transition:'all 240ms',
        }}>{v}</div>
        {isWinner && winnerNote && (
          <div className="mono" style={{
            fontSize:9.5, letterSpacing:'0.24em', color:'var(--gold-deep)',
            marginTop:3, textTransform:'uppercase',
          }}>★ {winnerNote}</div>
        )}
      </div>
    </div>
  );
}

function argMax(arr) {
  let max = -Infinity, idx = -1;
  arr.forEach((v, i) => { if (v > max) { max = v; idx = i; } });
  // tie → no winner
  if (arr.filter(v => v === max).length > 1) return -1;
  return idx;
}
function argMin(arr) {
  let min = Infinity, idx = -1;
  arr.forEach((v, i) => { if (v < min) { min = v; idx = i; } });
  if (arr.filter(v => v === min).length > 1) return -1;
  return idx;
}

// ============================================================================
// SHARED SLIDER ROW
// ============================================================================
function SliderRow({ label, value, setValue, min, max, step, suffix='', fixed, hint, trackBg, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = format ? format(value) : (fixed != null ? value.toFixed(fixed) : value);
  const bg = trackBg ? trackBg(pct) :
    `linear-gradient(90deg, var(--gold-deep) 0%, var(--gold) ${pct}%, var(--line) ${pct}%, var(--line) 100%)`;
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10}}>
        <div className="mono" style={{fontSize:14, letterSpacing:'0.30em', color:'var(--gold-deep)', textTransform:'uppercase'}}>{label}</div>
        <div className="serif" style={{
          fontSize:38, fontWeight:400, color:'var(--ink)', letterSpacing:'-0.012em',
          lineHeight:1, fontVariantNumeric:'tabular-nums',
        }}>
          {display}<span style={{fontSize:21, color:'var(--graphite)', fontStyle:'italic', marginLeft:4}}>{suffix}</span>
        </div>
      </div>
      <input className="lt-range" type="range"
        min={min} max={max} step={step}
        value={value} onChange={e=>setValue(parseFloat(e.target.value))}
        style={{ ['--lt-range-bg']: bg }}/>
      <div style={{
        display:'flex', justifyContent:'space-between', marginTop:7,
        fontSize:11, color:'var(--slate)',
        fontFamily:'JetBrains Mono, monospace', letterSpacing:'0.22em',
      }}>
        <span>{format ? format(min) : min}{suffix.trim()}</span>
        {hint && <span style={{color:'var(--gold-deep)', textTransform:'uppercase'}}>{hint}</span>}
        <span>{format ? format(max) : max}{suffix.trim()}</span>
      </div>
    </div>
  );
}

window.Tools = Tools;
