// ============================================================================
// PresenterGate — salesperson passcode-claim overlay.
// ----------------------------------------------------------------------------
// Sits at the very top of the render tree (wraps <App/>), before any screen
// mounts. A salesperson punches their 4-digit CRM passcode + the guest's
// mobile number; on success the lead in the central CRM is claimed to them
// and this device's session is tagged with their name for the rest of the
// walk-in (sessionStorage — re-asks on a fresh tab/kiosk reboot).
//
// Never blocks the demo: every error state offers "Continue without
// claiming", and a network/CORS failure degrades to the same escape hatch.
// Uses data-crm="1" (existing convention — see session.jsx) so the
// salesperson's own taps here never pollute the customer's journey log.
// ============================================================================
(function () {
  const SKEY = 'uni_presenter_v1';
  const CLAIM_URL = 'https://universegre.venusprojects.co.in/api/studio/claim';

  function loadPresenter() {
    try { return JSON.parse(sessionStorage.getItem(SKEY)) || null; } catch (e) { return null; }
  }
  function savePresenter(p) {
    try { sessionStorage.setItem(SKEY, JSON.stringify(p)); } catch (e) {}
  }
  function clearPresenter() {
    try { sessionStorage.removeItem(SKEY); } catch (e) {}
  }

  function Keypad({ value, onChange, onSubmit }) {
    const press = (d) => {
      if (d === 'back') { onChange(value.slice(0, -1)); return; }
      if (d === 'clear') { onChange(''); return; }
      if (value.length >= 4) return;
      const next = value + d;
      onChange(next);
      if (next.length === 4) setTimeout(() => onSubmit(next), 120);
    };
    const keys = ['1','2','3','4','5','6','7','8','9','clear','0','back'];
    return (
      <div className="pgate-pad">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            className={'pgate-key' + (k === 'clear' || k === 'back' ? ' pgate-key-alt' : '')}
            onClick={() => press(k)}
          >
            {k === 'back' ? '⌫' : k === 'clear' ? 'Clear' : k}
          </button>
        ))}
      </div>
    );
  }

  function PresenterGate({ children }) {
    const [presenter, setPresenter] = React.useState(loadPresenter);
    const [open, setOpen] = React.useState(!presenter);
    const [pin, setPin] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [status, setStatus] = React.useState('idle'); // idle | busy | error | success
    const [errMsg, setErrMsg] = React.useState('');
    const [errCode, setErrCode] = React.useState(null);
    const [successInfo, setSuccessInfo] = React.useState(null);

    const reset = () => { setPin(''); setStatus('idle'); setErrMsg(''); setErrCode(null); setSuccessInfo(null); };

    async function submit(pinValue) {
      const p = (pinValue !== undefined ? pinValue : pin).trim();
      const ph = phone.replace(/\D/g, '');
      if (p.length !== 4) { setErrMsg('Enter the full 4-digit PIN.'); setStatus('error'); return; }
      if (ph.length < 10) { setErrMsg('Enter the guest’s 10-digit mobile number.'); setStatus('error'); setErrCode(null); return; }
      setStatus('busy'); setErrMsg(''); setErrCode(null);
      try {
        const res = await fetch(CLAIM_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode: p, phone: ph }),
        });
        let data = null;
        try { data = await res.json(); } catch (e) { data = null; }
        if (data && data.ok) {
          // Persist the PIN so the mini-CRM ("Today at The Universe") can reuse
          // it to load walk-ins, claim more guests and end sessions without re-asking.
          const info = { name: data.claimed_by, passcode: p, leadId: data.lead_id, leadName: data.lead_name, stage: data.stage, claimedAt: Date.now() };
          savePresenter(info);
          setSuccessInfo(info);
          setStatus('success');
          if (window.UNI_SESSION) {
            window.UNI_SESSION.setCustomer({ id: data.lead_id, name: data.lead_name, phone: ph });
          }
          setTimeout(() => { setPresenter(info); setOpen(false); }, 1700);
        } else {
          const code = data && data.error;
          setErrCode(code || 'unknown');
          if (code === 'invalid_passcode') setErrMsg('PIN not recognised.');
          else if (code === 'lead_not_found') setErrMsg('No active lead for this number — register the guest at GRE first.');
          else setErrMsg('Couldn’t verify right now.');
          setStatus('error');
          setPin('');
        }
      } catch (e) {
        setErrCode('network');
        setErrMsg('Couldn’t reach the presenter service — check the connection.');
        setStatus('error');
        setPin('');
      }
    }

    function continueWithoutClaiming() {
      savePresenter({ skipped: true, claimedAt: Date.now() });
      setPresenter({ skipped: true });
      setOpen(false);
    }

    function switchPresenter() {
      clearPresenter();
      setPresenter(null);
      reset();
      setPhone('');
      setOpen(true);
    }

    return (
      <React.Fragment>
        {children}
        {!open && presenter && !presenter.skipped && (
          <div data-crm="1" className="pgate-chip" onClick={switchPresenter} title="Tap to switch presenter">
            <span className="pgate-chip-dot"/> Presenter: {presenter.name}
          </div>
        )}
        {!open && presenter && presenter.skipped && (
          <div data-crm="1" className="pgate-chip pgate-chip-muted" onClick={switchPresenter} title="Tap to claim this lead">
            Claim lead
          </div>
        )}
        {open && (
          <div data-crm="1" className="pgate-overlay">
            <style>{PGATE_CSS}</style>
            <div className="pgate-card">
              {status === 'success' && successInfo ? (
                <div className="pgate-success">
                  <div className="pgate-kicker">Claimed</div>
                  <div className="pgate-title display">Presenting to {successInfo.leadName}</div>
                  <div className="pgate-sub mono">claimed by {successInfo.name}</div>
                </div>
              ) : (
                <React.Fragment>
                  <div className="pgate-kicker">Venus Group &middot; Sales Studio</div>
                  <div className="pgate-title display">Presenter sign-in</div>
                  <div className="pgate-sub">Punch your 4-digit PIN and the guest&rsquo;s mobile number to tag this walk-in to you.</div>

                  <div className="pgate-pin-row">
                    {[0,1,2,3].map((i) => (
                      <div key={i} className={'pgate-pin-dot' + (pin.length > i ? ' filled' : '')}/>
                    ))}
                  </div>

                  <Keypad value={pin} onChange={setPin} onSubmit={submit}/>

                  <label className="pgate-label mono">Guest mobile number</label>
                  <input
                    className="pgate-input"
                    type="tel"
                    inputMode="numeric"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={status === 'busy'}
                  />

                  {status === 'error' && (
                    <div className="pgate-err">
                      {errMsg}
                    </div>
                  )}
                  {status === 'busy' && <div className="pgate-busy mono">Verifying&hellip;</div>}

                  <button className="pgate-submit" disabled={status === 'busy'} onClick={() => submit()}>
                    {status === 'busy' ? 'Verifying…' : 'Claim this walk-in'}
                  </button>

                  <div className="pgate-skip" onClick={continueWithoutClaiming}>
                    Continue without claiming
                  </div>
                </React.Fragment>
              )}
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }

  const PGATE_CSS = `
  .pgate-overlay {
    position: fixed; inset: 0; z-index: 100050;
    display: flex; align-items: center; justify-content: center;
    background: #0b0a08;
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .pgate-overlay::before {
    content: ''; position: absolute; inset: 0; z-index: -1;
    background: radial-gradient(120% 90% at 50% 30%, rgba(201,160,94,0.10), rgba(11,10,8,0.98) 70%);
  }
  .pgate-card {
    width: min(560px, 90vw);
    max-height: 92vh; overflow: auto; scrollbar-width: none;
    text-align: center; display: flex; flex-direction: column; align-items: center;
    animation: pgateIn 640ms cubic-bezier(.22,1,.36,1) both;
    padding: clamp(20px, 3vw, 36px) 0;
  }
  @keyframes pgateIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
  .pgate-kicker {
    font: 600 clamp(10px,1.2vw,12px)/1 'JetBrains Mono', monospace; letter-spacing: 0.3em;
    text-transform: uppercase; color: #c9a05e; margin-bottom: 14px;
  }
  .pgate-title.display {
    font-family: 'Cinzel', 'Cormorant Garamond', serif; font-weight: 400;
    font-size: clamp(24px,4vw,38px); color: #fbf4e3; letter-spacing: 0.01em; line-height: 1.15;
  }
  .pgate-sub {
    font-size: clamp(12.5px,1.5vw,15px); line-height: 1.55; color: rgba(244,236,218,0.62);
    max-width: 30em; margin: 12px auto 22px;
  }
  .pgate-pin-row { display: flex; gap: 16px; margin-bottom: 18px; }
  .pgate-pin-dot {
    width: 16px; height: 16px; border-radius: 50%;
    border: 1.5px solid rgba(232,215,168,0.45); background: transparent;
    transition: background .16s ease, transform .16s ease;
  }
  .pgate-pin-dot.filled { background: #c9a05e; transform: scale(1.08); box-shadow: 0 0 10px rgba(201,160,94,0.6); }
  .pgate-pad {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
    width: min(320px, 78vw); margin-bottom: 22px;
  }
  .pgate-key {
    appearance: none; border: 1px solid rgba(232,215,168,0.22); background: rgba(255,255,255,0.03);
    color: #fbf4e3; font: 500 20px/1 'JetBrains Mono', monospace; border-radius: 14px;
    padding: 16px 0; cursor: pointer; transition: background .12s ease, transform .12s ease;
  }
  .pgate-key:active { transform: scale(0.94); background: rgba(201,160,94,0.22); }
  .pgate-key-alt { color: rgba(244,236,218,0.55); font-size: 13px; letter-spacing: 0.08em; }
  .pgate-label {
    align-self: flex-start; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(244,236,218,0.5); margin: 2px auto 8px; width: min(320px, 78vw); text-align: left;
  }
  .pgate-input {
    width: min(320px, 78vw); font: 500 18px/1 'Inter', sans-serif; color: #fbf4e3;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(232,215,168,0.25); border-radius: 12px;
    padding: 15px 18px; text-align: center; margin-bottom: 8px; outline: none;
  }
  .pgate-input:focus { border-color: #c9a05e; background: rgba(201,160,94,0.08); }
  .pgate-input::placeholder { color: rgba(244,236,218,0.32); }
  .pgate-err {
    width: min(320px, 78vw); color: #e58a83; font-size: 13px; line-height: 1.5; margin: 8px auto 4px;
  }
  .pgate-busy { color: rgba(244,236,218,0.55); font-size: 12px; margin: 8px auto 4px; }
  .pgate-submit {
    appearance: none; border: none; cursor: pointer; margin-top: 14px;
    font: 700 13px/1 'JetBrains Mono', monospace; letter-spacing: 0.16em; text-transform: uppercase;
    color: #1a130a; padding: 16px 40px; border-radius: 999px;
    background: linear-gradient(180deg, #ead7a8 0%, #c9a05e 100%);
    box-shadow: 0 14px 36px rgba(201,160,94,0.3), inset 0 1px 0 rgba(255,255,255,0.5);
  }
  .pgate-submit:disabled { opacity: 0.6; cursor: default; }
  .pgate-skip {
    margin-top: 20px; font: 500 11.5px/1 'JetBrains Mono', monospace; letter-spacing: 0.14em;
    color: rgba(244,236,218,0.4); cursor: pointer; text-transform: uppercase;
  }
  .pgate-skip:hover { color: rgba(244,236,218,0.68); }
  .pgate-success .pgate-title { margin-top: 4px; }
  .pgate-success .pgate-sub.mono { font-family: 'JetBrains Mono', monospace; color: #c9a05e; margin-top: 10px; }

  .pgate-chip {
    position: fixed; left: 18px; bottom: 18px; z-index: 100040;
    display: flex; align-items: center; gap: 8px;
    font: 600 11px/1 'JetBrains Mono', monospace; letter-spacing: 0.08em;
    color: #faf6e8; background: rgba(10,10,10,0.72); backdrop-filter: blur(6px);
    border: 1px solid rgba(232,215,168,0.28); border-radius: 999px;
    padding: 9px 16px; cursor: pointer; user-select: none;
  }
  .pgate-chip:hover { background: rgba(10,10,10,0.86); }
  .pgate-chip-dot { width: 7px; height: 7px; border-radius: 50%; background: #4a8b52; box-shadow: 0 0 6px rgba(74,139,82,0.7); }
  .pgate-chip-muted { color: rgba(250,246,232,0.6); }
  `;

  window.PresenterGate = PresenterGate;
})();
