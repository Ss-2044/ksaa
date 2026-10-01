"""Generates an original 30s soundtrack (public/music.wav) so the video has no licensing issues.

Cinematic drone + boom hits on scene changes + modern electronic pulse
+ an oud-like plucked melody in maqam Hijaz on D. 120 BPM so beats land on scene cuts.
Run: python3 scripts/make_music.py   (needs numpy)
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 30.0
BPM = 120
BEAT = 60 / BPM
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)

L = np.zeros(N)
R = np.zeros(N)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def env(n, a, d):
    a, d = int(a * SR), int(d * SR)
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    e[n - d :] *= np.linspace(1, 0, d)
    return e


def lowpass(x, alpha):
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += alpha * (v - acc)
        y[i] = acc
    return y


# --- Drone pad: D2 + A2 + D3, detuned saws softened, slow swell
pad = np.zeros(N)
for m, g in [(38, 1.0), (45, 0.7), (50, 0.5), (53, 0.25)]:
    for det in (-0.12, 0.0, 0.12):
        f = hz(m + det)
        pad += g * (2 * ((t * f) % 1) - 1)
pad = lowpass(pad, 0.02)
swell = 0.55 + 0.45 * np.sin(2 * np.pi * t / 12 - np.pi / 2)
pad *= swell * env(N, 2.0, 3.0)
pad /= np.max(np.abs(pad))
L += pad * 0.22
R += pad * 0.22


# --- Cinematic boom (sub drop + noise burst)
def boom(length=3.0):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = 55 * np.exp(-tt * 1.4) + 30
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.3)
    noise = lowpass(rng.standard_normal(n), 0.05) * np.exp(-tt * 6)
    return sub + noise * 0.8


for s in (0.0, 3.0, 22.0, 27.0):
    add(boom(), s, gain=0.9)


# --- Riser (filtered noise sweep) into key moments
def riser(length):
    n = int(length * SR)
    tt = np.linspace(0, 1, n)
    x = rng.standard_normal(n)
    out = np.empty(n)
    acc = 0.0
    for i in range(n):
        acc += (0.005 + 0.25 * tt[i] ** 2) * (x[i] - acc)
        out[i] = acc
    return out * tt**2


add(riser(2.0), 1.0, gain=0.6)
add(riser(2.0), 20.0, gain=0.6)


# --- Kick (from 3s to 26s) and hats (from 7s)
def kick():
    n = int(0.35 * SR)
    tt = np.arange(n) / SR
    f = 150 * np.exp(-tt * 30) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)


def hat():
    n = int(0.05 * SR)
    x = rng.standard_normal(n)
    x = x - lowpass(x, 0.6)
    return x * np.exp(-np.arange(n) / SR * 80)


b = 3.0
while b < 26.0:
    add(kick(), b, gain=0.55)
    if b >= 7.0:
        add(hat(), b + BEAT / 2, pan=0.3, gain=0.25)
    b += BEAT


# --- Oud-like pluck (Karplus–Strong), maqam Hijaz on D
def pluck(midi, length=1.2, bright=0.5):
    n = int(length * SR)
    p = int(SR / hz(midi))
    buf = rng.uniform(-1, 1, p)
    out = np.empty(n)
    for i in range(n):
        v = buf[i % p]
        out[i] = v
        buf[i % p] = 0.996 * (bright * v + (1 - bright) * buf[(i + 1) % p])
    return out


D = 62  # D4
HIJAZ = [0, 1, 4, 5, 7, 8, 10, 12]  # D Eb F# G A Bb C D
phrase = [
    (0, 1), (1, 0.5), (2, 0.5), (3, 1), (2, 0.5), (1, 0.5), (0, 2),
    (4, 1), (5, 0.5), (4, 0.5), (3, 1), (2, 1), (1, 1), (2, 2),
]
time = 7.0
while time < 25.5:
    for deg, beats in phrase:
        if time >= 25.5:
            break
        add(pluck(D + HIJAZ[deg]), time, pan=-0.25, gain=0.35)
        # echo
        add(pluck(D + HIJAZ[deg]), time + BEAT * 0.75, pan=0.35, gain=0.12)
        time += beats * BEAT

# --- Final chord on outro
for m in (50, 57, 62, 66):
    add(pluck(m, 3.0, 0.6), 27.0, pan=(m - 58) / 10, gain=0.3)

# --- Master: fade, normalize, soft clip
mix = np.stack([L, R], axis=1)
mix *= env(N, 0.05, 1.5)[:, None]
mix /= np.max(np.abs(mix))
mix = np.tanh(mix * 1.3) * 0.85

out = Path(__file__).resolve().parent.parent / 'public' / 'music.wav'
with wave.open(str(out), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', out)
