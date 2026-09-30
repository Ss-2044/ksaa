// Tiny offline synth shared by the soundtrack scripts: drums, bass, hits, whooshes, risers
// and UI sounds, rendered into a stereo buffer and written as a 16-bit WAV.
import fs from "node:fs";

export const createSynth = ({ seconds, fps, bpm, seed: initialSeed = 11 }) => {
  const SR = 44100;
  const FPS = fps;
  const N = Math.round(seconds * SR);
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  const at = (frame) => Math.round((frame / FPS) * SR);
  const beatFrames = (60 / bpm) * FPS;

  let seed = initialSeed;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

  const add = (i, l, r = l) => {
    if (i >= 0 && i < N) {
      L[i] += l;
      R[i] += r;
    }
  };

  // ---------- instruments ----------
  const kick = (frame, gain = 0.9) => {
    const s = at(frame);
    let ph = 0;
    for (let i = 0; i < 0.45 * SR; i++) {
      const t = i / SR;
      const f = 45 + 110 * Math.exp(-t * 30);
      ph += (2 * Math.PI * f) / SR;
      add(s + i, Math.sin(ph) * Math.exp(-t * 7) * gain);
    }
  };
  const clap = (frame, gain = 0.35) => {
    const s = at(frame);
    let hp = 0;
    for (const off of [0, 0.011, 0.022]) {
      for (let i = 0; i < 0.18 * SR; i++) {
        const n = rnd();
        hp = 0.6 * hp + 0.4 * n;
        const v = (n - hp) * Math.exp(-(i / SR) * 26) * gain;
        add(s + Math.round(off * SR) + i, v * 1.1, v * 0.9);
      }
    }
  };
  const hat = (frame, gain = 0.12, open = false) => {
    const s = at(frame);
    let lp = 0;
    for (let i = 0; i < (open ? 0.2 : 0.05) * SR; i++) {
      const n = rnd();
      lp += 0.5 * (n - lp);
      const v = (n - lp) * Math.exp(-(i / SR) * (open ? 18 : 70)) * gain;
      add(s + i, v * 0.8, v * 1.2);
    }
  };
  const bass = (frame, freq, len = 0.45, gain = 0.28) => {
    const s = at(frame);
    for (let i = 0; i < len * SR; i++) {
      const t = i / SR;
      const env = Math.min(1, t * 80) * Math.exp(-t * 3);
      add(s + i, (Math.sin(2 * Math.PI * freq * t) + 0.35 * Math.sin(2 * Math.PI * freq * 2 * t)) * env * gain);
    }
  };
  const hit = (frame, gain = 0.9) => {
    const s = at(frame);
    let lp = 0;
    for (let i = 0; i < 2.5 * SR; i++) {
      const t = i / SR;
      const f = 34 + 60 * Math.exp(-t * 9);
      const body = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 1.8);
      lp += 0.06 * (rnd() - lp);
      const air = lp * Math.exp(-t * 2.5) * 1.3;
      const metal = Math.sin(2 * Math.PI * 211 * t) * Math.sin(2 * Math.PI * 317 * t) * Math.exp(-t * 4) * 0.25;
      add(s + i, (body + air + metal) * gain);
    }
  };
  const whoosh = (frame, len = 0.6, gain = 0.4, leftToRight = true) => {
    const s = at(frame);
    let lp = 0;
    for (let i = 0; i < len * SR; i++) {
      const p = i / (len * SR);
      const env = Math.sin(Math.PI * p) ** 2;
      lp += (0.02 + 0.3 * Math.sin(Math.PI * p)) * (rnd() - lp);
      const pan = leftToRight ? p : 1 - p;
      add(s + i, lp * env * gain * (1 - pan * 0.7), lp * env * gain * (0.3 + pan * 0.7));
    }
  };
  const riser = (from, to, gain = 0.22) => {
    const s = at(from);
    const e = at(to);
    let lp = 0;
    for (let i = s; i < e; i++) {
      const p = (i - s) / (e - s);
      lp += (0.01 + p * 0.35) * (rnd() - lp);
      const tone = Math.sin(2 * Math.PI * (180 + 700 * p * p) * (i / SR)) * 0.12;
      add(i, (lp + tone) * p * p * gain);
    }
  };
  const click = (frame, gain = 0.16) => {
    const s = at(frame) + Math.floor(((rnd() + 1) / 2) * 300);
    for (let i = 0; i < 0.012 * SR; i++) {
      const v = rnd() * Math.exp(-(i / SR) * 500) * gain + Math.sin(i * 0.9) * Math.exp(-(i / SR) * 400) * gain * 0.5;
      add(s + i, v * 0.9, v * 1.1);
    }
  };
  const ping = (frame, freq = 1318.5, gain = 0.18) => {
    const s = at(frame);
    for (let i = 0; i < 1.4 * SR; i++) {
      const t = i / SR;
      const v = (Math.sin(2 * Math.PI * freq * t) + 0.4 * Math.sin(2 * Math.PI * freq * 2.01 * t)) * Math.exp(-t * 3.5) * gain;
      add(s + i, v * 0.8, v);
    }
  };
  const shutter = (frame, gain = 0.3) => {
    const s = at(frame);
    for (const off of [0, 0.045]) {
      for (let i = 0; i < 0.03 * SR; i++) {
        add(s + Math.round(off * SR) + i, rnd() * Math.exp(-(i / SR) * 160) * gain);
      }
    }
  };
  const scribble = (from, to, gain = 0.06) => {
    const s = at(from);
    const e = at(to);
    let lp = 0;
    for (let i = s; i < e; i++) {
      lp += 0.25 * (rnd() - lp);
      const mod = 0.5 + 0.5 * Math.sin((2 * Math.PI * 7 * (i - s)) / SR);
      add(i, lp * mod * gain);
    }
  };

  const beatsBetween = (from, to, fn) => {
    for (let b = 0; from + b * beatFrames < to; b++) fn(from + b * beatFrames, b);
  };

  const write = (file) => {
    let peak = 0;
    for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
    const norm = 1.1 / peak;
    const buf = Buffer.alloc(44 + N * 4);
    buf.write("RIFF", 0);
    buf.writeUInt32LE(36 + N * 4, 4);
    buf.write("WAVEfmt ", 8);
    buf.writeUInt32LE(16, 16);
    buf.writeUInt16LE(1, 20);
    buf.writeUInt16LE(2, 22);
    buf.writeUInt32LE(SR, 24);
    buf.writeUInt32LE(SR * 4, 28);
    buf.writeUInt16LE(4, 32);
    buf.writeUInt16LE(16, 34);
    buf.write("data", 36);
    buf.writeUInt32LE(N * 4, 40);
    for (let i = 0; i < N; i++) {
      buf.writeInt16LE(Math.round(Math.tanh(L[i] * norm) * 0.92 * 32767), 44 + i * 4);
      buf.writeInt16LE(Math.round(Math.tanh(R[i] * norm) * 0.92 * 32767), 46 + i * 4);
    }
    fs.writeFileSync(file, buf);
  };

  return {
    SR, FPS, N, L, R, at, beatFrames, rnd, add, beatsBetween, write,
    kick, clap, hat, bass, hit, whoosh, riser, click, ping, shutter, scribble,
  };
};
