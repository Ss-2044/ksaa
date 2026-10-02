"""Generates three original 30s soundtracks (no licensing issues), one per idea:

  public/music-notification.wav   playful pop: marimba, finger snaps, soft kick, phone "dings",
                                  typing clicks, tap + confetti sparkle (synced to Notification.tsx)
  public/music-constellation.wav  ambient: warm pad, slow piano/bell notes, shimmer, swell at the
                                  shooting-star link (17s) (synced to Constellation.tsx)
  public/music-arcade.wav         8-bit chiptune: square lead, triangle bass, noise drums, coin,
                                  power-up and level-up jingles (synced to Arcade.tsx)

Run: python3 scripts/make_music.py   (needs numpy)
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 30.0
N = int(SR * DUR)
FPS = 30
OUT = Path(__file__).resolve().parent.parent / 'public'


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(length):
    return np.arange(int(length * SR)) / SR


def onepole(x, alpha):
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += alpha * (v - acc)
        y[i] = acc
    return y


class Track:
    def __init__(self, seed, dur=DUR):
        self.n = int(SR * dur)
        self.L = np.zeros(self.n)
        self.R = np.zeros(self.n)
        self.rng = np.random.default_rng(seed)

    def add(self, sig, start, pan=0.0, gain=1.0):
        i = int(round(start * SR))
        if i >= self.n or i < 0:
            return
        sig = sig[: self.n - i] * gain
        self.L[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
        self.R[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))

    def noise(self, n):
        return self.rng.standard_normal(n)

    def save(self, name, drive=1.3, fade_out=1.0):
        mix = np.stack([self.L, self.R], axis=1)
        fade = np.ones(self.n)
        k = int(fade_out * SR)
        fade[-k:] = np.linspace(1, 0, k)
        mix *= fade[:, None]
        mix /= np.max(np.abs(mix))
        mix = np.tanh(mix * drive) * 0.9
        with wave.open(str(OUT / name), 'wb') as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((mix * 32767).astype('<i2').tobytes())
        print('wrote', OUT / name)


def fr(frame):
    return frame / FPS


# ======================================================================
# 1) Notification — playful pop, 120 BPM
# ======================================================================
def notification():
    T = Track(1)
    beat = 0.5

    def marimba(m, length=0.6):
        t = tt(length)
        f = hz(m)
        return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30)) * np.exp(-t * 7)

    def snap():
        t = tt(0.08)
        x = T.noise(len(t))
        return (x - onepole(x, 0.5)) * np.exp(-t * 70)

    def kick():
        t = tt(0.3)
        return np.sin(2 * np.pi * np.cumsum(110 * np.exp(-t * 30) + 50) / SR) * np.exp(-t * 10)

    def ding(m=88):
        t = tt(0.9)
        return (np.sin(2 * np.pi * hz(m) * t) + 0.5 * np.sin(2 * np.pi * hz(m + 7) * t)) * np.exp(-t * 5)

    def click():
        t = tt(0.02)
        return T.noise(len(t)) * np.exp(-t * 300)

    def sparkle():
        out = np.zeros(int(1.2 * SR))
        for k in range(14):
            s = marimba(84 + (k * 5) % 14, 0.4) * 0.5
            i = int(k * 0.05 * SR)
            out[i : i + len(s)] += s[: len(out) - i]
        return out

    chords = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]]  # Cmaj7 Am7 Fmaj7 G7
    riff = [0, 2, 1, 3, 2, 1, 0, 3]
    # intro: two icon "pops"
    T.add(marimba(72, 0.8), 0.0, gain=0.6)
    T.add(marimba(79, 0.8), fr(8), gain=0.6)
    bar = 0.0
    n = 0
    while bar < 29.0:
        ch = chords[n % 4]
        for s in range(8):
            at = bar + s * beat / 2
            if at >= 29:
                break
            T.add(marimba(ch[riff[s]] + 12, 0.5), at, pan=(-0.3 if s % 2 else 0.3), gain=0.32)
        if bar >= 3.0:
            for b in range(4):
                T.add(kick(), bar + b * beat, gain=0.5)
                if b % 2:
                    T.add(snap(), bar + b * beat, pan=0.2, gain=0.6)
        bas = ch[0] - 24
        T.add(marimba(bas, 1.6), bar, gain=0.5)
        bar += 4 * beat
        n += 1
    # dings for notifications
    for frm, m in ((120, 88), (150, 91), (180, 93)):
        T.add(ding(m), fr(frm), gain=0.5)
    # typing clicks before each chat bubble + pop
    for at in (262, 310, 358, 410):
        for k in range(10):
            T.add(click(), fr(at - 18) + k * 0.05, pan=0.3, gain=0.4)
        T.add(marimba(84, 0.3), fr(at), gain=0.5)
    # tap + success + confetti
    T.add(click(), fr(560), gain=1.0)
    for i, m in enumerate((72, 76, 79, 84)):
        T.add(marimba(m, 0.8), fr(564) + i * 0.08, gain=0.6)
    T.add(sparkle(), fr(564), gain=0.6)
    # result chips pops
    for i in range(4):
        T.add(marimba(79 + i * 2, 0.4), fr(690 + i * 15), gain=0.4)
    T.add(sparkle(), fr(812), gain=0.5)
    T.add(marimba(60, 2.0), 29.0, gain=0.5)
    T.save('music-notification.wav', drive=1.9)


# ======================================================================
# 2) Constellation — ambient, free time
# ======================================================================
def constellation():
    T = Track(2)

    def pad(notes, length):
        t = tt(length)
        out = np.zeros(len(t))
        for m in notes:
            for det in (-0.07, 0.07):
                ph = 2 * np.pi * np.cumsum(hz(m + det) * (1 + 0.002 * np.sin(2 * np.pi * 0.3 * t))) / SR
                out += np.sin(ph) + 0.2 * np.sin(2 * ph)
        env = np.minimum(1, t / 2.5) * np.minimum(1, (length - t) / 2.5)
        return out / len(notes) * env

    def piano(m, length=3.0):
        t = tt(length)
        f = hz(m)
        s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t) * np.exp(-t * 3) + 0.15 * np.sin(6 * np.pi * f * t)
        return s * np.exp(-t * 1.6) * np.minimum(1, t * 200)

    def shimmer(length):
        t = tt(length)
        x = T.noise(len(t))
        x = x - onepole(x, 0.85)
        return x * (np.sin(np.pi * t / length) ** 2) * 0.3

    def boom():
        t = tt(4.0)
        return np.sin(2 * np.pi * np.cumsum(45 * np.exp(-t * 0.8) + 25) / SR) * np.exp(-t * 1.0)

    # pads: Dmaj9-ish → Bm → Gmaj7 → A sus, overlapping 8s blocks
    blocks = [([50, 57, 62, 64, 69], 0), ([47, 54, 59, 62, 66], 7), ([43, 50, 55, 59, 62], 14),
              ([45, 52, 57, 59, 64], 21)]
    for notes, at in blocks:
        T.add(pad(notes, 10.0), at, gain=0.4)
    # slow pentatonic piano notes that follow the stars appearing
    scale = [62, 64, 66, 69, 71, 74, 76, 78, 81]
    rng = np.random.default_rng(5)
    t = 0.3
    while t < 28:
        m = scale[rng.integers(len(scale))]
        T.add(piano(m), t, pan=rng.uniform(-0.6, 0.6), gain=0.22)
        t += rng.choice([0.75, 1.0, 1.5])
    # constellation draws: soft high notes for each star
    for i in range(13):
        T.add(piano(scale[i % len(scale)] + 12, 1.5), fr(130 + i * 11), pan=-0.4, gain=0.12)
    for i in range(10):
        T.add(piano(scale[(i + 3) % len(scale)] + 12, 1.5), fr(310 + i * 16), pan=0.4, gain=0.12)
    # shooting stars
    for at in (100, 190):
        T.add(shimmer(1.2), fr(at), gain=0.5)
    # the link (17s): swell + boom + chord
    T.add(shimmer(3.0), fr(500), gain=0.8)
    T.add(boom(), fr(550), gain=0.9)
    for m in (50, 62, 66, 69, 74, 78):
        T.add(piano(m, 5.0), fr(550), gain=0.25)
    T.add(boom(), fr(812), gain=0.6)
    for m in (50, 57, 62, 66, 69):
        T.add(piano(m, 4.0), fr(812), gain=0.22)
    T.save('music-constellation.wav', drive=1.1, fade_out=2.0)


# ======================================================================
# 3) Arcade — chiptune, 150 BPM
# ======================================================================
def arcade():
    T = Track(3)
    beat = 0.4
    step = beat / 4

    def square(m, length, duty=0.5, decay=4.0):
        t = tt(length)
        ph = (t * hz(m)) % 1
        return np.where(ph < duty, 1.0, -1.0) * np.exp(-t * decay) * np.minimum(1, (length - t) * 200)

    def tri(m, length):
        t = tt(length)
        ph = (t * hz(m)) % 1
        return (4 * np.abs(ph - 0.5) - 1) * np.minimum(1, (length - t) * 200)

    def noise_hit(length, decay):
        t = tt(length)
        x = np.sign(T.noise(len(t)))  # 1-bit noise
        return x * np.exp(-t * decay)

    def kick():
        t = tt(0.15)
        f = 200 * np.exp(-t * 40) + 50
        ph = np.cumsum(f) / SR
        return np.where((ph % 1) < 0.5, 1.0, -1.0) * np.exp(-t * 20)

    def jingle(notes, d=0.07, gain=1.0):
        out = np.zeros(int((len(notes) * d + 0.3) * SR))
        for i, m in enumerate(notes):
            s = square(m, d * 1.5, 0.25, 6)
            k = int(i * d * SR)
            out[k : k + len(s)] += s[: len(out) - k]
        return out * gain

    coin = lambda: jingle([83, 88], 0.08)  # noqa: E731

    # 0–3s: player intro jingle
    T.add(jingle([60, 64, 67, 72, 67, 72, 76, 79], 0.1), 0.0, gain=0.35)
    # 3–7s: insert coin, coin drop, press start blips
    T.add(coin(), fr(126), gain=0.45)
    for k in range(5):
        T.add(square(84, 0.08, 0.25, 10), fr(150) + k * 0.47, gain=0.2)
    T.add(jingle([72, 76, 79, 84, 88], 0.06), fr(208), gain=0.4)
    # main loop from 7s
    melody = [72, 0, 76, 79, 76, 0, 74, 72, 69, 0, 72, 74, 76, 0, 79, 81]
    bass = [45, 45, 57, 45, 41, 41, 53, 41, 43, 43, 55, 43, 40, 40, 52, 40]
    shift = [0, 0, -4, -2]
    start = fr(210)
    bar = 0
    t = start
    while t < 29.0:
        sh = shift[bar % 4]
        for s in range(16):
            at = t + s * step
            if at >= 29.0:
                break
            if s % 4 == 0:
                T.add(kick(), at, gain=0.5)
            if s % 8 == 4:
                T.add(noise_hit(0.12, 25), at, gain=0.3)
            T.add(noise_hit(0.03, 120), at, pan=0.3, gain=0.08)
            if s % 2 == 0:
                T.add(tri(bass[s] + sh - 12, step * 2), at, gain=0.35)
            m = melody[s]
            if m and at >= fr(390):
                T.add(square(m + sh, step * 1.8, 0.25, 3), at, pan=-0.2, gain=0.16)
            # arpeggio under the select screen
            T.add(square([69, 72, 76][s % 3] + sh + 12, step * 0.9, 0.125, 12), at, pan=0.3, gain=0.06)
        t += 16 * step
        bar += 1
    # stat bars fill: rising blips
    for i in range(6):
        for k in range(10):
            T.add(square(72 + k, 0.05, 0.25, 20), fr(240 + i * 25 + (12 if i >= 3 else 0)) + k * 0.13, gain=0.08)
    # co-op unlocked explosion + power up + level up
    T.add(noise_hit(0.8, 4), fr(390), gain=0.5)
    T.add(jingle(list(range(60, 96, 2)), 0.035), fr(440), gain=0.4)
    T.add(jingle([72, 76, 79, 84, 79, 84, 88, 91], 0.09), fr(512), gain=0.5)
    T.add(noise_hit(0.6, 5), fr(512), gain=0.4)
    # mission typing + checklist coins
    for k in range(40):
        T.add(square(96, 0.02, 0.5, 50), fr(590) + k * 0.03, gain=0.05)
    for at in (665, 695, 725):
        T.add(coin(), fr(at), gain=0.45)
    # ending fanfare
    T.add(jingle([67, 72, 76, 79, 84, 79, 84], 0.12), fr(785), gain=0.5)
    T.add(square(84, 1.2, 0.5, 2), fr(785) + 0.84, gain=0.3)
    T.save('music-arcade.wav', drive=1.2)


# ======================================================================
# 4) Clay — organic hand percussion that turns electronic when the clay shatters (15s)
# ======================================================================
def clay():
    T = Track(4)
    beat = 0.5

    def doum():
        t = tt(0.6)
        return np.sin(2 * np.pi * np.cumsum(95 * np.exp(-t * 10) + 65) / SR) * np.exp(-t * 6)

    def tek():
        t = tt(0.1)
        x = T.noise(len(t))
        return (x - onepole(x, 0.35)) * np.exp(-t * 45) + np.sin(2 * np.pi * 900 * t) * np.exp(-t * 60) * 0.5

    def udu(m):
        t = tt(0.5)
        f = hz(m) * (1 - 0.15 * (1 - np.exp(-t * 12)))
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)

    def crack():
        out = np.zeros(int(0.6 * SR))
        for k in range(18):
            t = tt(0.02)
            s = T.noise(len(t)) * np.exp(-t * 200)
            i = int(abs(T.rng.normal(0.2, 0.12)) * SR)
            out[i : i + len(s)] += s[: max(0, len(out) - i)]
        return out

    def shatter():
        t = tt(1.8)
        x = T.noise(len(t))
        return (x - onepole(x, 0.2)) * np.exp(-t * 3) + np.sin(2 * np.pi * np.cumsum(60 * np.exp(-t * 2) + 30) / SR) * np.exp(-t * 2)

    def arp(m):
        t = tt(0.22)
        ph = (t * hz(m)) % 1
        return onepole(2 * ph - 1, 0.3) * np.exp(-t * 10)

    def pad(notes, length):
        t = tt(length)
        out = sum(np.sin(2 * np.pi * hz(m) * t) + 0.3 * np.sin(4 * np.pi * hz(m) * t) for m in notes)
        return out / len(notes) * np.minimum(1, t / 1.5) * np.minimum(1, (length - t) / 1.0)

    # stamps of the logos
    T.add(doum(), 0.1, gain=0.9)
    T.add(doum(), fr(14), gain=0.9)
    # 3–15s: maqsum-like hand drum groove + udu melody
    pat = [(0, 'D'), (1, 't'), (2, 't'), (3, 'D'), (5, 't'), (6, 'D'), (7, 't')]  # 8th notes per bar
    udum = [50, 53, 55, 57, 55, 53]
    t0 = 3.0
    k = 0
    while t0 < 15.0:
        for st, kind in pat:
            at = t0 + st * beat / 2
            T.add(doum() if kind == 'D' else tek(), at, pan=(0 if kind == 'D' else 0.3), gain=0.6 if kind == 'D' else 0.35)
        T.add(udu(udum[k % len(udum)]), t0 + beat * 1.5, pan=-0.3, gain=0.4)
        t0 += 4 * beat
        k += 1
    # cracks from 9s
    for at in (9.0, 10.2, 11.5, 12.6, 13.6, 14.4):
        T.add(crack(), at, pan=T.rng.uniform(-0.5, 0.5), gain=0.6)
    T.add(shatter(), 15.0, gain=1.0)
    # 15–30s: digital: arps + pad + drums continue, now electronic kick
    chords = [[62, 65, 69], [60, 64, 67], [58, 62, 65], [57, 61, 64]]
    t0 = 15.0
    k = 0
    while t0 < 29.0:
        ch = chords[k % 4]
        T.add(pad(ch, 2.2), t0, gain=0.3)
        for s16 in range(16):
            at = t0 + s16 * beat / 4
            T.add(arp(ch[s16 % 3] + 12 * (s16 // 8)), at, pan=(-0.4 if s16 % 2 else 0.4), gain=0.13)
            if s16 % 4 == 0:
                T.add(doum(), at, gain=0.5)
            if s16 % 8 == 4:
                T.add(tek(), at, gain=0.35)
        t0 += 2.0
        k += 1
    T.add(pad([50, 57, 62, 66], 3.0), 26.5, gain=0.4)
    T.save('music-clay.wav', drive=2.2, fade_out=1.5)


# ======================================================================
# 5) Weather — TV news theme: staccato synth strings, driving pulse, news stings
# ======================================================================
def weather():
    T = Track(5)
    beat = 60 / 128

    def stac(notes, length=0.16):
        t = tt(length)
        out = sum(2 * ((t * hz(m)) % 1) - 1 for m in notes)
        return onepole(out / len(notes), 0.2) * np.exp(-t * 14)

    def brass(notes, length=0.9):
        t = tt(length)
        out = sum(2 * ((t * hz(m + d)) % 1) - 1 for m in notes for d in (-0.1, 0.1))
        cut = 0.03 + 0.3 * np.exp(-t * 5)
        y = np.empty(len(t))
        acc = 0.0
        for i in range(len(t)):
            acc += cut[i] * (out[i] - acc)
            y[i] = acc
        return y / len(notes) * np.exp(-t * 2.5)

    def kick():
        t = tt(0.3)
        return np.sin(2 * np.pi * np.cumsum(130 * np.exp(-t * 30) + 50) / SR) * np.exp(-t * 9)

    def tick():
        t = tt(0.03)
        return np.sin(2 * np.pi * 2000 * t) * np.exp(-t * 150)

    def whoosh(length=0.8):
        t = tt(length)
        x = T.noise(len(t))
        out = np.empty(len(t))
        acc = 0.0
        for i in range(len(t)):
            acc += (0.02 + 0.3 * np.sin(np.pi * t[i] / length)) * (x[i] - acc)
            out[i] = acc
        return out * np.sin(np.pi * t / length)

    def sting():
        return brass([62, 66, 69, 74], 1.4)

    # 0–3 opener: whooshes + sting
    for at in (0.0, 0.35, 0.7):
        T.add(whoosh(), at, pan=(at - 0.35) * 2, gain=0.5)
    T.add(sting(), fr(20), gain=0.7)
    T.add(kick(), fr(20), gain=0.8)
    # news bed 3–21s & 26–30s: staccato strings pattern + ticking clock 16ths
    prog = [[62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]]  # D Bm G A
    t0 = 3.0
    k = 0
    while t0 < 29.5:
        if 21.0 <= t0 < 26.0:
            t0 += 4 * beat
            k += 1
            continue
        ch = prog[k % 4]
        for e in range(8):
            at = t0 + e * beat / 2
            if e in (0, 3, 6):
                T.add(stac(ch), at, pan=-0.2, gain=0.35)
            if e % 2 == 0:
                T.add(kick(), at, gain=0.45)
            T.add(tick(), at, pan=0.4, gain=0.15)
            T.add(tick(), at + beat / 4, pan=0.4, gain=0.08)
        T.add(stac([ch[0] - 24], 0.4), t0, gain=0.4)
        t0 += 4 * beat
        k += 1
    # radar sweep pings 8–15s
    for at in np.arange(8.0, 15.0, 0.9):
        t = tt(0.6)
        T.add(np.sin(2 * np.pi * 1320 * t) * np.exp(-t * 6), at, pan=0.5, gain=0.15)
    # forecast reveal sting at 15s, counter ticks
    T.add(sting(), 15.0, gain=0.6)
    for i in range(20):
        T.add(tick(), fr(480) + i * 0.13, gain=0.3)
    # BREAKING at 21s: big hits
    for i, at in enumerate((21.0, 21.35, 21.7)):
        T.add(brass([50, 57, 62, 65] if i < 2 else [50, 57, 62, 66], 1.2 if i == 2 else 0.3), at, gain=0.8)
        T.add(kick(), at, gain=0.9)
    for b in np.arange(22.4, 26.0, beat):
        T.add(kick(), b, gain=0.6)
        T.add(stac([62, 65, 69], 0.12), b + beat / 2, gain=0.3)
    T.add(whoosh(1.0), 25.2, gain=0.5)
    T.add(sting(), 26.1, gain=0.7)
    T.add(brass([50, 57, 62, 66, 69], 2.5), 28.4, gain=0.6)
    T.save('music-weather.wav', drive=1.4)


# ======================================================================
# 6) Crossword — lo-fi jazz: Rhodes chords, brushes, upright bass, vinyl crackle, typewriter
# ======================================================================
def crossword():
    T = Track(6)
    beat = 60 / 84

    def rhodes(notes, length):
        t = tt(length)
        out = np.zeros(len(t))
        for m in notes:
            f = hz(m)
            out += (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 4)) * np.exp(-t * 0.9)
        trem = 1 + 0.15 * np.sin(2 * np.pi * 4.5 * t)
        return out / len(notes) * trem * np.minimum(1, t * 100)

    def bass(m, length):
        t = tt(length)
        return np.sin(2 * np.pi * hz(m) * t) * np.exp(-t * 3) * np.minimum(1, t * 300)

    def brush(length=0.25):
        t = tt(length)
        x = T.noise(len(t))
        return (x - onepole(x, 0.4)) * np.exp(-t * 14) * 0.6

    def kick():
        t = tt(0.25)
        return np.sin(2 * np.pi * np.cumsum(90 * np.exp(-t * 25) + 45) / SR) * np.exp(-t * 12)

    def type_click():
        t = tt(0.05)
        x = T.noise(len(t))
        return (x - onepole(x, 0.3)) * np.exp(-t * 120) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 200) * 0.4

    def bell():
        t = tt(1.5)
        return (np.sin(2 * np.pi * hz(88) * t) + 0.4 * np.sin(2 * np.pi * hz(95) * t)) * np.exp(-t * 3)

    # vinyl crackle bed
    crackle = np.zeros(T.n)
    idx = T.rng.integers(0, T.n, 2500)
    crackle[idx] = T.rng.uniform(-1, 1, len(idx))
    crackle = onepole(crackle, 0.5) * 0.5 + onepole(T.noise(T.n), 0.02) * 0.05
    T.add(crackle, 0.0, gain=0.4)
    # ink stamps
    T.add(kick(), fr(2), gain=0.8)
    T.add(kick(), fr(12), gain=0.8)
    chords = [[62, 65, 69, 72], [55, 59, 62, 65], [60, 64, 67, 71], [57, 60, 64, 67]]  # Dm9 G7 Cmaj7 Am7
    roots = [38, 43, 36, 45]
    t0 = 0.8
    k = 0
    while t0 < 29.0:
        ch = chords[k % 4]
        T.add(rhodes(ch, 4 * beat), t0, gain=0.4)
        T.add(rhodes(ch, 2 * beat), t0 + 2.5 * beat, gain=0.18)
        for b in range(4):
            at = t0 + b * beat
            T.add(bass(roots[k % 4] + (0, 7, 12, 7)[b], beat * 0.9), at, gain=0.45)
            if t0 > 2.5:
                if b % 2 == 0:
                    T.add(kick(), at, gain=0.5)
                T.add(brush(), at + beat * 0.66, pan=0.3, gain=0.35)
                if b % 2 == 1:
                    T.add(brush(0.35), at, pan=-0.2, gain=0.5)
        t0 += 4 * beat
        k += 1
    # typewriter clicks for clues and each letter
    for at, n in ((130, 36), (160, 34), (190, 32)):
        for i in range(0, n, 2):
            T.add(type_click(), fr(at) + i / 1.6 / 30, pan=0.2, gain=0.25)
    for start in (270, 345, 420):
        for i in range(5):
            T.add(type_click(), fr(start + i * 13), gain=0.6)
    T.add(bell(), fr(500), gain=0.5)
    T.add(kick(), fr(770), gain=0.9)
    T.add(bell(), fr(770), gain=0.4)
    T.save('music-crossword.wav', drive=1.3, fade_out=1.5)


# ======================================================================
# Teasers (10s): suspense
# ======================================================================
def teaser_who():
    T = Track(7, 10.0)

    def thump(f0=55):
        t = tt(0.35)
        return np.sin(2 * np.pi * np.cumsum(f0 * np.exp(-t * 8) + 35) / SR) * np.exp(-t * 10)

    def drone(length):
        t = tt(length)
        s = np.sin(2 * np.pi * hz(38) * t) + 0.6 * np.sin(2 * np.pi * hz(39) * t) + 0.3 * np.sin(2 * np.pi * hz(50) * t)
        return s * np.minimum(1, t / 2) * np.minimum(1, (length - t) * 3)

    def glitch():
        t = tt(0.15)
        return np.sign(np.sin(2 * np.pi * 180 * t)) * T.noise(len(t)) * 0.7

    def hit():
        t = tt(1.5)
        return np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t * 3) + 30) / SR) * np.exp(-t * 2.5) + onepole(T.noise(len(t)), 0.15) * np.exp(-t * 8)

    T.add(drone(8.4), 0.0, gain=0.35)
    for b in np.arange(0.2, 8.3, 1.0):  # heartbeat lub-dub
        T.add(thump(), b, gain=0.8)
        T.add(thump(45), b + 0.22, gain=0.55)
    for at in (5.0, 5.5):
        T.add(glitch(), at, gain=0.6)
    for at in (185, 207, 229):
        T.add(hit(), fr(at), gain=0.5)
    T.add(hit(), fr(255), gain=1.0)
    T.save('music-teaser-who.wav', drive=1.3, fade_out=0.5)


def teaser_tomorrow():
    T = Track(8, 10.0)

    def tick(high=True):
        t = tt(0.04)
        return np.sin(2 * np.pi * (2400 if high else 1800) * t) * np.exp(-t * 120)

    def pulse():
        t = tt(0.5)
        return np.sin(2 * np.pi * 50 * t) * np.exp(-t * 7)

    def riser(length):
        t = tt(length)
        tone = np.sin(2 * np.pi * np.cumsum(100 + 900 * (t / length) ** 2) / SR)
        return (tone * 0.5 + onepole(T.noise(len(t)), 0.1) * 0.5) * (t / length) ** 2

    def impact():
        t = tt(2.0)
        return np.sin(2 * np.pi * np.cumsum(60 * np.exp(-t * 2) + 28) / SR) * np.exp(-t * 2) + onepole(T.noise(len(t)), 0.3) * np.exp(-t * 6)

    def pad(length):
        t = tt(length)
        s = sum(np.sin(2 * np.pi * hz(m) * t) for m in (50, 57, 62, 66))
        return s / 4 * np.minimum(1, t / 0.5) * np.exp(-t * 0.6)

    for s in range(8):
        T.add(tick(s % 2 == 0), float(s), gain=0.6)
        T.add(pulse(), float(s), gain=0.5 + s * 0.05)
    T.add(riser(3.0), 5.0, gain=0.6)
    T.add(impact(), fr(240), gain=1.0)
    T.add(pad(2.0), fr(242), gain=0.4)
    T.save('music-teaser-tomorrow.wav', drive=1.3, fade_out=0.4)


# ======================================================================
# 7) Puzzle — light & playful: pizzicato, glockenspiel, soft kick, the big "click"
# ======================================================================
def puzzle():
    T = Track(9)
    beat = 0.6

    def pizz(m, length=0.35):
        t = tt(length)
        f = hz(m)
        return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 14)

    def glock(m, length=1.2):
        t = tt(length)
        f = hz(m)
        return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6)) * np.exp(-t * 3.5)

    def kick():
        t = tt(0.25)
        return np.sin(2 * np.pi * np.cumsum(100 * np.exp(-t * 30) + 50) / SR) * np.exp(-t * 14)

    def click():
        t = tt(0.25)
        x = T.noise(len(t))
        return (x - onepole(x, 0.5)) * np.exp(-t * 80) + np.sin(2 * np.pi * 180 * t) * np.exp(-t * 25)

    def whoosh(length=0.5):
        t = tt(length)
        return onepole(T.noise(len(t)), 0.08) * np.sin(np.pi * t / length) ** 2

    chords = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]
    t0, k = 0.0, 0
    while t0 < 29.0:
        ch = chords[k % 4]
        for e in range(8):
            at = t0 + e * beat / 2
            if at >= 29:
                break
            T.add(pizz(ch[e % 3] + (12 if e in (3, 7) else 0)), at, pan=(-0.3 if e % 2 else 0.3), gain=0.35)
            if t0 >= 3.0 and e % 2 == 0 and not (9.0 <= at < 11.0):
                T.add(kick(), at, gain=0.35)
        T.add(pizz(ch[0] - 12, 0.6), t0, gain=0.45)
        t0 += 4 * beat
        k += 1
    for i, m in enumerate((72, 76, 79)):
        T.add(glock(m), 0.1 + i * 0.12, gain=0.3)
    # tension before the snap, then CLICK
    for i in range(10):
        T.add(glock(72 + i, 0.4), 9.0 + i * 0.2, gain=0.12 + i * 0.015)
    T.add(click(), fr(330), gain=1.0)
    for i, m in enumerate((72, 76, 79, 84)):
        T.add(glock(m, 1.5), fr(332) + i * 0.07, gain=0.35)
    for i in range(6):
        T.add(whoosh(), fr(405 + i * 15), pan=(-0.5 if i % 2 else 0.5), gain=0.35)
        T.add(click(), fr(425 + i * 15), gain=0.4)
    for i, m in enumerate((79, 84, 88, 91)):
        T.add(glock(m, 2.0), fr(610) + i * 0.1, gain=0.3)
    T.add(glock(84, 2.5), 28.0, gain=0.4)
    T.save('music-puzzle.wav', drive=2.3)


# ======================================================================
# 8) Coffee — oud (Karplus-Strong) in maqam Kurd, riq & frame drum, pouring, cup clink
# ======================================================================
def coffee():
    T = Track(10)
    beat = 60 / 90

    def oud(m, length=1.2, bright=0.55):
        n = int(length * SR)
        p = int(SR / hz(m))
        buf = T.rng.uniform(-1, 1, p)
        out = np.empty(n)
        for i in range(n):
            v = buf[i % p]
            out[i] = v
            buf[i % p] = 0.995 * (bright * v + (1 - bright) * buf[(i + 1) % p])
        return out

    def tar():
        t = tt(0.5)
        return np.sin(2 * np.pi * np.cumsum(80 * np.exp(-t * 12) + 60) / SR) * np.exp(-t * 6)

    def riq():
        t = tt(0.15)
        x = T.noise(len(t))
        return (x - onepole(x, 0.8)) * np.exp(-t * 25) * 0.6

    def pour(length):
        t = tt(length)
        x = onepole(T.noise(len(t)), 0.15)
        bub = np.sin(2 * np.pi * (500 + 200 * np.sin(2 * np.pi * 7 * t)) * t) * 0.15
        return (x + bub) * np.minimum(1, t * 5) * np.minimum(1, (length - t) * 5)

    def clink():
        t = tt(1.5)
        return sum(np.sin(2 * np.pi * f0 * t) * np.exp(-t * d) for f0, d in ((2350, 4), (3410, 6), (5120, 9))) / 3

    def drone(length):
        t = tt(length)
        return (np.sin(2 * np.pi * hz(38) * t) + 0.5 * np.sin(2 * np.pi * hz(45) * t)) * np.minimum(1, t / 2) * np.minimum(1, (length - t) / 2)

    KURD = [62, 63, 65, 67, 69, 70, 72, 74]
    phrase = [(0, 1), (1, 0.5), (2, 0.5), (3, 1), (4, 1), (3, 0.5), (2, 0.5), (1, 1), (0, 2),
              (4, 1), (5, 0.5), (4, 0.5), (3, 1), (2, 1), (3, 0.5), (2, 0.5), (1, 1), (0, 2)]
    T.add(drone(29.0), 0.0, gain=0.25)
    t0 = 0.3
    while t0 < 27.5:
        for deg, b in phrase:
            if t0 >= 27.5:
                break
            T.add(oud(KURD[deg]), t0, pan=-0.2, gain=0.3)
            t0 += b * beat
    # frame drum (samai-like) from 3s
    pat = [(0, 'D'), (1.5, 'D'), (2, 't'), (3, 't'), (3.5, 't')]
    bar = 3.0
    while bar < 26.0:
        for off, kind in pat:
            at = bar + off * beat
            T.add(tar() if kind == 'D' else riq(), at, pan=(0 if kind == 'D' else 0.35), gain=0.45 if kind == 'D' else 0.3)
        bar += 4 * beat
    T.add(pour(fr(70)), fr(158), pan=-0.2, gain=0.5)
    T.add(pour(fr(70)), fr(328), pan=0.2, gain=0.5)
    for i, m in enumerate((62, 65, 69, 74)):
        T.add(oud(m, 2.0, 0.7), fr(520) + i * 0.12, gain=0.3)
    T.add(clink(), fr(820), gain=0.6)
    for m in (50, 57, 62, 65):
        T.add(oud(m, 3.0, 0.6), fr(822), gain=0.3)
    T.save('music-coffee.wav', drive=1.5, fade_out=1.5)


# ======================================================================
# 9) Live stream — trap beat: 808 slides, hat rolls, snaps, airy pad, drop at the reveal
# ======================================================================
def live():
    T = Track(11)
    beat = 60 / 140

    def kick808(m, length):
        t = tt(length)
        f = hz(m) * (1 + 1.5 * np.exp(-t * 30))
        return np.tanh(2 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t * 1.2) * np.minimum(1, (length - t) * 30)

    def snap():
        t = tt(0.12)
        x = T.noise(len(t))
        return (x - onepole(x, 0.4)) * np.exp(-t * 40)

    def hat():
        t = tt(0.04)
        x = T.noise(len(t))
        return (x - onepole(x, 0.8)) * np.exp(-t * 120)

    def pad(notes, length):
        t = tt(length)
        out = sum(np.sin(2 * np.pi * hz(m + d) * t) for m in notes for d in (-0.08, 0.08))
        return out / (2 * len(notes)) * np.minimum(1, t / 0.8) * np.minimum(1, (length - t) / 0.8)

    def blip(m):
        t = tt(0.12)
        return np.sin(2 * np.pi * hz(m) * t) * np.exp(-t * 30)

    def chime():
        t = tt(1.5)
        return sum(np.sin(2 * np.pi * hz(m) * t) * np.exp(-t * 3) for m in (84, 88, 91)) / 3

    def impact():
        t = tt(2.0)
        return np.sin(2 * np.pi * np.cumsum(60 * np.exp(-t * 2) + 30) / SR) * np.exp(-t * 2) + onepole(T.noise(len(t)), 0.2) * np.exp(-t * 6)

    chords = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 62]]  # Am7 Fmaj7 G7 Em7
    roots = [33, 29, 31, 28]
    bar_len = 4 * beat
    t0, k = 0.0, 0
    while t0 < 28.5:
        T.add(pad(chords[k % 4], bar_len + 0.3), t0, gain=0.3)
        drop = t0 >= 15.0
        if t0 >= 3.0:
            T.add(kick808(roots[k % 4] + 12, beat * (1.5 if drop else 1.0)), t0, gain=0.6)
            T.add(kick808(roots[k % 4] + 12, beat * 0.9), t0 + beat * 2.5, gain=0.5)
            T.add(snap(), t0 + beat, pan=0.1, gain=0.5)
            T.add(snap(), t0 + 3 * beat, pan=0.1, gain=0.5)
            for s16 in range(16):
                at = t0 + s16 * beat / 4
                if s16 % 2 == 0 or (drop and s16 in (13, 14, 15)):
                    T.add(hat(), at, pan=0.35, gain=0.18)
            if drop and k % 2 == 1:
                for r in range(6):
                    T.add(hat(), t0 + 3.5 * beat + r * beat / 12, pan=0.35, gain=0.15)
        t0 += bar_len
        k += 1
    # comment pops
    for at in (100, 125, 150, 180, 215, 300, 330, 365, 500, 522, 545, 570, 600):
        T.add(blip(84 + (at % 5) * 2), fr(at), pan=-0.4, gain=0.25)
    T.add(impact(), fr(450), gain=0.9)
    T.add(chime(), fr(470), gain=0.5)
    T.add(chime(), fr(640), gain=0.35)
    T.add(impact(), fr(780), gain=0.6)
    T.save('music-live.wav', drive=1.5)


def teaser_piece():
    T = Track(12, 10.0)

    def piano(m, length=2.5):
        t = tt(length)
        f = hz(m)
        return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) * np.exp(-t * 3)) * np.exp(-t * 1.5) * np.minimum(1, t * 200)

    def tick():
        t = tt(0.03)
        return np.sin(2 * np.pi * 1600 * t) * np.exp(-t * 150)

    def whoosh(length=0.6):
        t = tt(length)
        return onepole(T.noise(len(t)), 0.06) * np.sin(np.pi * t / length) ** 2

    def thud():
        t = tt(1.5)
        return np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t * 4) + 35) / SR) * np.exp(-t * 3)

    notes = [69, 72, 76, 74, 72, 71, 69, 68]
    for i, m in enumerate(notes):
        T.add(piano(m), 0.2 + i * 0.9, pan=(-0.3 if i % 2 else 0.3), gain=0.35)
        T.add(piano(m - 24, 2.0), 0.2 + i * 0.9, gain=0.2)
    for s in np.arange(0.0, 7.2, 0.5):
        T.add(tick(), s, gain=0.25)
    for at in (90, 160):
        T.add(whoosh(), fr(at), gain=0.4)
    T.add(thud(), fr(220), gain=0.9)
    for m in (57, 64, 69, 72, 76):
        T.add(piano(m, 3.0), fr(222), gain=0.25)
    T.save('music-teaser-piece.wav', drive=1.3, fade_out=0.5)


# ======================================================================
# 10) Time has come — clock ticks under cinematic strings, oud motif, a bell toll at 12
# ======================================================================
def time_has_come():
    T = Track(13)

    def tick(tock=False):
        t = tt(0.06)
        x = T.noise(len(t))
        body = np.sin(2 * np.pi * (1300 if tock else 1750) * t) * np.exp(-t * 90)
        return (body + (x - onepole(x, 0.5)) * 0.4) * np.exp(-t * 60)

    def strings(notes, length):
        t = tt(length)
        out = np.zeros(len(t))
        for m in notes:
            for det in (-0.07, 0.0, 0.07):
                f = hz(m + det) * (1 + 0.004 * np.sin(2 * np.pi * 5 * t + m))
                ph = 2 * np.pi * np.cumsum(f) / SR
                out += np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
        return out / (3 * len(notes)) * np.minimum(1, t / 1.2) * np.minimum(1, (length - t) / 1.0)

    def oud(m, length=1.4):
        n = int(length * SR)
        p = int(SR / hz(m))
        buf = T.rng.uniform(-1, 1, p)
        out = np.empty(n)
        for i in range(n):
            v = buf[i % p]
            out[i] = v
            buf[i % p] = 0.995 * (0.55 * v + 0.45 * buf[(i + 1) % p])
        return out

    def pulse():
        t = tt(0.5)
        return np.sin(2 * np.pi * np.cumsum(60 * np.exp(-t * 10) + 40) / SR) * np.exp(-t * 7)

    def bell(length=6.0):
        t = tt(length)
        partials = [(0.5, 1.0, 0.6), (1.0, 0.8, 0.8), (1.19, 0.5, 1.1), (1.5, 0.4, 1.3), (2.0, 0.35, 1.6), (2.74, 0.25, 2.2)]
        f0 = hz(50)
        return sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * d) for r, a, d in partials) / 3

    def impact(length=3.0):
        t = tt(length)
        return np.sin(2 * np.pi * np.cumsum(55 * np.exp(-t * 1.5) + 28) / SR) * np.exp(-t * 1.4) + onepole(T.noise(len(t)), 0.15) * np.exp(-t * 5)

    def whoosh_up(length):
        t = tt(length)
        x = T.noise(len(t))
        out = np.empty(len(t))
        acc = 0.0
        for i in range(len(t)):
            acc += (0.005 + 0.35 * (t[i] / length) ** 2) * (x[i] - acc)
            out[i] = acc
        return out * (t / length) ** 1.5

    # opening hit under the logos
    T.add(impact(), 0.0, gain=0.7)
    # strings: Dm – Bb – Gm – A during the tour, then D major for the partnership
    prog = [([50, 57, 62, 65], 3.0), ([46, 53, 58, 62], 7.0), ([43, 50, 55, 58], 11.0), ([45, 52, 57, 61], 15.0)]
    for notes, at in prog:
        T.add(strings(notes, 4.6), at, gain=0.4)
    # clock ticks 3–18s with a heartbeat pulse every second
    for k, at in enumerate(np.arange(3.0, 18.0, 0.5)):
        T.add(tick(k % 2 == 1), at, pan=-0.3, gain=0.5)
        if k % 2 == 0:
            T.add(pulse(), at, gain=0.35)
    # oud motif (maqam Hijaz on D)
    hijaz = [62, 63, 66, 67, 69, 70, 72, 74]
    motif = [(0, 1), (1, 0.5), (2, 0.5), (3, 1), (4, 1), (3, 0.5), (2, 0.5), (1, 1), (0, 2)]
    for start in (3.5, 10.5):
        t0 = start
        for deg, b in motif:
            T.add(oud(hijaz[deg]), t0, pan=0.25, gain=0.32)
            t0 += b * 0.5
    # clock spins (18–20.5s), accelerating ticks + rising whoosh, then the bell strikes twelve
    t0, step = 18.0, 0.25
    while t0 < 20.4:
        T.add(tick(), t0, gain=0.5)
        t0 += step
        step = max(0.04, step * 0.85)
    T.add(whoosh_up(2.5), 18.0, gain=0.6)
    T.add(bell(), fr(618), gain=0.9)
    T.add(impact(), fr(618), gain=0.8)
    # «للشراكة» — warm D major swell
    T.add(strings([50, 57, 62, 66, 69], 4.5), fr(690), gain=0.55)
    T.add(impact(2.0), fr(690), gain=0.6)
    for i, m in enumerate((62, 66, 69, 74)):
        T.add(oud(m, 2.0), fr(705) + i * 0.12, gain=0.3)
    # ending
    T.add(strings([38, 50, 57, 62, 66], 3.2), fr(812), gain=0.5)
    T.add(bell(3.0), fr(812), gain=0.4)
    T.save('music-time.wav', drive=1.5, fade_out=1.5)


# shared helpers for the photo-based clips
def _ks(T, m, length=1.4, bright=0.55, decay=0.995):
    n = int(length * SR)
    p = int(SR / hz(m))
    buf = T.rng.uniform(-1, 1, p)
    out = np.empty(n)
    for i in range(n):
        v = buf[i % p]
        out[i] = v
        buf[i % p] = decay * (bright * v + (1 - bright) * buf[(i + 1) % p])
    return out


def _pad(notes, length, att=1.2):
    t = tt(length)
    out = np.zeros(len(t))
    for m in notes:
        for det in (-0.07, 0.07):
            ph = 2 * np.pi * np.cumsum(hz(m + det) * (1 + 0.003 * np.sin(2 * np.pi * 5 * t + m))) / SR
            out += np.sin(ph) + 0.25 * np.sin(2 * ph)
    return out / (2 * len(notes)) * np.minimum(1, t / att) * np.minimum(1, (length - t) / 1.0)


# ======================================================================
# 11) Doors — wind, wooden creaks, oud, warm strings; a thump each time a door opens
# ======================================================================
def doors():
    T = Track(14)

    def wind(length):
        t = tt(length)
        x = T.noise(len(t))
        out = np.empty(len(t))
        acc = 0.0
        for i in range(len(t)):
            acc += (0.01 + 0.01 * np.sin(2 * np.pi * 0.2 * t[i])) * (x[i] - acc)
            out[i] = acc
        return out * 4

    def creak(length=1.0):
        t = tt(length)
        f = 140 + 60 * np.sin(2 * np.pi * 1.3 * t) + 30 * T.noise(len(t)) * 0.1
        s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (0.5 + 0.5 * np.sin(2 * np.pi * 23 * t))
        return onepole(s, 0.2) * np.sin(np.pi * t / length) * 0.4

    def thump():
        t = tt(1.2)
        return np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t * 5) + 35) / SR) * np.exp(-t * 4)

    def whoosh(length=1.2):
        t = tt(length)
        return onepole(T.noise(len(t)), 0.05) * np.sin(np.pi * t / length) ** 2 * 2

    T.add(wind(30.0), 0.0, gain=0.1)
    T.add(thump(), 0.05, gain=0.7)
    chords = [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 61]]
    for k in range(5):
        T.add(_pad(chords[k % 4], 6.6), 3.0 + k * 6.0 - 0.3, gain=0.32 if k < 4 else 0.0)
    hijaz = [62, 63, 66, 67, 69, 70, 72, 74]
    motif = [(0, 1), (2, 0.5), (3, 0.5), (4, 1), (3, 0.5), (2, 0.5), (1, 1), (0, 1.5)]
    for start in (6.0, 12.0, 18.0):
        t0 = start
        for deg, b in motif:
            T.add(_ks(T, hijaz[deg]), t0, pan=0.25, gain=0.3)
            t0 += b * 0.55
    for r in range(4):
        base = fr(90 + r * 180)
        T.add(creak(1.1), base + fr(15), pan=-0.2, gain=0.5)
        T.add(whoosh(), base + fr(48), gain=0.45)
        T.add(thump(), base + fr(85), gain=0.5)
    # final door: bright D major swell + sparkle
    T.add(_pad([50, 57, 62, 66, 69, 74], 5.5), fr(630), gain=0.55)
    for i, m in enumerate((74, 78, 81, 86, 90)):
        T.add(_ks(T, m, 1.5, 0.7), fr(690) + i * 0.09, gain=0.25)
    T.add(creak(1.0), fr(810), gain=0.4)
    T.add(thump(), fr(840), gain=0.6)
    T.save('music-doors.wav', drive=1.5, fade_out=1.5)


# ======================================================================
# 12) Postcards — warm acoustic guitar, shaker, paper whooshes, stamp thuds
# ======================================================================
def postcards():
    T = Track(15)
    beat = 60 / 96

    def shaker():
        t = tt(0.08)
        x = T.noise(len(t))
        return (x - onepole(x, 0.6)) * np.exp(-t * 50) * 0.5

    def stamp():
        t = tt(0.6)
        return np.sin(2 * np.pi * np.cumsum(90 * np.exp(-t * 20) + 50) / SR) * np.exp(-t * 12) + onepole(T.noise(len(t)), 0.3) * np.exp(-t * 40)

    def paper(length=0.5):
        t = tt(length)
        x = T.noise(len(t))
        return (x - onepole(x, 0.3)) * np.sin(np.pi * t / length) ** 2 * 0.5

    chords = [[55, 59, 62, 67, 71], [52, 55, 59, 64, 67], [48, 52, 55, 60, 64], [50, 54, 57, 62, 66]]  # G Em C D
    t0, k = 0.2, 0
    while t0 < 28.5:
        ch = chords[k % 4]
        for e, idx in enumerate([0, 2, 3, 4, 3, 2, 1, 2]):  # fingerpicking
            T.add(_ks(T, ch[idx], 1.2, 0.5, 0.996), t0 + e * beat / 2, pan=(-0.2 if e % 2 else 0.2), gain=0.28)
        if t0 >= 3.0:
            for e in range(8):
                T.add(shaker(), t0 + e * beat / 2, pan=0.4, gain=0.3 if e % 2 else 0.18)
        t0 += 4 * beat
        k += 1
    T.add(stamp(), fr(6), gain=0.9)
    T.add(stamp(), fr(18), gain=0.9)
    for i in range(4):
        T.add(paper(), fr(90 + i * 120), pan=(0.4 if i % 2 else -0.4), gain=0.6)
    T.add(paper(0.8), fr(570), gain=0.6)
    T.add(paper(0.7), fr(620), gain=0.5)
    T.add(stamp(), fr(715), gain=1.0)
    for i, m in enumerate((67, 71, 74, 79)):
        T.add(_ks(T, m, 2.0, 0.6), fr(720) + i * 0.1, gain=0.3)
    T.add(stamp(), fr(792), gain=0.7)
    T.save('music-postcards.wav', drive=2.4, fade_out=1.5)


# ======================================================================
# 13) Viewfinder — chill modern beat with camera shutter clicks and focus beeps
# ======================================================================
def viewfinder():
    T = Track(16)
    beat = 60 / 100

    def kick():
        t = tt(0.3)
        return np.sin(2 * np.pi * np.cumsum(120 * np.exp(-t * 30) + 48) / SR) * np.exp(-t * 9)

    def snare():
        t = tt(0.2)
        x = T.noise(len(t))
        return ((x - onepole(x, 0.3)) * 0.7 + np.sin(2 * np.pi * 190 * t) * 0.5) * np.exp(-t * 20)

    def hat():
        t = tt(0.04)
        x = T.noise(len(t))
        return (x - onepole(x, 0.8)) * np.exp(-t * 110)

    def keys(notes, length):
        t = tt(length)
        out = sum(np.sin(2 * np.pi * hz(m) * t) + 0.2 * np.sin(4 * np.pi * hz(m) * t) * np.exp(-t * 4) for m in notes)
        return out / len(notes) * np.exp(-t * 0.8) * np.minimum(1, t * 100)

    def shutter():
        out = np.zeros(int(0.25 * SR))
        for d in (0.0, 0.06):
            t = tt(0.05)
            x = T.noise(len(t))
            s = (x - onepole(x, 0.4)) * np.exp(-t * 120)
            i = int(d * SR)
            out[i : i + len(s)] += s
        return out

    def beep():
        t = tt(0.12)
        s = np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 20)
        return np.concatenate([s, np.zeros(int(0.04 * SR)), s])

    chords = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]  # Am7 Fmaj7 Cmaj7 G7
    roots = [33, 29, 36, 31]
    t0, k = 0.0, 0
    while t0 < 28.5:
        T.add(keys(chords[k % 4], 4 * beat), t0, gain=0.35)
        T.add(keys([roots[k % 4] + 12], 4 * beat), t0, gain=0.35)
        if t0 >= 3.0:
            for b in range(4):
                at = t0 + b * beat
                if b in (0, 2):
                    T.add(kick(), at, gain=0.55)
                if b in (1, 3):
                    T.add(snare(), at, gain=0.35)
                T.add(hat(), at, pan=0.35, gain=0.15)
                T.add(hat(), at + beat / 2, pan=0.35, gain=0.1)
        t0 += 4 * beat
        k += 1
    T.add(beep(), fr(48), gain=0.3)
    for i in range(4):
        base = 90 + i * 135
        T.add(beep(), fr(base + 55), gain=0.3)
        T.add(shutter(), fr(base + 95), gain=0.9)
    T.add(keys([69, 72, 76, 81], 3.0), fr(655), gain=0.4)
    T.add(keys([62, 66, 69, 74], 3.0), fr(812), gain=0.4)
    T.add(shutter(), fr(812), gain=0.7)
    T.save('music-viewfinder.wav', drive=1.5)


# ======================================================================
# 14) Flight — lounge electronic: airport chime, split-flap clatter, printer, jet rumble
# ======================================================================
def flight():
    T = Track(17)
    beat = 60 / 112

    def chime(seq=(76, 72, 79)):
        out = np.zeros(int(2.4 * SR))
        for i, m in enumerate(seq):
            t = tt(1.4)
            s = (np.sin(2 * np.pi * hz(m) * t) + 0.3 * np.sin(2 * np.pi * hz(m + 12) * t)) * np.exp(-t * 2.5)
            k = int(i * 0.45 * SR)
            out[k : k + len(s)] += s[: len(out) - k]
        return out

    def flap():
        t = tt(0.025)
        x = T.noise(len(t))
        return (x - onepole(x, 0.4)) * np.exp(-t * 200)

    def rhodes(notes, length):
        t = tt(length)
        out = sum((np.sin(2 * np.pi * hz(m) * t) + 0.25 * np.sin(4 * np.pi * hz(m) * t) * np.exp(-t * 4)) for m in notes)
        return out / len(notes) * (1 + 0.15 * np.sin(2 * np.pi * 4 * t)) * np.exp(-t * 0.7) * np.minimum(1, t * 100)

    def kick():
        t = tt(0.25)
        return np.sin(2 * np.pi * np.cumsum(110 * np.exp(-t * 30) + 50) / SR) * np.exp(-t * 11)

    def hat(op=False):
        t = tt(0.15 if op else 0.04)
        x = T.noise(len(t))
        return (x - onepole(x, 0.8)) * np.exp(-t * (18 if op else 110))

    def printer(length):
        t = tt(length)
        return np.sign(np.sin(2 * np.pi * 95 * t)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 7 * t))) * 0.25

    def rumble(length):
        t = tt(length)
        x = onepole(T.noise(len(t)), 0.01) * 6
        return x * np.minimum(1, t / 1.5) * np.minimum(1, (length - t) / 1.5)

    def stamp():
        t = tt(0.5)
        return np.sin(2 * np.pi * np.cumsum(90 * np.exp(-t * 20) + 50) / SR) * np.exp(-t * 12)

    chords = [[62, 65, 69, 72], [60, 64, 67, 71], [58, 62, 65, 69], [57, 60, 64, 67]]  # Dm9 Cmaj7 Bbmaj7 Am7
    t0, k = 0.0, 0
    while t0 < 28.5:
        T.add(rhodes(chords[k % 4], 4 * beat), t0, gain=0.35)
        T.add(rhodes([chords[k % 4][0] - 24], 4 * beat), t0, gain=0.4)
        if t0 >= 3.0 and not (15.0 <= t0 < 23.0):
            for b in range(4):
                at = t0 + b * beat
                T.add(kick(), at, gain=0.45)
                T.add(hat(True), at + beat / 2, pan=0.35, gain=0.12)
        t0 += 4 * beat
        k += 1
    T.add(chime((72, 76, 79)), 0.1, gain=0.45)
    for i in range(140):
        T.add(flap(), fr(100) + i * 0.022 + T.rng.uniform(0, 0.01), pan=T.rng.uniform(-0.5, 0.5), gain=0.35)
    T.add(chime(), fr(190), gain=0.6)
    T.add(printer(1.4), fr(275), gain=0.4)
    T.add(stamp(), fr(380), gain=0.9)
    T.add(rumble(8.0), fr(450), gain=0.5)
    T.add(rhodes([62, 66, 69, 74, 78], 4.0), fr(690), gain=0.5)
    T.add(chime((79, 76, 72)), fr(812), gain=0.45)
    T.save('music-flight.wav', drive=1.5, fade_out=1.5)


# ======================================================================
# 15) Letters — stomp-clap anthem: stomps, crowd claps, synth drone, a hit on every word
# ======================================================================
def letters():
    T = Track(18)
    beat = 60 / 96

    def stomp():
        t = tt(0.4)
        thud = np.sin(2 * np.pi * np.cumsum(80 * np.exp(-t * 15) + 45) / SR) * np.exp(-t * 9)
        wood = onepole(T.noise(len(t)), 0.2) * np.exp(-t * 30)
        return thud + wood * 0.5

    def clap():
        t = tt(0.22)
        out = np.zeros(len(t))
        for d in (0.0, 0.007, 0.015, 0.022, 0.03):
            i = int(d * SR)
            x = T.noise(len(t) - i)
            out[i:] += (x - onepole(x, 0.3)) * np.exp(-t[: len(t) - i] * 26)
        return out * 0.4

    def drone(notes, length):
        t = tt(length)
        out = sum(2 * ((t * hz(m + d)) % 1) - 1 for m in notes for d in (-0.1, 0.1))
        return onepole(out / (2 * len(notes)), 0.04) * np.minimum(1, t / 0.5) * np.minimum(1, (length - t) / 0.5)

    def hit():
        t = tt(1.6)
        return np.sin(2 * np.pi * np.cumsum(60 * np.exp(-t * 3) + 32) / SR) * np.exp(-t * 2.5) + onepole(T.noise(len(t)), 0.25) * np.exp(-t * 7)

    def riser(length):
        t = tt(length)
        tone = np.sin(2 * np.pi * np.cumsum(120 + 1100 * (t / length) ** 2) / SR) * 0.4
        return (tone + onepole(T.noise(len(t)), 0.15) * 0.6) * (t / length) ** 2

    T.add(hit(), 0.0, gain=0.7)
    T.add(hit(), fr(8), gain=0.5)
    chords = [[50, 57, 62], [46, 53, 58], [48, 55, 60], [45, 52, 57]]
    t0, k = 3.0, 0
    while t0 < 19.0:
        T.add(drone(chords[k % 4], 4 * beat), t0, gain=0.3)
        for b in range(4):
            at = t0 + b * beat
            if b in (0, 2):
                T.add(stomp(), at, gain=0.7)
            else:
                T.add(clap(), at, pan=0.2, gain=0.6)
        t0 += 4 * beat
        k += 1
    for frm in (90, 210, 330, 450):
        T.add(hit(), fr(frm), gain=0.8)
    T.add(riser(2.2), fr(570), gain=0.7)
    T.add(hit(), fr(640), gain=1.0)
    T.add(drone([50, 57, 62, 66, 69], 5.0), fr(645), gain=0.45)
    t0 = fr(660)
    while t0 < 27.5:
        T.add(stomp(), t0, gain=0.6)
        T.add(clap(), t0 + beat, gain=0.5)
        t0 += 2 * beat
    T.add(hit(), fr(782), gain=0.7)
    T.save('music-letters.wav', drive=1.6)


# ======================================================================
# 16) Sketch — gentle piano & strings, pencil scratching, brush swishes
# ======================================================================
def sketch():
    T = Track(19)

    def piano(m, length=2.5):
        t = tt(length)
        f = hz(m)
        return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) * np.exp(-t * 3) + 0.1 * np.sin(6 * np.pi * f * t)) * np.exp(-t * 1.4) * np.minimum(1, t * 200)

    def pencil(length):
        t = tt(length)
        x = T.noise(len(t))
        x = x - onepole(x, 0.5)
        strokes = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 3.2 * t + np.sin(2 * np.pi * 0.7 * t)))
        return x * strokes * 0.25

    def brush(length=0.6):
        t = tt(length)
        x = onepole(T.noise(len(t)), 0.08)
        return x * np.sin(np.pi * t / length) ** 2 * 2.5

    arps = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]]  # C Am F G
    t0, k = 0.2, 0
    while t0 < 28.0:
        for i, m in enumerate(arps[k % 4] + arps[k % 4][::-1][1:3]):
            T.add(piano(m), t0 + i * 0.4, pan=(-0.25 if i % 2 else 0.25), gain=0.22)
        T.add(_pad([arps[k % 4][0] - 12, arps[k % 4][2] - 12], 2.6), t0, gain=0.25)
        t0 += 2.4
        k += 1
    T.add(pencil(fr(120)), fr(95), pan=0.3, gain=0.6)
    T.add(pencil(fr(80)), fr(455), pan=0.3, gain=0.6)
    T.add(pencil(fr(50)), fr(665), pan=-0.2, gain=0.5)
    for i in range(5):
        T.add(brush(), fr(300 + i * 16), pan=(-0.4 + i * 0.2), gain=0.5)
        T.add(brush(), fr(545 + i * 14), pan=(0.4 - i * 0.2), gain=0.5)
    for m in (60, 64, 67, 72, 76):
        T.add(piano(m, 4.0), fr(720) + (m - 60) * 0.02, gain=0.25)
    T.add(_pad([48, 55, 60, 64, 67], 3.0), fr(812), gain=0.4)
    T.save('music-sketch.wav', drive=1.6, fade_out=1.5)


# ======================================================================
# 17) Projection — dark ambient electronic: projector relay clunks, deep pulses, glitch, swells
# ======================================================================
def projection():
    T = Track(20)

    def clunk():
        t = tt(0.3)
        return (np.sin(2 * np.pi * np.cumsum(140 * np.exp(-t * 40) + 60) / SR) * np.exp(-t * 18) + onepole(T.noise(len(t)), 0.4) * np.exp(-t * 60)) * 0.9

    def pulse():
        t = tt(0.9)
        return np.sin(2 * np.pi * np.cumsum(55 * np.exp(-t * 4) + 38) / SR) * np.exp(-t * 3.5)

    def glitch(length=0.25):
        t = tt(length)
        return np.sign(np.sin(2 * np.pi * (300 + 900 * T.rng.random()) * t)) * (T.noise(len(t)) > 0.3) * np.exp(-t * 12) * 0.4

    def arp(m, length=0.18):
        t = tt(length)
        return (2 * ((t * hz(m)) % 1) - 1) * np.exp(-t * 14) * 0.6

    T.add(_pad([38, 45, 50], 30.0, att=3.0), 0.0, gain=0.3)
    for at in (0.2, fr(90), fr(140), fr(245), fr(428), fr(600), fr(655), fr(790)):
        T.add(clunk(), at, gain=0.8)
    for b in np.arange(3.0, 26.0, 0.75):
        T.add(pulse(), b, gain=0.5)
    notes = [62, 65, 69, 72, 74, 72, 69, 65]
    for k, at in enumerate(np.arange(8.2, 20.0, 0.1875)):
        T.add(arp(notes[k % 8] + (12 if at > 14 else 0)), at, pan=(-0.4 if k % 2 else 0.4), gain=0.18)
    for f0 in (47, 61, 94, 122, 141, 183, 244, 305, 366, 427, 488, 549):
        T.add(glitch(), fr(f0), pan=T.rng.uniform(-0.6, 0.6), gain=0.35)
    T.add(_pad([50, 57, 62, 66, 69], 6.0, att=1.0), fr(600), gain=0.5)
    T.add(_pad([50, 57, 62, 66], 3.0), fr(790), gain=0.4)
    T.save('music-projection.wav', drive=1.6, fade_out=1.5)


# ======================================================================
# 18) Yesterday × Tomorrow — oud & frame drum (yesterday) answered by synth & piano (tomorrow), then merged
# ======================================================================
def yesterday():
    T = Track(21)

    def tar():
        t = tt(0.5)
        return np.sin(2 * np.pi * np.cumsum(80 * np.exp(-t * 12) + 60) / SR) * np.exp(-t * 6)

    def synth(m, length=0.4):
        t = tt(length)
        s = sum(2 * ((t * hz(m + d)) % 1) - 1 for d in (-0.1, 0.1)) / 2
        return onepole(s, 0.15) * np.exp(-t * 5)

    def piano(m, length=2.0):
        t = tt(length)
        f0 = hz(m)
        return (np.sin(2 * np.pi * f0 * t) + 0.3 * np.sin(4 * np.pi * f0 * t) * np.exp(-t * 3)) * np.exp(-t * 1.5) * np.minimum(1, t * 200)

    def whoosh(length=0.8):
        t = tt(length)
        return onepole(T.noise(len(t)), 0.06) * np.sin(np.pi * t / length) ** 2 * 2

    T.add(tar(), 0.1, gain=0.8)
    T.add(synth(74, 0.8), fr(8), gain=0.5)
    kurd = [62, 63, 65, 67, 69, 70, 72, 74]
    phrase = [(0, 1), (1, 0.5), (2, 0.5), (3, 1), (4, 1), (3, 0.5), (2, 0.5), (1, 1), (0, 1)]
    t0 = 3.1
    for deg, b in phrase:
        T.add(_ks(T, kurd[deg]), t0, pan=-0.5, gain=0.35)
        t0 += b * 0.6
    for b in np.arange(3.0, 9.0, 1.2):
        T.add(tar(), b, pan=-0.4, gain=0.5)
    t0 = 9.1
    for k in range(32):
        T.add(synth([62, 65, 69, 74][k % 4] + (12 if k % 8 > 5 else 0), 0.25), t0 + k * 0.1875, pan=0.5, gain=0.25)
    for k, m in enumerate((74, 72, 69, 65, 69, 72)):
        T.add(piano(m), 9.0 + k * 0.9, pan=0.4, gain=0.3)
    # the slider (15–21s): both voices alternate
    for k in range(12):
        at = 15.0 + k * 0.5
        if k % 2 == 0:
            T.add(_ks(T, kurd[k % 8]), at, pan=-0.5, gain=0.3)
            T.add(tar(), at, pan=-0.4, gain=0.4)
        else:
            T.add(synth(kurd[k % 8] + 12, 0.3), at, pan=0.5, gain=0.3)
    T.add(whoosh(1.2), fr(630), gain=0.6)
    # merged: both together on D major
    T.add(_pad([50, 57, 62, 66, 69], 6.0, att=0.8), fr(640), gain=0.5)
    for k in range(16):
        at = fr(690) + k * 0.3
        T.add(_ks(T, [62, 66, 69, 74][k % 4]), at, pan=-0.3, gain=0.25)
        T.add(synth([74, 78, 81, 86][k % 4], 0.25), at + 0.15, pan=0.3, gain=0.18)
    T.add(tar(), fr(790), gain=0.7)
    T.add(_pad([50, 57, 62, 66], 3.2), fr(790), gain=0.4)
    T.save('music-yesterday.wav', drive=1.5, fade_out=1.5)


# ======================================================================
# 19) Wax seal — chamber strings & harp-like plucks, quill scratching, paper folds, wax and the seal thud
# ======================================================================
def waxseal():
    T = Track(22)

    def quill(length):
        t = tt(length)
        x = T.noise(len(t))
        x = x - onepole(x, 0.6)
        return x * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 5 * t))) * 0.2

    def fold():
        t = tt(0.5)
        x = T.noise(len(t))
        return (x - onepole(x, 0.2)) * np.sin(np.pi * t / 0.5) ** 2 * 0.6

    def drip():
        t = tt(0.4)
        return np.sin(2 * np.pi * np.cumsum(700 * np.exp(-t * 18) + 200) / SR) * np.exp(-t * 14) * 0.4

    def thud():
        t = tt(0.8)
        return np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t * 12) + 40) / SR) * np.exp(-t * 7) + onepole(T.noise(len(t)), 0.2) * np.exp(-t * 30)

    prog = [[50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61]]
    for k in range(7):
        T.add(_pad(prog[k % 4], 4.6, att=0.8), k * 4.0, gain=0.35)
        for i, m in enumerate(prog[k % 4] + [prog[k % 4][1] + 12, prog[k % 4][2] + 12]):
            T.add(_ks(T, m + 12, 1.6, 0.7), k * 4.0 + i * 0.25, pan=(-0.3 if i % 2 else 0.3), gain=0.18)
    T.add(thud(), fr(6), gain=0.8)
    T.add(thud(), fr(20), gain=0.8)
    for i in range(len(LINES_TIMING)):
        T.add(quill(1.1), fr(LINES_TIMING[i]), pan=0.2, gain=0.6)
    T.add(fold(), fr(345), gain=0.8)
    T.add(fold(), fr(385), gain=0.8)
    for i in range(4):
        T.add(drip(), fr(455) + i * 0.25, gain=0.6)
    T.add(thud(), fr(505), gain=1.0)
    T.add(_pad([50, 57, 62, 66, 69], 5.0, att=0.6), fr(620), gain=0.5)
    T.add(_pad([50, 57, 62, 66], 3.0), fr(792), gain=0.4)
    T.save('music-waxseal.wav', drive=1.6, fade_out=1.5)


LINES_TIMING = [120, 160, 200, 240, 280]


# ======================================================================
# Calm tracks for the surreal ideas (20–22)
# ======================================================================
def _glass(m, length=4.0):
    t = tt(length)
    f0 = hz(m)
    s = np.sin(2 * np.pi * f0 * t) + 0.4 * np.sin(2 * np.pi * f0 * 2.01 * t) * np.exp(-t * 1.2) + 0.15 * np.sin(2 * np.pi * f0 * 3.98 * t) * np.exp(-t * 2)
    return s * np.exp(-t * 0.9) * np.minimum(1, t * 60)


def microscope():
    # glassy ambient: long airy chords, sparse crystal tones, soft sub hum, gentle focus swells
    T = Track(23)
    chords = [[50, 57, 62, 64], [48, 55, 60, 64], [46, 53, 58, 62], [45, 52, 57, 64]]
    for k in range(5):
        T.add(_pad(chords[k % 4], 7.5, att=3.0), k * 6.0, gain=0.4)
    t = tt(30.0)
    T.add(np.sin(2 * np.pi * 41 * t) * 0.25 * np.minimum(1, t / 4) * np.minimum(1, (30 - t) / 3), 0.0, gain=0.6)
    scale = [74, 76, 79, 81, 83, 86, 88]
    rng = np.random.default_rng(8)
    at = 0.6
    while at < 28.0:
        T.add(_glass(scale[rng.integers(len(scale))]), at, pan=rng.uniform(-0.6, 0.6), gain=0.12)
        at += rng.choice([1.2, 1.6, 2.0])
    for frm in (90, 240, 420):
        t2 = tt(2.0)
        sw = onepole(T.noise(len(t2)), 0.02) * np.sin(np.pi * t2 / 2.0) ** 2 * 3
        T.add(sw, fr(frm) - 0.8, gain=0.3)
    T.add(_pad([50, 57, 62, 66, 69], 7.0, att=1.5), fr(600), gain=0.45)
    T.save('music-microscope.wav', drive=1.2, fade_out=2.5)


def island():
    # dreamy music box waltz (3/4) over a soft pad and wind
    T = Track(24)
    beat = 60 / 72

    def box(m, length=2.2):
        t = tt(length)
        f0 = hz(m)
        return (np.sin(2 * np.pi * f0 * t) + 0.25 * np.sin(2 * np.pi * f0 * 4.2 * t) * np.exp(-t * 6)) * np.exp(-t * 2.2) * np.minimum(1, t * 300)

    t = tt(30.0)
    wind = onepole(T.noise(len(t)), 0.004) * 4 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t))
    T.add(wind, 0.0, gain=0.15)
    chords = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]
    melody = [76, 79, 84, 83, 79, 76, 77, 81, 84, 83, 79, 74]
    bar, k = 0.5, 0
    while bar < 28.0:
        ch = chords[k % 4]
        T.add(_pad([c - 12 for c in ch], 3 * beat + 0.4, att=0.8), bar, gain=0.28)
        T.add(box(ch[0] - 12 + 24, 1.6), bar, pan=-0.2, gain=0.18)
        T.add(box(ch[1] + 12, 1.2), bar + beat, pan=0.2, gain=0.12)
        T.add(box(ch[2] + 12, 1.2), bar + 2 * beat, pan=0.2, gain=0.12)
        if bar >= 3.0:
            T.add(box(melody[k % len(melody)]), bar, pan=0.1, gain=0.2)
            T.add(box(melody[(k + 3) % len(melody)], 1.6), bar + 1.5 * beat, pan=-0.1, gain=0.12)
        bar += 3 * beat
        k += 1
    for i, m in enumerate((84, 88, 91, 96)):
        T.add(box(m, 2.5), fr(560) + i * 0.15, gain=0.18)
    T.save('music-island.wav', drive=1.3, fade_out=2.5)


def reflection():
    # water drops, soft felt piano, low warm drone
    T = Track(25)

    def plip(m=88):
        t = tt(0.5)
        f = hz(m) * (1 + 0.8 * np.exp(-t * 30))
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)

    def felt(m, length=3.5):
        t = tt(length)
        f0 = hz(m)
        s = np.sin(2 * np.pi * f0 * t) + 0.2 * np.sin(4 * np.pi * f0 * t) * np.exp(-t * 3)
        return onepole(s, 0.3) * np.exp(-t * 1.0) * np.minimum(1, t * 80)

    t = tt(30.0)
    T.add((np.sin(2 * np.pi * hz(38) * t) + 0.5 * np.sin(2 * np.pi * hz(45) * t)) * np.minimum(1, t / 4) * np.minimum(1, (30 - t) / 3), 0.0, gain=0.18)
    prog = [[62, 65, 69, 72], [58, 62, 65, 69], [60, 64, 67, 71], [57, 60, 64, 69]]
    at, k = 0.4, 0
    while at < 28.0:
        ch = prog[k % 4]
        for i, m in enumerate(ch):
            T.add(felt(m), at + i * 0.55, pan=(-0.3 if i % 2 else 0.3), gain=0.22)
        at += 3.2
        k += 1
    rng = np.random.default_rng(3)
    a = 1.0
    while a < 28.5:
        T.add(plip(int(rng.integers(84, 96))), a, pan=rng.uniform(-0.7, 0.7), gain=0.08)
        a += rng.uniform(0.8, 2.2)
    for d, m in zip((150, 420, 610), (86, 81, 74)):
        T.add(plip(m), fr(d), gain=0.6)
        T.add(_pad([m - 24, m - 17, m - 12], 4.0, att=0.5), fr(d), gain=0.25)
    T.save('music-reflection.wav', drive=1.3, fade_out=2.5)


# ======================================================================
# Cinematic films (23–25) — new sound palette: bowed cello/strings, soft choir, grand piano, braams
# ======================================================================
def _bowed(m, length, att=0.35, rel=0.5, vib=0.006):
    t = tt(length)
    f0 = hz(m) * (1 + vib * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.6))
    ph = np.cumsum(f0) / SR
    saw = 2 * (ph % 1) - 1
    s = onepole(saw, 0.08) + 0.3 * onepole(saw, 0.02)
    env = np.minimum(1, t / att) * np.minimum(1, (length - t) / rel)
    return s * env


def _choir(notes, length, att=1.5):
    t = tt(length)
    out = np.zeros(len(t))
    for m in notes:
        for d in (-0.06, 0.0, 0.06):
            f0 = hz(m + d) * (1 + 0.004 * np.sin(2 * np.pi * 4.6 * t + m))
            ph = 2 * np.pi * np.cumsum(f0) / SR
            # vowel-like "aah": fundamental + formant-ish partials
            out += np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.35 * np.sin(3 * ph) + 0.12 * np.sin(5 * ph)
    env = np.minimum(1, t / att) * np.minimum(1, (length - t) / 1.2)
    return onepole(out / (3 * len(notes)), 0.25) * env


def _grand(T, m, length=3.0):
    t = tt(length)
    f0 = hz(m)
    s = sum(a * np.sin(2 * np.pi * f0 * k * (1 + 0.0004 * k * k) * t) * np.exp(-t * (0.9 + k * 0.6)) for k, a in ((1, 1.0), (2, 0.5), (3, 0.25), (4, 0.12), (5, 0.06)))
    hammer = onepole(T.noise(int(0.02 * SR)), 0.5) * np.exp(-tt(0.02) * 200)
    s[: len(hammer)] += hammer * 0.4
    return s * np.minimum(1, t * 400)


def _braam(notes, length=3.0):
    t = tt(length)
    out = np.zeros(len(t))
    for m in notes:
        for d in (-0.15, 0.0, 0.15):
            out += 2 * ((t * hz(m + d)) % 1) - 1
    cut = 0.02 + 0.18 * np.exp(-t * 1.2)
    y = np.empty(len(t))
    acc = 0.0
    for i in range(len(t)):
        acc += cut[i] * (out[i] - acc)
        y[i] = acc
    return np.tanh(2.2 * y / len(notes)) * np.minimum(1, t / 0.05) * np.exp(-t * 0.7)


def _sub(length=3.0, f0=38):
    t = tt(length)
    return np.sin(2 * np.pi * np.cumsum(f0 * (1 + 0.6 * np.exp(-t * 6))) / SR) * np.exp(-t * 1.1)


def film_vision():
    # luxurious & calm: grand piano, cello lines, soft choir swells
    T = Track(26)
    prog = [([50, 57, 62, 65], 0.0), ([46, 53, 58, 62], 5.0), ([48, 55, 60, 64], 10.0), ([45, 52, 57, 61], 15.0), ([50, 57, 62, 66], 23.0)]
    for notes, at in prog:
        ln = 5.6 if at < 23 else 7.0
        T.add(_bowed(notes[0] - 12, ln, att=1.0, rel=1.2), at, gain=0.28)
        T.add(_bowed(notes[1], ln, att=1.2, rel=1.2), at, pan=-0.3, gain=0.18)
    motif = [74, 72, 69, 72, 74, 77, 76, 74]
    for i in range(16):
        at = 0.4 + i * 0.62
        T.add(_grand(T, motif[i % 8] - (12 if i >= 8 else 0)), at, pan=0.2, gain=0.22)
    T.add(_choir([62, 65, 69], 5.5, att=1.2), fr(300), gain=0.35)
    T.add(_grand(T, 50, 4.0), fr(305), gain=0.35)
    T.add(_grand(T, 62, 4.0), fr(350), gain=0.3)
    # 15–23s montage: gentle pulse with cello pizzicato-like plucks
    for k, at in enumerate(np.arange(15.0, 23.0, 0.5)):
        T.add(_ks(T, [50, 57, 62, 57][k % 4], 0.8, 0.4), at, pan=-0.3, gain=0.25)
        if k % 2 == 0:
            t = tt(0.4)
            T.add(np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t * 12) + 45) / SR) * np.exp(-t * 8), at, gain=0.3)
    T.add(_choir([50, 57, 62, 66, 69], 7.0, att=0.8), fr(690), gain=0.45)
    for i, m in enumerate((62, 66, 69, 74, 78)):
        T.add(_grand(T, m, 5.0), fr(715) + i * 0.18, gain=0.2)
    T.save('music-film-vision.wav', drive=1.1, fade_out=2.0)


def film_everywhere():
    # bold premium: heartbeat, deep sub, glass FM plucks spreading, braam on the logos
    T = Track(27)

    def heart():
        t = tt(0.3)
        return np.sin(2 * np.pi * np.cumsum(55 * np.exp(-t * 10) + 38) / SR) * np.exp(-t * 14)

    def glass(m, length=0.9):
        t = tt(length)
        f0 = hz(m)
        mod = np.sin(2 * np.pi * f0 * 1.41 * t) * 2.5 * np.exp(-t * 5)
        return np.sin(2 * np.pi * f0 * t + mod) * np.exp(-t * 4)

    def whoosh(length=1.6):
        t = tt(length)
        x = T.noise(len(t))
        out = np.empty(len(t))
        acc = 0.0
        for i in range(len(t)):
            acc += (0.004 + 0.25 * (t[i] / length) ** 2) * (x[i] - acc)
            out[i] = acc
        return out * (t / length) ** 2

    for b in np.arange(0.0, 4.0, 1.0):
        T.add(heart(), b, gain=0.9)
        T.add(heart(), b + 0.22, gain=0.6)
    T.add(_sub(4.0), fr(65), gain=0.8)
    T.add(_bowed(38, 26.0, att=3.0, rel=2.0, vib=0.002), 2.0, gain=0.35)
    rng = np.random.default_rng(12)
    notes = [74, 76, 79, 81, 83, 86]
    at = fr(190)
    while at < fr(420):
        T.add(glass(notes[rng.integers(len(notes))]), at, pan=rng.uniform(-0.8, 0.8), gain=0.16)
        at += 0.12 + 0.2 * (1 - (at - fr(190)) / (fr(420) - fr(190)))
    for b in np.arange(4.0, 20.0, 1.0):
        T.add(heart(), b, gain=0.45 + 0.02 * (b - 4))
    T.add(whoosh(1.6), fr(420) - 1.4, gain=0.7)
    T.add(_sub(3.0, 34), fr(425), gain=0.9)
    T.add(_choir([62, 69, 74], 6.0, att=0.5), fr(430), gain=0.25)
    T.add(whoosh(1.2), fr(600) - 1.1, gain=0.6)
    T.add(_braam([38, 45, 50], 4.0), fr(600), gain=0.8)
    T.add(_sub(3.0), fr(600), gain=0.7)
    T.add(_choir([50, 57, 62, 66, 69], 6.0, att=0.6), fr(752), gain=0.5)
    T.add(glass(86, 3.0), fr(790), gain=0.35)
    T.add(_braam([38, 50, 57], 4.0), fr(825), gain=0.45)
    T.save('music-film-everywhere.wav', drive=1.5, fade_out=1.5)


def film_notjust():
    # big news: staccato string ostinato, a silence, braams on the logos, driving toms, uplifting choir finish
    T = Track(28)
    bpm16 = 60 / 120 / 4

    def stacc(m):
        return _bowed(m, 0.13, att=0.01, rel=0.05, vib=0.0)

    def tom(f0=90):
        t = tt(0.6)
        return np.sin(2 * np.pi * np.cumsum(f0 * np.exp(-t * 6) + f0 * 0.5) / SR) * np.exp(-t * 6)

    pattern = [50, 50, 62, 50, 50, 62, 57, 50]
    for k, at in enumerate(np.arange(0.2, 4.95, bpm16)):
        T.add(stacc(pattern[k % 8] - 12), at, pan=-0.2, gain=0.35)
    T.add(_bowed(38, 5.0, att=1.5, rel=0.6), 0.0, gain=0.4)
    # silence 5–6s, then a soft tick pulse through the creative shots
    for k, at in enumerate(np.arange(6.0, 11.0, 0.25)):
        t = tt(0.03)
        T.add(np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 150), at, pan=0.3, gain=0.2)
        if k % 4 == 0:
            T.add(tom(70), at, gain=0.3)
    T.add(_bowed(45, 5.0, att=2.0, rel=0.4), 6.0, gain=0.35)
    T.add(_braam([38, 45, 50], 3.0), fr(340), gain=0.85)
    T.add(_braam([41, 48, 53], 3.0), fr(392), gain=0.85)
    T.add(_sub(3.0), fr(340), gain=0.6)
    for k, at in enumerate(np.arange(16.0, 23.0, bpm16)):
        T.add(stacc([50, 57, 62, 57][k % 4]), at, pan=-0.25, gain=0.28)
        if k % 8 == 0:
            T.add(tom(95), at, gain=0.45)
        if k % 8 == 6:
            T.add(tom(120), at, gain=0.3)
    T.add(_bowed(38, 7.2, att=0.5, rel=0.5), 16.0, gain=0.35)
    T.add(_choir([50, 57, 62, 66, 69], 7.0, att=1.0), fr(690), gain=0.5)
    T.add(_bowed(50, 7.0, att=1.0, rel=1.5), fr(690), gain=0.35)
    T.add(_braam([38, 50, 57, 62], 4.0), fr(805), gain=0.55)
    T.save('music-film-notjust.wav', drive=1.5, fade_out=1.5)


if __name__ == '__main__':
    import sys

    tracks = {
        'notification': notification,
        'constellation': constellation,
        'arcade': arcade,
        'clay': clay,
        'weather': weather,
        'crossword': crossword,
        'teaser-who': teaser_who,
        'teaser-tomorrow': teaser_tomorrow,
        'puzzle': puzzle,
        'coffee': coffee,
        'live': live,
        'teaser-piece': teaser_piece,
        'time': time_has_come,
        'doors': doors,
        'postcards': postcards,
        'viewfinder': viewfinder,
        'flight': flight,
        'letters': letters,
        'sketch': sketch,
        'projection': projection,
        'yesterday': yesterday,
        'waxseal': waxseal,
        'microscope': microscope,
        'island': island,
        'reflection': reflection,
        'film-vision': film_vision,
        'film-everywhere': film_everywhere,
        'film-notjust': film_notjust,
    }
    for name in sys.argv[1:] or tracks:
        tracks[name]()
