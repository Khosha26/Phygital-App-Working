"""Find a good filter range by checking what passes various thresholds."""
from xml.etree import ElementTree as ET
import re

tree = ET.parse('/Users/mi1k/Documents/Projects/livingtree/app/assets/brand/leaves.svg')
root = tree.getroot()
ns = {'svg': 'http://www.w3.org/2000/svg'}
paths = root.findall('.//svg:path', ns)

def bbox(d):
    nums = re.findall(r'-?\d+(?:\.\d+)?', d)
    if len(nums) < 2: return None
    xs = [float(n) for n in nums[0::2]]
    ys = [float(n) for n in nums[1::2]]
    return min(xs), min(ys), max(xs), max(ys), max(xs)-min(xs), max(ys)-min(ys)

areas = []
widths = []
heights = []
lengths = []
for p in paths:
    d = p.get('d') or ''
    if not d: continue
    bb = bbox(d)
    if not bb: continue
    _,_,_,_, w, h = bb
    if w==0 or h==0: continue
    areas.append(w*h)
    widths.append(w)
    heights.append(h)
    lengths.append(len(d))

areas.sort(); widths.sort(); heights.sort(); lengths.sort()
n = len(areas)
def stats(name, arr):
    print(f'{name}: min={arr[0]:.1f} p10={arr[n//10]:.1f} p25={arr[n//4]:.1f} median={arr[n//2]:.1f} p75={arr[3*n//4]:.1f} p90={arr[9*n//10]:.1f} max={arr[-1]:.1f}')
stats('area', areas)
stats('width', widths)
stats('height', heights)
stats('length', lengths)

# Now try relaxed filter
passing = []
for p in paths:
    d = p.get('d') or ''
    if not (170 <= len(d) <= 3500): continue
    bezC = d.count('C') + d.count('c')
    if bezC < 4: continue
    bb = bbox(d)
    if not bb: continue
    _,_,_,_, w, h = bb
    if w==0 or h==0: continue
    aspect = max(w/h, h/w)
    if aspect >= 5: continue
    area = w*h
    if not (30 < area < 30000): continue
    passing.append((len(d), int(w), int(h), int(area)))

print(f'\nRelaxed filter passes: {len(passing)} / {len(paths)}')
print('First 10 passing:', passing[:10])
