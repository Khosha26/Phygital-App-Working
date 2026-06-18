from xml.etree import ElementTree as ET
import re

tree = ET.parse('/Users/mi1k/Documents/Projects/livingtree/app/assets/brand/leaves.svg')
root = tree.getroot()
ns = {'svg': 'http://www.w3.org/2000/svg'}

grads = root.findall('.//svg:linearGradient', ns)
print('Total gradients:', len(grads))
mid_colors = {}
all_colors = {}
for g in grads:
    stops = g.findall('.//svg:stop', ns)
    if not stops: continue
    mid = stops[len(stops)//2]
    style = mid.get('style') or ''
    m = re.search(r'stop-color:\s*([^;]+)', style)
    c = m.group(1).strip() if m else mid.get('stop-color')
    mid_colors[c] = mid_colors.get(c,0)+1
    for s in stops:
        sstyle = s.get('style') or ''
        sm = re.search(r'stop-color:\s*([^;]+)', sstyle)
        sc = sm.group(1).strip() if sm else s.get('stop-color')
        all_colors[sc] = all_colors.get(sc,0)+1

print('\nMID stop colors (top 20):')
for c, n in sorted(mid_colors.items(), key=lambda x: -x[1])[:20]:
    print(f'  {c}: {n}')

print('\nALL stop colors (top 20):')
for c, n in sorted(all_colors.items(), key=lambda x: -x[1])[:20]:
    print(f'  {c}: {n}')
