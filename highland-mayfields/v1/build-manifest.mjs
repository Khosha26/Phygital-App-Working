#!/usr/bin/env node
/* Highland Mayfields — asset-manifest builder.
   Scans the CLEAN servable fileset under app/ and writes app/asset-manifest.json
   = a JSON array of every servable asset URL (relative to app/), used by the
   first-run "Download the experience" gate to precache the whole app into the SW.
   Run:  node build-manifest.mjs   (from the project root or anywhere)  */

import { readdir, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const APP  = path.join(ROOT, 'app');

/* servable extensions we ship to the client */
const EXT = new Set([
  '.html', '.css', '.js', '.mjs', '.json',
  '.webp', '.png', '.jpg', '.jpeg', '.svg', '.gif',
  '.mp3', '.m4a', '.mp4', '.webm', '.wav', '.ogg',
  '.glb', '.gltf', '.woff2', '.woff', '.ttf'
]);

/* dev-scratch exclusion rules (file BASENAME or relative-path tests) */
function isExcluded(rel, base) {
  if (base === '.DS_Store') return true;
  if (base === 'sw-prod.js.bak') return true;
  if (base === 'asset-manifest.json') return true;   // don't list the manifest in itself
  // dev scratch home variants (keep home.html)
  if (/^home-v.*\.html$/i.test(base)) return true;
  // any backup / orig / pre variants
  if (/\.bak(\.[^.]+)?$/i.test(base)) return true;   // *.bak , *.bak.html , *.bak.mp3
  if (/\.bak\.html$/i.test(base)) return true;
  if (/\.orig(\.[^.]+)?$/i.test(base)) return true;
  if (/\.pre[^/]*\.bak/i.test(base)) return true;    // *.pre*.bak*
  if (/\.prev\.[^.]+$/i.test(base)) return true;      // *.prev.m4a etc (dev takes)
  // dev-only source / pipeline artefacts
  if (/-src\.[^.]+$/i.test(base)) return true;        // *-src.png (uncompressed sources)
  if (/\.say\.bak\./i.test(base)) return true;
  if (base.endsWith('.py')) return true;              // slice scripts
  if (base.endsWith('.log')) return true;             // pipeline logs
  // dev-only .mjs not referenced by index.html / home.html / screens
  if (base === 'homev22.mjs' || base === 'psdrag.mjs') return true;
  // dev variant stylesheets (production uses brand.css)
  if (/^brand-v.*\.css$/i.test(base)) return true;
  // scratch dirs anywhere in path
  const parts = rel.split('/');
  if (parts.includes('_verify') || parts.includes('_intel')) return true;
  return false;
}

async function walk(dir, rel = '') {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const abs = path.join(dir, e.name);
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (e.name === '_verify' || e.name === '_intel') continue;
      out.push(...await walk(abs, r));
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (!EXT.has(ext)) continue;
      if (isExcluded(r, e.name)) continue;
      out.push(r);
    }
  }
  return out;
}

const urls = (await walk(APP)).sort();

/* integrity: every url must resolve under app/ */
let missing = 0;
for (const u of urls) {
  try { await stat(path.join(APP, u)); }
  catch { missing++; console.error('MISSING:', u); }
}

await writeFile(path.join(APP, 'asset-manifest.json'), JSON.stringify(urls, null, 0) + '\n');
console.log(`asset-manifest.json written: ${urls.length} assets, ${missing} missing.`);
if (missing > 0) process.exit(1);
