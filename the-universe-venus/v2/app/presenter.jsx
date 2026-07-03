// ============================================================================
// Presenter passcode gate — protects ONLY the mini-CRM (not the whole app).
// ----------------------------------------------------------------------------
// The Studio boots straight into its normal home/experience with NO passcode —
// a salesperson presenting does not sign in just to use the tablet.
//
// The mini-CRM (today's walk-ins = sensitive customer data) opens by TRIPLE-
// CLICKING the centre Universe logo on Home. On triple-click, if no valid
// presenter is stored, this on-brand 4-digit PIN pad appears FIRST. The PIN is
// validated by the relay (POST /api/studio/validate → studio_validate_passcode
// RPC). On success the presenter {user_id, name, passcode} is stored in
// sessionStorage (uni_presenter_v1) and the mini-CRM opens. A stored presenter
// means triple-click opens the mini-CRM directly (no re-ask this session); a
// "lock/switch presenter" affordance in the StudioBar clears it.
//
// There is NO mobile-number entry anywhere — selecting a customer card in the
// mini-CRM and starting their journey is what links them to the salesperson.
// data-crm="1" so the presenter's own taps never pollute the customer journey.
// ============================================================================
(function () {
  const SKEY = 'uni_presenter_v1';
  const VALIDATE_URL = 'https://universegre.venusprojects.co.in/api/studio/validate';

  function loadPresenter() {
    try { return JSON.parse(sessionStorage.getItem(SKEY)) || null; } catch (e) { return null; }
  }
  function savePresenter(p) {
    try { sessionStorage.setItem(SKEY, JSON.stringify(p)); } catch (e) {}
  }
  function clearPresenter() {
    try { sessionStorage.removeItem(SKEY); } catch (e) {}
  }
  function signedIn() { const p = loadPresenter(); return !!(p && p.passcode); }

  // Shared helper store so home.jsx / minicrm.jsx agree on the presenter.
  window.UNI_PRESENTER = {
    get: loadPresenter,
    save: savePresenter,
    clear: clearPresenter,
    signedIn,
    passcode() { const p = loadPresenter(); return p && p.passcode ? p.passcode : ''; },
  };

  function Keypad({ value, onChange, onSubmit, disabled }) {
    const press = (d) => {
      if (disabled) return;
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

  // Full-screen PIN overlay. Props: onSuccess(presenter), onCancel().
  function PresenterPasscodeGate({ onSuccess, onCancel }) {
    const [pin, setPin] = React.useState('');
    const [status, setStatus] = React.useState('idle'); // idle | busy | error
    const [errMsg, setErrMsg] = React.useState('');

    async function submit(pinValue) {
      const p = (pinValue !== undefined ? pinValue : pin).trim();
      if (p.length !== 4) { setErrMsg('Enter the full 4-digit PIN.'); setStatus('error'); return; }
      setStatus('busy'); setErrMsg('');
      try {
        const res = await fetch(VALIDATE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode: p }),
        });
        let data = null;
        try { data = await res.json(); } catch (e) { data = null; }
        if (data && data.ok) {
          const info = { user_id: data.user_id, name: data.name || 'Presenter', passcode: p, at: Date.now() };
          savePresenter(info);
          if (onSuccess) onSuccess(info);
        } else {
          setErrMsg('PIN not recognised.');
          setStatus('error');
          setPin('');
        }
      } catch (e) {
        setErrMsg('Couldn’t reach the studio service — check the connection.');
        setStatus('error');
        setPin('');
      }
    }

    return (
      <div data-crm="1" className="pgate-overlay">
        <style>{PGATE_CSS}</style>
        <div className="pgate-card">
          <div className="pgate-kicker">Venus Group &middot; Sales Studio</div>
          <div className="pgate-title display">Presenter access</div>
          <div className="pgate-sub">Enter your 4-digit PIN to open today&rsquo;s guest list.</div>

          <div className="pgate-pin-row">
            {[0,1,2,3].map((i) => (
              <div key={i} className={'pgate-pin-dot' + (pin.length > i ? ' filled' : '')}/>
            ))}
          </div>

          <Keypad value={pin} onChange={(v) => { setPin(v); if (status === 'error') setStatus('idle'); }} onSubmit={submit} disabled={status === 'busy'}/>

          {status === 'error' && <div className="pgate-err">{errMsg}</div>}
          {status === 'busy' && <div className="pgate-busy mono">Verifying&hellip;</div>}

          <button className="pgate-submit" disabled={status === 'busy'} onClick={() => submit()}>
            {status === 'busy' ? 'Verifying…' : 'Unlock'}
          </button>

          <div className="pgate-skip" onClick={() => onCancel && onCancel()}>
            Cancel
          </div>
        </div>
      </div>
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
  `;

  window.PresenterPasscodeGate = PresenterPasscodeGate;
})();
