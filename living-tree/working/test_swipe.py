"""Test the splash swipe interaction: simulate dragging across the screen and check reveal."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={'width': 2560, 'height': 1600})
    page = ctx.new_page()
    page.on('console', lambda msg: print(f'[{msg.type}] {msg.text}') if msg.type in ('error', 'warning', 'log') else None)
    page.on('pageerror', lambda exc: print(f'[ERR] {exc}'))
    page.goto('http://localhost:9090/', wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(2000)  # wait for intro to finish

    # Sweep 1: horizontal across center
    page.mouse.move(400, 800)
    page.mouse.down()
    for x in range(400, 2200, 60):
        page.mouse.move(x, 800)
    page.mouse.up()
    page.wait_for_timeout(200)

    # Sweep 2: another horizontal pass at different Y
    page.mouse.move(400, 700)
    page.mouse.down()
    for x in range(400, 2200, 60):
        page.mouse.move(x, 700)
    page.mouse.up()
    page.wait_for_timeout(200)

    # Sweep 3: diagonal
    page.mouse.move(400, 1000)
    page.mouse.down()
    for i in range(40):
        page.mouse.move(400 + i*45, 1000 - i*15)
    page.mouse.up()
    page.wait_for_timeout(800)

    page.screenshot(path='/tmp/lt-splash-swiped.png', full_page=False)

    # Wait for reveal phase
    page.wait_for_timeout(1500)
    page.screenshot(path='/tmp/lt-splash-revealed.png', full_page=False)

    browser.close()

print('SWIPED:    /tmp/lt-splash-swiped.png')
print('REVEALED:  /tmp/lt-splash-revealed.png')
