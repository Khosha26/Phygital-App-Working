from xml.etree import ElementTree as ET
import re

tree = ET.parse('/Users/mi1k/Documents/Projects/livingtree/app/assets/brand/leaves.svg')
root = tree.getroot()
ns = {'svg': 'http://www.w3.org/2000/svg'}

print('Root tag:', root.tag, 'viewBox:', root.get('viewBox'))

paths = root.findall('.//svg:path', ns)
print('Total paths:', len(paths))

if paths:
    lens = [len(p.get('d') or '') for p in paths]
    bezC = [(p.get('d') or '').count('C') + (p.get('d') or '').count('c') for p in paths]
    print('d-length min/max/median:', min(lens), max(lens), sorted(lens)[len(lens)//2])
    print('bezier count min/max:', min(bezC), max(bezC))

    for i, p in enumerate(paths[:5]):
        d = p.get('d') or ''
        fill = p.get('fill') or ''
        style = p.get('style') or ''
        print(f'path[{i}] len={len(d)} bez={d.count("C")+d.count("c")} fill={fill!r} style={style[:80]!r}')
        print('  d-sample:', d[:140])

# Check bbox stats with our heuristic
def bbox_of(d):
    nums = re.findall(r'-?\d+(?:\.\d+)?', d)
    if not nums:
        return None
    xs = [float(n) for n in nums[0::2]]
    ys = [float(n) for n in nums[1::2]]
    return min(xs), min(ys), max(xs), max(ys), max(xs)-min(xs), max(ys)-min(ys)

passing = 0
sample_pass = []
for p in paths:
    d = p.get('d') or ''
    if not (240 <= len(d) <= 1400):
        continue
    if (d.count('C')+d.count('c')) < 4:
        continue
    bb = bbox_of(d)
    if not bb:
        continue
    minX, minY, maxX, maxY, w, h = bb
    if w == 0 or h == 0:
        continue
    aspect = max(w/h, h/w)
    if aspect >= 5:
        continue
    area = w*h
    if not (100 < area < 4000):
        continue
    passing += 1
    if len(sample_pass) < 3:
        sample_pass.append((len(d), w, h, area))

print(f'Paths matching our filter: {passing}')
print('Sample pass (len,w,h,area):', sample_pass)

# Check linearGradients
grads = root.findall('.//svg:linearGradient', ns)
print(f'linearGradients: {len(grads)}')
if grads:
    g = grads[0]
    print(' first grad id:', g.get('id'))
    stops = g.findall('.//svg:stop', ns)
    print(' stops:', len(stops), 'first:', stops[0].get('stop-color') if stops else None, stops[0].get('style') if stops else None)
