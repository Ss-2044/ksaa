"""Synthesize the 30s score for the Blink design (bright, rhythmic, 110 BPM).

Writes public/audio/blink.wav. Requires numpy.
Cues: 0 eye opens | 3 blink + "look" hits | 7-8 whoosh into lavender
      8 noise → 10.7 "meaning" chime | 14 blink, full groove (orbit)
      20 groove drops, tension | 25 lids shut, silence | 26 bloom | 29.5 last blink
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 30.0
BEAT = 60 / 110
t = np.arange(int(SR * DUR)) / SR
rng = np.random.default_rng(5)
noise = rng.standard_normal(len(t))


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def at(start, length):
    x = t - start
    return x, (x >= 0) & (x < length)


def pluck(start, midi, decay=7.0, length=0.8):
    x, m = at(start, length)
    out = np.zeros_like(t)
    f = hz(midi)
    out[m] = (np.sin(2 * np.pi * f * x[m]) + 0.3 * np.sin(4 * np.pi * f * x[m])) * np.exp(-x[m] * decay)
    return out


def kick(start, amp=1.0):
    x, m = at(start, 0.4)
    out = np.zeros_like(t)
    freq = 48 + 110 * np.exp(-x[m] * 35)
    out[m] = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-x[m] * 10) * amp
    return out


bright = noise - lowpass(noise, 5000)
mid = lowpass(noise, 3000) - lowpass(noise, 800)


def hit(start, src, length, decay, amp):
    x, m = at(start, length)
    out = np.zeros_like(t)
    out[m] = src[m] * np.exp(-x[m] * decay) * amp
    return out


def swish(start, length=0.3, amp=0.5):
    """Filtered noise that swells and dies — an eyelid moving."""
    x, m = at(start, length)
    out = np.zeros_like(t)
    env = np.sin(np.pi * x[m] / length) ** 2
    out[m] = mid[m] * env * amp
    return out


mix = np.zeros_like(t)

# eye opens, then the 3s blink
mix += swish(0.0, 0.6, 0.6) + pluck(0.5, 74, 2.5, 2.5) * 0.3 + pluck(0.5, 81, 2.5, 2.5) * 0.2
mix += swish(3.0, 0.35, 0.6)

# "look / look closer / closer" mallet hits, rising
for s, n in ((3.33, 69), (4.5, 74), (5.67, 81)):
    mix += pluck(s, n, 5, 1.2) * 0.6 + pluck(s, n - 12, 5, 1.2) * 0.4 + kick(s, 0.6)

# whoosh into the lavender dot
x, m = at(6.9, 1.1)
rise = np.zeros_like(t)
rise[m] = (x[m] / 1.1) ** 2
mix += rise * (mid * 0.6 + bright * 0.3) + kick(8.0, 0.9)

# 8–14s: busy clicks (the noise) resolving into a chime at "meaning"
for c in np.sort(rng.uniform(8.0, 10.6, 60)):
    mix += hit(c, bright, 0.04, 90, 0.18)
for n in (74, 78, 81, 86):
    mix += pluck(10.67, n, 1.6, 3.2) * 0.22
pad = sum(np.sin(2 * np.pi * hz(n) * t) for n in (50, 57, 62, 66))
mix += 0.05 * pad * np.interp(t, [10.5, 11.5, 13.6, 14.0], [0, 1, 1, 0], left=0, right=0)

# 14–20s: blink, then the full groove with a Lydian pluck line
mix += swish(14.0, 0.35, 0.6)
line = [74, 78, 81, 80, 78, 81, 85, 81]
for i, b in enumerate(np.arange(14.0, 20.0, BEAT / 2)):
    mix += pluck(b, line[i % len(line)], 9, 0.5) * 0.3
    if i % 2 == 0:
        mix += kick(b, 0.9)
    else:
        mix += hit(b, bright, 0.06, 60, 0.25)
    if i % 4 == 2:
        mix += hit(b, mid, 0.18, 22, 0.45)  # clap on 2 and 4

# 20–25s: groove drops; ticking and a rising drone as the lids close
drone = np.sin(2 * np.pi * np.cumsum(55 + 30 * np.clip((t - 20) / 5, 0, 1)) / SR)
mix += 0.35 * drone * np.interp(t, [20, 21, 24.8, 25.0], [0, 1, 1, 0], left=0, right=0)
for i, k in enumerate(np.arange(20.0, 25.0, BEAT / 2)):
    mix += hit(k, bright, 0.03, 120, 0.25 + 0.03 * i)
mix += swish(24.4, 0.6, 0.5) + kick(25.0, 1.2)  # lids shut

# 26s: eyes open onto the logo — a bloom chord and bell
mix += swish(26.0, 0.35, 0.6)
bloom = sum(np.sin(2 * np.pi * hz(n) * t) for n in (50, 57, 62, 66, 69, 74))
mix += 0.06 * bloom * np.interp(t, [26.0, 26.4, 29.0, 30.0], [0, 1, 1, 0], left=0, right=0)
for n in (86, 93):
    mix += pluck(26.05, n, 1.2, 3.5) * 0.25
mix += kick(26.0, 0.9)
mix += swish(29.5, 0.35, 0.5)  # final blink

mix *= np.interp(t, [0, 0.01, DUR - 0.4, DUR], [0, 1, 1, 0])
mix = np.tanh(mix * 1.1)
mix = mix / np.abs(mix).max() * 0.85

d = int(0.011 * SR)
right = np.concatenate([mix[:d], mix[:-d]]) * 0.3 + mix * 0.7
stereo = np.stack([mix, right], axis=1)

out = Path(__file__).resolve().parent.parent / "public" / "audio" / "blink.wav"
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype("<i2").tobytes())
print("wrote", out)
