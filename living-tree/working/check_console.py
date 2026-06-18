from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={'width': 2560, 'height': 1600})
    page = ctx.new_page()
    page.on('console', lambda msg: print(f'[{msg.type}] {msg.text}') if msg.type != 'debug' else None)
    page.on('pageerror', lambda exc: print(f'[ERR] {exc}'))
    page.goto('http://localhost:9090/', wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(2500)
    browser.close()
