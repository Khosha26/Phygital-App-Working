import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:8210';
const OUT = '/Users/mi1k/Documents/Projects/highland-mayfields/sales-suite/_verify/dlgate';
mkdirSync(OUT, { recursive: true });

const errors = [];
function attach(page, tag){
  page.on('console', m => { if (m.type()==='error') errors.push(`[${tag}] ${m.text()}`); });
  page.on('pageerror', e => errors.push(`[${tag}] pageerror: ${e.message}`));
}
const log = (...a)=>console.log(...a);
const browser = await chromium.launch();

/* ============ 1 · FRESH state ============ */
const ctx = await browser.newContext({ viewport:{width:2560,height:1600}, deviceScaleFactor:1 });
const page = await ctx.newPage();
attach(page, 'fresh');

// wipe everything before the app scripts run
await page.addInitScript(() => {
  try { localStorage.clear(); } catch(e){}
});
await page.goto(`${BASE}/index.html`, { waitUntil:'domcontentloaded' });
// clear caches + unregister SW, then reload clean
await page.evaluate(async () => {
  try { const ks = await caches.keys(); await Promise.all(ks.map(k=>caches.delete(k))); } catch(e){}
  try { const rs = await navigator.serviceWorker.getRegistrations(); await Promise.all(rs.map(r=>r.unregister())); } catch(e){}
  try { localStorage.clear(); } catch(e){}
});
await page.reload({ waitUntil:'domcontentloaded' });

// wait for the OFFER state (real button visible, not auto-running)
await page.waitForSelector('#dlBtn', { state:'visible', timeout:8000 });
const offerVisible = await page.isVisible('#dlBtn');
const btnText = (await page.textContent('#dlBtn'))?.trim();
const progHiddenAtStart = await page.getAttribute('#dlProg', 'hidden') !== null;
log(`[fresh] offer button visible=${offerVisible} text="${btnText}" progHiddenAtStart=${progHiddenAtStart}`);
await page.screenshot({ path:`${OUT}/01-offer.png` });

// tap Download, sample byte-progress a few times to prove it advances through the videos
await page.click('#dlBtn');
let samples = [];
let sawDone = false;
for (let i=0;i<120;i++){
  await page.waitForTimeout(700);
  const st = await page.evaluate(() => ({
    progHidden: document.getElementById('dlProg').hidden,
    doneHidden: document.getElementById('dlDone').hidden,
    pct: document.getElementById('dlPct')?.textContent,
    bytes: document.getElementById('dlBytes')?.textContent,
    cap: document.getElementById('dlCap')?.textContent,
    barW: document.getElementById('dlBar')?.style.width
  }));
  if (!st.progHidden) samples.push(`${st.pct} | ${st.bytes} | ${st.cap}`);
  if (i===3) await page.screenshot({ path:`${OUT}/02-progress-early.png` });
  if (st.bytes && /\d+\.\d+.MB \/ \d+\.\d+.MB/.test(st.bytes) && parseFloat(st.bytes) > 20) {
    // mid-download through the big video
    await page.screenshot({ path:`${OUT}/03-progress-videos.png` });
  }
  if (!st.doneHidden){ sawDone = true; break; }
}
// print a de-duped trail of progress samples
const trail = samples.filter((v,i)=> i===0 || v.split('|')[0]!==samples[i-1].split('|')[0]);
log(`[fresh] progress trail (${samples.length} samples):`);
trail.slice(0,40).forEach(s=>log('   '+s));

const doneMsg = (await page.textContent('#dlDoneMsg'))?.trim();
const continueVisible = await page.isVisible('#dlContinue');
log(`[fresh] DONE reached=${sawDone} msg="${doneMsg}" continueVisible=${continueVisible}`);
await page.screenshot({ path:`${OUT}/04-done.png` });

// verify cache actually holds the big videos + a woff2 + shell
const cacheCheck = await page.evaluate(async () => {
  const c = await caches.open('hm-v5');
  const keys = (await c.keys()).map(r=>r.url);
  const has = (frag)=>keys.some(u=>u.includes(frag));
  return {
    count: keys.length,
    locationTour: has('location-tour.mp4'),
    walkthrough: has('walkthrough.mp4'),
    welcome: has('welcome.m4a'),
    glb: has('earth-villa.glb'),
    modelViewer: has('model-viewer.min.js'),
    woff2: keys.some(u=>u.endsWith('.woff2')),
    fontCss: keys.some(u=>u.includes('fonts.googleapis.com')),
    leaflet: keys.some(u=>u.includes('leaflet')),
    indexHtml: has('/index.html'),
    homeHtml: has('/home.html')
  };
});
log('[fresh] cache after download:', JSON.stringify(cacheCheck));

// Continue → enters the intro ("touch to begin" gate)
await page.click('#dlContinue');
await page.waitForTimeout(1200);
const gateGone = await page.evaluate(()=>!document.getElementById('dlGate'));
const introGateVisible = await page.isVisible('#gate');
const videoStartedEarly = await page.evaluate(()=>{
  const v=document.getElementById('introVideo'); return v ? (v.currentTime>0 && !v.paused) : false;
});
log(`[fresh] after Continue: dlGate removed=${gateGone} introGateVisible=${introGateVisible} introVideoPlayingEarly=${videoStartedEarly}`);
await page.screenshot({ path:`${OUT}/05-intro-gate.png` });

/* ============ 2 · OFFLINE reload boots from cache ============ */
await ctx.setOffline(true);
await page.reload({ waitUntil:'domcontentloaded' });
await page.waitForTimeout(1500);
const offlineBoot = await page.evaluate(()=>({
  hasApp: !!document.getElementById('app'),
  dlGatePresent: !!document.getElementById('dlGate'),
  doneHidden: document.getElementById('dlDone')?.hidden,
  doneMsg: document.getElementById('dlDoneMsg')?.textContent?.trim(),
  gate: !!document.getElementById('gate')
}));
log('[offline] boot:', JSON.stringify(offlineBoot));
await page.screenshot({ path:`${OUT}/06-offline-boot.png` });
await ctx.setOffline(false);

/* ============ 3 · ALREADY-CACHED path (fresh page, same cache) → instant Ready ============ */
const page2 = await ctx.newPage();
attach(page2, 'cached');
await page2.goto(`${BASE}/index.html`, { waitUntil:'domcontentloaded' });
// should NOT show the offer/progress; should show DONE instantly with "Ready"
await page2.waitForTimeout(1500);
const cachedState = await page2.evaluate(()=>({
  offerHidden: document.getElementById('dlOffer')?.hidden,
  progHidden: document.getElementById('dlProg')?.hidden,
  doneHidden: document.getElementById('dlDone')?.hidden,
  doneMsg: document.getElementById('dlDoneMsg')?.textContent?.trim()
}));
log('[cached] instant state:', JSON.stringify(cachedState));
await page2.screenshot({ path:`${OUT}/07-already-cached.png` });

log('\n=== CONSOLE ERRORS (' + errors.length + ') ===');
errors.slice(0,30).forEach(e=>log('  '+e));

await browser.close();
