"""Prepares Mahd («محض») assets from the client's three invitation designs.

    python3 mahd/assets.py   # -> public/mahd/*  and  src/mahd.json
"""
import json, os
import numpy as np
import potrace
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(HERE, '..', 'public', 'mahd')
SRC = os.path.join(HERE, '..', 'src')
os.makedirs(PUB, exist_ok=True)

counter = Image.open(os.path.join(HERE, 'source-counter.jpg')).convert('RGB')
flat = Image.open(os.path.join(HERE, 'source-flat.jpg')).convert('RGB')
store = Image.open(os.path.join(HERE, 'source-storefront.jpg')).convert('RGB')

# Illustrations (upscaled 2x for 1080-wide video).
for img, box, name in [(counter, (62, 285, 836, 975), 'counter.jpg'), (store, (62, 213, 836, 975), 'storefront.jpg')]:
    c = img.crop(box)
    c = c.resize((c.width * 2, c.height * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2, percent=60))
    c.save(os.path.join(PUB, name), quality=93)

# Brand colours sampled from the flat design.
a = np.asarray(flat).astype(int)
green = a[40:80, 40:120].reshape(-1, 3).mean(0)
cream = a[700:760, 40:120].reshape(-1, 3).mean(0)
tile = np.asarray(counter).astype(int)[880:920, 200:260].reshape(-1, 3).mean(0)
hexc = lambda c: '#%02X%02X%02X' % tuple(int(round(v)) for v in c)

def trace(region_img, threshold=150, scale=6):
    im = region_img.resize((region_img.width * scale, region_img.height * scale), Image.LANCZOS).filter(ImageFilter.GaussianBlur(scale * 0.35))
    lum = np.asarray(im.convert('L')).astype(float)
    mask = lum > threshold  # cream shapes on green
    bm = potrace.Bitmap(~mask)
    p = bm.trace(turdsize=40, alphamax=1.0, opttolerance=0.3)
    d = []
    for curve in p:
        s = curve.start_point
        d.append(f'M{s.x:.1f},{s.y:.1f}')
        for seg in curve.segments:
            if seg.is_corner:
                d.append(f'L{seg.c.x:.1f},{seg.c.y:.1f}L{seg.end_point.x:.1f},{seg.end_point.y:.1f}')
            else:
                d.append(f'C{seg.c1.x:.1f},{seg.c1.y:.1f} {seg.c2.x:.1f},{seg.c2.y:.1f} {seg.end_point.x:.1f},{seg.end_point.y:.1f}')
        d.append('Z')
    return {'w': im.width, 'h': im.height, 'd': ''.join(d)}

data = {
    'colors': {'green': hexc(green), 'cream': hexc(cream), 'tile': hexc(tile)},
    'logo': trace(flat.crop((344, 128, 556, 168)), threshold=140, scale=8),
    'storefront': trace(flat.crop((80, 286, 820, 520)), threshold=150, scale=3),
}
# Dot targets for the logo (in the logo's traced coordinate space).
lg = flat.crop((344, 128, 556, 168))
lg = lg.resize((lg.width * 8, lg.height * 8), Image.LANCZOS).filter(ImageFilter.GaussianBlur(2.8))
lm = np.asarray(lg.convert('L')) > 140
step = 20
data['logoDots'] = [[x, y] for y in range(step // 2, lm.shape[0], step) for x in range(step // 2 + (step // 2 if (y // step) % 2 else 0), lm.shape[1], step) if lm[y, x]]
json.dump(data, open(os.path.join(SRC, 'mahd.json'), 'w'))
print(len(data['logoDots']), 'dots', data['colors'], 'logo', data['logo']['w'], data['logo']['h'], len(data['logo']['d']), 'store', len(data['storefront']['d']))
