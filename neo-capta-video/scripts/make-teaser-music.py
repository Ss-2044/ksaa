"""Synthesize the 30s trailer score for the Teaser design.

Writes public/audio/teaser.wav. Requires numpy.
Beats: 0 heartbeat | 2 word hits | 6 glitch montage | 12 quiet horizon
       16 riser | 21.67 silence | 22 braam + logo | 26 soft hit | 30 end
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 30.0
t = np.arange(int(SR * DUR)) / SR
rng = np.random.default_rng(11)
noise = rng.standard_normal(len(t))


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def window(start, length):
    x = t - start
    return x, (x >= 0) & (x < length)


def thump(at, f0=110, f1=42, decay=9.0, length=0.6):
    x, m = window(at, length)
    out = np.zeros_like(t)
    freq = f1 + (f0 - f1) * np.exp(-x[m] * 25)
    out[m] = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-x[m] * decay)
    return out


def burst(at, length=0.18, decay=18.0, src=noise):
    x, m = window(at, length)
    out = np.zeros_like(t)
    out[m] = src[m] * np.exp(-x[m] * decay)
    return out


def saw(f):
    return 2 * ((f * t) % 1.0) - 1


bright = noise - lowpass(noise, 3000)
dark = lowpass(noise, 700)
mix = np.zeros_like(t)

# sub drone under everything before the drop
drone = (np.sin(2 * np.pi * 55 * t) + 0.4 * np.sin(2 * np.pi * 110 * t + 0.5)) * (0.5 + 0.2 * np.sin(2 * np.pi * 0.15 * t))
drone *= np.interp(t, [0, 1.5, 11.8, 12.4, 15.6, 16.2, 21.6, 21.67], [0, 0.35, 0.35, 0.12, 0.12, 0.45, 0.8, 0], right=0)
mix += drone

# 0–2s heartbeat (lub-dub)
for b in (0.05, 0.85, 1.6):
    mix += thump(b) * 0.9 + thump(b + 0.22, 90, 40) * 0.5

# 2–6s one hit per word
for i in range(5):
    at = 2.0 + i * 0.7
    mix += thump(at, 140, 45, 7) * (0.8 + 0.1 * i) + burst(at, 0.25, 14, bright) * 0.25

# 6–12s glitch montage: cut hits, crushed noise, ticking hats
crushed = np.repeat(noise[::40], 40)[: len(t)]
for i in range(4):
    at = 6.0 + i * 1.5
    mix += thump(at, 160, 50, 8) * 0.9 + burst(at, 0.3, 10, crushed) * 0.35
for h in np.arange(6.0, 12.0, 0.25):
    mix += burst(h, 0.05, 70, bright) * 0.14

# 12–16s near silence: wind
wind = dark * np.interp(t, [11.8, 12.5, 15.5, 16.2], [0, 0.08, 0.08, 0], left=0, right=0)
mix += wind * (1 + 0.5 * np.sin(2 * np.pi * 0.4 * t))

# 16–21.67s riser: rising tone, swelling noise, accelerating ticks
rise = np.clip((t - 16) / 5.67, 0, 1) * (t < 21.67)
sweep_f = 180 + 900 * rise**2
mix += 0.35 * rise**1.5 * np.sin(2 * np.pi * np.cumsum(sweep_f) / SR)
mix += 0.5 * rise**2 * (bright * 0.6 + dark)
tick = 16.0
while tick < 21.6:
    mix += burst(tick, 0.03, 120, bright) * 0.3
    tick += 0.5 - 0.4 * ((tick - 16) / 5.67)

# 22s braam: detuned saw cluster through a lowpass, plus boom and crash
braam_env = np.where(t >= 22, np.exp(-np.clip(t - 22, 0, None) * 0.9) * np.clip((t - 22) / 0.04, 0, 1), 0)
braam = sum(saw(f) for f in (55, 55.3, 82.4, 110, 110.6, 164.8))
braam = lowpass(np.tanh(braam * 0.6) * braam_env, 900)
mix += braam * 1.4 + thump(22.0, 90, 30, 1.5, 4) * 1.3 + burst(22.0, 2.5, 2.2, bright) * 0.45

# 22.5–30s shimmer pad, soft hit on the tagline
pad_env = np.interp(t, [22.3, 23.5, 28, 30], [0, 1, 1, 0], left=0, right=0)
for f in (440, 659.3, 880, 1318.5):
    mix += 0.06 * pad_env * np.sin(2 * np.pi * f * t) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.5 * t + f))
mix += thump(26.0, 120, 45, 4, 1.5) * 0.6 + burst(26.0, 1.2, 4, bright) * 0.12

mix *= np.interp(t, [0, 0.01, DUR - 1.5, DUR], [0, 1, 1, 0])
mix = np.tanh(mix * 1.1)
mix = mix / np.abs(mix).max() * 0.85

d = int(0.009 * SR)
right = np.concatenate([mix[:d], mix[:-d]]) * 0.3 + mix * 0.7
stereo = np.stack([mix, right], axis=1)

out = Path(__file__).resolve().parent.parent / "public" / "audio" / "teaser.wav"
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype("<i2").tobytes())
print("wrote", out)
