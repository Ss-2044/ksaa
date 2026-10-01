"""Generates an original 30s ceremonial soundtrack (public/music.wav) — no licensing issues.

Mood: regal "signing ceremony". Warm string pad on a D major progression, Ardah-style big
frame drums, brass stabs and timpani on scene changes, bell arpeggios, and two stamp
hits synced to the logo seals in the signing scene. Cue times match src/theme.ts.
Run: python3 scripts/make_music.py   (needs numpy)
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 30.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(11)
L = np.zeros(N)
R = np.zeros(N)

# Cue points (seconds) — keep in sync with SCENES / SEAL_FRAMES in src/theme.ts
ANNOUNCE, SIGNING, UNION, TAGLINE, OUTRO = 3.0, 9.0, 15.0, 21.0, 26.0
SEALS = [SIGNING + 100 / 30, SIGNING + 118 / 30]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def adsr(n, a, r):
    e = np.ones(n)
    a, r = max(1, int(a * SR)), max(1, int(r * SR))
    e[:a] = np.linspace(0, 1, a)
    e[n - r :] *= np.linspace(1, 0, r)
    return e


def onepole(x, alpha):
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += alpha * (v - acc)
        y[i] = acc
    return y


# --- String pad: D – Bm – G – A progression, 3s per chord, soft vibrato
CHORDS = [
    [50, 57, 62, 66],  # D
    [47, 54, 62, 66],  # Bm
    [43, 50, 59, 62],  # G
    [45, 52, 61, 64],  # A
]


def strings(notes, length):
    n = int(length * SR)
    tt = np.arange(n) / SR
    out = np.zeros(n)
    for m in notes:
        for det in (-0.08, 0.0, 0.08):
            f = hz(m + det) * (1 + 0.004 * np.sin(2 * np.pi * 5.2 * tt + m))
            ph = 2 * np.pi * np.cumsum(f) / SR
            out += np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)
    return out / (len(notes) * 3) * adsr(n, 0.8, 0.8)


time, k = 0.0, 0
while time < DUR:
    length = min(3.6, DUR - time)
    gain = 0.35 if time < UNION else 0.5
    add(strings(CHORDS[k % 4], length), time, pan=(-0.2 if k % 2 else 0.2), gain=gain)
    time += 3.0
    k += 1


# --- Timpani hit + roll
def timpani(m=38, length=2.5):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = hz(m) * (1 + 0.15 * np.exp(-tt * 20))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.2)
    noise = onepole(rng.standard_normal(n), 0.08) * np.exp(-tt * 25)
    return body + noise * 0.6


def roll(length, m=38):
    out = np.zeros(int(length * SR))
    step = 0.06
    s = 0.0
    while s < length - 0.05:
        hit = timpani(m, 0.4) * (0.15 + 0.85 * (s / length) ** 2)
        i = int(s * SR)
        out[i : i + len(hit)] += hit[: len(out) - i]
        s += step
    return out


add(roll(2.0), 1.0, gain=0.5)
add(roll(1.5), TAGLINE - 1.5, gain=0.5)
for c in (0.0, ANNOUNCE, UNION, TAGLINE, OUTRO):
    add(timpani(), c, gain=0.9)


# --- Brass stab (filtered saw chord with bright attack)
def brass(notes, length=1.4):
    n = int(length * SR)
    tt = np.arange(n) / SR
    out = np.zeros(n)
    for m in notes:
        for det in (-0.1, 0.1):
            out += 2 * ((tt * hz(m + det)) % 1) - 1
    cutoff = 0.02 + 0.25 * np.exp(-tt * 4)
    y = np.empty(n)
    acc = 0.0
    for i in range(n):
        acc += cutoff[i] * (out[i] - acc)
        y[i] = acc
    return y / len(notes) * adsr(n, 0.02, 0.6)


add(brass([50, 57, 62, 66]), ANNOUNCE, gain=0.5)
add(brass([43, 50, 55, 59]), UNION, gain=0.5)
add(brass([45, 52, 57, 61]), TAGLINE, gain=0.6)
add(brass([38, 50, 57, 62, 66], 3.5), OUTRO, gain=0.6)


# --- Ardah-style frame drums (big "tabl" + slap), 120 BPM grid
def tabl():
    n = int(0.5 * SR)
    tt = np.arange(n) / SR
    f = 90 * np.exp(-tt * 18) + 55
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7)


def slap():
    n = int(0.12 * SR)
    x = rng.standard_normal(n)
    x = x - onepole(x, 0.15)
    return x * np.exp(-np.arange(n) / SR * 40)


# one bar = 2s: DUM . . DUM | . tak DUM . | DUM . . DUM | tak . tak .
PATTERN = [(0.0, 'D'), (0.375, 'D'), (0.625, 's'), (0.75, 'D'), (1.0, 'D'), (1.375, 'D'), (1.5, 's'), (1.75, 's')]
bar = ANNOUNCE
while bar < OUTRO:
    for off, kind in PATTERN:
        at = bar + off
        if at >= OUTRO:
            break
        loud = 1.0 if at >= UNION else 0.7
        if kind == 'D':
            add(tabl(), at, gain=0.6 * loud)
        else:
            add(slap(), at, pan=0.35, gain=0.3 * loud)
    bar += 2.0


# --- Bell arpeggios (FM) during signing & union
def bell(m, length=1.6):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = hz(m)
    mod = np.sin(2 * np.pi * f * 3.5 * tt) * 2.0 * np.exp(-tt * 3)
    return np.sin(2 * np.pi * f * tt + mod) * np.exp(-tt * 2.5)


ARP = [74, 78, 81, 86, 81, 78]  # D major arpeggio
s, j = SIGNING, 0
while s < TAGLINE:
    if not any(abs(s - x) < 0.3 for x in SEALS):
        add(bell(ARP[j % len(ARP)]), s, pan=0.4 * np.sin(j), gain=0.18)
    s += 0.25
    j += 1


# --- Stamp hits on the two logo seals: heavy thud + bright chime
def stamp():
    n = int(1.2 * SR)
    tt = np.arange(n) / SR
    thud = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-tt * 12) + 40) / SR) * np.exp(-tt * 10)
    knock = onepole(rng.standard_normal(n), 0.3) * np.exp(-tt * 60)
    return thud + knock * 0.7


for x, m in zip(SEALS, (86, 90)):
    add(stamp(), x, gain=1.0)
    add(bell(m, 2.0), x, gain=0.35)

# --- Master
mix = np.stack([L, R], axis=1)
mix *= adsr(N, 0.05, 2.0)[:, None]
mix /= np.max(np.abs(mix))
mix = np.tanh(mix * 1.4) * 0.88

out = Path(__file__).resolve().parent.parent / 'public' / 'music.wav'
with wave.open(str(out), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', out)
