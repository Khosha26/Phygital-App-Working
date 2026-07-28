/* ============================================================
   Embassy Citadel — Voice Intent Map
   ------------------------------------------------------------
   window.ECIntents = { intents, vocabulary(), match(text) }

   Phrases are written the way speech-to-text emits them:
   lowercase, no punctuation, numbers as words ("three b h k").
   vocabulary() feeds the constrained recognizer grammar.
   match(text) resolves an utterance to one intent (or null).

   DEEP-LINK MECHANISMS (verified in the v4 codebase — do not
   invent new ones):

   1. tools.html  — reads ?tool=price|emi|fsi from the query
      string on load and opens that tool (tools.html:1801-1807).
      → action.params.query = { tool: '...' }

   2. unit-detail.html — reads hash params on load:
      new URLSearchParams(location.hash.slice(1)) keys 'unit'
      and 'floor'; unit validated against
      N01 N02 N03 S01 S02 S03 MN MS; mansion codes (MN/MS)
      force floor 79 (unit-detail.html:1062-1073).
      → action.params.hash = { unit: 'N03', floor: '45' }

   3. floor-plan.html — consumes sessionStorage 'ec.floor' and
      'ec.section' once on load: preselects the matching plan
      (refuge / amenity level, else the typical band containing
      the level), sets window.__ecDeepLinked = true and skips
      the picker (floor-plan.html:2454-2497).
      → action.params.session = { 'ec.floor': '45' }

   4. floor-units.html — reads sessionStorage 'ec.floor'
      (default 45) and 'ec.section' (default 'residential')
      on load (floor-units.html:751-753). Defaults are fine,
      so no params are set here.

   No other page accepts a content deep link. masterplan.html's
   focusMarker() is internal only (tap handlers); ?from=home on
   gallery / amenities / masterplan / tools / home is a cosmetic
   fast-entry veil, not a content link — both are left alone.

   The navigation layer should apply params in this order:
   set params.session keys via sessionStorage.setItem, then
   navigate to page + ('?' + params.query) + ('#' + params.hash).
   action.back === true  → history.back().
   action.control        → app-level ('stop' | 'help'), no nav.
   ============================================================ */
