"""Synthesize the 30s comedy score for the Megaphone design (120 BPM).

Writes public/audio/megaphone.wav. Requires numpy.
Cues: 0.4 logo boing + ta-da | 3–9 pizzicato march, shouts 3.5/5/6.5/8
      9.2/10/10.8 louder shouts | 11–13 slide whistles as the crowd leaves
      12.9 music stops, crickets | 14 skateboard + whistle up | 15.5 deflate
      16.5 question boop | 17.5–19 boings | 19–20 heart pops
      20–25 happy groove | 25 ta-da | 29.3 wink ding
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 30.0
BEAT = 0.5
t = np.arange(int(SR * DUR)) / SR
rng = np.random.default_rng(3)
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


def sweep(start, length, f0, f1, amp, shape="sine"):
    """A pitch glide — slide whistles, boings, deflating."""
    x, m = at(start, length)
    out = np.zeros_like(t)
    f = f0 * (f1 / f0) ** (x[m] / length)
    ph = 2 * np.pi * np.cumsum(f) / SR
    wave_ = np.sin(ph) if shape == "sine" else np.sign(np.sin(ph)) * 0.6
    out[m] = wave_ * amp * np.sin(np.pi * np.clip(x[m] / length, 0, 1)) ** 0.3
    return out


def boing(start, amp=0.5):
    x, m = at(start, 0.45)
    out = np.zeros_like(t)
    f = 180 + 260 * np.exp(-x[m] * 6) * (1 + 0.35 * np.sin(2 * np.pi * 18 * x[m]))
    out[m] = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x[m] * 5) * amp
    return out


def pluck(start, midi, amp=0.4, decay=14):
    x, m = at(start, 0.4)
    out = np.zeros_like(t)
    f = hz(midi)
    out[m] = (np.sin(2 * np.pi * f * x[m]) + 0.5 * np.sin(4 * np.pi * f * x[m])) * np.exp(-x[m] * decay) * amp
    return out


def tuba(start, midi, length=0.3, amp=0.5):
    x, m = at(start, length)
    out = np.zeros_like(t)
    f = hz(midi)
    ph = 2 * np.pi * f * x[m]
    out[m] = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)) * np.exp(-x[m] * 5) * amp
    return out


def shout(start, length=0.55, amp=0.35, pitch=220):
    """Buzzy distorted 'megaphone' blast."""
    x, m = at(start, length)
    out = np.zeros_like(t)
    f = pitch * (1 + 0.08 * np.sin(2 * np.pi * 9 * x[m]))
    ph = 2 * np.pi * np.cumsum(f) / SR
    out[m] = np.tanh(4 * (np.sign(np.sin(ph)) * 0.7 + 0.3 * np.sin(3 * ph))) * amp * np.clip(x[m] * 30, 0, 1) * np.clip((length - x[m]) * 12, 0, 1)
    return out


def pop(start, amp=0.4):
    x, m = at(start, 0.1)
    out = np.zeros_like(t)
    f = 500 + 1400 * (1 - np.exp(-x[m] * 50))
    out[m] = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x[m] * 35) * amp
    return out


def clap(start, amp=0.3):
    x, m = at(start, 0.12)
    out = np.zeros_like(t)
    out[m] = (noise[m] - lowpass(noise, 1200)[m]) * np.exp(-x[m] * 30) * amp
    return out


def tada(start, root, amp=0.14):
    out = np.zeros_like(t)
    for i, n in enumerate((root, root + 4, root + 7, root + 12)):
        out += pluck(start + i * 0.06, n, amp * 2, 6)
    x, m = at(start + 0.25, 1.6)
    for n in (root, root + 4, root + 7, root + 12):
        out[m] += np.sin(2 * np.pi * hz(n) * x[m]) * np.exp(-x[m] * 1.8) * amp
    return out


mix = np.zeros_like(t)

# 0–3s: logo drops and boings, ta-da
mix += sweep(0.0, 0.4, 1400, 300, 0.25) + boing(0.4, 0.6) + tada(0.6, 72)

# 3–9s: sneaky pizzicato march (the bored crowd), megaphone shouts on top
march = [57, 60, 64, 60, 55, 59, 62, 59]
for i, b in enumerate(np.arange(3.0, 9.0, BEAT)):
    mix += tuba(b, 45 if i % 2 == 0 else 52, 0.25, 0.35) + pluck(b + 0.25, march[i % 8] + 12, 0.18)
for s in (3.5, 5.0, 6.5, 8.0):
    mix += shout(s, 0.6, 0.3)

# 9–12.9s: faster, higher, more desperate
for i, b in enumerate(np.arange(9.0, 12.9, BEAT / 2)):
    mix += tuba(b, 45 + (i % 4) * 2, 0.18, 0.3) + pluck(b, 69 + (i % 3) * 3, 0.12)
for i, s in enumerate((9.2, 10.0, 10.8)):
    mix += shout(s, 0.55, 0.35 + i * 0.05, 240 + i * 40)
for w in (11.0, 11.5, 12.0, 12.5, 13.0):
    mix += sweep(w, 0.45, 1600, 500, 0.18)  # slide whistle: someone walks off

# 12.9–14s: silence, wind and crickets (tumbleweed)
wind = lowpass(noise, 500) * np.interp(t, [12.9, 13.2, 13.9, 14.1], [0, 0.6, 0.6, 0], left=0, right=0)
mix += wind
for c in (13.1, 13.25, 13.6, 13.75):
    x, m = at(c, 0.1)
    chirp = np.zeros_like(t)
    chirp[m] = np.sin(2 * np.pi * 4200 * x[m]) * (np.sin(2 * np.pi * 60 * x[m]) > 0) * 0.12
    mix += chirp

# 14–20s: Neo Capta rolls in, deflates the megaphone, asks, crowd hops back
mix += lowpass(noise, 900) * np.interp(t, [14.0, 14.1, 14.9, 15.0], [0, 0.3, 0.3, 0], left=0, right=0)  # skateboard
mix += sweep(14.0, 0.6, 500, 1700, 0.2)
x, m = at(15.5, 0.9)
deflate = np.zeros_like(t)
deflate[m] = (lowpass(noise, 3000)[m] * 0.5 + np.sin(2 * np.pi * np.cumsum(400 * np.exp(-x[m] * 2.5)) / SR)[: m.sum()] * 0.3) * (1 - x[m] / 0.9)
mix += deflate
mix += pluck(16.5, 76, 0.4, 8) + pluck(16.65, 81, 0.4, 8)  # question "boop-boop"
for i in range(5):
    mix += boing(17.5 + i * 0.3, 0.4)
for i in range(6):
    mix += pop(19.0 + i * 0.15, 0.35)

# 20–25s: happy bouncy groove, claps, a little melody
melody = [72, 76, 79, 76, 77, 81, 79, 77, 76, 79, 84, 79, 77, 74, 72, 72]
for i, b in enumerate(np.arange(20.0, 25.0, BEAT / 2)):
    if i % 2 == 0:
        mix += tuba(b, (48, 53, 55, 48)[(i // 4) % 4], 0.22, 0.4)
    if i % 4 == 2:
        mix += clap(b, 0.35)
    mix += pluck(b, melody[i % 16], 0.22, 10)

# 25–30s: ta-da and a wink
mix += tada(25.0, 72, 0.16) + boing(25.0, 0.4)
mix += pluck(29.3, 96, 0.35, 5) + pluck(29.38, 100, 0.3, 5)

mix *= np.interp(t, [0, 0.01, DUR - 0.5, DUR], [0, 1, 1, 0])
mix = np.tanh(mix * 1.1)
mix = mix / np.abs(mix).max() * 0.85

d = int(0.012 * SR)
right = np.concatenate([mix[:d], mix[:-d]]) * 0.3 + mix * 0.7
stereo = np.stack([mix, right], axis=1)

out = Path(__file__).resolve().parent.parent / "public" / "audio" / "megaphone.wav"
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype("<i2").tobytes())
print("wrote", out)
