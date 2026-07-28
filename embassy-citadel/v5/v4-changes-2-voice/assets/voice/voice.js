/* ════════════════════════════════════════════════════════════════════
   EMBASSY CITADEL — VOICE CONCIERGE ORCHESTRATOR  (assets/voice/voice.js)
   ────────────────────────────────────────────────────────────────────
   · Consumes  window.ECVoiceEngine  (assets/voice/engine.js)
       { engineName, init({vocabulary,onResult,onPartial,onState}),
         start(), stop() }   states: loading|ready|listening|paused|error
   · Consumes  window.ECIntents     (assets/voice/intents.js)
       { intents, vocabulary(), match(text) → {id, action:{page,say}}|null }
   · Exposes   window.ECVoice = { activate(), deactivate(), active() }
   · Activation flag: sessionStorage 'ec.voice' === '1'
   · HUD lives OUTSIDE the 1440×900 design stage — position:fixed on
     <body>, so it never scales with the stage transform.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.ECVoice) return;                       /* idempotent */

  var FLAG = 'ec.voice';
  var CHIP_IDLE_MS = 3500;
  var HELP_AUTO_MS = 12000;
  var NAV_DELAY_MS = 700;
  var DTAP_MS      = 400;

  /* ─── state ──────────────────────────────────────────────────── */
  var els          = null;     /* HUD element refs                  */
  var helpEl       = null;     /* help card root                    */
  var engineReady  = false;
  var paused       = false;
  var uiState      = 'idle';
  var chipTimer    = null;
  var flashTimer   = null;
  var helpTimer    = null;
  var navTimer     = null;
  var hintSpoken   = false;    /* once per page — don't nag         */
  var voicePick    = null;

  /* ─── small utils ────────────────────────────────────────────── */
  function flagOn () {
    try { return sessionStorage.getItem(FLAG) === '1'; } catch (e) { return false; }
  }
  function setFlag (on) {
    try {
      if (on) sessionStorage.setItem(FLAG, '1');
      else    sessionStorage.removeItem(FLAG);
    } catch (e) {}
  }
  function pageName () {
    var p = (location.pathname.split('/').pop() || 'index.html');
    return p.toLowerCase();
  }
  function samePage (page) {
    if (!page) return true;
    var t = String(page).split('/').pop().split('?')[0].split('#')[0].toLowerCase();
    return t === pageName();
  }
  function destLabel (page) {
    var names = {
      'home.html':             'Home',
      'gallery.html':          'Gallery',
      'masterplan.html':       'Master Plan',
      'inventory.html':        'Residences',
      'inventory-floors.html': 'Residences',
      'floor-plan.html':       'Floor Plans',
      'floor-units.html':      'Typical Floor',
      'unit-detail.html':      'Residence',
      'amenities.html':        'Amenities',
      'location.html':         'Location',
      'tools.html':            'Tools',
      'about.html':            'About',
      'gre.html':              'Concierge',
      'intro.html':            'Entrance'
    };
    var key = String(page || '').split('/').pop().toLowerCase();
    if (names[key]) return names[key];
    return key.replace(/\.html?$/, '').replace(/[-_]+/g, ' ') || 'There';
  }

  /* ─── speech ─────────────────────────────────────────────────── */
  function refreshVoice () {
    if (!('speechSynthesis' in window)) return null;
    var vs = [];
    try { vs = speechSynthesis.getVoices() || []; } catch (e) { return null; }
    var i, pref = null;
    for (i = 0; i < vs.length && !pref; i++) if (/^en[-_]GB/i.test(vs[i].lang)) pref = vs[i];
    for (i = 0; i < vs.length && !pref; i++) if (/^en[-_]IN/i.test(vs[i].lang)) pref = vs[i];
    for (i = 0; i < vs.length && !pref; i++) if (/^en/i.test(vs[i].lang))       pref = vs[i];
    voicePick = pref;
    return pref;
  }
  if ('speechSynthesis' in window) {
    try { speechSynthesis.onvoiceschanged = function () { refreshVoice(); }; } catch (e) {}
  }
  function speak (text) {
    if (!('speechSynthesis' in window) || !text) return;
    try {
      var u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      var v = voicePick || refreshVoice();
      if (v) u.voice = v;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* ─── HUD styles (injected once, all prefixed ecv-) ──────────── */
  var CSS = "" +
  ".ecv-root{position:fixed;right:100px;bottom:22px;z-index:9990;display:flex;align-items:center;gap:14px;" +
    "font-family:'Lato',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;pointer-events:none;" +
    "opacity:0;transform:translateY(8px);transition:opacity 420ms ease,transform 420ms cubic-bezier(.22,1,.36,1);}" +
  ".ecv-root.ecv-on{opacity:1;transform:none;}" +
  ".ecv-root *{box-sizing:border-box;margin:0;padding:0;}" +

  /* ── transcript chip (slides out to the LEFT of the medallion) ── */
  ".ecv-chip{display:flex;flex-direction:column;align-items:flex-end;gap:2px;max-width:340px;" +
    "padding:9px 14px 8px;background:#FCFAF4;border:1px solid rgba(148,111,56,0.34);border-radius:2px;" +
    "box-shadow:0 12px 28px -10px rgba(120,95,55,0.24),0 2px 8px rgba(70,50,22,0.08);" +
    "opacity:0;transform:translateX(12px);pointer-events:none;text-align:right;" +
    "transition:opacity 260ms ease,transform 300ms cubic-bezier(.22,1,.36,1);}" +
  ".ecv-root.ecv-chip-on .ecv-chip{opacity:1;transform:none;}" +
  ".ecv-chip-partial{display:none;font-style:italic;font-weight:300;font-size:13px;line-height:1.5;color:#1F1B15;opacity:.6;}" +
  ".ecv-chip-final{display:none;font-weight:400;font-size:13px;line-height:1.5;color:#1F1B15;}" +
  ".ecv-chip-final.ecv-hint{font-style:italic;color:#6E5A37;}" +
  ".ecv-chip-dest{display:none;font-family:'Cinzel',serif;font-weight:600;font-size:11px;letter-spacing:.22em;" +
    "text-transform:uppercase;color:#946F38;margin-top:3px;}" +

  /* ── concierge medallion (kin to home centerpiece disc) ───────── */
  ".ecv-medallion{position:relative;width:64px;height:64px;border-radius:50%;pointer-events:auto;cursor:pointer;" +
    "-webkit-tap-highlight-color:transparent;display:grid;place-items:center;border:1.5px solid rgba(180,145,80,0.55);" +
    "background:" +
      "radial-gradient(ellipse 85% 55% at 50% -8%,rgba(255,255,255,0.85),transparent 65%)," +
      "radial-gradient(ellipse 80% 50% at 50% 108%,rgba(180,158,115,0.28),transparent 70%)," +
      "radial-gradient(circle at 35% 25%,rgba(255,255,255,0.55),transparent 60%)," +
      "linear-gradient(160deg,#FCFAF4 0%,#F7F5EF 55%,#E8E2D6 100%);" +
    "box-shadow:" +
      "8px 16px 34px -10px rgba(120,95,55,0.26)," +
      "3px 6px 12px rgba(70,50,22,0.13)," +
      "inset 0 2px 0 rgba(255,255,255,0.95)," +
      "inset 0 4px 9px rgba(255,255,255,0.55)," +
      "inset 1px 0 0 rgba(255,255,255,0.45)," +
      "inset 0 -9px 16px rgba(190,168,130,0.50)," +
      "inset 0 -2px 0 rgba(148,111,56,0.30);" +
    "transition:border-color 260ms ease,transform 220ms cubic-bezier(.22,1,.36,1),box-shadow 260ms ease;}" +
  ".ecv-medallion:active{transform:scale(.96);}" +

  /* breathing halo ring (::after) */
  ".ecv-medallion::after{content:'';position:absolute;inset:-7px;border-radius:50%;" +
    "border:1px solid rgba(201,165,103,0.60);" +
    "box-shadow:0 0 18px rgba(217,185,122,0.35),inset 0 0 10px rgba(217,185,122,0.16);" +
    "opacity:0;transform:scale(.94);pointer-events:none;transition:opacity 320ms ease,transform 320ms ease;}" +
  ".ecv-root.ecv-listening .ecv-medallion::after{opacity:1;animation:ecvBreathe 2.4s ease-in-out infinite;}" +
  "@keyframes ecvBreathe{0%,100%{opacity:.35;transform:scale(.96);}50%{opacity:.85;transform:scale(1.05);}}" +

  /* loading — small rotating gold arc (::before) */
  ".ecv-medallion::before{content:'';position:absolute;inset:-7px;border-radius:50%;" +
    "border:1.5px solid transparent;border-top-color:#C9A567;opacity:0;pointer-events:none;}" +
  ".ecv-root.ecv-loading .ecv-medallion::before{opacity:1;animation:ecvSpin 1.1s linear infinite;}" +
  "@keyframes ecvSpin{to{transform:rotate(360deg);}}" +

  /* heard — brief brighter flash */
  ".ecv-root.ecv-flash .ecv-medallion{border-color:rgba(201,165,103,0.95);" +
    "box-shadow:8px 16px 34px -10px rgba(120,95,55,0.26),3px 6px 12px rgba(70,50,22,0.13)," +
    "0 0 26px rgba(217,185,122,0.55),inset 0 2px 0 rgba(255,255,255,0.95)," +
    "inset 0 -9px 16px rgba(190,168,130,0.50);}" +
  ".ecv-root.ecv-flash .ecv-medallion::after{opacity:1;transform:scale(1.08);animation:none;}" +

  /* paused — ring static at 40% */
  ".ecv-root.ecv-paused .ecv-medallion::after{opacity:.4;transform:scale(.96);animation:none;}" +
  ".ecv-root.ecv-paused .ecv-mic{opacity:.45;}" +

  /* error — muted red-brown ring + tooltip */
  ".ecv-root.ecv-error .ecv-medallion{border-color:rgba(122,62,48,0.62);}" +
  ".ecv-root.ecv-error .ecv-medallion::after{opacity:.5;transform:scale(.96);animation:none;" +
    "border-color:rgba(122,62,48,0.45);box-shadow:none;}" +
  ".ecv-root.ecv-error .ecv-mic{color:#7A4434;opacity:.8;}" +
  ".ecv-tip{position:absolute;right:0;bottom:78px;white-space:nowrap;padding:6px 12px;" +
    "background:#FCFAF4;border:1px solid rgba(122,62,48,0.4);border-radius:2px;" +
    "font-size:11px;letter-spacing:.04em;color:#5C3327;" +
    "box-shadow:0 8px 20px -8px rgba(70,50,22,0.2);opacity:0;pointer-events:none;transition:opacity 260ms ease;}" +
  ".ecv-root.ecv-error .ecv-tip{opacity:1;}" +

  /* mic glyph */
  ".ecv-mic{position:relative;z-index:2;width:22px;height:22px;color:#946F38;opacity:.92;" +
    "filter:drop-shadow(0 1px 0 rgba(255,255,255,0.5));transition:opacity 240ms ease,color 240ms ease;}" +
  ".ecv-mic svg{width:100%;height:100%;display:block;}" +

  /* ── help card ─────────────────────────────────────────────────── */
  ".ecv-help{position:fixed;inset:0;z-index:9994;display:grid;place-items:center;" +
    "background:rgba(26,24,20,0.22);opacity:0;pointer-events:none;transition:opacity 320ms ease;" +
    "font-family:'Lato',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}" +
  ".ecv-help.ecv-on{opacity:1;pointer-events:auto;}" +
  ".ecv-help-panel{position:relative;background:#FCFAF4;border:1px solid rgba(148,111,56,0.42);" +
    "padding:42px 50px 32px;max-width:620px;width:calc(100vw - 64px);text-align:center;" +
    "box-shadow:0 34px 90px -24px rgba(20,14,6,0.4),0 10px 30px rgba(20,14,6,0.14);" +
    "transform:translateY(10px) scale(.985);transition:transform 360ms cubic-bezier(.22,1,.36,1);}" +
  ".ecv-help.ecv-on .ecv-help-panel{transform:none;}" +
  ".ecv-help-panel::before{content:'';position:absolute;inset:9px;border:1px solid rgba(148,111,56,0.18);pointer-events:none;}" +
  ".ecv-help-h{font-family:'Cinzel',serif;font-weight:600;font-size:17px;letter-spacing:.34em;" +
    "text-transform:uppercase;color:#1A1814;padding-left:.34em;}" +
  ".ecv-help-rule{width:56px;height:1px;background:rgba(148,111,56,0.55);margin:16px auto 24px;}" +
  ".ecv-help-list{columns:2;column-gap:40px;text-align:left;list-style:none;}" +
  ".ecv-help-list li{font-weight:400;font-size:13px;line-height:2.15;color:#3A332A;" +
    "break-inside:avoid;white-space:nowrap;}" +
  ".ecv-help-list li::before{content:'';display:inline-block;width:3px;height:3px;background:#946F38;" +
    "transform:rotate(45deg);margin-right:11px;vertical-align:2px;opacity:.55;}" +
  ".ecv-help-foot{margin-top:26px;font-size:9px;font-weight:500;letter-spacing:.36em;" +
    "text-transform:uppercase;color:#946F38;opacity:.7;padding-left:.36em;}" +

  "@media (prefers-reduced-motion:reduce){" +
    ".ecv-medallion::after,.ecv-medallion::before{animation:none!important;}}";

  var MIC_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="9" y="3" width="6" height="11" rx="3"/>' +
    '<path d="M5.5 11.5a6.5 6.5 0 0 0 13 0"/>' +
    '<line x1="12" y1="18" x2="12" y2="21"/>' +
    '<line x1="8.5" y1="21" x2="15.5" y2="21"/>' +
    '</svg>';

  /* ─── HUD build / teardown ───────────────────────────────────── */
  function injectStyle () {
    if (document.getElementById('ecv-style')) return;
    var s = document.createElement('style');
    s.id = 'ecv-style';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function buildHUD () {
    if (els || !document.body) return;
    injectStyle();

    var root = document.createElement('div');
    root.className = 'ecv-root';
    root.setAttribute('role', 'status');
    root.setAttribute('aria-live', 'polite');

    var chip = document.createElement('div');
    chip.className = 'ecv-chip';
    var partial = document.createElement('div'); partial.className = 'ecv-chip-partial';
    var fin     = document.createElement('div'); fin.className     = 'ecv-chip-final';
    var dest    = document.createElement('div'); dest.className    = 'ecv-chip-dest';
    chip.appendChild(partial); chip.appendChild(fin); chip.appendChild(dest);

    var med = document.createElement('button');
    med.type = 'button';
    med.className = 'ecv-medallion';
    med.setAttribute('aria-label', 'Voice guide — tap to pause or resume');

    var mic = document.createElement('span');
    mic.className = 'ecv-mic';
    mic.innerHTML = MIC_SVG;

    var tip = document.createElement('div');
    tip.className = 'ecv-tip';

    med.appendChild(mic);
    med.appendChild(tip);
    root.appendChild(chip);
    root.appendChild(med);
    document.body.appendChild(root);

    els = { root: root, chip: chip, partial: partial, fin: fin, dest: dest, med: med, tip: tip };

    med.addEventListener('click', function (e) {
      e.stopPropagation();
      togglePause();
    });

    /* settle in on next frame */
    requestAnimationFrame(function () { root.classList.add('ecv-on'); });
  }

  function removeHUD () {
    if (els && els.root && els.root.parentNode) els.root.parentNode.removeChild(els.root);
    els = null;
    if (helpEl && helpEl.parentNode) helpEl.parentNode.removeChild(helpEl);
    helpEl = null;
    clearTimeout(chipTimer); clearTimeout(flashTimer);
    clearTimeout(helpTimer); clearTimeout(navTimer);
  }

  /* ─── HUD state + chip helpers ───────────────────────────────── */
  var STATES = ['ecv-loading', 'ecv-listening', 'ecv-paused', 'ecv-error'];
  function setUI (s) {
    uiState = s;
    if (!els) return;
    for (var i = 0; i < STATES.length; i++) els.root.classList.remove(STATES[i]);
    if (s === 'loading')   els.root.classList.add('ecv-loading');
    if (s === 'listening') els.root.classList.add('ecv-listening');
    if (s === 'paused')    els.root.classList.add('ecv-paused');
    if (s === 'error')     els.root.classList.add('ecv-error');
  }

  function chipShow () {
    if (!els) return;
    els.root.classList.add('ecv-chip-on');
    clearTimeout(chipTimer);
    chipTimer = setTimeout(function () {
      if (els) els.root.classList.remove('ecv-chip-on');
    }, CHIP_IDLE_MS);
  }
  function chipPartial (t) {
    if (!els) return;
    els.partial.textContent = t;
    els.partial.style.display = 'block';
    els.fin.style.display = 'none';
    els.dest.style.display = 'none';
    chipShow();
  }
  function chipFinal (t, isHint) {
    if (!els) return;
    els.partial.style.display = 'none';
    els.fin.textContent = t;
    els.fin.classList[isHint ? 'add' : 'remove']('ecv-hint');
    els.fin.style.display = 'block';
    els.dest.style.display = 'none';
    chipShow();
  }
  function chipDest (label) {
    if (!els) return;
    els.dest.textContent = '→ ' + label;
    els.dest.style.display = 'block';
    chipShow();
  }
  function chipNote (label) {           /* Cinzel-gold standalone note */
    if (!els) return;
    els.partial.style.display = 'none';
    els.fin.style.display = 'none';
    els.dest.textContent = label;
    els.dest.style.display = 'block';
    chipShow();
  }
  function flash () {
    if (!els) return;
    els.root.classList.add('ecv-flash');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () {
      if (els) els.root.classList.remove('ecv-flash');
    }, 520);
  }
  function uiError (msg) {
    buildHUD();
    if (els) els.tip.textContent = msg || 'Voice guide unavailable';
    setUI('error');
  }

  /* ─── help card ──────────────────────────────────────────────── */
  var EXAMPLES = [
    '“Show me the gallery”',
    '“Open the master plan”',
    '“Show me the residences”',
    '“What amenities are there”',
    '“Where is this located”',
    '“Show me a three bedroom”',
    '“Tell me about the tower”',
    '“Show a typical floor”',
    '“Take me home”',
    '“Stop listening”'
  ];
  function buildHelp () {
    if (helpEl || !document.body) return;
    injectStyle();
    helpEl = document.createElement('div');
    helpEl.className = 'ecv-help';
    var panel = document.createElement('div');
    panel.className = 'ecv-help-panel';

    var h = document.createElement('div');
    h.className = 'ecv-help-h';
    h.textContent = 'You May Ask';
    var rule = document.createElement('div');
    rule.className = 'ecv-help-rule';
    var ul = document.createElement('ul');
    ul.className = 'ecv-help-list';
    for (var i = 0; i < EXAMPLES.length; i++) {
      var li = document.createElement('li');
      li.textContent = EXAMPLES[i];
      ul.appendChild(li);
    }
    var foot = document.createElement('div');
    foot.className = 'ecv-help-foot';
    foot.textContent = 'Tap anywhere to continue';

    panel.appendChild(h); panel.appendChild(rule);
    panel.appendChild(ul); panel.appendChild(foot);
    helpEl.appendChild(panel);
    document.body.appendChild(helpEl);

    helpEl.addEventListener('pointerdown', function () { hideHelp(); });
  }
  function showHelp () {
    buildHelp();
    if (!helpEl) return;
    /* force a frame so the transition runs even right after build */
    requestAnimationFrame(function () {
      if (helpEl) helpEl.classList.add('ecv-on');
    });
    clearTimeout(helpTimer);
    helpTimer = setTimeout(hideHelp, HELP_AUTO_MS);
  }
  function hideHelp () {
    clearTimeout(helpTimer);
    if (helpEl) helpEl.classList.remove('ecv-on');
  }
  function toggleHelp () {
    if (helpEl && helpEl.classList.contains('ecv-on')) hideHelp();
    else showHelp();
  }

  /* ─── engine wiring ──────────────────────────────────────────── */
  function onEngineState (s) {
    if (!flagOn()) return;
    if (s === 'error') { uiError('Voice engine error — tap to retry'); return; }
    if (paused && s !== 'listening') { setUI('paused'); return; }
    if (s === 'loading')   setUI('loading');
    else if (s === 'listening') { paused = false; setUI('listening'); }
    else if (s === 'paused')    { paused = true;  setUI('paused'); }
    else setUI('ready');
  }

  function onPartial (text) {
    if (!flagOn() || !text) return;
    chipPartial(text);
  }

  function onResult (text) {
    if (!flagOn()) return;
    text = String(text || '').trim();
    if (!text) return;
    chipFinal('“' + text + '”');
    flash();

    var m = null;
    try {
      if (window.ECIntents && typeof window.ECIntents.match === 'function')
        m = window.ECIntents.match(text);
    } catch (e) { m = null; }

    if (!m) {
      chipFinal('Try: ‘show me the gallery’', true);
      if (!hintSpoken) {
        hintSpoken = true;
        speak('You can ask for any part of the project.');
      }
      return;
    }

    if (m.id === 'voice-off') {
      speak('Voice guide off.');
      deactivate();
      return;
    }
    if (m.id === 'help') {
      toggleHelp();
      return;
    }

    var page = m.action && m.action.page;
    var say  = m.action && m.action.say;
    chipDest(destLabel(page));
    if (say) speak(say);
    if (page && !samePage(page)) {
      clearTimeout(navTimer);
      navTimer = setTimeout(function () {
        try { window.location.href = page; } catch (e) {}
      }, NAV_DELAY_MS);
    }
  }

  function ensureEngine () {
    if (engineReady) return Promise.resolve();
    if (!window.ECVoiceEngine || typeof window.ECVoiceEngine.init !== 'function') {
      uiError('Voice engine unavailable');
      return Promise.reject(new Error('ECVoiceEngine missing'));
    }
    var vocab = [];
    try {
      if (window.ECIntents && typeof window.ECIntents.vocabulary === 'function')
        vocab = window.ECIntents.vocabulary() || [];
    } catch (e) { vocab = []; }
    setUI('loading');
    return Promise.resolve(window.ECVoiceEngine.init({
      vocabulary: vocab,
      onResult:   onResult,
      onPartial:  onPartial,
      onState:    onEngineState
    })).then(function () { engineReady = true; });
  }

  function startListening () {
    return ensureEngine()
      .then(function () { return window.ECVoiceEngine.start(); })
      .catch(function () { /* uiError already shown */ });
  }

  function togglePause () {
    if (!flagOn()) return;
    if (uiState === 'error') { startListening(); return; }
    if (!engineReady) return;
    if (paused) {
      paused = false;
      try { window.ECVoiceEngine.start(); } catch (e) {}
      setUI('listening');
    } else {
      paused = true;
      try { window.ECVoiceEngine.stop(); } catch (e) {}
      setUI('paused');
    }
  }

  /* ─── public lifecycle ───────────────────────────────────────── */
  function active () { return flagOn(); }

  function activate () {
    if (flagOn() && els) return;
    setFlag(true);
    paused = false;
    buildHUD();
    chipNote('Voice Guide Active');
    startListening();
  }

  function deactivate () {
    setFlag(false);
    paused = false;
    try {
      if (window.ECVoiceEngine && typeof window.ECVoiceEngine.stop === 'function')
        window.ECVoiceEngine.stop();
    } catch (e) {}
    hideHelp();
    removeHUD();
  }

  function toggle () { if (active()) deactivate(); else activate(); }

  /* ─── home binding — single tap on the centerpiece (.core) toggles ─ */
  function bindHomeToggle () {
    if (pageName() !== 'home.html') return;
    if (!document.querySelector) return;                 /* feature-detect */
    var core = document.querySelector('.core');
    if (!core || !core.addEventListener) return;
    core.style.cursor = 'pointer';
    var downX = 0, downY = 0;
    core.addEventListener('pointerdown', function (e) { downX = e.clientX; downY = e.clientY; });
    core.addEventListener('pointerup', function (e) {
      /* ignore drags — only a clean tap toggles */
      if (Math.abs(e.clientX - downX) > 12 || Math.abs(e.clientY - downY) > 12) return;
      toggle();
    });
  }

  /* ─── boot ───────────────────────────────────────────────────── */
  function boot () {
    if (!document.body) return;                          /* guard odd contexts */
    refreshVoice();
    bindHomeToggle();
    if (flagOn()) {
      buildHUD();
      startListening();
    }
  }

  window.ECVoice = { activate: activate, deactivate: deactivate, active: active };

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', boot);
  else
    boot();
})();
