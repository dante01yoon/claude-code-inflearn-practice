# OSM 형상만 그린 지도 바탕(글자 없음, 2배). 글자·핀은 Figma에서 텍스트·컴포넌트로 얹는다.
import json, math, sys
from PIL import Image, ImageDraw
v = json.load(open('data/view.json')); d = json.load(open('data/osm.json'))['elements']
Z, T = v['zoom'], 256; M = v.get('margin', {'l': 0, 'r': 0, 't': 0, 'b': 0}); ox, oy = v['origin'][0] - M['l'], v['origin'][1] - M['t']; S = 2
W, H = (390 + M['l'] + M['r']) * S, (844 + M['t'] + M['b']) * S
def px(lat, lng):
    n = 2 ** Z
    x = (lng + 180) / 360 * n * T
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n * T
    return ((x - ox) * S, (y - oy) * S)
C = {'bg': '#F1F0EC', 'water': '#C9DDE8', 'park': '#DCE8D3', 'case': '#E0DCD3', 'road': '#FFFFFF', 'major': '#FFFFFF', 'rail': '#D6D2C8'}
img = Image.new('RGB', (W, H), C['bg']); g = ImageDraw.Draw(img)
def join(parts):
    # 멀티폴리곤 outer 조각들을 끝점끼리 이어 닫힌 고리로 만든다
    parts = [[(q['lat'], q['lon']) for q in g] for g in parts]; out = []
    while parts:
        r = parts.pop(0)
        while r[0] != r[-1]:
            for i, q in enumerate(parts):
                if q[0] == r[-1]: r += q[1:]
                elif q[-1] == r[-1]: r += q[::-1][1:]
                elif q[-1] == r[0]: r = q + r[1:]
                elif q[0] == r[0]: r = q[::-1] + r[1:]
                else: continue
                parts.pop(i); break
            else: break
        out.append([{'lat': a, 'lon': b} for a, b in r])
    return out
def rings(e, role='outer'):
    if e['type'] == 'way': return [e['geometry']] if role == 'outer' else []
    return join([m['geometry'] for m in e.get('members', []) if m.get('role') == role and 'geometry' in m])
def poly(e, col):
    for r in rings(e):
        if len(r) > 2: g.polygon([px(p['lat'], p['lon']) for p in r], fill=col)
    for r in rings(e, 'inner'):
        if len(r) > 2: g.polygon([px(p['lat'], p['lon']) for p in r], fill=C['bg'])
tag = lambda e, k: e.get('tags', {}).get(k, '')
for e in d:
    if tag(e, 'natural') == 'water' or tag(e, 'waterway') == 'riverbank': poly(e, C['water'])
for e in d:
    if tag(e, 'leisure') == 'park': poly(e, C['park'])
W_ = {'motorway': 9, 'trunk': 9, 'primary': 8, 'secondary': 7, 'tertiary': 6, 'residential': 3.5, 'unclassified': 3.5, 'living_street': 3, 'pedestrian': 3}
ways = [e for e in d if e['type'] == 'way' and tag(e, 'highway') in W_]
for layer in ('case', 'road'):
    for e in sorted(ways, key=lambda e: W_[tag(e, 'highway')]):
        w = W_[tag(e, 'highway')] * S / 2
        pts = [px(p['lat'], p['lon']) for p in e['geometry']]
        g.line(pts, fill=C[layer], width=round(w + (2 * S if layer == 'case' else 0)), joint='curve')
for e in d:
    if e['type'] == 'way' and tag(e, 'railway') == 'rail':
        g.line([px(p['lat'], p['lon']) for p in e['geometry']], fill=C['rail'], width=3 * S)
img.save('data/map-base@2x.png', optimize=True)
labels = []
for e in d:
    if e['type'] == 'node':
        x, y = px(e['lat'], e['lon'])
        if 0 <= x <= W and 0 <= y <= H:
            labels.append({'name': tag(e, 'name'), 'kind': 'station' if tag(e, 'railway') == 'station' else 'area', 'x': round(x / S - M['l'], 1), 'y': round(y / S - M['t'], 1)})  # 화면(뷰포트) 좌표
json.dump(labels, open('data/map-labels.json', 'w'), ensure_ascii=False, indent=1)
print(labels)
