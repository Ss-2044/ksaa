"""Generates an original 30s soundtrack (public/music.wav) — no licensing issues.

Style: energetic Khaleeji-electronic. 120 BPM (one beat = 15 video frames), synced to
src/theme.ts: intro build, 3-2-1 countdown beeps, silence, a big DROP at 6s, four-on-the-floor
kick + layered Khaleeji handclaps + 808 bass + offbeat synth stabs, a lead hook, word-slam
hits at 18–21s, a riser into the final drop at 24s and an ending stab.
Run: python3 scripts/make_music.py   (needs numpy)
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 30.0
N = int(SR * DUR)
BEAT = 0.5
STEP = BEAT / 4  # 16th note
rng = np.random.default_rng(23)
L = np.zeros(N)
R = np.zeros(N)

COUNTDOWN, DROP, EQUATION, SLAM, OUTRO = 3.0, 6.0, 11.0, 18.0, 24.0


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, start, pan=0.0, gain=1.0):
    i = int(round(start * SR))
    if i >= N or i < 0:
        return
    sig = sig[: N - i] * gain
    L[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def onepole(x, alpha):
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += alpha * (v - acc)
        y[i] = acc
    return y


def tt(length):
    return np.arange(int(length * SR)) / SR


# ---------- instruments
def kick():
    t = tt(0.4)
    f = 160 * np.exp(-t * 35) + 48
    return np.tanh(2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7))


def clap():
    # several noise bursts a few ms apart = a crowd of hands
    t = tt(0.25)
    out = np.zeros(len(t))
    for d in (0.0, 0.008, 0.017, 0.026):
        i = int(d * SR)
        x = rng.standard_normal(len(t) - i)
        x = x - onepole(x, 0.25)
        out[i:] += x * np.exp(-t[: len(t) - i] * 28)
    return out * 0.5


def hat(open_=False):
    t = tt(0.25 if open_ else 0.05)
    x = rng.standard_normal(len(t))
    x = x - onepole(x, 0.7)
    return x * np.exp(-t * (12 if open_ else 90))


def bass808(m, length):
    t = tt(length)
    f = hz(m) * (1 + 0.6 * np.exp(-t * 40))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return np.tanh(1.8 * s) * np.exp(-t * 1.5) * np.minimum(1, (length - t) * 40)


def stab(notes, length=0.22):
    t = tt(length)
    out = np.zeros(len(t))
    for m in notes:
        for det in (-0.15, 0.15):
            out += 2 * ((t * hz(m + det)) % 1) - 1
    out = onepole(out, 0.25)
    return out / len(notes) * np.exp(-t * 10)


def lead(m, length):
    t = tt(length)
    f = hz(m) * (1 + 0.006 * np.sin(2 * np.pi * 6 * t))
    ph = np.cumsum(f) / SR
    sq = np.sign(np.sin(2 * np.pi * ph)) * 0.6 + np.sin(2 * np.pi * ph * 2) * 0.3
    env = np.minimum(1, t * 80) * np.exp(-t * 2.5)
    return onepole(sq, 0.18) * env


def beep(m, length=0.18):
    t = tt(length)
    return np.sin(2 * np.pi * hz(m) * t) * np.exp(-t * 12)


def impact(length=2.5):
    t = tt(length)
    sub = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t * 3) + 30) / SR) * np.exp(-t * 1.6)
    noise = onepole(rng.standard_normal(len(t)), 0.2) * np.exp(-t * 5)
    return np.tanh(1.5 * (sub + noise * 0.7))


def riser(length):
    t = tt(length)
    x = rng.standard_normal(len(t))
    out = np.empty(len(t))
    acc = 0.0
    for i in range(len(t)):
        acc += (0.004 + 0.3 * (t[i] / length) ** 2) * (x[i] - acc)
        out[i] = acc
    tone = np.sin(2 * np.pi * np.cumsum(200 + 1200 * (t / length) ** 2) / SR) * 0.3
    return (out + tone) * (t / length) ** 2


# ---------- intro (0–3s): impact + riser + filtered pulse
add(impact(), 0.0, gain=0.9)
add(riser(2.8), 0.2, gain=0.5)
for k in range(12):
    add(stab([62, 65, 69], 0.12), 0.5 + k * 0.25 - 0.25, pan=(-0.4 if k % 2 else 0.4), gain=0.15 + k * 0.02)

# ---------- countdown (3–6s): beeps, building kicks, snare roll, then silence before the drop
for i, m in enumerate((81, 81, 86)):
    add(beep(m, 0.3), COUNTDOWN + i, gain=0.6)
for b in np.arange(COUNTDOWN, DROP - 0.5, BEAT):
    add(kick(), b, gain=0.7)
s = DROP - 1.5
while s < DROP - 0.25:
    k = (s - (DROP - 1.5)) / 1.25
    add(clap(), s, gain=0.2 + 0.5 * k)
    s += 0.25 if k < 0.4 else (0.125 if k < 0.8 else 0.0625)
add(riser(1.5), DROP - 1.75, gain=0.5)

# ---------- main groove
BASS = [(0, 38), (3, 38), (6, 41), (8, 38), (11, 36), (14, 33)]  # (16th step, midi) per bar
CHORDS = [[62, 65, 69], [62, 65, 69], [60, 64, 67], [58, 62, 65]]  # Dm Dm C Bb
CLAPS = [4, 6, 7, 12, 14, 15]  # Khaleeji-style clap cluster
HOOK = [(0, 74, 2), (2, 72, 1), (3, 74, 1), (4, 77, 2), (6, 76, 1), (7, 74, 1),
        (8, 72, 2), (10, 69, 2), (12, 70, 2), (14, 69, 2)]


def groove(start, end, hook=False, heavy=False):
    bar = start
    n = 0
    while bar < end - 1e-6:
        for st in range(16):
            at = bar + st * STEP
            if at >= end:
                break
            if st % 4 == 0:
                add(kick(), at, gain=0.85)
            if st in CLAPS:
                add(clap(), at, pan=(0.25 if st % 2 else -0.25), gain=0.45 if heavy else 0.35)
            add(hat(st % 4 == 2), at, pan=0.4, gain=0.12 if st % 2 else 0.08)
        for st, m in BASS:
            at = bar + st * STEP
            if at < end:
                add(bass808(m, STEP * 3), at, gain=0.55)
        chord = CHORDS[n % 4]
        for b in range(4):
            at = bar + b * BEAT + BEAT / 2
            if at < end:
                add(stab(chord), at, pan=(-0.3 if b % 2 else 0.3), gain=0.22)
        if hook:
            for st, m, ln in HOOK:
                at = bar + st * BEAT / 2
                if at < end:
                    add(lead(m, ln * BEAT / 2), at, pan=-0.15, gain=0.22)
                    add(lead(m, ln * BEAT / 2), at + 0.375, pan=0.35, gain=0.07)  # echo
        bar += 4 * BEAT
        n += 1


add(impact(), DROP, gain=1.0)
groove(DROP, EQUATION)
add(impact(1.5), EQUATION, gain=0.6)
groove(EQUATION, SLAM, hook=True)

# word slams: big hit on every word (each 1s), groove underneath
for i in range(4):
    add(impact(0.9), SLAM + i, gain=0.8)
    add(stab([50, 62, 65, 69], 0.5), SLAM + i, gain=0.5)
groove(SLAM, OUTRO - 1.0, heavy=True)
add(riser(1.0), OUTRO - 1.0, gain=0.7)

# final drop and ending
add(impact(3.0), OUTRO, gain=1.0)
groove(OUTRO, 28.0, hook=True, heavy=True)
add(stab([38, 50, 62, 65, 69], 2.0), 28.0, gain=0.7)
add(impact(2.0), 28.0, gain=0.8)

# ---------- master
mix = np.stack([L, R], axis=1)
fade = np.ones(N)
fade[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR))
mix *= fade[:, None]
mix /= np.max(np.abs(mix))
mix = np.tanh(mix * 1.6) * 0.9

out = Path(__file__).resolve().parent.parent / 'public' / 'music.wav'
with wave.open(str(out), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', out)
