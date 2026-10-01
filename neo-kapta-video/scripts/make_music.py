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
    def __init__(self, seed):
        self.L = np.zeros(N)
        self.R = np.zeros(N)
        self.rng = np.random.default_rng(seed)

    def add(self, sig, start, pan=0.0, gain=1.0):
        i = int(round(start * SR))
        if i >= N or i < 0:
            return
        sig = sig[: N - i] * gain
        self.L[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
        self.R[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))

    def noise(self, n):
        return self.rng.standard_normal(n)

    def save(self, name, drive=1.3, fade_out=1.0):
        mix = np.stack([self.L, self.R], axis=1)
        fade = np.ones(N)
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


if __name__ == '__main__':
    notification()
    constellation()
    arcade()
