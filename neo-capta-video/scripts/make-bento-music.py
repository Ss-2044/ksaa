"""Synthesize the 30s score for the Bento design (clean tech UI, 100 BPM).

Writes public/audio/bento.wav. Requires numpy.
Cues: 0 cards snap in | 3.8 click, 4.0–6.7 typing, 7.0 enter | 8.0 answer cards pop
      14 groove + service clicks | 20 collapse whoosh, 21 line | 25 outro pop | 30 end
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 30.0
BEAT = 60 / 100
t = np.arange(int(SR * DUR)) / SR
rng = np.random.default_rng(9)
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


def tone(start, midi, decay, length, amp=1.0, harm=0.2):
    x, m = at(start, length)
    out = np.zeros_like(t)
    f = hz(midi)
    out[m] = (np.sin(2 * np.pi * f * x[m]) + harm * np.sin(4 * np.pi * f * x[m])) * np.exp(-x[m] * decay) * amp
    return out


def pop(start, midi=84, amp=0.35):
    """Bubbly UI pop: a quick upward pitch blip."""
    x, m = at(start, 0.12)
    out = np.zeros_like(t)
    f = hz(midi) * (0.6 + 0.4 * (1 - np.exp(-x[m] * 60)))
    out[m] = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x[m] * 30) * amp
    return out


bright = noise - lowpass(noise, 4000)


def click(start, amp=0.4):
    x, m = at(start, 0.02)
    out = np.zeros_like(t)
    out[m] = bright[m] * np.exp(-x[m] * 300) * amp
    return out


def kick(start, amp=1.0):
    x, m = at(start, 0.35)
    out = np.zeros_like(t)
    freq = 45 + 100 * np.exp(-x[m] * 40)
    out[m] = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-x[m] * 11) * amp
    return out


mix = np.zeros_like(t)

# 0–3s: nine cards snap into place, rising pops
for i in range(9):
    mix += pop(0.2 + i * 0.12, 72 + i * 2, 0.3)
mix += tone(1.5, 60, 1.2, 3, 0.25) + tone(1.5, 67, 1.2, 3, 0.18) + tone(1.5, 76, 1.5, 3, 0.12)

# 3–8s: cursor click, typing, enter, loading shimmer
mix += click(3.83, 0.7) + pop(3.83, 79, 0.2)
for k in np.arange(4.0, 6.67, 0.09):
    mix += click(k + rng.uniform(-0.015, 0.015), 0.25 + rng.uniform(0, 0.15))
mix += click(7.0, 0.8) + pop(7.0, 86, 0.3)
x, m = at(7.0, 1.0)
shimmer = np.zeros_like(t)
shimmer[m] = np.sin(2 * np.pi * (1200 + 400 * np.sin(2 * np.pi * 6 * x[m])) * x[m]) * 0.05 * np.sin(np.pi * x[m])
mix += shimmer

# soft bass pulse under the whole piece once the answer arrives
bass_notes = [36, 36, 43, 41]  # C C G F
for i, b in enumerate(np.arange(8.0, 25.0, BEAT * 2)):
    mix += tone(b, bass_notes[i % 4], 3.5, BEAT * 2, 0.35, 0.5)

# 8–14s: answer cards pop in, then a calm hat groove
for i in range(5):
    mix += pop(8.0 + i * 0.27, 76 + i * 3, 0.35)
for i, b in enumerate(np.arange(9.6, 14.0, BEAT / 2)):
    mix += click(b, 0.12 if i % 2 else 0.2)

# 14–20s: fuller groove; a click + chime as each service lights up
for i, b in enumerate(np.arange(14.0, 20.0, BEAT / 2)):
    if i % 2 == 0:
        mix += kick(b, 0.7)
    mix += click(b, 0.15)
for i, s in enumerate((15.0, 15.83, 16.67, 17.5, 18.33)):
    mix += click(s, 0.6) + tone(s, (72, 74, 76, 79, 81)[i], 5, 0.8, 0.28)

# 20–25s: collapse whoosh, then the line lands on a chord
x, m = at(19.6, 0.8)
whoosh = np.zeros_like(t)
whoosh[m] = lowpass(noise, 2500)[m] * np.sin(np.pi * x[m] / 0.8) ** 2 * 0.9
mix += whoosh + kick(20.4, 1.0)
for n in (60, 64, 67, 71):
    mix += tone(21.0, n, 0.9, 4, 0.12)

# 25–30s: outro pop and a resolving chord
mix += pop(25.0, 84, 0.45) + kick(25.0, 0.9)
for n in (48, 60, 64, 67, 72, 79):
    mix += tone(25.05, n, 0.7, 5, 0.1)

mix *= np.interp(t, [0, 0.01, DUR - 1.2, DUR], [0, 1, 1, 0])
mix = np.tanh(mix * 1.2)
mix = mix / np.abs(mix).max() * 0.85

d = int(0.01 * SR)
right = np.concatenate([mix[:d], mix[:-d]]) * 0.3 + mix * 0.7
stereo = np.stack([mix, right], axis=1)

out = Path(__file__).resolve().parent.parent / "public" / "audio" / "bento.wav"
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype("<i2").tobytes())
print("wrote", out)
