#!/usr/bin/env python3
"""Inject PWA <head> tags and service-worker registration into HTML files.

Idempotent: re-running won't duplicate the block. Uses an HTML comment
sentinel so we can detect prior injection.
"""
import os
import re
import sys

HEAD_SENTINEL = "<!-- pwa:head -->"
BODY_SENTINEL = "<!-- pwa:sw-register -->"

HEAD_BLOCK = """  <!-- pwa:head -->
  <link rel="manifest" href="manifest.json" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Citadel" />
  <link rel="apple-touch-icon" href="assets/brand/icon-192.png" />
"""

# Note: existing files set their own theme-color (often #050505 for the dark
# stage). We deliberately do NOT clobber that — the manifest carries the
# branded #E07E27 theme color. Only add theme-color if file has none.
THEME_COLOR_TAG = '  <meta name="theme-color" content="#E07E27" />\n'

SW_SCRIPT = """  <!-- pwa:sw-register -->
  <script>
    (function () {
      if (!('serviceWorker' in navigator)) return;
      var isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      if (location.protocol !== 'https:' && !isLocalhost && location.protocol !== 'file:') return;
      if (location.protocol === 'file:') return;
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js').catch(function () {});
      });
    })();
  </script>
"""

def inject_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    changed = False

    # --- head injection -----------------------------------------------------
    if HEAD_SENTINEL not in html:
        head_addition = HEAD_BLOCK
        # Only add theme-color if file lacks one
        if not re.search(r'<meta\s+name=["\']theme-color["\']', html, re.IGNORECASE):
            head_addition = HEAD_BLOCK + THEME_COLOR_TAG

        # Anchor: insert after the first <link rel="stylesheet" href="brand/tokens.css" ...>
        anchor_re = re.compile(r'(<link[^>]+href=["\']brand/tokens\.css["\'][^>]*/?>\s*\n)', re.IGNORECASE)
        m = anchor_re.search(html)
        if m:
            html = html[:m.end()] + head_addition + html[m.end():]
            changed = True
        else:
            # Fallback: insert after <title>
            title_re = re.compile(r'(</title>\s*\n)', re.IGNORECASE)
            m = title_re.search(html)
            if m:
                html = html[:m.end()] + head_addition + html[m.end():]
                changed = True
            else:
                # Last-resort fallback: after <head>
                head_re = re.compile(r'(<head[^>]*>\s*\n)', re.IGNORECASE)
                m = head_re.search(html)
                if m:
                    html = html[:m.end()] + head_addition + html[m.end():]
                    changed = True
                else:
                    print(f"SKIP head: no anchor in {path}", file=sys.stderr)

    # --- service-worker registration ----------------------------------------
    if BODY_SENTINEL not in html:
        body_re = re.compile(r'(\n?)(\s*)(</body>)', re.IGNORECASE)
        m = body_re.search(html)
        if m:
            indent = m.group(2)
            html = html[:m.start()] + '\n' + SW_SCRIPT + indent + '</body>' + html[m.end():]
            changed = True
        else:
            # File has no </body> (rare). Skip — don't pollute.
            print(f"SKIP sw: no </body> in {path}", file=sys.stderr)

    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        return True
    return False

def main():
    paths = sys.argv[1:]
    if not paths:
        print("usage: inject_pwa.py <html-file> [...]", file=sys.stderr)
        sys.exit(1)
    for p in paths:
        if not os.path.exists(p):
            print(f"missing: {p}", file=sys.stderr)
            continue
        changed = inject_file(p)
        print(f"{'updated' if changed else 'unchanged'}: {p}")

if __name__ == "__main__":
    main()
