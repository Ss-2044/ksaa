"""Synthesize the 30s background score, timed to the video's scenes.

Writes public/audio/music.wav. Requires numpy.
Scenes: 0 logo | 3 tagline | 7 desert | 13 different | 19 ideas | 25 outro
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 30.0
BEAT = 60 / 90  # 90 BPM
t = np.arange(int(SR * DUR)) / SR
rng = np.random.default_rng(7)


def env(start, attack, hold, release):
    """Linear attack/hold/release envelope over the whole timeline."""
    return np.interp(t, [start, start + attack, start + attack + hold, start + attack + hold + release], [0, 1, 1, 0], left=0, right=0)


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


# --- pad: one chord per scene, crossfaded -----------------------------------
chords = [  # (start, end, midi notes)
    (0, 7.4, [45, 52, 57, 60, 64]),  # Am
    (7, 13.4, [41, 48, 53, 57, 60]),  # F
    (13, 19.4, [48, 55, 60, 64, 67]),  # C
    (19, 25.4, [43, 50, 55, 59, 62]),  # G
    (25, 30, [45, 52, 57, 60, 64, 69]),  # Am
]
pad = np.zeros_like(t)
for start, end, notes in chords:
    e = env(start, 1.2, end - start - 1.6, 1.4)
    for n in notes:
        f = hz(n)
        for detune in (-0.12, 0, 0.12):
            ph = rng.uniform(0, 2 * np.pi)
            pad += e * (np.sin(2 * np.pi * (f + detune) * t + ph) + 0.25 * np.sin(4 * np.pi * (f + detune) * t + ph))
pad *= 1 + 0.15 * np.sin(2 * np.pi * 0.2 * t)  # slow breathing
pad = lowpass(pad / np.abs(pad).max(), 1400)


# --- percussion ---------------------------------------------------------------
def boom(at, f0=70, f1=32, decay=2.2):
    x = t - at
    m = x >= 0
    out = np.zeros_like(t)
    freq = f1 + (f0 - f1) * np.exp(-x[m] * 6)
    out[m] = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-x[m] / decay * 3)
    return out


def kick(at):
    x = t - at
    m = (x >= 0) & (x < 0.5)
    out = np.zeros_like(t)
    freq = 45 + 90 * np.exp(-x[m] * 30)
    out[m] = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-x[m] * 9)
    return out


noise = rng.standard_normal(len(t))
hat_src = noise - lowpass(noise, 6000)


def hat(at):
    x = t - at
    return np.where((x >= 0) & (x < 0.08), hat_src * np.exp(-np.clip(x, 0, None) * 60), 0)


drums = boom(0.05) + boom(13.0, 80, 35, 1.6) * 0.8 + boom(25.0) * 1.1
for k in np.arange(13.0, 25.0, BEAT):
    drums += kick(k) * (0.55 if k < 19 else 0.7)
for h in np.arange(19.0 + BEAT / 2, 25.0, BEAT):
    drums += hat(h) * 0.12

# --- swells into the big moments ---------------------------------------------
swell = lowpass(noise, 2500)
risers = swell * (np.clip((t - 11.2) / 1.8, 0, 1) * (t < 13.0) + np.clip((t - 23.2) / 1.8, 0, 1) * (t < 25.0))
risers *= 0.35

# --- arp shimmer over the "ideas" section --------------------------------------
arp = np.zeros_like(t)
arp_notes = [67, 71, 74, 79, 74, 71]
for i, start in enumerate(np.arange(19.0, 25.0, BEAT / 2)):
    x = t - start
    m = (x >= 0) & (x < 0.6)
    f = hz(arp_notes[i % len(arp_notes)])
    arp[m] += np.sin(2 * np.pi * f * x[m]) * np.exp(-x[m] * 7)
# a softer echo of the arp through the outro
for i, start in enumerate(np.arange(25.3, 28.5, BEAT)):
    x = t - start
    m = (x >= 0) & (x < 1.2)
    arp[m] += 0.5 * np.sin(2 * np.pi * hz([69, 76, 72, 81][i % 4]) * x[m]) * np.exp(-x[m] * 3)

mix = 0.55 * pad + 0.9 * drums + risers + 0.18 * arp
mix *= np.interp(t, [0, 0.02, DUR - 2.2, DUR], [0, 1, 1, 0])  # fade out
mix = np.tanh(mix * 1.2)
mix = mix / np.abs(mix).max() * 0.8

# gentle stereo: pad/arp widened with a short delay on the right channel
d = int(0.012 * SR)
right = np.concatenate([mix[:d], mix[:-d]]) * 0.35 + mix * 0.65
stereo = np.stack([mix, right], axis=1)

out = Path(__file__).resolve().parent.parent / "public" / "audio" / "music.wav"
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype("<i2").tobytes())
print("wrote", out)