(function () {
  'use strict';

  var INTENTS = [

    /* ───────────── Global controls ───────────── */
    {
      id: 'home',
      phrases: [
        'go home', 'home screen', 'take me home',
        'go to the home screen', 'show me the index', 'main menu'
      ],
      keywords: ['home', 'index', 'main menu'],
      action: { page: 'home.html', say: 'Returning to the index.' }
    },
    {
      id: 'back',
      phrases: ['go back', 'take me back', 'previous screen', 'back up'],
      keywords: ['back', 'previous'],
      action: { page: null, back: true, say: 'Going back.' }
    },
    {
      id: 'voice-off',
      phrases: [
        'stop listening', 'voice off', 'stop voice',
        'turn off the voice', 'be quiet'
      ],
      keywords: ['stop listening', 'voice off', 'quiet', 'mute'],
      action: { page: null, control: 'stop', say: 'Voice off.' }
    },
    {
      id: 'help',
      phrases: [
        'help', 'what can i say', 'what can i ask',
        'show me the commands', 'voice help'
      ],
      keywords: ['help', 'commands', 'what can i say'],
      action: {
        page: null, control: 'help',
        say: 'Ask for the gallery, plans, amenities, or location.'
      }
    },
    {
      id: 'intro',
      phrases: ['go to the threshold', 'start over', 'restart the experience'],
      keywords: ['threshold', 'start over', 'restart'],
      action: { page: 'intro.html', say: 'Returning to the threshold.' }
    },

    /* ───────────── Chapters ───────────── */
    {
      id: 'gallery',
      phrases: [
        'open the gallery', 'show me the gallery', 'go to the gallery',
        'show me photos', 'show me the pictures', 'show me the renders',
        'show me the view', 'show me the views', 'play the film',
        'show me the film', 'show me the interiors', 'show me the exteriors'
      ],
      keywords: [
        'gallery', 'photos', 'pictures', 'renders', 'film',
        'views', 'view', 'interiors', 'exteriors', 'images'
      ],
      action: { page: 'gallery.html', say: 'Opening the gallery.' }
    },
    {
      id: 'masterplan',
      phrases: [
        'show me the master plan', 'open the master plan',
        'go to the master plan', 'show me the site plan',
        'show me the site', 'tell me about the towers',
        'show me the towers', 'show me the grounds'
      ],
      keywords: ['master plan', 'master plans', 'master', 'masterplan', 'site plan', 'towers', 'grounds', 'site'],
      action: { page: 'masterplan.html', say: 'Here is the master plan.' }
    },
    {
      id: 'amenities',
      phrases: [
        'go to amenities', 'open the amenities', 'show me the amenities',
        'what facilities do you have', 'what amenities do you have',
        'show me the pool', 'show me the swimming pool',
        'where is the gym', 'show me the gym', 'show me the spa',
        'show me the club house', 'what about sports'
      ],
      keywords: [
        'amenities', 'facilities', 'pool', 'swimming', 'gym', 'gymnasium',
        'spa', 'club house', 'clubhouse', 'sports', 'tennis', 'bowling',
        'concierge', 'salon', 'banquet', 'lounge'
      ],
      action: { page: 'amenities.html', say: 'Opening the amenities.' }
    },
    {
      id: 'inventory',
      phrases: [
        'open the inventory', 'show me the inventory', 'what is available',
        'show me what is available', 'which homes are available',
        'check availability'
      ],
      keywords: ['inventory', 'available', 'availability'],
      action: { page: 'inventory.html', say: 'Here is the inventory.' }
    },
    {
      id: 'floors',
      phrases: [
        'choose a floor', 'show me the floors', 'pick a floor',
        'go to the floors'
      ],
      keywords: ['choose a floor', 'pick a floor', 'floors'],
      action: { page: 'inventory-floors.html', say: 'Choose a floor.' }
    },
    {
      id: 'floor-plans',
      phrases: [
        'show me the plans', 'show me the floor plans',
        'open the floor plans', 'go to floor plans', 'compare the plans',
        'how big are the apartments', 'show me the layouts',
        'what are the sizes', 'show me apartment sizes'
      ],
      keywords: ['floor plans', 'plans', 'layouts', 'sizes', 'how big', 'carpet area'],
      action: { page: 'floor-plan.html', say: 'Here are the floor plans.' }
    },
    {
      /* Deep link #3: sessionStorage ec.floor → floor-plan.html
         preselects the typical band containing level 45 and
         skips the picker (floor-plan.html:2454-2497). */
      id: 'typical-floor',
      phrases: [
        'what is on a typical floor', 'show me a typical floor',
        'typical floor plan'
      ],
      keywords: ['typical floor', 'typical'],
      action: {
        page: 'floor-plan.html',
        params: { session: { 'ec.floor': '45' } },
        say: 'Here is a typical floor.'
      }
    },
    {
      id: 'residences',
      phrases: [
        'i want to see the homes', 'show me the homes',
        'show me the residences', 'choose a residence',
        'show me the apartments', 'show me the units',
        'explore the residences'
      ],
      keywords: ['homes', 'residences', 'residence', 'apartments', 'units'],
      action: { page: 'floor-units.html', say: 'Opening the residences.' }
    },

    /* ───────────── Residence types (deep link #2: unit-detail hash) ───────────── */
    {
      /* N03 is the three-bedroom line (1,843–1,901 sqft). */
      id: 'three-bed',
      phrases: [
        'what does a three bedroom look like', 'show me a three bedroom',
        'three bedroom', 'show me the three b h k', 'three b h k',
        'show me a three b h k apartment'
      ],
      keywords: ['three bedroom', 'three b h k'],
      action: {
        page: 'unit-detail.html',
        params: { hash: { unit: 'N03', floor: '45' } },
        say: 'Here is a three bedroom residence.'
      }
    },
    {
      /* N01 is a four-bedroom line (3,072–3,247 sqft). */
      id: 'four-bed',
      phrases: [
        'what does a four bedroom look like', 'show me a four bedroom',
        'four bedroom', 'four b h k', 'show me the four b h k'
      ],
      keywords: ['four bedroom', 'four b h k'],
      action: {
        page: 'unit-detail.html',
        params: { hash: { unit: 'N01', floor: '45' } },
        say: 'Here is a four bedroom residence.'
      }
    },
    {
      /* N02 at level 55 is a five-bedroom refuge plan (5,534 sqft). */
      id: 'five-bed',
      phrases: ['show me a five bedroom', 'five bedroom', 'five b h k'],
      keywords: ['five bedroom', 'five b h k'],
      action: {
        page: 'unit-detail.html',
        params: { hash: { unit: 'N02', floor: '55' } },
        say: 'Here is a five bedroom residence.'
      }
    },
    {
      /* MN/MS are the mansions; unit-detail forces floor 79. */
      id: 'mansion',
      phrases: [
        'show me the mansion', 'show me the penthouse',
        'what is on the top floor', 'the mansions'
      ],
      keywords: ['mansion', 'mansions', 'penthouse', 'top floor'],
      action: {
        page: 'unit-detail.html',
        params: { hash: { unit: 'MN' } },
        say: 'Here is the mansion residence.'
      }
    },

    /* ───────────── Context ───────────── */
    {
      id: 'location',
      phrases: [
        'where is this located', 'where is this project', 'where are we',
        'show me the location', 'show me the map', 'what is nearby',
        'how far is the airport', 'tell me about worli',
        'what schools are nearby', 'show me the neighbourhood'
      ],
      keywords: [
        'location', 'located', 'map', 'nearby', 'airport', 'worli',
        'schools', 'neighbourhood', 'connectivity', 'sea link'
      ],
      action: { page: 'location.html', say: 'Here is the location.' }
    },
    {
      id: 'about',
      phrases: [
        'tell me about the project', 'project overview',
        'who is the developer', 'tell me about embassy',
        'about the builder', 'tell me about the developer',
        'open the project overview'
      ],
      keywords: ['developer', 'builder', 'embassy', 'overview', 'about the project'],
      action: { page: 'about.html', say: 'Here is the project overview.' }
    },
    {
      id: 'gre',
      phrases: [
        'pre visit', 'start registration', 'register me',
        'guest registration', 'sign me up'
      ],
      keywords: ['registration', 'register', 'pre visit', 'sign me up'],
      action: { page: 'gre.html', say: 'Starting your pre-visit registration.' }
    },

    /* ───────────── Tools (deep link #1: ?tool=) ───────────── */
    {
      id: 'tools',
      phrases: ['open the tools', 'show me the tools', 'go to tools'],
      keywords: ['tools'],
      action: { page: 'tools.html', say: 'Opening the tools.' }
    },
    {
      id: 'price',
      phrases: [
        'what is the price', 'how much does it cost',
        'show me the price sheet', 'show me the pricing',
        'what are the rates', 'how much is an apartment', 'price sheet'
      ],
      keywords: ['price', 'pricing', 'cost', 'rates', 'how much', 'price sheet'],
      action: {
        page: 'tools.html',
        params: { query: { tool: 'price' } },
        say: 'Here is the price sheet.'
      }
    },
    {
      id: 'emi',
      phrases: [
        'e m i calculator', 'show me the e m i', 'calculate my e m i',
        'monthly installment', 'what would my installment be'
      ],
      keywords: ['e m i', 'emi', 'installment', 'installments'],
      action: {
        page: 'tools.html',
        params: { query: { tool: 'emi' } },
        say: 'Opening the installment calculator.'
      }
    },
    {
      id: 'fsi',
      phrases: [
        'f s i calculator', 'show me the f s i',
        'open the f s i calculator'
      ],
      keywords: ['f s i', 'fsi', 'floor space index'],
      action: {
        page: 'tools.html',
        params: { query: { tool: 'fsi' } },
        say: 'Opening the F S I calculator.'
      }
    }
  ];

  /* ───────────── Normalization ─────────────
     Mirrors what the recognizer emits: lowercase, no punctuation,
     digits as words. Also folds "whats" → "what is" and
     "bhk" → "b h k" so typed/test input meets spoken phrases. */
  var DIGIT_WORDS = {
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
    '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'
  };
  function normalize(text) {
    var t = String(text || '').toLowerCase();
    t = t.replace(/[’']/g, '');             // what's → whats
    t = t.replace(/[^a-z0-9\s]/g, ' ');          // strip punctuation
    t = t.replace(/\b([0-9])\b/g, function (_, d) { return DIGIT_WORDS[d]; });
    t = t.replace(/\bbhk\b/g, 'b h k');
    t = t.replace(/\bwhats\b/g, 'what is');
    t = t.replace(/\s+/g, ' ').trim();
    return t;
  }

  /* Phrase index: exact map + length-sorted list for substring pass. */
  var EXACT = {};
  var PHRASES = [];
  INTENTS.forEach(function (intent) {
    intent.phrases.forEach(function (p) {
      var n = normalize(p);
      if (!EXACT[n]) EXACT[n] = intent;
      PHRASES.push({ phrase: n, intent: intent });
    });
  });
  PHRASES.sort(function (a, b) { return b.phrase.length - a.phrase.length; });

  function containsPhrase(text, phrase) {
    return (' ' + text + ' ').indexOf(' ' + phrase + ' ') !== -1;
  }

  function keywordHits(text, intent) {
    var padded = ' ' + text + ' ';
    var hits = 0, chars = 0;
    intent.keywords.forEach(function (k) {
      if (padded.indexOf(' ' + k + ' ') !== -1) { hits += 1; chars += k.length; }
    });
    return { hits: hits, chars: chars };
  }

  function match(text) {
    var t = normalize(text);
    if (!t) return null;

    // 1 · exact phrase
    if (EXACT[t]) return EXACT[t];

    // 2 · longest phrase contained in the utterance (filler-tolerant)
    for (var i = 0; i < PHRASES.length; i++) {
      if (containsPhrase(t, PHRASES[i].phrase)) return PHRASES[i].intent;
    }

    // 3 · keyword scoring: ≥1 keyword required; more hits wins,
    //     ties broken by total matched keyword length.
    var best = null, bestHits = 0, bestChars = 0;
    for (var j = 0; j < INTENTS.length; j++) {
      var s = keywordHits(t, INTENTS[j]);
      if (s.hits === 0) continue;
      if (s.hits > bestHits || (s.hits === bestHits && s.chars > bestChars)) {
        best = INTENTS[j]; bestHits = s.hits; bestChars = s.chars;
      }
    }
    return best;
  }

  function vocabulary() {
    var seen = {}, out = [];
    INTENTS.forEach(function (intent) {
      intent.phrases.forEach(function (p) {
        var n = normalize(p);
        if (!seen[n]) { seen[n] = true; out.push(n); }
      });
    });
    return out;
  }

  window.ECIntents = {
    intents: INTENTS,
    vocabulary: vocabulary,
    match: match
  };
})();
