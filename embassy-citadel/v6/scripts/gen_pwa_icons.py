#!/usr/bin/env python3
"""Generate Embassy Citadel PWA icons (icon-192, icon-512, icon-maskable-512).

Uses rsvg-convert (librsvg) to rasterise the brand SVG when available,
falls back to a typography monogram via PIL when not.
"""
import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

BONE = (244, 242, 237, 255)
BRONZE = (224, 126, 39, 255)
DARK_TEXT = (35, 31, 32, 255)

OUT_DIR = "/Users/mi1k/Documents/Projects/embassy citadel/sales-suite/assets/brand"
SVG_PATH = os.path.join(OUT_DIR, "embassy-citadel-logo.svg")
RSVG = "/opt/homebrew/bin/rsvg-convert"

SERIF_FONTS = [
    "/System/Library/Fonts/Supplemental/Cormorant Garamond.ttf",
    "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
    "/System/Library/Fonts/Supplemental/Baskerville.ttc",
    "/System/Library/Fonts/Times.ttc",
]
SANS_FONTS = [
    "/System/Library/Fonts/Supplemental/Futura.ttc",
    "/System/Library/Fonts/HelveticaNeue.ttc",
    "/System/Library/Fonts/Helvetica.ttc",
]

def find_font(candidates, size):
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()

def typographic_icon(size, bg_color, safe_ratio=0.78):
    img = Image.new("RGBA", (size, size), bg_color)
    draw = ImageDraw.Draw(img)
    inner = int(size * safe_ratio)
    serif = find_font(SERIF_FONTS, int(inner * 0.55))
    text = "EC"
    bbox = draw.textbbox((0, 0), text, font=serif)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    cx = (size - tw) // 2 - bbox[0]
    cy = (size - th) // 2 - bbox[1] - int(size * 0.04)
    draw.text((cx, cy), text, font=serif, fill=DARK_TEXT)
    line_y = cy + th + int(size * 0.06)
    line_w = int(inner * 0.5)
    lx = (size - line_w) // 2
    line_h = max(2, int(size * 0.008))
    draw.rectangle([lx, line_y, lx + line_w, line_y + line_h], fill=BRONZE)
    sans = find_font(SANS_FONTS, max(8, int(size * 0.055)))
    wmark = "EMBASSY CITADEL"
    bbox2 = draw.textbbox((0, 0), wmark, font=sans)
    tw2 = bbox2[2] - bbox2[0]
    wx = (size - tw2) // 2 - bbox2[0]
    wy = line_y + int(size * 0.035)
    draw.text((wx, wy), wmark, font=sans, fill=DARK_TEXT)
    return img

def logo_centered(size, bg_color, safe_ratio=0.78):
    canvas = Image.new("RGBA", (size, size), bg_color)
    target_w = int(size * safe_ratio)
    target_h = target_w // 2
    tmp = f"/tmp/__ec_logo_{size}_{int(safe_ratio*100)}.png"
    ok = False
    if os.path.exists(RSVG):
        try:
            r = subprocess.run(
                [RSVG, "-w", str(target_w), "-h", str(target_h), SVG_PATH, "-o", tmp],
                capture_output=True, timeout=30,
            )
            ok = r.returncode == 0 and os.path.exists(tmp) and os.path.getsize(tmp) > 100
        except Exception as e:
            print(f"rsvg fail: {e}", file=sys.stderr)
    if not ok:
        print(f"WARN: falling back to typographic icon at {size}", file=sys.stderr)
        return typographic_icon(size, bg_color, safe_ratio)

    logo = Image.open(tmp).convert("RGBA")
    x = (size - target_w) // 2
    y = (size - target_h) // 2 - int(size * 0.03)
    canvas.paste(logo, (x, y), logo)
    draw = ImageDraw.Draw(canvas)
    line_y = y + target_h + int(size * 0.045)
    line_w = int(target_w * 0.35)
    lx = (size - line_w) // 2
    line_h = max(2, int(size * 0.008))
    draw.rectangle([lx, line_y, lx + line_w, line_y + line_h], fill=BRONZE)
    try:
        os.remove(tmp)
    except OSError:
        pass
    return canvas

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, size, ratio in [
        ("icon-192.png", 192, 0.80),
        ("icon-512.png", 512, 0.78),
        ("icon-maskable-512.png", 512, 0.62),
    ]:
        img = logo_centered(size, BONE, safe_ratio=ratio)
        path = os.path.join(OUT_DIR, name)
        img.save(path, "PNG", optimize=True)
        print(f"wrote {path} ({os.path.getsize(path)} bytes)")

if __name__ == "__main__":
    main()
