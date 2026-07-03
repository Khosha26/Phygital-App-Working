// ============================================================================
// Mini-CRM — "Today at The Universe" + the studio session controls.
// ----------------------------------------------------------------------------
// Three pieces, all gated on a signed-in presenter (uni_presenter_v1 with a PIN):
//   • MiniCRM   — a registered screen (#/minicrm) listing today's walk-ins from
//                 the relay; tap an un-attended guest to "Start presenting".
//   • StudioBar — a floating control cluster (sits by the presenter chip):
//                 "Today" (opens the mini-CRM) + "End session" (opens the modal).
//                 Also the shim that STARTS the journey tracker the moment a
//                 customer is claimed, so per-screen dwell times are captured.
//   • EndSessionModal — disposition + notes + the auto-collected screen-time
//                 summary → POST /api/studio/session-end → CRM lead timeline.
// data-crm="1" everywhere so the salesperson's taps never pollute the journey.
// Matches the app's ivory / gold / ink aesthetic.
// ============================================================================
(function () {
  const RELAY = 'https://universegre.venusprojects.co.in';
  const PKEY = 'uni_presenter_v1';

  function presenter() { try { return JSON.parse(sessionStorage.getItem(PKEY)) || null; } catch (e) { return null; } }
  function passcode() { const p = presenter(); return p && p.passcode ? p.passcode : ''; }
  function signedIn() { const p = presenter(); return !!(p && p.passcode && !p.skipped); }

  const fmtMins = (ms) => { const m = Math.round((ms || 0) / 60000); return m < 1 ? '<1m' : m + 'm'; };

  // ── The mini-CRM screen ─────────────────────────────────────────────────
  function MiniCRM() {
    const [rows, setRows] = React.useState([]);
    const [state, setState] = React.useState('idle'); // idle | loading | ready | error | denied
    const [err, setErr] = React.useState('');
    const [claiming, setClaiming] = React.useState(null); // lead id currently being claimed
    const [claimErr, setClaimErr] = React.useState('');

    const load = React.useCallback(async () => {
      const pc = passcode();
      if (!pc) { setState('denied'); return; }
      setState('loading'); setErr('');
      try {
        const res = await fetch(`${RELAY}/api/studio/walkins?passcode=${encodeURIComponent(pc)}`);
        const data = await res.json();
        if (data && data.ok) { setRows(data.walkins || []); setState('ready'); }
        else { setErr(data && data.error === 'invalid_passcode' ? 'PIN not recognised — unlock again.' : 'Couldn’t load walk-ins.'); setState('error'); }
      } catch (e) { setErr('Couldn’t reach the studio service.'); setState('error'); }
    }, []);

    React.useEffect(() => { load(); }, [load]);

    // Selecting a customer + starting their journey is what LINKS them to the
    // salesperson — no typed phone number. Claim the lead by id via the relay,
    // then set them as the active session and drop onto Home to present.
    async function startPresenting(row) {
      if (claiming) return;
      const pc = passcode();
      if (!pc) { setState('denied'); return; }
      setClaiming(row.id); setClaimErr('');
      try {
        const res = await fetch(`${RELAY}/api/studio/claim-by-id`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode: pc, lead_id: row.id }),
        });
        const data = await res.json();
        if (data && data.ok) {
          const cust = { id: data.lead_id || row.id, name: data.lead_name || row.name };
          if (window.UNI_SESSION) {
            window.UNI_SESSION.setCustomer(cust);
            if (!window.UNI_SESSION.isActive()) window.UNI_SESSION.start(cust);
          }
          if (window.navigate) window.navigate('home');
        } else {
          setClaimErr(data && data.error === 'invalid_passcode' ? 'PIN not recognised — unlock again.'
            : data && data.error === 'lead_not_found' ? 'This lead is no longer active.'
            : 'Couldn’t start the journey.');
          setClaiming(null);
        }
      } catch (e) {
        setClaimErr('Couldn’t reach the studio service.');
        setClaiming(null);
      }
    }

    return (
      <div data-crm="1" className="mcrm-wrap">
        <style>{MCRM_CSS}</style>
        <div className="mcrm-head">
          <div>
            <div className="mcrm-kicker">Venus Group · Sales Studio</div>
            <div className="mcrm-title display">Today at The Universe</div>
            <div className="mcrm-sub">Walk-ins registered today &middot; tap an awaiting guest to begin their tour.</div>
          </div>
          <button className="mcrm-refresh" onClick={load} disabled={state === 'loading'}>
            {state === 'loading' ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>

        {state === 'denied' && <div className="mcrm-empty">Unlock the studio first (triple-tap the centre logo on Home).</div>}
        {state === 'error' && <div className="mcrm-empty mcrm-err">{err}</div>}
        {state === 'ready' && rows.length === 0 && <div className="mcrm-empty">No walk-ins yet today.</div>}
        {claimErr && <div className="mcrm-empty mcrm-err">{claimErr}</div>}

        <div className="mcrm-strip">
          {rows.map((r) => (
            <div key={r.id} className={'mcrm-card' + (r.attended ? ' is-attended' : '')}>
              <div className="mcrm-card-top">
                {r.attended ? (
                  <span className="mcrm-status attended"><span className="mcrm-tick">✓</span> Attended</span>
                ) : (
                  <span className="mcrm-status awaiting"><span className="mcrm-dot" /> Awaiting</span>
                )}
                <span className="mcrm-chip">{prettyStage(r.stage)}</span>
              </div>
              <div className="mcrm-name">{r.name || 'Guest'}</div>
              <div className="mcrm-phone mono">{r.phone}</div>
              {r.owner && <div className="mcrm-owner">Owner · {r.owner.name}</div>}
              <div className="mcrm-card-foot">
                {r.attended ? (
                  <button className="mcrm-start mcrm-start-alt" onClick={() => startPresenting(r)} disabled={!!claiming}>
                    {claiming === r.id ? 'Starting…' : 'Resume journey'}
                  </button>
                ) : (
                  <button className="mcrm-start" onClick={() => startPresenting(r)} disabled={!!claiming}>
                    {claiming === r.id ? 'Starting…' : 'Start journey'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function prettyStage(s) {
    if (!s) return '—';
    return String(s).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // ── The end-session modal ───────────────────────────────────────────────
  function EndSessionModal({ onClose }) {
    const [dispositions, setDispositions] = React.useState([]);
    const [pick, setPick] = React.useState('');
    const [notes, setNotes] = React.useState('');
    const [phase, setPhase] = React.useState('form'); // form | busy | done | error
    const [err, setErr] = React.useState('');
    const snap = React.useRef(window.UNI_SESSION ? window.UNI_SESSION.snapshot() : null).current;
    const customer = (window.UNI_SESSION && window.UNI_SESSION.getCustomer()) || (snap && snap.customer) || null;

    React.useEffect(() => {
      (async () => {
        try {
          const res = await fetch(`${RELAY}/api/studio/dispositions?passcode=${encodeURIComponent(passcode())}`);
          const data = await res.json();
          if (data && data.ok) setDispositions(data.dispositions || []);
        } catch (e) {}
      })();
    }, []);

    const screens = (snap && snap.screens) ? snap.screens.filter((s) => s.ms > 1500) : [];

    async function submit() {
      if (!pick) { setErr('Pick a disposition.'); return; }
      setPhase('busy'); setErr('');
      const events = (snap && snap.screens ? snap.screens : []).map((s) => ({ screen: s.path, seconds: Math.round(s.ms / 1000) }));
      const body = {
        passcode: passcode(),
        lead_id: customer && customer.id ? customer.id : undefined,
        phone: customer && customer.phone ? customer.phone : undefined,
        disposition: pick,
        notes,
        events,
        started_at: snap ? snap.startedAt : 0,
      };
      try {
        const res = await fetch(`${RELAY}/api/studio/session-end`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data && data.ok) {
          if (window.UNI_SESSION && window.UNI_SESSION.isActive()) window.UNI_SESSION.end({ disposition: pick, remark: notes });
          else if (window.UNI_SESSION) window.UNI_SESSION.setCustomer(null);
          setPhase('done');
        } else { setErr('Couldn’t save the session.'); setPhase('error'); }
      } catch (e) { setErr('Couldn’t reach the studio service.'); setPhase('error'); }
    }

    return (
      <div data-crm="1" className="esm-overlay" onClick={(e) => { if (e.target.classList.contains('esm-overlay') && phase !== 'busy') onClose(); }}>
        <style>{MCRM_CSS}</style>
        <div className="esm-card">
          {phase === 'done' ? (
            <div className="esm-done">
              <div className="esm-tick-big">✓</div>
              <div className="esm-title display">Session saved</div>
              <div className="esm-sub">Logged to {customer ? customer.name : 'the guest'}’s CRM timeline.</div>
              <button className="esm-primary" onClick={onClose}>Done</button>
            </div>
          ) : (
            <React.Fragment>
              <div className="esm-kicker">End session</div>
              <div className="esm-title display">{customer ? customer.name : 'This guest'}</div>

              <div className="esm-summary">
                <div className="esm-summary-h mono">Time in the studio · {snap ? fmtMins(snap.durationMs) : '—'}</div>
                {screens.length ? (
                  <div className="esm-screens">
                    {screens.map((s) => (
                      <div key={s.path} className="esm-screen-row">
                        <span>{s.label}</span><span className="mono">{fmtMins(s.ms)}</span>
                      </div>
                    ))}
                  </div>
                ) : <div className="esm-screens esm-muted">No screen dwell captured yet.</div>}
              </div>

              <div className="esm-label mono">Disposition</div>
              <div className="esm-dispo">
                {dispositions.map((d) => (
                  <button key={d} className={'esm-pill' + (pick === d ? ' on' : '')} onClick={() => setPick(d)}>{d}</button>
                ))}
              </div>

              <div className="esm-label mono">Notes (optional)</div>
              <textarea className="esm-notes" rows={3} value={notes} placeholder="Anything the sales team should know…"
                onChange={(e) => setNotes(e.target.value)} />

              {(phase === 'error' || err) && <div className="esm-err">{err}</div>}

              <div className="esm-actions">
                <button className="esm-ghost" onClick={onClose} disabled={phase === 'busy'}>Cancel</button>
                <button className="esm-primary" onClick={submit} disabled={phase === 'busy'}>
                  {phase === 'busy' ? 'Saving…' : 'Submit & end'}
                </button>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    );
  }

  // ── Floating studio controls (by the presenter chip) ────────────────────
  function StudioBar() {
    const sess = window.useUniSession ? window.useUniSession() : null;
    const [, force] = React.useState(0);
    const [modal, setModal] = React.useState(false);
    const startedFor = React.useRef(null);

    // Re-render on presenter change / route change so visibility stays accurate.
    React.useEffect(() => {
      const h = () => force((x) => x + 1);
      window.addEventListener('hashchange', h);
      window.addEventListener('storage', h);
      return () => { window.removeEventListener('hashchange', h); window.removeEventListener('storage', h); };
    }, []);

    // Shim: the instant a customer is claimed, begin the journey tracker so the
    // per-screen dwell times exist for the end-session summary.
    React.useEffect(() => {
      const c = sess && sess.getCustomer && sess.getCustomer();
      if (c && c.id && startedFor.current !== c.id && !sess.isActive()) {
        startedFor.current = c.id;
        sess.start(c);
      }
      if (!c) startedFor.current = null;
    });

    if (!signedIn()) return null;
    const customer = sess && sess.getCustomer && sess.getCustomer();
    const onMiniCrm = (location.hash || '').indexOf('minicrm') >= 0;
    const pres = presenter();

    function lockStudio() {
      // Lock / switch presenter: clear the stored PIN so the next mini-CRM open
      // re-asks for a passcode. Never disturbs the customer's live journey.
      if (window.UNI_PRESENTER) window.UNI_PRESENTER.clear();
      else { try { sessionStorage.removeItem(PKEY); } catch (e) {} }
      if (onMiniCrm && window.navigate) window.navigate('home');
      force((x) => x + 1);
    }

    return (
      <div data-crm="1" className="sbar">
        <style>{MCRM_CSS}</style>
        {!onMiniCrm && (
          <button className="sbar-btn" onClick={() => window.navigate && window.navigate('minicrm')}>
            <span className="sbar-ic">☰</span> Today
          </button>
        )}
        {onMiniCrm && (
          <button className="sbar-btn" onClick={() => window.navigate && window.navigate('home')}>
            <span className="sbar-ic">‹</span> Experience
          </button>
        )}
        {customer && (
          <button className="sbar-btn sbar-end" onClick={() => setModal(true)}>End session</button>
        )}
        <button className="sbar-btn sbar-lock" onClick={lockStudio} title="Lock / switch presenter">
          <span className="sbar-ic">⎋</span> {pres && pres.name ? pres.name.split(' ')[0] : 'Lock'}
        </button>
        {modal && <EndSessionModal onClose={() => setModal(false)} />}
      </div>
    );
  }

  const MCRM_CSS = `
  .mcrm-wrap {
    position: absolute; inset: 0; overflow-y: auto; z-index: 5;
    padding: clamp(48px, 6vw, 110px) clamp(48px, 7vw, 150px) 120px;
    font-family: 'Inter', system-ui, sans-serif; color: #2a2013;
  }
  .mcrm-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 40px; }
  .mcrm-kicker { font: 600 13px/1 'JetBrains Mono', monospace; letter-spacing: 0.3em; text-transform: uppercase; color: #b98f45; margin-bottom: 16px; }
  .mcrm-title.display { font-family: 'Cinzel','Cormorant Garamond',serif; font-weight: 400; font-size: clamp(38px,5vw,64px); color: #1c150c; line-height: 1.06; }
  .mcrm-sub { font-size: clamp(15px,1.5vw,19px); color: rgba(42,32,19,0.6); margin-top: 14px; max-width: 34em; }
  .mcrm-refresh {
    flex-shrink: 0; appearance: none; cursor: pointer; margin-top: 8px;
    font: 700 13px/1 'JetBrains Mono', monospace; letter-spacing: 0.12em; text-transform: uppercase; color: #6a5326;
    background: rgba(201,160,94,0.10); border: 1px solid rgba(201,160,94,0.4); border-radius: 999px; padding: 15px 26px;
  }
  .mcrm-refresh:disabled { opacity: 0.5; cursor: default; }
  .mcrm-empty { font-size: 19px; color: rgba(42,32,19,0.5); padding: 40px 0; }
  .mcrm-empty.mcrm-err { color: #b4564e; }
  /* Horizontal scroll strip of customer cards (client's screenshot layout). */
  .mcrm-strip {
    display: flex; flex-direction: row; gap: 22px;
    overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch;
    padding: 6px 2px 26px; scroll-snap-type: x proximity;
    scrollbar-color: rgba(201,160,94,0.5) transparent;
  }
  .mcrm-strip::-webkit-scrollbar { height: 10px; }
  .mcrm-strip::-webkit-scrollbar-thumb { background: rgba(201,160,94,0.45); border-radius: 999px; }
  .mcrm-strip::-webkit-scrollbar-track { background: transparent; }
  .mcrm-card {
    flex: 0 0 auto; width: 340px; scroll-snap-align: start;
    display: flex; flex-direction: column; gap: 12px;
    background: rgba(255,255,255,0.66); border: 1px solid rgba(201,160,94,0.28); border-radius: 22px;
    padding: 26px 30px; box-shadow: 0 8px 30px rgba(60,44,18,0.06);
  }
  .mcrm-card.is-attended { opacity: 0.82; }
  .mcrm-card-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .mcrm-name { font-family: 'Cormorant Garamond','Cinzel',serif; font-weight: 600; font-size: clamp(26px,2.4vw,32px); color: #1c150c; line-height: 1.05; }
  .mcrm-phone { font-size: 16px; color: rgba(42,32,19,0.72); letter-spacing: 0.08em; }
  .mcrm-chip { font: 600 11px/1 'JetBrains Mono', monospace; letter-spacing: 0.08em; text-transform: uppercase; color: #7a5d28;
    background: rgba(201,160,94,0.16); border-radius: 999px; padding: 7px 12px; }
  .mcrm-owner { font-size: 14px; color: rgba(42,32,19,0.5); }
  .mcrm-card-foot { margin-top: 8px; }
  .mcrm-status { display: inline-flex; align-items: center; gap: 8px; font: 600 12px/1 'JetBrains Mono', monospace; letter-spacing: 0.1em; text-transform: uppercase; }
  .mcrm-status.attended { color: #4a8b52; }
  .mcrm-status.awaiting { color: rgba(42,32,19,0.5); }
  .mcrm-tick { font-size: 15px; }
  .mcrm-dot { width: 9px; height: 9px; border-radius: 50%; background: #c9a05e; box-shadow: 0 0 0 0 rgba(201,160,94,0.6); animation: mcrmPulse 1.8s ease-out infinite; }
  @keyframes mcrmPulse { 0%{box-shadow:0 0 0 0 rgba(201,160,94,0.55)} 100%{box-shadow:0 0 0 12px rgba(201,160,94,0)} }
  .mcrm-start {
    appearance: none; cursor: pointer; border: none; color: #1a130a; width: 100%;
    font: 700 13px/1 'JetBrains Mono', monospace; letter-spacing: 0.12em; text-transform: uppercase; padding: 15px 26px; border-radius: 999px;
    background: linear-gradient(180deg,#ead7a8 0%,#c9a05e 100%); box-shadow: 0 10px 26px rgba(201,160,94,0.3), inset 0 1px 0 rgba(255,255,255,0.5);
  }
  .mcrm-start:active { transform: scale(0.96); }
  .mcrm-start:disabled { opacity: 0.6; cursor: default; }
  .mcrm-start-alt { background: rgba(255,255,255,0.7); color: #6a5326; border: 1px solid rgba(201,160,94,0.45); box-shadow: none; }

  /* Floating studio bar */
  .sbar { position: fixed; left: 18px; bottom: 60px; z-index: 100041; display: flex; gap: 10px; }
  .sbar-btn {
    appearance: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
    font: 600 11px/1 'JetBrains Mono', monospace; letter-spacing: 0.1em; text-transform: uppercase; color: #faf6e8;
    background: rgba(10,10,10,0.72); backdrop-filter: blur(6px); border: 1px solid rgba(232,215,168,0.28); border-radius: 999px; padding: 10px 16px;
  }
  .sbar-btn:hover { background: rgba(10,10,10,0.88); }
  .sbar-ic { font-size: 13px; opacity: 0.85; }
  .sbar-end { color: #1a130a; background: linear-gradient(180deg,#ead7a8 0%,#c9a05e 100%); border-color: transparent; box-shadow: 0 8px 22px rgba(201,160,94,0.3); }
  .sbar-lock { color: rgba(250,246,232,0.82); }
  .sbar-lock:hover { color: #faf6e8; }

  /* End-session modal */
  .esm-overlay { position: fixed; inset: 0; z-index: 100060; display: flex; align-items: center; justify-content: center;
    background: rgba(11,10,8,0.72); backdrop-filter: blur(4px); padding: 24px; font-family: 'Inter', system-ui, sans-serif; }
  .esm-card { width: min(560px, 94vw); max-height: 92vh; overflow-y: auto; background: #fbf6ec; border: 1px solid rgba(201,160,94,0.4);
    border-radius: 24px; padding: 38px clamp(28px,4vw,44px); box-shadow: 0 30px 90px rgba(0,0,0,0.5);
    animation: esmIn 420ms cubic-bezier(.22,1,.36,1) both; }
  @keyframes esmIn { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: none; } }
  .esm-kicker { font: 600 12px/1 'JetBrains Mono', monospace; letter-spacing: 0.28em; text-transform: uppercase; color: #b98f45; margin-bottom: 12px; }
  .esm-title.display { font-family: 'Cinzel','Cormorant Garamond',serif; font-weight: 400; font-size: clamp(26px,3.4vw,38px); color: #1c150c; line-height: 1.1; }
  .esm-summary { margin: 22px 0 8px; background: rgba(201,160,94,0.09); border: 1px solid rgba(201,160,94,0.24); border-radius: 16px; padding: 16px 20px; }
  .esm-summary-h { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #7a5d28; margin-bottom: 10px; }
  .esm-screens { display: flex; flex-direction: column; gap: 7px; }
  .esm-screen-row { display: flex; justify-content: space-between; font-size: 15px; color: #3a2d19; }
  .esm-screen-row .mono { color: rgba(42,32,19,0.62); }
  .esm-muted { color: rgba(42,32,19,0.5); font-size: 14px; }
  .esm-label { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(42,32,19,0.55); margin: 22px 0 10px; }
  .esm-dispo { display: flex; flex-wrap: wrap; gap: 9px; }
  .esm-pill { appearance: none; cursor: pointer; font: 500 14px/1 'Inter', sans-serif; color: #4a3a1e;
    background: rgba(255,255,255,0.7); border: 1px solid rgba(201,160,94,0.4); border-radius: 999px; padding: 11px 18px; }
  .esm-pill.on { color: #1a130a; background: linear-gradient(180deg,#ead7a8 0%,#c9a05e 100%); border-color: transparent; font-weight: 700; box-shadow: 0 6px 16px rgba(201,160,94,0.3); }
  .esm-notes { width: 100%; box-sizing: border-box; resize: vertical; font: 400 15px/1.5 'Inter', sans-serif; color: #2a2013;
    background: rgba(255,255,255,0.8); border: 1px solid rgba(201,160,94,0.35); border-radius: 14px; padding: 14px 16px; outline: none; }
  .esm-notes:focus { border-color: #c9a05e; }
  .esm-err { color: #b4564e; font-size: 14px; margin-top: 14px; }
  .esm-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 26px; }
  .esm-ghost { appearance: none; cursor: pointer; font: 600 13px/1 'JetBrains Mono', monospace; letter-spacing: 0.1em; text-transform: uppercase;
    color: #6a5326; background: transparent; border: 1px solid rgba(201,160,94,0.4); border-radius: 999px; padding: 15px 26px; }
  .esm-primary { appearance: none; cursor: pointer; color: #1a130a; font: 700 13px/1 'JetBrains Mono', monospace; letter-spacing: 0.12em; text-transform: uppercase;
    background: linear-gradient(180deg,#ead7a8 0%,#c9a05e 100%); border: none; border-radius: 999px; padding: 15px 30px; box-shadow: 0 10px 26px rgba(201,160,94,0.3); }
  .esm-primary:disabled, .esm-ghost:disabled { opacity: 0.55; cursor: default; }
  .esm-done { text-align: center; padding: 14px 0; }
  .esm-tick-big { width: 68px; height: 68px; margin: 0 auto 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 34px; color: #fff; background: linear-gradient(180deg,#c9a05e,#a97f3c); box-shadow: 0 12px 30px rgba(201,160,94,0.4); }
  .esm-sub { font-size: 16px; color: rgba(42,32,19,0.62); margin: 12px 0 26px; }
  `;

  window.MiniCRM = MiniCRM;
  window.StudioBar = StudioBar;
})();
