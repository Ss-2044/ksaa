"""Original synthesized soundtracks for the Neo Capta videos.

Every sound is generated here (no samples), so the music is royalty free.
Each score is a list of timed events synced to the scene cues of its composition.

    python3 music/compose.py          # writes public/audio/*.wav
"""

import os
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
RNG = np.random.default_rng(7)
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def filt(x, fc, kind='low', order=2):
    fc = np.clip(fc, 20, SR / 2 - 100)
    return sosfilt(butter(order, np.array(fc) / (SR / 2), kind, output='sos'), x)


def noise(d):
    return RNG.standard_normal(int(d * SR))


def saw(f, d, phase=0.0):
    return 2 * np.mod(f * tt(d) + phase, 1.0) - 1


def adsr(n, a, r, sustain=1.0):
    e = np.full(n, sustain)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, sustain, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


# ------------------------------------------------------------------ voices

def pad(notes, d, cutoff=1400, a=1.2, r=1.5):
    out = np.zeros(int(d * SR))
    for n in notes:
        for det in (-0.07, 0.0, 0.07):
            out += saw(midi(n + det), d, RNG.random())
    out = filt(out / (len(notes) * 3), cutoff)
    return out * adsr(len(out), a, r)


def sub(note, d, a=0.8, r=1.0):
    x = np.sin(2 * np.pi * midi(note) * tt(d))
    return x * adsr(len(x), a, r)


def boom(size=1.0):
    t = tt(2.5)
    f = 38 + 90 * np.exp(-t * 9)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (1.6 / size))
    thump = filt(noise(2.5), 220) * np.exp(-t * 14) * 0.9
    click = filt(noise(2.5), 2500, 'high') * np.exp(-t * 90) * 0.25
    return (body * 1.1 + thump + click) * size


def kick(level=1.0):
    t = tt(0.45)
    f = 45 + 120 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * level


def hat(level=0.25, length=0.05):
    x = filt(noise(length), 7000, 'high')
    return x * np.exp(-tt(length) * 70) * level


def clap(level=0.5):
    x = filt(filt(noise(0.3), 900, 'high'), 5000)
    e = np.exp(-tt(0.3) * 22)
    for k in (0.0, 0.012, 0.024):
        i = int(k * SR)
        e[i:] += np.exp(-np.arange(len(e) - i) / SR * 60) * 0.6
    return x * e * level


def ping(note, level=0.4, decay=1.6):
    t = tt(decay * 2.5)
    f = midi(note)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.01 * t) + 0.12 * np.sin(2 * np.pi * f * 3.98 * t)
    return x * np.exp(-t * 3.5 / decay) * adsr(len(t), 0.003, 0.05) * level


def pluck(note, level=0.3, cutoff=2600, decay=0.35):
    t = tt(decay * 3)
    x = saw(midi(note), decay * 3) + 0.5 * saw(midi(note + 12.04), decay * 3)
    return filt(x, cutoff) * np.exp(-t * 3 / decay) * adsr(len(t), 0.002, 0.03) * level


def riser(d, level=0.5, f0=300, f1=9000):
    n = int(d * SR)
    src = noise(d)
    out = np.zeros(n)
    blk = int(0.03 * SR)
    for i in range(0, n, blk):
        fc = f0 * (f1 / f0) ** (i / n)
        seg = src[max(0, i - 2048): i + blk]
        out[i: i + blk] = filt(seg, fc)[-len(src[i: i + blk]):]
    t = tt(d)
    tone = np.sin(2 * np.pi * np.cumsum(220 * (6 ** (t / d))) / SR) * 0.25
    return (out * 0.8 + tone) * (t / d) ** 2.2 * level


def whoosh(d=0.8, level=0.45):
    n = int(d * SR)
    src = noise(d)
    out = np.zeros(n)
    blk = int(0.02 * SR)
    for i in range(0, n, blk):
        x = i / n
        fc = 400 + 3800 * np.sin(np.pi * x) ** 2
        seg = src[max(0, i - 2048): i + blk]
        out[i: i + blk] = filt(seg, [fc * 0.6, fc * 1.4], 'band')[-len(src[i: i + blk]):]
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 2 * level * 2


def shimmer(d=2.5, level=0.25):
    x = filt(noise(d), 6000, 'high')
    return x * np.exp(-tt(d) * 2.2) * adsr(int(d * SR), 0.01, 0.2) * level


def shutter(level=0.35):
    a = filt(noise(0.02), 3000, 'high') * np.exp(-tt(0.02) * 200)
    out = np.zeros(int(0.12 * SR))
    out[: len(a)] += a
    out[int(0.06 * SR): int(0.06 * SR) + len(a)] += a * 0.7
    return out * level


