import json, os
import numpy as np
from PIL import Image
from scipy import ndimage

SRC = "/Users/mi1k/Downloads/ChatGPT Image Jun 28, 2026, 08_46_59 PM.png"
OUT = "/Users/mi1k/Documents/Projects/highland-mayfields/sales-suite/app/assets/petals"
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert("RGB")
W, H = im.size
arr = np.asarray(im).astype(np.int32)
mn = arr.min(axis=2)
alpha = np.clip((236 - mn) * 8, 0, 255).astype(np.uint8)
mask = alpha > 110

# hand-placed seeds (fraction of W,H) — one per piece, at its centre
SEEDS = {
    "residences": (0.500, 0.250),
    "address":    (0.330, 0.300),
    "pearl":      (0.668, 0.300),
    "inventory":  (0.241, 0.483),
    "landscape":  (0.762, 0.483),
    "villas":     (0.500, 0.565),
    "masterplan": (0.340, 0.730),
    "gallery":    (0.665, 0.730),
}
names = list(SEEDS.keys())
markers = np.zeros((H, W), np.int32)
yy, xx = np.ogrid[:H, :W]
for i, nm in enumerate(names, start=1):
    fx, fy = SEEDS[nm]
    cx, cy = fx * W, fy * H
    disk = (xx - cx) ** 2 + (yy - cy) ** 2 <= 14 ** 2
    markers[disk] = i

# Voronoi: each mask pixel -> nearest seed
_, (iy, ix) = ndimage.distance_transform_edt(markers == 0, return_indices=True)
grown = np.where(mask, markers[iy, ix], 0)

manifest = {}
for i, nm in enumerate(names, start=1):
    comp = grown == i
    ys, xs = np.where(comp)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    a = np.where(comp, alpha, 0).astype(np.uint8)
    rgba = np.dstack([arr.astype(np.uint8), a])[y0:y1 + 1, x0:x1 + 1]
    Image.fromarray(rgba).save(os.path.join(OUT, f"{nm}.png"))
    manifest[nm] = {"file": f"assets/petals/{nm}.png",
                    "cx": round((x0 + x1) / 2 / W, 5), "cy": round((y0 + y1) / 2 / H, 5),
                    "w": round((x1 - x0 + 1) / W, 5), "h": round((y1 - y0 + 1) / H, 5)}

print("image", W, H)
for k, v in manifest.items():
    print(f"{k:11s} cx={v['cx']:.3f} cy={v['cy']:.3f} w={v['w']:.3f} h={v['h']:.3f}")
json.dump({"ref_w": W, "ref_h": H, "pieces": manifest},
          open(os.path.join(OUT, "manifest.json"), "w"), indent=2)
print("wrote", OUT)
