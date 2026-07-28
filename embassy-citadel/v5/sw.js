// Embassy Citadel — Service Worker
// Cache-first for assets, network-first for HTML, with offline fallback.
//
// Versioning: bump CACHE_VERSION to invalidate older caches on activation.

const CACHE_VERSION = 'embassy-citadel-v4';

// App shell — small, always-needed resources. Large assets (photos,
// floor plans, videos) are picked up on demand by the fetch handler.
const APP_SHELL = [
  './',
  './index.html',
  './intro-v8.html',
  './home-v11.html',
  './home-v10.html',
  './home-v9.html',
  './intro-v7.html',
  './home-v8.html',
  './screen-01-overview.html',
  './screen-02-gallery.html',
  './screen-03-masterplan.html',
  './screen-04-amenities.html',
  './screen-05-inventory.html',
  './screen-06-floor-plans.html',
  './screen-07-location.html',
  './screen-08-tools.html',
  './manifest.json',
  './brand/tokens.css',
  './brand/logo.svg',
  './assets/brand/embassy-citadel-logo.svg',
  './assets/brand/icon-192.png',
  './assets/brand/icon-512.png',
  './assets/brand/icon-maskable-512.png',
  './assets/intro-v2/F1-intro.png',
  './assets/intro-v2/F2-home.png',
  './assets/intro-v2/embassy-citadel-logo.svg',
  './assets/intro-v2/tower-center.jpg',
  './assets/intro-v2/wheel-reference-v2.png',
  './assets/intro-v2/petals/petal-01-gallery.png',
  './assets/intro-v2/petals/petal-02-floorplan.png',
  './assets/intro-v2/petals/petal-03-masterplan.png',
  './assets/intro-v2/petals/petal-04-inventory.png',
  './assets/intro-v2/petals/petal-05-tools.png',
  './assets/intro-v2/petals/petal-06-amenities.png',
  './assets/intro-v2/petals/petal-07-about.png',
  './assets/intro-v2/petals/tower-circle.png',
  './offline.html'
];

// Normalise a URL by stripping the query string (so `?reveal=immediate`
// hits the same cache entry as the bare HTML page).
function normalizeKey(request) {
  const url = new URL(request.url);
  url.search = '';
  return new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    mode: request.mode === 'navigate' ? 'cors' : request.mode,
    credentials: request.credentials,
    redirect: request.redirect
  });
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      // addAll is atomic — if anything 404s the install fails.
      // Use individual puts so a single missing screen doesn't kill the SW.
      return Promise.all(
        APP_SHELL.map(url =>
          fetch(url, { cache: 'reload' })
            .then(res => {
              if (res && res.ok) return cache.put(url, res);
            })
            .catch(() => { /* ignore individual misses */ })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Only handle same-origin requests. Let the browser deal with
  // CDN assets (unpkg, fonts.googleapis.com etc) directly.
  if (url.origin !== self.location.origin) return;

  const accept = req.headers.get('accept') || '';
  const isHTML = req.mode === 'navigate'
    || accept.includes('text/html')
    || url.pathname.endsWith('.html')
    || url.pathname === '/'
    || url.pathname.endsWith('/');

  const isAsset = /\.(png|jpg|jpeg|webp|gif|svg|css|js|woff2?|ttf|otf|mp3|m4a|ogg|wav|json|mp4|webm)$/i.test(url.pathname);

  const cacheKey = normalizeKey(req);

  if (isHTML) {
    // Network-first so users see updates when online.
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then(c => c.put(cacheKey, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches.match(cacheKey)
            .then(r => r || caches.match(req))
            .then(r => r || caches.match('./offline.html'))
            .then(r => r || new Response('Offline', { status: 503, statusText: 'Offline' }))
        )
    );
    return;
  }

  if (isAsset) {
    // Cache-first; populate cache on first network hit.
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          if (res && res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then(c => c.put(req, copy)).catch(() => {});
          }
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Everything else: try network, fall back to cache if available.
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

// Allow pages to trigger an immediate update (skipWaiting).
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING' || (event.data && event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});