# -------------------------------------------------------------------- mixer

class Mix:
    def __init__(self, dur):
        self.dur = dur
        self.n = int(dur * SR)
        self.dry = np.zeros((self.n, 2))
        self.send = np.zeros((self.n, 2))

    def add(self, at, x, gain=1.0, pan=0.0, verb=0.25):
        i = int(at * SR)
        if i >= self.n:
            return
        x = x[: self.n - i] * gain
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        st = np.stack([x * l, x * r], 1) * np.sqrt(2)
        self.dry[i: i + len(x)] += st
        self.send[i: i + len(x)] += st * verb

    def render(self, path, fade_out=1.5):
        ir_len = 2.8
        t = tt(ir_len)
        wet = np.zeros_like(self.dry)
        for ch in range(2):
            ir = filt(noise(ir_len), 5000) * np.exp(-t * 2.4)
            ir /= np.sqrt(np.sum(ir ** 2))
            wet[:, ch] = fftconvolve(self.send[:, ch], ir)[: self.n]
        out = self.dry + wet * 0.9
        out = np.tanh(out * 1.1)
        out[-int(fade_out * SR):] *= np.linspace(1, 0, int(fade_out * SR))[:, None]
        out[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
        out /= np.max(np.abs(out)) / 0.89
        wavfile.write(path, SR, (out * 32767).astype(np.int16))
        print('wrote', path)


F = 30  # composition fps


def fr(frame):
    return frame / F


# Chords (A minor, cinematic): Am, F, C, G
AM = [57, 60, 64, 69]
FM = [53, 57, 60, 65]
CM = [55, 60, 64, 67]
GM = [55, 59, 62, 67]


def arp(m, start, end, chords, step=0.25, level=0.16, cutoff=2200, pan_width=0.5):
    """8th-note arpeggio over a list of (time, chord) changes."""
    t, k = start, 0
    while t < end:
        chord = [c for at, c in chords if at <= t][-1]
        note = chord[[0, 2, 1, 3, 2, 1][k % 6]] + 12
        m.add(t, pluck(note, level, cutoff), pan=pan_width * np.sin(k * 1.3), verb=0.3)
        t += step
        k += 1


# ------------------------------------------------------- 1) From idea to impact

def score_idea():
    m = Mix(24.0)
    # Scene 1: void, the first dot, spiral riser
    m.add(0.0, sub(33, 7.0, a=2.5, r=2.0), 0.35, verb=0.0)
    m.add(0.0, pad(AM, 3.2, cutoff=600, a=2.5, r=0.6), 0.45)
    m.add(fr(8), ping(81, 0.5, 2.2), verb=0.6)
    m.add(fr(52), ping(88, 0.2, 1.5), pan=0.4, verb=0.7)
    m.add(1.4, riser(1.6, 0.45))
    # Scene 2: explosion into the grid + flash words
    m.add(fr(90), boom(1.0), 0.9, verb=0.3)
    m.add(fr(90), shimmer(2.8, 0.3), verb=0.5)
    m.add(fr(90), pad(FM, 4.2, cutoff=1500, a=0.4, r=0.8), 0.5)
    m.add(fr(90), sub(29, 4.0, a=0.1, r=0.5), 0.4, verb=0)
    for k, f in enumerate([108, 133, 158, 183]):
        m.add(fr(f), kick(0.9 if k < 3 else 1.1), verb=0.1)
        m.add(fr(f), pluck([69, 72, 76, 81][k], 0.32, 3500, 0.5), verb=0.4)
        if k == 3:
            m.add(fr(f), boom(0.6), 0.6)
    arp(m, fr(96), fr(210), [(0, FM)], level=0.1, cutoff=1600)
    # Scene 3: logo gathering + glimpses
    m.add(fr(196), whoosh(0.9, 0.5), pan=-0.3)
    m.add(fr(210), pad(CM, 5.3, cutoff=1400, a=0.6, r=0.6), 0.26)
    m.add(fr(210), sub(36, 5.0, a=0.2, r=0.4), 0.2, verb=0)
    arp(m, fr(210), fr(360), [(0, CM)], level=0.17, cutoff=3000)
    for k in range(6):
        f = 222 + 22 * k
        m.add(fr(f), shutter(0.4), pan=-0.6 if k % 2 == 0 else 0.6, verb=0.2)
        m.add(fr(f), ping([76, 79, 84, 79, 83, 88][k], 0.18, 0.8), pan=-0.5 if k % 2 == 0 else 0.5, verb=0.5)
    m.add(fr(330), riser(1.0, 0.4))
    # Scene 4: the runner — driving pulse
    m.add(fr(360), boom(0.9), 0.85)
    m.add(fr(352), whoosh(0.7, 0.5), pan=0.5)
    m.add(fr(360), pad(GM, 2.0, cutoff=2200, a=0.1, r=0.4), 0.42)
    m.add(fr(420), pad(AM, 3.1, cutoff=2400, a=0.1, r=0.6), 0.45)
    t = fr(360)
    while t < fr(500):
        m.add(t, kick(0.85), verb=0.05)
        m.add(t + 0.25, hat(0.22), pan=0.3, verb=0.1)
        m.add(t + 0.125, hat(0.1), pan=-0.3, verb=0.1)
        t += 0.5
    for t in np.arange(fr(360), fr(500), 0.125):
        m.add(t, pluck(33 if t < fr(420) else 33, 0.18, 500, 0.12), verb=0.0)
    m.add(fr(390), clap(0.4), verb=0.4)
    m.add(fr(450), boom(0.8), 0.8)
    m.add(fr(450), clap(0.55), verb=0.5)
    # Scene 5: logo reveal
    m.add(fr(545) - 1.8, riser(1.8, 0.6))
    m.add(fr(500), pad(AM, 1.9, cutoff=900, a=0.1, r=0.6), 0.3)
    m.add(fr(545), boom(1.2), 0.9, verb=0.35)
    m.add(fr(545), ping(81, 0.35, 2.5), verb=0.6)
    m.add(fr(560), whoosh(0.8, 0.55), pan=-0.6)
    m.add(fr(595), boom(1.0), 0.75)
    m.add(fr(545), pad(AM + [76], 6.5, cutoff=2600, a=0.2, r=2.5), 0.55)
    m.add(fr(545), sub(33, 6.0, a=0.1, r=2.5), 0.45, verb=0)
    m.add(fr(605), shimmer(2.0, 0.22), verb=0.6)
    for k, n in enumerate([81, 84, 88, 93]):
        m.add(fr(605) + k * 0.09, ping(n, 0.14, 1.2), pan=-0.4 + k * 0.27, verb=0.6)
    m.add(fr(648), ping(69, 0.3, 3.0), verb=0.7)
    m.add(fr(648), pluck(57, 0.25, 1800, 1.2), verb=0.6)
    m.render(os.path.join(OUT, 'from-idea-to-impact.wav'), fade_out=1.4)


# ------------------------------------------------------------ 2) Manifesto
# 20 s. noise 0–6 s, three slams 6–11 s, runner 11–15 s, logo 15–20 s.

def score_manifesto():
    m = Mix(20.0)
    # Noisy, tense opening: detuned cluster + crackle
    m.add(0.0, pad([57, 58, 64, 65], 6.0, cutoff=900, a=0.3, r=0.4), 0.38)
    m.add(0.0, sub(33, 6.0, a=0.2, r=0.3), 0.3, verb=0)
    for i in range(70):
        t = RNG.random() * 3.9
        m.add(t, hat(0.15 + RNG.random() * 0.12, 0.03), pan=RNG.uniform(-0.9, 0.9), verb=0.15)
    for i in range(110):
        t = 2.0 + RNG.random() * 2.0
        m.add(t, hat(0.12 + RNG.random() * 0.1, 0.02), pan=RNG.uniform(-1, 1), verb=0.1)
    m.add(fr(15), kick(0.6))
    m.add(fr(62), kick(0.7))
    # "Few are heard": everything drops out to one pure tone
    m.add(fr(120), ping(81, 0.45, 3.0), verb=0.7)
    m.add(fr(120), sub(45, 2.0, a=0.05, r=1.0), 0.15, verb=0.3)
    m.add(fr(150), riser(1.0, 0.5))
    # Three slams
    for k, (f, ch) in enumerate([(180, AM), (230, FM), (280, CM)]):
        m.add(fr(f), boom(0.9 + 0.1 * k), 0.85)
        m.add(fr(f), clap(0.55), verb=0.4)
        m.add(fr(f), pad(ch, 1.7, cutoff=2400, a=0.02, r=0.5), 0.45)
        m.add(fr(f), sub(ch[0] - 24, 1.6, a=0.02, r=0.4), 0.4, verb=0)
        t = fr(f)
        while t < fr(f + 50) - 0.05:
            m.add(t + 0.25, hat(0.2), pan=0.3)
            t += 0.5
        m.add(fr(f + 40), whoosh(0.45, 0.35), pan=0.5 - k * 0.5)
    # Runner sprint
    m.add(fr(330), boom(0.8), 0.7)
    m.add(fr(330), pad(GM, 4.2, cutoff=2600, a=0.1, r=0.5), 0.45)
    t = fr(330)
    while t < fr(440):
        m.add(t, kick(0.9))
        m.add(t + 0.25, hat(0.24), pan=0.3)
        m.add(t + 0.125, hat(0.1), pan=-0.3)
        t += 0.5
    arp(m, fr(330), fr(445), [(0, GM)], step=0.125, level=0.11, cutoff=3000)
    m.add(fr(338), whoosh(1.2, 0.55), pan=-0.8)
    m.add(fr(400), riser(1.5, 0.55))
    # Logo
    m.add(fr(450), boom(1.2), 0.95)
    m.add(fr(450), shimmer(2.5, 0.25), verb=0.6)
    m.add(fr(450), pad(AM + [76], 5.0, cutoff=2600, a=0.15, r=2.5), 0.55)
    m.add(fr(450), sub(33, 5.0, a=0.05, r=2.5), 0.45, verb=0)
    for k, n in enumerate([81, 84, 88, 93]):
        m.add(fr(500) + k * 0.09, ping(n, 0.14, 1.2), pan=-0.4 + k * 0.27, verb=0.6)
    m.add(fr(530), ping(69, 0.3, 3.0), verb=0.7)
    m.render(os.path.join(OUT, 'manifesto.wav'), fade_out=1.2)


# -------------------------------------------------------------- 3) Journey
# 22 s. intro 0–2.5 s, four steps of 4 s from 2.5 s, end card 18.5–22 s.

def score_journey():
    m = Mix(22.0)
    prog = [AM, FM, CM, GM]
    m.add(0.0, pad(AM, 2.6, cutoff=900, a=1.5, r=0.5), 0.4)
    m.add(0.0, sub(33, 2.6, a=1.5, r=0.4), 0.3, verb=0)
    m.add(fr(10), ping(76, 0.35, 2.0), verb=0.6)
    m.add(fr(45), riser(1.0, 0.4))
    arp(m, fr(20), fr(75), [(0, AM)], step=0.25, level=0.09, cutoff=1400)
    step0 = 75
    for k in range(4):
        f = step0 + k * 120
        ch = prog[k]
        m.add(fr(f), boom(0.7 + 0.08 * k), 0.7)
        m.add(fr(f) - 0.35, whoosh(0.6, 0.4), pan=0.6 if k % 2 == 0 else -0.6)
        m.add(fr(f), pad(ch, 4.1, cutoff=1800 + 300 * k, a=0.1, r=0.4), 0.42)
        m.add(fr(f), sub(ch[0] - 24, 4.0, a=0.05, r=0.3), 0.35, verb=0)
        m.add(fr(f + 6), ping(ch[3] + 12, 0.25, 1.2), verb=0.5)
        arp(m, fr(f), fr(f + 120), [(0, ch)], step=0.25 if k < 2 else 0.125, level=0.12, cutoff=2400 + 300 * k)
        t = fr(f)
        while t < fr(f + 118):
            m.add(t, kick(0.75 if k < 2 else 0.9))
            if k >= 1:
                m.add(t + 0.25, hat(0.2), pan=0.3)
            if k >= 2:
                m.add(t + 0.5, clap(0.3), verb=0.3)
            t += 0.5 if k < 2 else 1.0
            if k >= 2:
                m.add(t - 0.5, kick(0.8))
        for j in range(3):
            m.add(fr(f + 40 + j * 14), pluck(ch[j + 1] + 24, 0.12, 4000, 0.3), pan=-0.5 + j * 0.5, verb=0.5)
    m.add(fr(520), riser(1.2, 0.55))
    m.add(fr(555), boom(1.2), 0.95)
    m.add(fr(555), shimmer(2.5, 0.25), verb=0.6)
    m.add(fr(555), pad(AM + [76], 3.6, cutoff=2600, a=0.15, r=2.0), 0.55)
    m.add(fr(555), sub(33, 3.6, a=0.05, r=2.0), 0.45, verb=0)
    for k, n in enumerate([81, 84, 88, 93]):
        m.add(fr(590) + k * 0.09, ping(n, 0.14, 1.2), pan=-0.4 + k * 0.27, verb=0.6)
    m.render(os.path.join(OUT, 'journey.wav'), fade_out=1.0)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    which = sys.argv[1:] or ['idea', 'manifesto', 'journey']
    for w in which:
        {'idea': score_idea, 'manifesto': score_manifesto, 'journey': score_journey}[w]()
