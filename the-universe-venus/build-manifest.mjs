#!/usr/bin/env node
// Generates asset-manifest.json — the complete list of URLs the PWA precaches
// for full offline use. Run from the project root: node build-manifest.mjs
import { readdirSync, statSync, writeFileSync, existsSync } from 'fs';
import { join, relative } from 'path';

const ROOT = process.cwd();
// Directories to scan for assets the app loads.
const SCAN = ['app', 'assets'];
// Root-level files the shell needs.
const ROOT_FILES = ['index.html', 'manifest.json'];
// Never precache these (backups, originals, docs, dev-only, hidden).
const SKIP_DIR = new Set(['plans_orig', '_build-docs', '_massing3d', 'node_modules', '.git']);
const SKIP_EXT = new Set(['.md', '.mjs', '.map', '.bak', '.py']);
const SKIP_FILE = new Set(['.DS_Store', 'sw.original.js', 'shell_check.mjs', 'asset-manifest.json']);
const SKIP_MATCH = (name) => name.includes('.bak.');

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') && name !== '.well-known') continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (SKIP_DIR.has(name)) continue;
      walk(full, out);
    } else {
      if (SKIP_FILE.has(name) || SKIP_MATCH(name)) continue;
      const ext = name.slice(name.lastIndexOf('.'));
      if (SKIP_EXT.has(ext)) continue;
      out.push({ url: './' + relative(ROOT, full).split('\\').join('/'), size: st.size });
    }
  }
}

const files = [];
for (const f of ROOT_FILES) if (existsSync(join(ROOT, f))) { files.push({ url: './' + f, size: statSync(join(ROOT, f)).size }); }
for (const d of SCAN) if (existsSync(join(ROOT, d))) walk(join(ROOT, d), files);

// Stable order: shell first, then by url.
files.sort((a, b) => a.url.localeCompare(b.url));
const totalBytes = files.reduce((s, f) => s + f.size, 0);
const manifest = {
  generatedAt: new Date().toISOString(),
  count: files.length,
  totalBytes,
  totalMB: +(totalBytes / 1048576).toFixed(1),
  urls: files.map(f => f.url),
  sizes: Object.fromEntries(files.map(f => [f.url, f.size])),
};
writeFileSync(join(ROOT, 'asset-manifest.json'), JSON.stringify(manifest, null, 0));
console.log(`asset-manifest.json: ${manifest.count} files, ${manifest.totalMB} MB`);
