/* ============================================================
   Embassy Citadel — Voice Engine (ECVoiceEngine)
   Offline-first speech recognition for the sales-suite kiosk.

   Primary engine : Vosk (vosk-browser 0.0.8, fully offline WASM)
   Fallback engine: webkitSpeechRecognition (Chrome, online)

   Public API (window.ECVoiceEngine):
     engineName            'vosk' | 'webspeech' | null
     init(opts)  Promise   opts = { vocabulary, onResult, onPartial, onState }
     start()     Promise   begin mic capture + recognition
     stop()                stop mic (engine stays initialized)

   States emitted via onState:
     'loading' | 'ready' | 'listening' | 'paused' | 'error'
   ============================================================ */
(function () {
  'use strict';

  /* ---- paths resolved relative to THIS script file ---- */
  var SCRIPT_BASE = (function () {
    try {
      var s = document.currentScript;
      if (s && s.src) return new URL('.', s.src).href;
    } catch (e) { /* fall through */ }
    return new URL('assets/voice/', document.baseURI).href;
  })();

  var VOSK_JS_URL = SCRIPT_BASE + 'vosk.js';
  var MODEL_URL = SCRIPT_BASE + 'model/vosk-model-small-en-us-0.15.tar.gz';
  var VOSK_TIMEOUT_MS = 45000; /* fall back to Web Speech beyond this */
  var BUFFER_SIZE = 4096;

  /* ---- internal state ---- */
  var cb = { onResult: null, onPartial: null, onState: null };
  var vocabulary = [];
  var currentState = null;
  var initialized = false;
  var listening = false;

  /* vosk */
  var voskModel = null;
  var voskRecognizer = null;
  var audioContext = null;
  var mediaStream = null;
  var sourceNode = null;
  var processorNode = null;

  /* webspeech */
  var speechRec = null;

  /* ---- helpers ---- */
  function setState(s) {
    currentState = s;
    if (typeof cb.onState === 'function') {
      try { cb.onState(s); } catch (e) { console.error('[ECVoice] onState callback failed', e); }
    }
  }

  function emitResult(text) {
    text = (text || '').trim();
    if (!text) return;
    if (typeof cb.onResult === 'function') {
      try { cb.onResult(text); } catch (e) { console.error('[ECVoice] onResult callback failed', e); }
    }
  }

  function emitPartial(text) {
    text = (text || '').trim();
    if (!text) return;
    if (typeof cb.onPartial === 'function') {
      try { cb.onPartial(text); } catch (e) { console.error('[ECVoice] onPartial callback failed', e); }
    }
  }

  function withTimeout(promise, ms, label) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        reject(new Error(label + ' timed out after ' + ms + 'ms'));
      }, ms);
      promise.then(
        function (v) { clearTimeout(timer); resolve(v); },
        function (e) { clearTimeout(timer); reject(e || new Error(label + ' failed')); }
      );
    });
  }

  function injectScript(url) {
    return new Promise(function (resolve, reject) {
      if (window.Vosk) { resolve(); return; }
      var el = document.createElement('script');
      el.src = url;
      el.async = true;
      el.onload = function () {
        if (window.Vosk && typeof window.Vosk.createModel === 'function') resolve();
        else reject(new Error('vosk.js loaded but window.Vosk missing'));
      };
      el.onerror = function () { reject(new Error('Failed to load ' + url)); };
      document.head.appendChild(el);
    });
  }

  /* ============================================================
     VOSK PATH
     ============================================================ */
  function initVosk() {
    /* one shared AudioContext — its real sample rate decides the
       recognizer's sample rate (worker resamples nothing itself) */
    return injectScript(VOSK_JS_URL)
      .then(function () {
        /* createModel resolves on the worker's "load" event; on a
           worker-side error it can reject with undefined or hang —
           the outer withTimeout() in init() covers the hang case. */
        return window.Vosk.createModel(MODEL_URL);
      })
      .then(function (model) {
        voskModel = model;
        if (!audioContext) {
          var AC = window.AudioContext || window.webkitAudioContext;
          audioContext = new AC();
        }
        var grammar;
        if (vocabulary && vocabulary.length) {
          grammar = JSON.stringify(vocabulary.concat(['[unk]']));
        }
        /* constructor signature in vosk-browser 0.0.8:
           new model.KaldiRecognizer(sampleRate, grammar?) */
        voskRecognizer = grammar
          ? new model.KaldiRecognizer(audioContext.sampleRate, grammar)
          : new model.KaldiRecognizer(audioContext.sampleRate);

        voskRecognizer.on('result', function (message) {
          if (message && message.result && typeof message.result.text === 'string') {
            var text = message.result.text.replace(/\[unk\]/g, ' ');
            emitResult(text);
          }
        });
        voskRecognizer.on('partialresult', function (message) {
          if (message && message.result && typeof message.result.partial === 'string') {
            var text = message.result.partial.replace(/\[unk\]/g, ' ');
            emitPartial(text);
          }
        });
      });
  }

  function startVosk() {
    return navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1
      }
    }).then(function (stream) {
      mediaStream = stream;
      if (audioContext.state === 'suspended') audioContext.resume();
      sourceNode = audioContext.createMediaStreamSource(stream);
      processorNode = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);
      processorNode.onaudioprocess = function (event) {
        if (!listening || !voskRecognizer) return;
        try {
          voskRecognizer.acceptWaveform(event.inputBuffer);
        } catch (e) {
          console.error('[ECVoice] acceptWaveform failed', e);
        }
      };
      sourceNode.connect(processorNode);
      /* ScriptProcessorNode only fires when routed to destination;
         we never write to outputBuffer, so it stays silent. */
      processorNode.connect(audioContext.destination);
      listening = true;
      setState('listening');
    });
  }

  function stopVosk() {
    listening = false;
    if (processorNode) {
      processorNode.onaudioprocess = null;
      try { processorNode.disconnect(); } catch (e) { /* noop */ }
      processorNode = null;
    }
    if (sourceNode) {
      try { sourceNode.disconnect(); } catch (e) { /* noop */ }
      sourceNode = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(function (t) { t.stop(); });
      mediaStream = null;
    }
    /* keep audioContext + recognizer alive for fast resume */
  }

  /* ============================================================
     WEB SPEECH PATH (fallback)
     ============================================================ */
  function initWebSpeech() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      return Promise.reject(new Error('webkitSpeechRecognition not available'));
    }
    speechRec = new SR();
    speechRec.continuous = false;
    speechRec.interimResults = true;
    speechRec.lang = 'en-IN';

    speechRec.onresult = function (event) {
      var interim = '';
      for (var i = event.resultIndex; i < event.results.length; i++) {
        var res = event.results[i];
        var text = res[0] && res[0].transcript ? res[0].transcript : '';
        if (res.isFinal) emitResult(text);
        else interim += text;
      }
      if (interim) emitPartial(interim);
    };
    speechRec.onerror = function (event) {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        listening = false;
        setState('error');
      }
      /* 'no-speech' / 'aborted' / 'network' → onend handles restart */
    };
    speechRec.onend = function () {
      /* continuous:false ends after each utterance — auto-restart
         for hands-free operation while we are meant to be listening */
      if (listening && currentState === 'listening') {
        try { speechRec.start(); } catch (e) { /* already started */ }
      }
    };
    return Promise.resolve();
  }

  function startWebSpeech() {
    /* prime mic permission explicitly so denial maps to 'error' */
    return navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 }
    }).then(function (stream) {
      /* Web Speech manages its own capture — release our handle */
      stream.getTracks().forEach(function (t) { t.stop(); });
      listening = true;
      setState('listening');
      try { speechRec.start(); } catch (e) { /* already started */ }
    });
  }

  function stopWebSpeech() {
    listening = false;
    if (speechRec) {
      try { speechRec.stop(); } catch (e) { /* noop */ }
    }
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */
  window.ECVoiceEngine = {
    engineName: null,

    init: function (opts) {
      opts = opts || {};
      vocabulary = Array.isArray(opts.vocabulary) ? opts.vocabulary.slice() : [];
      cb.onResult = opts.onResult || null;
      cb.onPartial = opts.onPartial || null;
      cb.onState = opts.onState || null;

      if (initialized) return Promise.resolve();
      setState('loading');

      var self = this;
      return withTimeout(initVosk(), VOSK_TIMEOUT_MS, 'Vosk init')
        .then(function () {
          self.engineName = 'vosk';
          initialized = true;
          setState('ready');
        })
        .catch(function (voskErr) {
          console.warn('[ECVoice] Vosk unavailable, falling back to Web Speech:', voskErr);
          return initWebSpeech()
            .then(function () {
              self.engineName = 'webspeech';
              initialized = true;
              setState('ready');
            })
            .catch(function (wsErr) {
              console.error('[ECVoice] No speech engine available', wsErr);
              self.engineName = null;
              setState('error');
              throw wsErr;
            });
        });
    },

    start: function () {
      var self = this;
      if (!initialized) {
        setState('error');
        return Promise.reject(new Error('ECVoiceEngine.init() must complete before start()'));
      }
      if (listening) return Promise.resolve();

      var begin = self.engineName === 'vosk' ? startVosk() : startWebSpeech();
      return begin.catch(function (err) {
        /* getUserMedia denial or device failure */
        console.error('[ECVoice] start failed', err);
        listening = false;
        setState('error');
        throw err;
      });
    },

    stop: function () {
      if (!initialized) return;
      if (this.engineName === 'vosk') stopVosk();
      else if (this.engineName === 'webspeech') stopWebSpeech();
      setState('paused');
    }
  };
})();
