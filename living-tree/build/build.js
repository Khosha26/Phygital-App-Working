#!/usr/bin/env node
/*
 * Living Tree — offline JSX bundler.
 *
 * WHY: the app previously transpiled ~536KB of JSX in the browser with
 * @babel/standalone on every load (3-8s of blocked main-thread on a tablet,
 * plus a 2.8MB Babel download) and ran React *development* builds (5-10x
 * slower renders -> janky bird/leaf animation). This script pre-compiles all
 * JSX -> one plain-JS bundle (app.js) so the page ships zero runtime Babel and
 * loads React production builds. The deploy stays 100% static.
 *
 * Usage:  node build.js        (from livingtree/build/)
 * Output: ../v3/app.js
 *
 * Edit the .jsx files as the source of truth, then re-run this. Bump the ?v=N
 * version in index.html + sw.js so installed PWAs pick up the new bundle.
 */
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const SRC = path.resolve(__dirname, '..', 'v3');
const OUT = path.join(SRC, 'app.js');

// Same order as the old <script type="text/babel"> tags in index.html.
// icons/dock-icons/data define globals consumed by experience + screens, so
// they must come first. experience defines App/ScreenShell/THEME, then screens
// register themselves onto window.SCREENS.
const FILES = [
  'icons.jsx',
  'dock-icons.jsx',
  'data.jsx',
  'experience.jsx',
  'screen-projectover.jsx',
  'screen-gallery.jsx',
  'screen-masterplan.jsx',
  'screen-inventory.jsx',
  'screen-amenities.jsx',
  'screen-location.jsx',
  'screen-floorplan.jsx',
  'screen-booking.jsx',
  'screen-emailsender.jsx',
  'screen-gre.jsx',
  'screen-minicrm.jsx',
];

// The inline bootstrap that used to live in index.html's last <script type=text/babel>.
const BOOTSTRAP = `
ReactDOM.createRoot(document.getElementById("stage")).render(React.createElement(App));
if (window.__ltScale) window.__ltScale();
`;

function transpile(code, filename) {
  // classic runtime -> React.createElement (React is a UMD global).
  // No preset-env / module transform: keep globals, target modern Safari/Chrome.
  const out = babel.transform(code, {
    filename,
    presets: [['@babel/preset-react', { runtime: 'classic' }]],
    compact: false,
    comments: false,
    babelrc: false,
    configFile: false,
  });
  return out.code;
}

let bundle = `/* Living Tree — pre-compiled bundle. DO NOT EDIT. Edit the .jsx source and run build/build.js. */\n"use strict";\n`;
let total = 0;

for (const f of FILES) {
  const p = path.join(SRC, f);
  const src = fs.readFileSync(p, 'utf8');
  total += src.length;
  const js = transpile(src, f);
  // Wrap each file in its own IIFE? NO — these files intentionally share top-level
  // globals (const STAGE_W, FACTS, THEME, component names referenced across files).
  // Concatenate at top level so the globals resolve exactly as they did when each
  // file was its own <script>. const/let at top level of a classic script are
  // script-scoped (not redeclarable across files only if duplicated) — the source
  // already avoided name collisions across files, so flat concat is safe.
  bundle += `\n/* ===== ${f} ===== */\n${js}\n`;
}

// Bootstrap last — App + globals are defined by now.
bundle += `\n/* ===== bootstrap ===== */\n${transpile(BOOTSTRAP, 'bootstrap.js')}\n`;

fs.writeFileSync(OUT, bundle, 'utf8');
const kb = (s) => (s / 1024).toFixed(0) + 'KB';
console.log(`✓ Bundled ${FILES.length} files (${kb(total)} JSX) -> app.js (${kb(bundle.length)})`);
console.log(`  ${OUT}`);
