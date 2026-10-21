"""Extra assets for the bold (dark) deck: plain dark backgrounds and darkened full-bleed stills."""
import os, subprocess
import numpy as np
from PIL import Image, ImageEnhance

ROOT = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(ROOT, 'assets')
VID = os.path.join(ROOT, '..', 'neo-capta-video', 'out')

# plain dark gradient, no dots
w, h = 2400, 1350
yy, xx = np.mgrid[0:h, 0:w].astype(float)
d = np.sqrt(((xx - 0.8 * w) / (1.1 * w)) ** 2 + ((yy - 0.2 * h) / (1.1 * h)) ** 2)
c0, c1 = np.array([23, 36, 107.]), np.array([3, 4, 13.])
t = np.clip(d / 0.9, 0, 1)[..., None]
Image.fromarray((c0 * (1 - t) + c1 * t).astype('uint8')).save(os.path.join(A, 'bg-plain.jpg'), quality=92)

def grab(src, t, out):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(t), '-i', os.path.join(VID, src), '-frames:v', '1', '-q:v', '2', out], check=True)

def darken(src_img, out, amount=0.45, side=None, shift=0):
    im = Image.open(src_img).convert('RGB')
    im = ImageEnhance.Brightness(im).enhance(amount)
    if side:  # fade one side to near-black so text sits on it
        a = np.asarray(im).astype(float)
        hh, ww = a.shape[:2]
        x = np.linspace(0, 1, ww)
        ramp = np.clip((x - 0.38) / 0.17, 0, 1) if side == 'right' else np.clip((0.62 - x) / 0.17, 0, 1)
        y = np.linspace(0, 1, hh)[:, None]
        k = ((1 - ramp)[None, :] * (1 - np.clip((y - 0.8) / 0.12, 0, 1)))[..., None]
        a = a * k + np.array([3, 4, 13.]) * (1 - k)
        im = Image.fromarray(a.astype('uint8'))
    if shift:  # move the frame left, filling the right with the dark base
        a = np.asarray(im).astype(float)
        hh, ww = a.shape[:2]
        dx = int(ww * shift)
        b = np.zeros_like(a) + np.array([3, 4, 13.])
        b[:, : ww - dx] = a[:, dx:]
        x = np.linspace(0, 1, ww)
        k = (1 - np.clip((x - 0.42) / 0.12, 0, 1))[None, :, None]
        im = Image.fromarray((b * k + np.array([3, 4, 13.]) * (1 - k)).astype('uint8'))
    im.save(out, quality=92)

tmp = os.path.join(A, '_tmp.jpg')
for src, t, out, amt, side, *rest in [
    ('neo-capta-ar.mp4', 10.9, 'hero-cover.jpg', 0.7, None, 0.24),
    ('scroll-ar.mp4', 8.5, 'hero-scroll.jpg', 0.4, None),
    ('manifesto-ar.mp4', 2.8, 'hero-noise.jpg', 0.55, None),
    ('journey-ar.mp4', 13.2, 'hero-about.jpg', 0.8, 'right'),
    ('rush-ar.mp4', 1.35, 'work-rush.jpg', 1.0, None),
    ('story-ar.mp4', 12.3, 'work-impact.jpg', 1.0, None),
    ('blank-page-ar.mp4', 8.5, 'work-blank.jpg', 1.0, None),
    ('vertical-sting-ar.mp4', 3.7, 'work-sting.jpg', 1.0, None),
    ('vertical-story-ar.mp4', 10.9, 'work-story-v.jpg', 1.0, None),
    ('square-carousel-ar.mp4', 6.4, 'work-carousel.jpg', 1.0, None),
]:
    grab(src, t, tmp)
    darken(tmp, os.path.join(A, out), amt, side, *rest)
os.remove(tmp)
print('ok')
