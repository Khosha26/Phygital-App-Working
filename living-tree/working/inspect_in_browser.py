"""Use the running page itself to see how many templates and leaves rendered."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={'width': 2560, 'height': 1600})
    page = ctx.new_page()
    page.on('console', lambda msg: print(f'[CON {msg.type}] {msg.text}'))
    page.on('pageerror', lambda exc: print(f'[ERR] {exc}'))
    page.goto('http://localhost:9090/', wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(2500)

    # Inject script to inspect how many SVG paths are rendered
    result = page.evaluate("""() => {
      const paths = document.querySelectorAll('svg path');
      const fills = {};
      let withFill = 0;
      paths.forEach(p => {
        const f = p.getAttribute('fill') || '(none)';
        fills[f] = (fills[f]||0) + 1;
        if (f && f !== '(none)' && f !== 'none') withFill += 1;
      });
      return {
        total_paths: paths.length,
        with_fill: withFill,
        sample_fills: Object.entries(fills).slice(0, 15),
      };
    }""")
    print('PAGE INSPECT:', result)
    browser.close()
