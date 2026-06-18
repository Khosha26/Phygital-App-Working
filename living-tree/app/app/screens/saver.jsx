// SAVER SNAPSHOT — printable "share-with-customer" one-pager.
//
// This is the heirloom certificate the sales agent hands / WhatsApps to the
// customer after the booking is confirmed. Designed to print cleanly on A4.
//
// Reads window.__LT_LAST_BOOKING__ (persisted by booking.jsx). If absent,
// falls back to a demo booking using SAMPLE_CUSTOMER + first non-sold typology.
//
// Embodied: a luxury-realty document designer. Heavier serif. Gold rules.
// Generous whitespace. A subtle DRAFT watermark to make it clear this is a
// preview, not the final stamped agreement.

// ---- One-time print CSS injection -------------------------------------
const LT_SAVER_PRINT_KEYS = 'lt-saver-print-keys';
function ensureLtSaverPrintKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(LT_SAVER_PRINT_KEYS)) return;
  const s = document.createElement('style');
  s.id = LT_SAVER_PRINT_KEYS;
  s.textContent = `
    @media print {
      body, html { background: white !important; }
      .lt-saver-chrome { display: none !important; }
      .lt-saver-page { box-shadow: none !important; border: none !important; }
    }
  `;
  document.head.appendChild(s);
}

