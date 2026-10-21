"""Builds the deck's image assets: logo PNGs, halftone backgrounds, video stills."""
import json, subprocess, sys, os
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.abspath(__file__))
VID = os.path.join(ROOT, '..', 'neo-capta-video')
A = os.path.join(ROOT, 'assets')
CHROME = os.environ.get('CHROME', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
BLUE, BLUE_LIGHT, WHITE, NAVY = '#3B4CC0', '#7486F2', '#E8E9EE', '#0A1033'

# --- logos (transparent PNG via headless Chrome) ---------------------------
logo = json.load(open(os.path.join(VID, 'src', 'logo.json')))
W, H = logo['w'], logo['h']
for name, capta in [('logo-dark-bg', WHITE), ('logo-light-bg', NAVY)]:
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
           f'<path fill="{BLUE_LIGHT if capta == WHITE else BLUE}" fill-rule="evenodd" d="{logo["neo"]}"/>'
           f'<path fill="{capta}" fill-rule="evenodd" d="{logo["capta"]}"/>'
           f'<path fill="{BLUE_LIGHT if capta == WHITE else BLUE}" fill-rule="evenodd" d="{logo["person"]}"/></svg>')
    html = f'<html><body style="margin:0;background:transparent">{svg}</body></html>'
    p = os.path.join(A, name + '.html'); open(p, 'w').write(html)
    subprocess.run([CHROME, '--no-sandbox', '--hide-scrollbars', '--default-background-color=00000000',
                    f'--window-size={W},{H}', f'--screenshot={os.path.join(A, name + ".png")}', 'file://' + p],
                   check=True, stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
    os.remove(p)

# runner mark alone (white) for icon use
x0, y0, x1, y1 = logo['bbox']['person']; pad = 20
pw, ph = x1 - x0 + 2 * pad, y1 - y0 + 2 * pad
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{pw}" height="{ph}" viewBox="{x0-pad} {y0-pad} {pw} {ph}">'
       f'<path fill="#FFFFFF" fill-rule="evenodd" d="{logo["person"]}"/></svg>')
p = os.path.join(A, 'runner.html'); open(p, 'w').write(f'<html><body style="margin:0;background:transparent">{svg}</body></html>')
subprocess.run([CHROME, '--no-sandbox', '--hide-scrollbars', '--default-background-color=00000000', f'--window-size={pw},{ph}',
                f'--screenshot={os.path.join(A, "runner-white.png")}', 'file://' + p], check=True, stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
os.remove(p)

# --- backgrounds -------------------------------------------------------------
def hexrgb(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)

def background(path, cx, cy, band_angle=0.55, band_offset=0.0, dots=True, size=(2400, 1350)):
    w, h = size
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    d = np.sqrt(((xx - cx * w) / (0.8 * w)) ** 2 + ((yy - cy * h) / (0.9 * h)) ** 2)
    stops = [(0, hexrgb('#17246b')), (0.38, hexrgb('#0a1033')), (0.72, hexrgb('#03040d')), (1.0, hexrgb('#000000'))]
    img = np.zeros((h, w, 3))
    for (a, ca), (b, cb) in zip(stops, stops[1:]):
        m = (d >= a) & (d < b) if b < 1 else (d >= a)
        t = np.clip((d - a) / (b - a), 0, 1)[..., None]
        img[m] = (ca * (1 - t) + cb * t)[m]
    im = Image.fromarray(img.astype('uint8'))
    if dots:
        dr = ImageDraw.Draw(im, 'RGBA')
        sp = 30
        for r in range(0, h // sp + 2):
            for c in range(0, w // sp + 2):
                x = c * sp + (sp / 2 if r % 2 else 0); y = r * sp
                v = (x * band_angle + y) / (w * band_angle + h) - (0.45 + band_offset)
                k = np.exp(-(v * v) / (2 * 0.09 ** 2))
                if k < 0.05: continue
                rad = 1 + 4.5 * k
                col = (232, 233, 238, int(150 * k)) if k > 0.6 else (116, 134, 242, int(170 * k))
                dr.ellipse([x - rad, y - rad, x + rad, y + rad], fill=col)
    im.save(path, quality=92)

background(os.path.join(A, 'bg-cover.jpg'), 0.7, 0.4)
background(os.path.join(A, 'bg-quote.jpg'), 0.3, 0.55, band_offset=0.1)
background(os.path.join(A, 'bg-close.jpg'), 0.5, 0.45, band_offset=-0.05)

# light halftone corner for content slides
w, h = 2400, 1350
im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); dr = ImageDraw.Draw(im)
for r in range(0, h // 30 + 2):
    for c in range(0, w // 30 + 2):
        x = c * 30 + (15 if r % 2 else 0); y = r * 30
        k = max(0.0, 1 - np.hypot(x / w, (h - y) / h) / 0.55)
        if k <= 0.02: continue
        rad = 0.8 + 5 * k
        dr.ellipse([x - rad, y - rad, x + rad, y + rad], fill=(59, 76, 192, int(90 * k)))
im.save(os.path.join(A, 'halftone-corner.png'))

# --- stills from the rendered videos -------------------------------------
stills = {
    'still-story.jpg': ('story-ar.mp4', 10.9),
    'still-manifesto.jpg': ('manifesto-ar.mp4', 7.3),
    'still-journey.jpg': ('journey-ar.mp4', 9.0),
    'still-scroll.jpg': ('scroll-ar.mp4', 8.5),
    'still-editorial.jpg': ('editorial-ar.mp4', 4.6),
    'still-intro.jpg': ('neo-capta-ar.mp4', 11.3),
    'still-before-after.jpg': ('vertical-before-after-ar.mp4', 8.0),
    'still-brief.jpg': ('vertical-brief-ar.mp4', 8.5),
    'still-rush.jpg': ('rush-ar.mp4', 1.35),
    'still-grid.jpg': ('square-grid-ar.mp4', 6.0),
    'still-countdown.jpg': ('square-countdown-ar.mp4', 2.6),
    'still-carousel.jpg': ('square-carousel-ar.mp4', 4.0),
}
for out, (src, t) in stills.items():
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(t), '-i', os.path.join(VID, 'out', src),
                    '-frames:v', '1', '-q:v', '3', os.path.join(A, out)], check=True)
print('assets ok', sorted(os.listdir(A)))
