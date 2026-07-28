/* ──────────────────────────────────────────────────────────────────────────
   DEV KILL-SWITCH service worker.

   Purpose: permanently evict any previously-installed offline worker on this
   origin (localhost:8166) so the browser ALWAYS loads the latest from the dev
   server — no more stale "old build" pages in the iframe.

   It serves every request network-only (always fresh), wipes all caches,
   reloads open windows, then unregisters itself.

   The real offline kiosk worker is preserved as sw-kiosk.js. For the final
   kiosk deployment: copy sw-kiosk.js back over sw.js and re-enable the
   registration block in index.html.
   ────────────────────────────────────────────────────────────────────────── */

self.addEventListener('install', function(){ self.skipWaiting(); });

self.addEventListener('activate', function(e){
  e.waitUntil((async function(){
    try{ await self.clients.claim(); }catch(_){}
    // wipe every cache this origin holds
    try{
      var keys = await caches.keys();
      await Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }catch(_){}
    // force every open window to reload fresh (network-only handler below)
    try{
      var cs = await self.clients.matchAll({ type:'window', includeUncontrolled:true });
      cs.forEach(function(c){ try{ c.navigate(c.url); }catch(_){} });
    }catch(_){}
    // remove ourselves so future loads have no worker at all
    try{ await self.registration.unregister(); }catch(_){}
  })());
});

/* Always go to the network — never serve anything from cache. */
self.addEventListener('fetch', function(e){
  e.respondWith(fetch(e.request).catch(function(){ return new Response('', { status:504 }); }));
});