function Saver() {
  ensureLtSaverPrintKeys();

  // Pull the most recent booking, or build a fallback demo from sample data.
  const booking = React.useMemo(() => {
    if (window.__LT_LAST_BOOKING__) return window.__LT_LAST_BOOKING__;
    // Demo fallback
    const ty = TYPOLOGIES.find(t => !t.soldOut);
    const tower = TOWERS.find(t => ty.tower.includes(t.name)) || TOWERS[0];
    const v = ty.east;
    const bsp = Math.round(ty.priceFrom * 1.085);  // floor 12 east premium
    const gst = Math.round(bsp * 0.05);
    const maintenance = Math.round(v.saleable * 100);
    const registration = Math.round(v.saleable * 250);
    const total = bsp + gst + maintenance + registration;
    return {
      token: 'LT-2026-DEMO',
      issuedAt: new Date().toISOString(),
      customer: { ...SAMPLE_CUSTOMER, employer: 'Wipro Aerospace' },
      unit: {
        code: ty.code, name: ty.name, bhk: ty.bhk,
        towerId: tower.id, towerName: tower.name, towerNo: tower.no, cluster: tower.cluster,
        floor: 12, variant: 'east',
        saleable: v.saleable, carpet: v.carpet, balcony: v.balcony,
        view: v.view, plan: ty.plan,
      },
      price: { bsp, gst, maintenance, registration, total },
      payment: { amount: 200000, mode: 'UPI' },
    };
  }, []);

  const issued = new Date(booking.issuedAt);
  const issuedLabel = issued.toLocaleDateString('en-IN', {
    weekday:'long', day:'2-digit', month:'long', year:'numeric',
  });

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const handleWhatsApp = () => {
    // mock: just a toast-style alert — production would build a wa.me link
    const text = `LivingTree booking ${booking.token} for ${booking.customer.name} — ${booking.unit.name}, ${booking.unit.towerName}, Floor ${booking.unit.floor}. Total ${formatINRFull(booking.price.total)}.`;
    if (navigator.share) {
      navigator.share({ title:'LivingTree Booking', text }).catch(()=>{});
    } else {
      window.alert('WhatsApp share (mock):\n\n' + text);
    }
  };

  return (
    <div style={{
      position:'absolute', inset:0,
      background:'var(--parchment)', color:'var(--ink)', overflow:'hidden',
    }}>
      <ScreenHeader title="Saver" sub="Snapshot · share with customer"/>

      {/* === The certificate page ================================== */}
      <div style={{
        position:'absolute', top:200, left:130, right:130, bottom:170,
        display:'flex', alignItems:'stretch', justifyContent:'center',
      }}>
        <div className="lt-saver-page" style={{
          position:'relative',
          width:'100%', maxWidth:1800,
          background:'#fbf6ea',
          backgroundImage:`
            radial-gradient(circle at 12% 8%, rgba(201,168,101,0.06) 0%, transparent 50%),
            radial-gradient(circle at 88% 92%, rgba(46,74,44,0.05) 0%, transparent 55%)
          `,
          border:'1px solid var(--gold)',
          borderRadius:6,
          boxShadow:'0 30px 80px rgba(26,31,23,0.22), 0 12px 28px rgba(26,31,23,0.14), inset 0 0 0 6px var(--parchment)',
          padding:'70px 84px 60px',
          overflow:'hidden',
          display:'flex', flexDirection:'column',
        }}>

          {/* DRAFT watermark, behind everything */}
          <div style={{
            position:'absolute', inset:0,
            display:'flex', alignItems:'center', justifyContent:'center',
            pointerEvents:'none', zIndex:0,
          }}>
            <div className="serif" style={{
              fontSize:380, color:'rgba(201,168,101,0.07)',
              letterSpacing:'0.35em', fontWeight:600,
              transform:'rotate(-22deg)',
              userSelect:'none', whiteSpace:'nowrap',
            }}>DRAFT</div>
          </div>

          {/* Wreath watermark — bottom-right corner stamp.
              The same brand mark used as a recurring seal motif. */}
          <div style={{
            position:'absolute', right:-80, bottom:-80,
            pointerEvents:'none', zIndex:0,
          }}>
            <LivingTreeWatermark size={460} opacity={0.10} rotation={-8}/>
          </div>

          {/* === Top band — monogram + wordmark + Kalyani triangle ==== */}
          <div style={{
            position:'relative', zIndex:1,
            display:'flex', justifyContent:'space-between', alignItems:'flex-start',
            paddingBottom:24, borderBottom:'1px solid var(--gold)',
          }}>
            <div style={{display:'flex', alignItems:'center', gap:24}}>
              <LivingTreeLockup size={340} progress={1}/>
              <div style={{paddingLeft:8}}>
                <div className="mono" style={{
                  fontSize:12, letterSpacing:'0.32em', color:'var(--gold-deep)',
                  textTransform:'uppercase',
                }}>by Kalyani Developers</div>
                <div className="serif" style={{
                  fontSize:18, fontStyle:'italic', color:'var(--forest)',
                  marginTop:6, letterSpacing:'0.01em',
                }}>Designed for Life.</div>
              </div>
            </div>
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10}}>
              <KalyaniTriangle size={84}/>
              <div className="mono" style={{
                fontSize:11, letterSpacing:'0.30em', color:'var(--slate)',
                textTransform:'uppercase',
              }}>Booking Snapshot</div>
            </div>
          </div>

          {/* === Title + token =========================================== */}
          <div style={{
            position:'relative', zIndex:1,
            display:'flex', justifyContent:'space-between', alignItems:'flex-end',
            gap:32, paddingTop:26, paddingBottom:22,
          }}>
            <div>
              <div className="mono" style={{fontSize:13, letterSpacing:'0.36em', color:'var(--gold-deep)', textTransform:'uppercase', marginBottom:8}}>
                Issued · {issuedLabel}
              </div>
              <div className="serif" style={{
                fontSize:62, fontWeight:400, color:'var(--forest)',
                letterSpacing:'-0.025em', lineHeight:1.05,
              }}>
                Reservation for <em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>{booking.customer.name}</em>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div className="mono" style={{fontSize:11, letterSpacing:'0.36em', color:'var(--slate)', textTransform:'uppercase'}}>Token ID</div>
              <div className="serif" style={{
                fontSize:48, fontWeight:600, color:'var(--ink)',
                letterSpacing:'0.06em', fontVariantNumeric:'tabular-nums',
                marginTop:6, lineHeight:1,
              }}>{booking.token}</div>
            </div>
          </div>

          {/* === Body grid =========================================== */}
          <div style={{
            position:'relative', zIndex:1, flex:'1 1 auto', minHeight:0,
            display:'grid', gridTemplateColumns:'1.05fr 1.25fr', gap:42, paddingTop:6,
          }}>

            {/* === LEFT column — customer + reserved unit + price ==== */}
            <div style={{display:'flex', flexDirection:'column', gap:24, minHeight:0}}>
              {/* Customer block */}
              <SaverSection title="Customer">
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
                  <SaverField k="NAME"     v={booking.customer.name}/>
                  <SaverField k="PHONE"    v={booking.customer.phone}/>
                  <SaverField k="EMAIL"    v={booking.customer.email}/>
                  <SaverField k="PAN"      v={booking.customer.pan || '—'}/>
                  <SaverField k="EMPLOYER" v={booking.customer.employer || '—'}/>
                  <SaverField k="HOME LOAN" v={booking.customer.loanPreApproved ? 'Pre-approved ✓' : 'Not yet'}/>
                </div>
              </SaverSection>

              {/* Reserved unit */}
              <SaverSection title="Reserved Residence">
                <div className="serif" style={{
                  fontSize:38, fontWeight:500, color:'var(--ink)',
                  letterSpacing:'-0.015em', lineHeight:1.05,
                }}>{booking.unit.name}</div>
                <div className="serif" style={{
                  fontSize:20, color:'var(--graphite)', fontStyle:'italic', marginTop:6,
                }}>
                  {booking.unit.towerName} (Tower #{booking.unit.towerNo}) ·
                  Floor {booking.unit.floor} ·
                  {booking.unit.variant === 'east' ? ' East' : ' West'}-facing ·
                  {' '}{booking.unit.cluster}
                </div>
                <div style={{
                  display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16,
                  marginTop:16, padding:'16px 20px',
                  background:'var(--parchment-2)', borderRadius:8,
                  border:'1px solid var(--line)',
                }}>
                  <SaverField k="SALEABLE" v={booking.unit.saleable.toLocaleString('en-IN') + ' sft'}/>
                  <SaverField k="CARPET"   v={booking.unit.carpet.toLocaleString('en-IN') + ' sft'}/>
                  <SaverField k="BALCONY"  v={booking.unit.balcony.toFixed(2) + ' sft'}/>
                </div>
                <SaverField k="VIEW" v={booking.unit.view}/>
              </SaverSection>
            </div>

            {/* === RIGHT column — price breakdown + payment + footer notes === */}
            <div style={{display:'flex', flexDirection:'column', gap:24, minHeight:0}}>
              <SaverSection title="Price Breakdown">
                <div style={{display:'flex', flexDirection:'column', gap:11}}>
                  <SaverPriceRow k="Base Selling Price" v={booking.price.bsp}/>
                  <SaverPriceRow k="GST (5%)"           v={booking.price.gst}/>
                  <SaverPriceRow k="Maintenance · ₹100/sft" v={booking.price.maintenance}/>
                  <SaverPriceRow k="Registration · ₹250/sft" v={booking.price.registration}/>
                  <div style={{
                    display:'flex', justifyContent:'space-between', alignItems:'baseline',
                    paddingTop:14, marginTop:7,
                    borderTop:'2px solid var(--gold-deep)',
                  }}>
                    <div className="serif" style={{fontSize:24, fontWeight:600, color:'var(--ink)'}}>Total Payable</div>
                    <div className="serif" style={{
                      fontSize:34, fontWeight:600, color:'var(--gold-deep)',
                      fontVariantNumeric:'tabular-nums', letterSpacing:'-0.012em',
                    }}>{formatINRFull(booking.price.total)}</div>
                  </div>
                </div>
              </SaverSection>

              <SaverSection title="Reservation Token Paid">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                  <div>
                    <div className="serif" style={{fontSize:34, fontWeight:500, color:'var(--forest)', fontVariantNumeric:'tabular-nums', letterSpacing:'-0.012em'}}>
                      {formatINRFull(booking.payment.amount)}
                    </div>
                    <div className="mono" style={{fontSize:11, letterSpacing:'0.28em', color:'var(--slate)', textTransform:'uppercase', marginTop:6}}>
                      via {booking.payment.mode} · refundable within 24 hrs
                    </div>
                  </div>
                  <div className="serif" style={{
                    fontSize:14, fontStyle:'italic', color:'var(--gold-deep)',
                    padding:'8px 16px', border:'1px solid var(--gold)', borderRadius:999,
                    background:'rgba(232,216,168,0.18)',
                  }}>holds unit · 7 days</div>
                </div>
              </SaverSection>

              <SaverSection title="Project">
                <div style={{display:'flex', flexDirection:'column', gap:8, fontSize:14, lineHeight:1.55}}>
                  <div style={{display:'flex', gap:10}}>
                    <div className="mono" style={{minWidth:96, fontSize:10.5, letterSpacing:'0.26em', color:'var(--slate)', textTransform:'uppercase'}}>ADDRESS</div>
                    <div style={{color:'var(--graphite)'}}>{PROJECT.location.address}</div>
                  </div>
                  <div style={{display:'flex', gap:10}}>
                    <div className="mono" style={{minWidth:96, fontSize:10.5, letterSpacing:'0.26em', color:'var(--slate)', textTransform:'uppercase'}}>RERA</div>
                    <div className="mono" style={{color:'var(--ink)', fontSize:12, letterSpacing:'0.10em'}}>{PROJECT.rera}</div>
                  </div>
                  <div style={{display:'flex', gap:10}}>
                    <div className="mono" style={{minWidth:96, fontSize:10.5, letterSpacing:'0.26em', color:'var(--slate)', textTransform:'uppercase'}}>SALES</div>
                    <div style={{color:'var(--graphite)'}}>
                      {PROJECT.contact.phone} · {PROJECT.contact.email}
                    </div>
                  </div>
                </div>
              </SaverSection>
            </div>
          </div>

          {/* === Footer disclaimer + signature line ================== */}
          <div style={{
            position:'relative', zIndex:1,
            marginTop:24, paddingTop:18,
            borderTop:'1px solid var(--gold)',
            display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:32,
          }}>
            <div style={{flex:1, fontSize:11.5, color:'var(--slate)', fontStyle:'italic', lineHeight:1.55, maxWidth:760}}>
              Figures are illustrative for sales discussion. The final schedule of payment,
              GST and registration charges will be reflected in the booking application form
              per RERA disclosures. This snapshot is not a legal commitment.
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{
                height:1.5, background:'var(--gold-deep)', width:240, marginLeft:'auto',
              }}/>
              <div className="mono" style={{
                fontSize:10, letterSpacing:'0.32em', color:'var(--slate)',
                textTransform:'uppercase', marginTop:8,
              }}>Authorised Signatory · Kalyani Developers</div>
            </div>
          </div>

        </div>
      </div>

      {/* === Chrome — share + print + done buttons (hidden in print) === */}
      <div className="lt-saver-chrome" style={{
        position:'absolute', bottom:48, left:64, right:64,
        display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:30,
      }}>
        <button onClick={()=>navigate('home')} className="mono" style={{
          padding:'20px 38px', borderRadius:999, background:'transparent',
          border:'1px solid var(--line)', color:'var(--ink)',
          fontSize:17, letterSpacing:'0.22em', textTransform:'uppercase', cursor:'pointer',
        }}>← Done · Back to home</button>

        <div style={{display:'flex', gap:14}}>
          <button onClick={handleWhatsApp} className="mono" style={{
            padding:'20px 32px', borderRadius:999,
            border:'1px solid var(--forest)',
            background:'linear-gradient(180deg, var(--forest-soft) 0%, var(--forest) 100%)',
            color:'var(--on-tile)',
            fontSize:15, letterSpacing:'0.22em', textTransform:'uppercase',
            fontWeight:700, cursor:'pointer',
            boxShadow:'0 12px 28px rgba(31,53,34,0.32), inset 0 1px 0 rgba(255,246,224,0.18)',
            display:'flex', alignItems:'center', gap:11,
          }}>
            <WhatsAppIcon/>
            Share via WhatsApp
          </button>
          <button onClick={handlePrint} className="mono" style={{
            padding:'20px 32px', borderRadius:999,
            border:'1px solid var(--gold-deep)',
            background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
            color:'#1a130a',
            fontSize:15, letterSpacing:'0.22em', textTransform:'uppercase',
            fontWeight:700, cursor:'pointer',
            boxShadow:'0 12px 28px rgba(176,142,69,0.42), inset 0 1px 0 rgba(255,255,255,0.42)',
            display:'flex', alignItems:'center', gap:11,
          }}>
            <PrintIcon/>
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Small composable bits ---------------------------------------------
function SaverSection({ title, children }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:11}}>
      <div className="mono" style={{
        fontSize:11, letterSpacing:'0.36em', color:'var(--gold-deep)',
        textTransform:'uppercase', paddingBottom:5,
        borderBottom:'1px solid rgba(201,168,101,0.40)',
      }}>{title}</div>
      <div>{children}</div>
    </div>
  );
}

