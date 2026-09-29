"""Synthesize the 30s score for the Aurora design: warm, elegant, cinematic.

Writes public/audio/aurora.wav. Requires numpy.
Cues: 0 swell | 0.6 logo blinds chime | 3 tagline flips | 8 skyline draws
      14 low hit, strips | 19 carousel pulse | 25 resolve | 30 end
Chords: Dmaj9 → Bm9 → Gmaj7(#11) → A6sus → D
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 30.0
t = np.arange(int(SR * DUR)) / SR
rng = np.random.default_rng(21)
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


def piano(start, midi, amp=0.3, decay=2.2, length=3.0):
    x, m = at(start, length)
    out = np.zeros_like(t)
    f = hz(midi)
    ph = 2 * np.pi * f * x[m]
    out[m] = (np.sin(ph) + 0.4 * np.sin(2 * ph) * np.exp(-x[m] * 3) + 0.15 * np.sin(3 * ph) * np.exp(-x[m] * 5)) * np.exp(-x[m] * decay) * amp * np.clip(x[m] * 200, 0, 1)
    return out


def boom(start, amp=0.8):
    x, m = at(start, 2.5)
    out = np.zeros_like(t)
    f = 32 + 40 * np.exp(-x[m] * 8)
    out[m] = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x[m] * 1.8) * amp
    return out


def riser(start, length, amp=0.3):
    x, m = at(start, length)
    out = np.zeros_like(t)
    out[m] = (x[m] / length) ** 2.5 * amp
    return out * lowpass(noise, 2500) * 1.5


chords = [  # (start, end, notes)
    (0.0, 8.4, [38, 50, 54, 57, 61, 64]),  # Dmaj9
    (8.0, 14.4, [35, 47, 50, 54, 57, 61]),  # Bm9
    (14.0, 19.4, [31, 43, 47, 50, 54, 61]),  # Gmaj7#11
    (19.0, 25.4, [33, 45, 50, 52, 54, 57]),  # A6sus
    (25.0, 30.0, [38, 50, 54, 57, 62, 66, 69]),  # D
]
pad = np.zeros_like(t)
for s, e, notes in chords:
    env = np.interp(t, [s, s + 1.5, e - 1.0, e], [0, 1, 1, 0], left=0, right=0)
    for n in notes:
        f = hz(n)
        for d in (-0.15, 0.0, 0.15):
            ph = rng.uniform(0, 6.28)
            pad += env * (np.sin(2 * np.pi * (f + d) * t + ph) + 0.2 * np.sin(4 * np.pi * (f + d) * t + ph))
pad = lowpass(pad / np.abs(pad).max(), 1800)
pad *= 1 + 0.12 * np.sin(2 * np.pi * 0.15 * t)
mix = 0.5 * pad * np.interp(t, [0, 2.5, 30], [0, 1, 1])

# logo blinds: a rising arpeggio of glassy notes
for i, n in enumerate((74, 78, 81, 85, 88)):
    mix += piano(0.6 + i * 0.09, n, 0.18, 2.5)
mix += boom(0.5, 0.5)

# tagline words flip in
for i, s in enumerate((3.33, 3.8, 4.27, 4.9)):
    mix += piano(s, (69, 73, 76, 81)[i], 0.25, 1.8)

# skyline: riser into it, then a slow piano line while the city draws
mix += riser(7.0, 1.0, 0.35) + boom(8.0, 0.6)
for i, (s, n) in enumerate(zip(np.arange(8.3, 13.8, 0.68), [66, 69, 71, 73, 71, 69, 66, 64, 66])):
    mix += piano(s, n, 0.2, 1.6)

# strips: riser, low hit
mix += riser(13.0, 1.0, 0.35) + boom(14.0, 0.8)
for i, s in enumerate(np.arange(14.2, 18.8, 0.25)):
    mix += piano(s, (79, 83, 86, 90)[i % 4], 0.07, 4, 0.6)

# carousel: soft pulse on each turn
for i, s in enumerate((19.0, 20.5, 21.5, 22.5, 23.5)):
    mix += boom(s, 0.35) + piano(s, (62, 64, 66, 69, 73)[i], 0.22, 1.8)
for s in np.arange(19.0, 25.0, 0.5):
    x, m = at(s, 0.05)
    tick = np.zeros_like(t)
    tick[m] = (noise[m] - lowpass(noise, 5000)[m]) * np.exp(-x[m] * 90) * 0.1
    mix += tick

# resolve
mix += riser(24.0, 1.0, 0.3) + boom(25.0, 0.8)
for i, n in enumerate((62, 66, 69, 74, 78, 81)):
    mix += piano(25.05 + i * 0.07, n, 0.18, 1.0, 4.5)

mix *= np.interp(t, [0, 0.01, DUR - 2.0, DUR], [0, 1, 1, 0])
mix = np.tanh(mix * 1.1)
mix = mix / np.abs(mix).max() * 0.85

d = int(0.014 * SR)
right = np.concatenate([mix[:d], mix[:-d]]) * 0.35 + mix * 0.65
stereo = np.stack([mix, right], axis=1)

out = Path(__file__).resolve().parent.parent / "public" / "audio" / "aurora.wav"
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype("<i2").tobytes())
print("wrote", out)
