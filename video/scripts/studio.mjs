// A second, richer offline synth ("studio") for the later soundtracks:
// Karplus-Strong strings, FM bells / e-piano, detuned supersaws, 808s, taiko, trailer braams,
// plus mix buses with sidechain ducking and a Schroeder reverb send, so tracks sound produced
// rather than bare. Everything renders into float buffers and is written as a 16-bit WAV.
import fs from "node:fs";

export const createStudio = ({ seconds, fps, bpm, seed: initialSeed = 1 }) => {
  const SR = 44100;
  const N = Math.round(seconds * SR);
  const bus = () => ({ L: new Float32Array(N), R: new Float32Array(N) });
  const buses = { dry: bus(), duck: bus(), wet: bus() };
  const kicks = [];
  const at = (frame) => Math.round((frame / fps) * SR);
  const beat = (60 / bpm) * fps;
  let seed = initialSeed;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const rand01 = () => (rnd() + 1) / 2; // deterministic replacement for Math.random

  // write a sample to a bus, with an optional reverb send
  const put = (b, i, l, r = l, send = 0) => {
    if (i < 0 || i >= N) return;
    buses[b].L[i] += l;
    buses[b].R[i] += r;
    if (send) {
      buses.wet.L[i] += l * send;
      buses.wet.R[i] += r * send;
    }
  };

  // ---------- drums ----------
  const kick = (frame, gain = 0.9, { duck = true, tone = 50 } = {}) => {
    const s = at(frame);
    if (duck) kicks.push(s);
    let ph = 0;
    for (let i = 0; i < 0.5 * SR; i++) {
      const t = i / SR;
      ph += (2 * Math.PI * (tone + 120 * Math.exp(-t * 35))) / SR;
      const click = i < 60 ? rnd() * 0.3 * (1 - i / 60) : 0;
      put("dry", s + i, (Math.tanh(Math.sin(ph) * 1.6) * Math.exp(-t * 6.5) + click) * gain);
    }
  };
  const k808 = (frame, freq, len = 0.9, gain = 0.6, glideTo = null) => {
    const s = at(frame);
    kicks.push(s);
    let ph = 0;
    for (let i = 0; i < len * SR; i++) {
      const t = i / SR;
      const f = glideTo ? freq + (glideTo - freq) * Math.min(1, t / (len * 0.6)) : freq;
      ph += (2 * Math.PI * (f + 90 * Math.exp(-t * 40))) / SR;
      put("dry", s + i, Math.tanh(Math.sin(ph) * 2) * Math.exp(-t * (2.2 / len)) * gain);
    }
  };
  const snare = (frame, gain = 0.4, send = 0.25) => {
    const s = at(frame);
    let lp = 0;
    for (let i = 0; i < 0.25 * SR; i++) {
      const t = i / SR;
      const n = rnd();
      lp += 0.5 * (n - lp);
      const v = (n - lp * 0.6) * Math.exp(-t * 18) * 0.8 + Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 30) * 0.6;
      put("dry", s + i, v * gain, v * gain * 0.95, send);
    }
  };
  const clap = (frame, gain = 0.35) => {
    const s = at(frame);
    for (const off of [0, 0.009, 0.019, 0.03]) {
      let hp = 0;
      for (let i = 0; i < 0.16 * SR; i++) {
        const n = rnd();
        hp = 0.55 * hp + 0.45 * n;
        const v = (n - hp) * Math.exp(-(i / SR) * (off === 0.03 ? 14 : 60)) * gain;
        put("dry", s + Math.round(off * SR) + i, v * 1.05, v * 0.95, 0.3);
      }
    }
  };
  const hat = (frame, gain = 0.1, open = false) => {
    const s = at(frame);
    let hp = 0;
    for (let i = 0; i < (open ? 0.25 : 0.045) * SR; i++) {
      const n = rnd();
      hp = 0.3 * hp + 0.7 * n;
      const v = (n - hp) * Math.exp(-(i / SR) * (open ? 12 : 80)) * gain;
      put("dry", s + i, v * 0.85, v * 1.15);
    }
  };
  const hatRoll = (from, to, perBeat, gain = 0.07) => {
    for (let f = from; f < to; f += beat / perBeat) hat(f, gain * (0.7 + 0.3 * Math.sin(f)));
  };
  const snareRoll = (from, to, gain = 0.3) => {
    let f = from;
    let step = beat / 2;
    while (f < to) {
      const p = (f - from) / (to - from);
      snare(f, gain * (0.3 + p * 0.7), 0.2);
      f += step;
      step = Math.max(beat / 8, step * 0.9);
    }
  };
  const taiko = (frame, gain = 0.8) => {
    const s = at(frame);
    let lp = 0;
    for (let i = 0; i < 1.2 * SR; i++) {
      const t = i / SR;
      lp += 0.04 * (rnd() - lp);
      const v = (Math.sin(2 * Math.PI * (62 + 40 * Math.exp(-t * 12)) * t) * Math.exp(-t * 3.2) + lp * Math.exp(-t * 8) * 2) * gain;
      put("dry", s + i, v, v, 0.35);
    }
  };

  // ---------- tonal ----------
  // Karplus-Strong plucked string (guitar / oud / pizzicato).
  const pluck = (frame, freq, gain = 0.2, { decay = 0.996, bright = 0.5, pan = 0, send = 0.25, b = "duck" } = {}) => {
    const s = at(frame);
    const period = Math.max(2, Math.round(SR / freq));
    const buf = new Float32Array(period);
    for (let i = 0; i < period; i++) buf[i] = rnd() * (0.5 + bright * 0.5);
    let idx = 0;
    const len = Math.min(3 * SR, N - s);
    for (let i = 0; i < len; i++) {
      const cur = buf[idx];
      const next = buf[(idx + 1) % period];
      buf[idx] = decay * (cur * (0.5 + bright * 0.25) + next * (0.5 - bright * 0.25));
      idx = (idx + 1) % period;
      put(b, s + i, cur * gain * (1 - pan), cur * gain * (1 + pan), send);
    }
  };
  const strum = (frame, freqs, gain = 0.12, down = true) =>
    (down ? freqs : [...freqs].reverse()).forEach((f, i) => pluck(frame + i * 0.6, f, gain, { decay: 0.997, bright: 0.6, pan: (i / freqs.length - 0.5) * 0.6 }));
  // FM bell / glass.
  const bell = (frame, freq, gain = 0.1, { ratio = 3.5, index = 4, dec = 2.2, send = 0.45, b = "duck" } = {}) => {
    const s = at(frame);
    for (let i = 0; i < 3 * SR && s + i < N; i++) {
      const t = i / SR;
      const env = Math.exp(-t * dec);
      const v = Math.sin(2 * Math.PI * freq * t + index * env * Math.sin(2 * Math.PI * freq * ratio * t)) * env * gain;
      put(b, s + i, v, v * 0.97, send);
    }
  };
  // FM electric piano chord.
  const rhodes = (frame, freqs, len = 1.5, gain = 0.06) => {
    const s = at(frame);
    for (let i = 0; i < len * SR && s + i < N; i++) {
      const t = i / SR;
      const env = Math.min(1, t * 200) * Math.exp(-t * 1.6);
      let v = 0;
      for (const f of freqs) v += Math.sin(2 * Math.PI * f * t + 1.2 * Math.exp(-t * 3) * Math.sin(2 * Math.PI * f * t));
      const trem = 1 + 0.12 * Math.sin(2 * Math.PI * 4.5 * t);
      put("duck", s + i, v * env * gain * trem, v * env * gain * (2 - trem), 0.3);
    }
  };
  // Detuned saw stack through a one-pole lowpass (pads, EDM chords).
  const supersaw = (from, to, freqs, gain = 0.02, { cutoff = 0.08, attack = 0.05, release = 0.3, b = "duck", send = 0.35 } = {}) => {
    const s0 = at(from);
    const s1 = at(to);
    const voices = [];
    for (const f of freqs) for (const d of [-0.012, -0.006, 0, 0.006, 0.012]) voices.push({ f: f * (1 + d), ph: rand01() });
    let lpL = 0;
    let lpR = 0;
    const len = s1 - s0;
    for (let i = 0; i < len + release * SR && s0 + i < N; i++) {
      const t = i / SR;
      const env = Math.min(1, t / attack) * (i > len ? Math.max(0, 1 - (i - len) / (release * SR)) : 1);
      let l = 0;
      let r = 0;
      voices.forEach((v, k) => {
        v.ph += v.f / SR;
        const saw = (v.ph % 1) * 2 - 1;
        if (k % 2) l += saw;
        else r += saw;
      });
      lpL += cutoff * (l - lpL);
      lpR += cutoff * (r - lpR);
      put(b, s0 + i, lpL * env * gain, lpR * env * gain, send);
    }
  };
  // Trailer "braam": low detuned brass with an opening filter.
  const braam = (frame, root = 55, len = 3, gain = 0.05) => {
    const s = at(frame);
    const fr = [root, root * 1.5, root * 2, root * 2.01];
    const ph = fr.map(() => 0);
    let lp = 0;
    for (let i = 0; i < len * SR && s + i < N; i++) {
      const t = i / SR;
      const env = Math.min(1, t * 8) * Math.exp(-t * (1.2 / len));
      let v = 0;
      fr.forEach((f, k) => {
        ph[k] += f / SR;
        v += (ph[k] % 1) * 2 - 1;
      });
      lp += (0.02 + 0.12 * Math.exp(-t * 1.5)) * (v - lp);
      put("dry", s + i, Math.tanh(lp * 1.5) * env * gain * 4, Math.tanh(lp * 1.5) * env * gain * 4, 0.3);
    }
  };
  const sub = (frame, freq, len = 0.5, gain = 0.3) => {
    const s = at(frame);
    for (let i = 0; i < len * SR && s + i < N; i++) {
      const t = i / SR;
      put("duck", s + i, Math.sin(2 * Math.PI * freq * t) * Math.min(1, t * 60) * Math.min(1, (len - t) * 20) * gain);
    }
  };

  // ---------- fx ----------
  const noiseSweep = (from, to, { up = true, gain = 0.2, send = 0.3 } = {}) => {
    const s0 = at(from);
    const s1 = at(to);
    let lp = 0;
    for (let i = s0; i < s1; i++) {
      const p = (i - s0) / (s1 - s0);
      const q = up ? p : 1 - p;
      lp += (0.005 + q * q * 0.4) * (rnd() - lp);
      put("dry", i, lp * q * gain * 2, lp * q * gain * 2, send);
    }
  };
  const impact = (frame, gain = 1) => {
    const s = at(frame);
    let lp = 0;
    for (let i = 0; i < 3 * SR && s + i < N; i++) {
      const t = i / SR;
      lp += 0.03 * (rnd() - lp);
      const v = (Math.sin(2 * Math.PI * (30 + 70 * Math.exp(-t * 6)) * t) * Math.exp(-t * 1.4) + lp * Math.exp(-t * 2) * 2.5) * gain;
      put("dry", s + i, v, v, 0.4);
    }
  };
  const whoosh = (frame, len = 0.6, gain = 0.3, ltr = true) => {
    const s = at(frame);
    let lp = 0;
    for (let i = 0; i < len * SR; i++) {
      const p = i / (len * SR);
      lp += (0.02 + 0.35 * Math.sin(Math.PI * p)) * (rnd() - lp);
      const e = Math.sin(Math.PI * p) ** 2;
      const pan = ltr ? p : 1 - p;
      put("dry", s + i, lp * e * gain * (1.2 - pan), lp * e * gain * (0.2 + pan), 0.2);
    }
  };
  const tick = (frame, freq = 2200, gain = 0.1) => {
    const s = at(frame);
    for (let i = 0; i < 0.03 * SR; i++) put("dry", s + i, Math.sin(2 * Math.PI * freq * (i / SR)) * Math.exp(-(i / SR) * 200) * gain);
  };
  const crackle = (from, len, density = 0.002, gain = 0.2, send = 0.3) => {
    const s = at(from);
    for (let i = 0; i < len * SR && s + i < N; i++) {
      if (rand01() < density) {
        const amp = (0.4 + rand01() * 0.6) * gain * (1 - i / (len * SR));
        const pan = rand01() * 2 - 1;
        for (let j = 0; j < 80; j++) put("dry", s + i + j, rnd() * amp * Math.exp(-j / 12) * (1 - pan * 0.5), rnd() * amp * Math.exp(-j / 12) * (1 + pan * 0.5), send);
      }
    }
  };
  const vinyl = (from, to, gain = 0.03) => {
    const s0 = at(from);
    const s1 = at(to);
    let lp = 0;
    for (let i = s0; i < s1; i++) {
      lp += 0.1 * (rnd() - lp);
      const pop = rand01() < 0.0004 ? rnd() * 6 : 0;
      put("dry", i, (lp * 0.4 + pop) * gain);
    }
  };
  const burner = (frame, len = 1, gain = 0.25) => {
    const s = at(frame);
    let lp = 0;
    let lp2 = 0;
    for (let i = 0; i < len * SR; i++) {
      const t = i / SR;
      lp += 0.15 * (rnd() - lp);
      lp2 += 0.01 * (lp - lp2);
      const e = Math.min(1, t * 15) * Math.min(1, (len - t) * 6);
      const v = ((lp - lp2) * 2 + lp2 * 3) * e * gain * (1 + 0.3 * Math.sin(2 * Math.PI * 22 * t));
      put("dry", s + i, v, v * 0.9, 0.2);
    }
  };
  const applause = (from, len, gain = 0.3) => {
    const s = at(from);
    for (let i = 0; i < len * SR && s + i < N; i++) {
      const p = i / (len * SR);
      if (rand01() < 0.02) {
        const amp = gain * Math.min(1, p * 6) * Math.min(1, (1 - p) * 3) * (0.3 + rand01() * 0.7);
        const pan = rand01() * 2 - 1;
        let hp = 0;
        for (let j = 0; j < 400; j++) {
          const n = rnd();
          hp = 0.6 * hp + 0.4 * n;
          put("dry", s + i + j, (n - hp) * amp * Math.exp(-j / 60) * (1 - pan * 0.6), (n - hp) * amp * Math.exp(-j / 60) * (1 + pan * 0.6), 0.25);
        }
      }
    }
  };
  const whistle = (frame, len = 1, gain = 0.06, from = 900, to = 2400) => {
    const s = at(frame);
    let ph = 0;
    for (let i = 0; i < len * SR; i++) {
      const p = i / (len * SR);
      ph += (2 * Math.PI * (from + (to - from) * p)) / SR;
      put("dry", s + i, Math.sin(ph) * gain * Math.min(1, p * 10) * (1 - p * 0.5), Math.sin(ph) * gain * Math.min(1, p * 10) * (1 - p * 0.5), 0.3);
    }
  };
  const boom = (frame, gain = 0.8) => {
    impact(frame, gain * 0.6);
    crackle(frame + 4, 1.4, 0.006, gain * 0.25, 0.4);
  };
  const brush = (frame, len = 0.5, gain = 0.12) => {
    const s = at(frame);
    let bp = 0;
    let lp = 0;
    for (let i = 0; i < len * SR; i++) {
      const p = i / (len * SR);
      lp += 0.3 * (rnd() - lp);
      bp += 0.08 * (lp - bp);
      put("dry", s + i, (lp - bp) * Math.sin(Math.PI * p) * gain * 3, (lp - bp) * Math.sin(Math.PI * p) * gain * 2.6, 0.15);
    }
  };
  const chime = (frame, gain = 0.1) => [1, 1.5, 2.25, 3.01].forEach((m, i) => bell(frame + i * 2, 1318.5 * m * 0.5, gain / (i + 1), { ratio: 2.76, index: 1.5, dec: 1.4 }));
  const clapper = (frame, gain = 0.6) => {
    const s = at(frame);
    for (let i = 0; i < 0.12 * SR; i++) {
      const t = i / SR;
      const v = (rnd() * Math.exp(-t * 90) + Math.sin(2 * Math.PI * 900 * t) * Math.exp(-t * 60) * 0.5) * gain;
      put("dry", s + i, v, v, 0.35);
    }
  };
  const projector = (from, to, gain = 0.04) => {
    for (let f = from; f < to; f += 1.25) tick(f, 1400 + (f % 2) * 300, gain);
  };

  // ---------- song helpers ----------
  const beatsBetween = (from, to, fn) => {
    for (let b = 0; from + b * beat < to; b++) fn(from + b * beat, b);
  };

  // ---------- mixdown ----------
  // Schroeder reverb (4 combs + 2 allpasses per channel).
  const reverb = (x, offs) => {
    const out = new Float32Array(N);
    const combs = [1116, 1188, 1277, 1356].map((d) => ({ d: d + offs, buf: new Float32Array(d + offs), i: 0, f: 0 }));
    const aps = [556, 441].map((d) => ({ d: d + offs, buf: new Float32Array(d + offs), i: 0 }));
    for (let n = 0; n < N; n++) {
      let y = 0;
      for (const c of combs) {
        const o = c.buf[c.i];
        c.f = o * 0.8 + c.f * 0.2;
        c.buf[c.i] = x[n] + c.f * 0.84;
        c.i = (c.i + 1) % c.d;
        y += o;
      }
      for (const a of aps) {
        const o = a.buf[a.i];
        const v = -y * 0.5 + o;
        a.buf[a.i] = y + o * 0.5;
        a.i = (a.i + 1) % a.d;
        y = v;
      }
      out[n] = y * 0.25;
    }
    return out;
  };

  const write = (file, { duckDepth = 0.6, reverbLevel = 0.9 } = {}) => {
    // sidechain envelope from every kick
    const env = new Float32Array(N).fill(1);
    for (const k of kicks) {
      for (let i = 0; i < 0.35 * SR && k + i < N; i++) {
        const g = 1 - duckDepth * Math.exp(-i / (0.09 * SR));
        if (k + i >= 0) env[k + i] = Math.min(env[k + i], g);
      }
    }
    const wl = reverb(buses.wet.L, 0);
    const wr = reverb(buses.wet.R, 23);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    let peak = 0;
    for (let i = 0; i < N; i++) {
      L[i] = buses.dry.L[i] + buses.duck.L[i] * env[i] + wl[i] * reverbLevel;
      R[i] = buses.dry.R[i] + buses.duck.R[i] * env[i] + wr[i] * reverbLevel;
      peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
    }
    const norm = 1.15 / (peak || 1);
    const out = Buffer.alloc(44 + N * 4);
    out.write("RIFF", 0);
    out.writeUInt32LE(36 + N * 4, 4);
    out.write("WAVEfmt ", 8);
    out.writeUInt32LE(16, 16);
    out.writeUInt16LE(1, 20);
    out.writeUInt16LE(2, 22);
    out.writeUInt32LE(SR, 24);
    out.writeUInt32LE(SR * 4, 28);
    out.writeUInt16LE(4, 32);
    out.writeUInt16LE(16, 34);
    out.write("data", 36);
    out.writeUInt32LE(N * 4, 40);
    for (let i = 0; i < N; i++) {
      out.writeInt16LE(Math.round(Math.tanh(L[i] * norm) * 0.93 * 32767), 44 + i * 4);
      out.writeInt16LE(Math.round(Math.tanh(R[i] * norm) * 0.93 * 32767), 46 + i * 4);
    }
    fs.writeFileSync(file, out);
  };

  return {
    SR, N, at, beat, rnd, put, beatsBetween, write,
    kick, k808, snare, clap, hat, hatRoll, snareRoll, taiko,
    pluck, strum, bell, rhodes, supersaw, braam, sub,
    noiseSweep, impact, whoosh, tick, crackle, vinyl, burner, applause, whistle, boom, brush, chime, clapper, projector,
  };
};