function SaverField({ k, v }) {
  return (
    <div>
      <div className="mono" style={{
        fontSize:10, letterSpacing:'0.30em', color:'var(--slate)', textTransform:'uppercase',
      }}>{k}</div>
      <div className="serif" style={{
        fontSize:17, fontWeight:400, marginTop:3, color:'var(--ink)',
        letterSpacing:'-0.005em', lineHeight:1.3,
      }}>{v}</div>
    </div>
  );
}

function SaverPriceRow({ k, v }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
      <div className="serif" style={{fontSize:18, color:'var(--graphite)', letterSpacing:'-0.005em'}}>{k}</div>
      <div className="mono" style={{fontSize:16, color:'var(--ink)', fontVariantNumeric:'tabular-nums'}}>{formatINRFull(v)}</div>
    </div>
  );
}

// inline icons — kept local so saver doesn't grow the global Icons map
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.72.45 3.39 1.31 4.87L2 22l5.36-1.41c1.43.78 3.04 1.2 4.68 1.2 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.49 0-2.95-.4-4.23-1.15l-.3-.18-3.13.82.83-3.05-.2-.31a8.18 8.18 0 0 1-1.27-4.37c0-4.54 3.69-8.23 8.23-8.23 4.54 0 8.23 3.69 8.23 8.23 0 4.54-3.69 8.24-8.16 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.02 2.57.12.17 1.76 2.69 4.27 3.77.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.1-.23-.16-.48-.29z"/>
    </svg>
  );
}
function PrintIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V4h12v5"/>
      <rect x="3" y="9" width="18" height="9" rx="1.5"/>
      <rect x="6" y="14" width="12" height="6"/>
      <circle cx="17" cy="12" r="0.8" fill="currentColor"/>
    </svg>
  );
}

window.Saver = Saver;
