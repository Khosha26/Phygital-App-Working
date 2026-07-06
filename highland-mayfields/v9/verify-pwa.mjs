import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:8215';
const OUT = '/Users/mi1k/Documents/Projects/highland-mayfields/sales-suite/_verify/pwa';
mkdirSync(OUT, { recursive: true });

const errors = [];
function attach(page, tag){
  page.on('console', m => { if (m.type()==='error') errors.push(`[${tag}] console.error: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`[${tag}] pageerror: ${e.message}`));
}

const results = {};

const browser = await chromium.launch();

/* ---- 1. First run with ?pwa=1 at 2560x1600: gate + precache + SW cache ---- */
{
  const ctx = await browser.newContext({ viewport:{width:2560,height:1600}, deviceScaleFactor:1 });
  const page = await ctx.newPage();
  attach(page, 'firstrun');
  await page.goto(`${BASE}/index.html?pwa=1`, { waitUntil:'domcontentloaded' });

  // gate should be visible
  await page.waitForSelector('#dlGate', { state:'attached', timeout:5000 });
  const gateVisible = await page.isVisible('#dlGate');
  await page.screenshot({ path:`${OUT}/01-gate-start.png` });

  // wait for gate to reach 100% / disappear (precache done) — up to 90s
  await page.waitForFunction(() => {
    const g = document.getElementById('dlGate');
    return !g || g.classList.contains('gone');
  }, { timeout:90000 });
  const pctText = await page.evaluate(() => { const g=document.getElementById('dlPct'); return g?g.textContent:'(removed)'; });

  // localStorage flag
  const flag = await page.evaluate(() => localStorage.getItem('hm-downloaded'));

  // SW registered + cache filled
  await page.waitForFunction(() => !!navigator.serviceWorker.controller || navigator.serviceWorker.ready, { timeout:10000 }).catch(()=>{});
  const cacheInfo = await page.evaluate(async () => {
    const keys = await caches.keys();
    let count = 0;
    if (keys.includes('hm-v3')) { const c = await caches.open('hm-v3'); count = (await c.keys()).length; }
    return { keys, hasV3: keys.includes('hm-v3'), v3count: count };
  });

  // let the app enter, screenshot the intro touch-gate (post-download boot)
  await page.waitForTimeout(1200);
  await page.screenshot({ path:`${OUT}/02-after-download-boot.png` });

  results.firstrun = { gateVisible, pctText, flag, cacheInfo };
  await ctx.close();
}

/* ---- 2. Reload WITHOUT ?pwa=1 → should skip gate ---- */
{
  const ctx = await browser.newContext({ viewport:{width:2560,height:1600}, deviceScaleFactor:1 });
  const page = await ctx.newPage();
  attach(page, 'secondrun');
  // seed localStorage before load via init script isn't shared across contexts; use addInitScript
  await page.addInitScript(() => { try{ localStorage.setItem('hm-downloaded','hm-v3'); }catch(e){} });
  await page.goto(`${BASE}/index.html`, { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(600);
  const gatePresent = await page.evaluate(() => {
    const g = document.getElementById('dlGate');
    return { exists: !!g, gone: g ? g.classList.contains('gone') : null };
  });
  await page.screenshot({ path:`${OUT}/03-second-run-no-gate.png` });
  results.secondrun = gatePresent;
  await ctx.close();
}

/* ---- 3. Home screenshots at device matrix (skip gate) ---- */
const shots = [
  { name:'tabS7-2560x1600', w:2560, h:1600 },
  { name:'ipadPro13-land-2732x2048', w:2732, h:2048 },
  { name:'ipadPro13-port-2048x2732', w:2048, h:2732 },
  { name:'16x9-1920x1080', w:1920, h:1080 },
  { name:'21x9-2560x1080', w:2560, h:1080 },
];
for (const s of shots) {
  const ctx = await browser.newContext({ viewport:{width:s.w,height:s.h}, deviceScaleFactor:1 });
  const page = await ctx.newPage();
  attach(page, s.name);
  await page.addInitScript(() => { try{ localStorage.setItem('hm-downloaded','hm-v3'); }catch(e){} });
  await page.goto(`${BASE}/index.html`, { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(700);
  // drive into home: click gate -> skip video -> enter
  try {
    await page.click('#gate', { timeout:2000 });
    await page.waitForTimeout(600);
    // skip video if present
    const skip = await page.$('#skip');
    if (skip) { try { await page.click('#skip', { force:true, timeout:1500 }); } catch(e){} }
    await page.waitForTimeout(700);
    const eb = await page.$('#enterBtn');
    if (eb) { try { await page.click('#enterBtn', { force:true, timeout:1500 }); } catch(e){} }
    await page.waitForTimeout(1600);
  } catch(e) { /* portrait may show rotate hint / different flow */ }
  await page.screenshot({ path:`${OUT}/home-${s.name}.png` });
  await ctx.close();
}

await browser.close();

console.log(JSON.stringify({ results, errorCount: errors.length, errors }, null, 2));
