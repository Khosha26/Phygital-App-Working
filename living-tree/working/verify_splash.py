#!/usr/bin/env python3
"""Verify splash.jsx renders without errors via Playwright against running server."""
from playwright.sync_api import sync_playwright

console_msgs = []
page_errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={'width': 2560, 'height': 1600})
    page = ctx.new_page()
    page.on('console', lambda msg: console_msgs.append((msg.type, msg.text)) if msg.type in ('error', 'warning') else None)
    page.on('pageerror', lambda exc: page_errors.append(str(exc)))
    page.goto('http://localhost:9090/', wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(2800)
    page.screenshot(path='/tmp/lt-splash.png', full_page=False)
    # Also capture the post-intro state (after intro 1.5s + extra settle)
    page.wait_for_timeout(1200)
    page.screenshot(path='/tmp/lt-splash-idle.png', full_page=False)
    browser.close()

print('SCREENSHOT_INTRO: /tmp/lt-splash.png')
print('SCREENSHOT_IDLE:  /tmp/lt-splash-idle.png')
print(f'PAGE_ERRORS ({len(page_errors)}):')
for e in page_errors:
    print(' -', e)
print(f'CONSOLE_WARN_OR_ERR ({len(console_msgs)}):')
for tp, msg in console_msgs:
    print(f' [{tp}] {msg}')
