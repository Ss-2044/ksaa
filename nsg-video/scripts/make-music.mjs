// Original synthesized soundtrack for design B: 120 BPM, A minor, Am–F–C–G.
// Usage: node scripts/make-music.mjs <seconds> <out.wav>
import {writeFileSync} from 'node:fs';

const SECONDS = Number(process.argv[2] ?? 60);
const OUT = process.argv[3] ?? 'music.wav';
const SR = 44100;
const N = Math.floor(SECONDS * SR);
const BPM = 120;
const BEAT = 60 / BPM; // 0.5 s = 15 frames @ 30fps
const BAR = BEAT * 4;
const DROP = 3; // logo intro ends, full beat starts
const OUTRO = SECONDS - 4; // last 2 bars: final chord ring-out

const L = new Float32Array(N);
const R = new Float32Array(N);
const add = (i, l, r = l) => {
  if (i >= 0 && i < N) {
    L[i] += l;
    R[i] += r;
  }
};
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 7;
const noise = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;

// Chords (MIDI): Am, F, C, G
const CHORDS = [
  [57, 60, 64],
  [53, 57, 60],
  [55, 60, 64],
  [55, 59, 62],
];
const BASS = [45, 41, 48, 43];
const chordAt = (t) => Math.floor(Math.max(0, t - DROP) / BAR) % 4;

// Breakdown in the 60s version (pads + arp only, no drums) under the Vision scene
const BREAK = [46, 50];
const isBreak = (t) => SECONDS >= 60 && t >= BREAK[0] && t < BREAK[1];

// ---- sidechain envelope from kick times
const kicks = [];
for (let t = DROP; t < OUTRO; t += BEAT) if (!isBreak(t)) kicks.push(t);
const duck = new Float32Array(N).fill(1);
for (const t of kicks) {
  const s = Math.floor(t * SR);
  for (let k = 0; k < 0.3 * SR; k++) {
    const v = 0.35 + 0.65 * Math.min(1, k / (0.3 * SR));
    if (s + k < N) duck[s + k] = Math.min(duck[s + k], v);
  }
}

// ---- kick
for (const t of kicks) {
  const s = Math.floor(t * SR);
  let ph = 0;
  for (let k = 0; k < 0.45 * SR; k++) {
    const tt = k / SR;
    const f = 45 + 110 * Math.exp(-tt * 28);
    ph += (2 * Math.PI * f) / SR;
    add(s + k, Math.sin(ph) * Math.exp(-tt * 7) * 0.9);
  }
}

// ---- hats (offbeats) and clap (beats 2 & 4)
for (let t = DROP; t < OUTRO; t += BEAT / 2) {
  if (isBreak(t)) continue;
  const beatIdx = Math.round((t - DROP) / (BEAT / 2));
  const s = Math.floor(t * SR);
  if (beatIdx % 2 === 1) {
    let prev = 0;
    for (let k = 0; k < 0.06 * SR; k++) {
      const n = noise();
      const hp = n - prev;
      prev = n;
      add(s + k, hp * Math.exp(-(k / SR) * 70) * 0.09, hp * Math.exp(-(k / SR) * 70) * 0.12);
    }
  }
  if (beatIdx % 4 === 2) {
    let lp = 0;
    for (let k = 0; k < 0.2 * SR; k++) {
      const n = noise();
      lp += 0.35 * (n - lp);
      const v = (n - lp) * Math.exp(-(k / SR) * 18) * 0.22;
      add(s + k, v * 0.9, v);
    }
  }
}

// ---- bass (eighth notes, saw through one-pole lowpass, ducked)
{
  let lp = 0;
  for (let i = Math.floor(DROP * SR); i < Math.floor(OUTRO * SR); i++) {
    const t = i / SR;
    if (isBreak(t)) continue;
    const f = midi(BASS[chordAt(t)]);
    const local = (t - DROP) % (BEAT / 2);
    const env = Math.exp(-local * 6);
    const saw = ((t * f) % 1) * 2 - 1;
    lp += 0.06 * (saw - lp);
    add(i, lp * env * 0.38 * duck[i]);
  }
}

// ---- pad (detuned saws, slow filter, whole track)
{
  let lpL = 0;
  let lpR = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const chord = t < DROP ? CHORDS[0] : CHORDS[chordAt(t)];
    let sl = 0;
    let sr = 0;
    for (const m of chord) {
      const f = midi(m);
      sl += ((t * f * 0.997) % 1) * 2 - 1;
      sr += ((t * f * 1.003) % 1) * 2 - 1;
    }
    const cutoff = 0.02 + 0.015 * Math.sin(t * 0.4);
    lpL += cutoff * (sl - lpL);
    lpR += cutoff * (sr - lpR);
    const fadeIn = Math.min(1, t / 1.5);
    const end = t > SECONDS - 1.5 ? Math.max(0, (SECONDS - t) / 1.5) : 1;
    const g = 0.07 * fadeIn * end * (t < DROP ? 1 : duck[i]);
    add(i, lpL * g, lpR * g);
  }
}

// ---- arpeggio pluck (16ths) from bar 2 after the drop
for (let t = DROP + BAR; t < OUTRO; t += BEAT / 4) {
  const step = Math.round((t - DROP) / (BEAT / 4));
  const chord = CHORDS[chordAt(t)];
  const pattern = [0, 1, 2, 1, 2, 0, 1, 2];
  const m = chord[pattern[step % 8]] + 12;
  const f = midi(m);
  const s = Math.floor(t * SR);
  const pan = 0.5 + 0.35 * Math.sin(step * 0.7);
  for (let k = 0; k < 0.22 * SR; k++) {
    const tt = k / SR;
    const tri = Math.abs(((tt * f) % 1) * 4 - 2) - 1;
    const v = tri * Math.exp(-tt * 16) * 0.075;
    add(s + k, v * (1 - pan) * 2 * 0.6, v * pan * 2 * 0.6);
  }
}

// ---- riser into the drop + impact hits (logo flash at 1.25s, drop at 3s)
{
  let lp = 0;
  for (let i = 0; i < DROP * SR; i++) {
    const t = i / SR;
    const p = t / DROP;
    const n = noise();
    lp += (0.01 + 0.25 * p * p) * (n - lp);
    add(i, lp * p * p * 0.18, lp * p * p * 0.18);
    add(i, Math.sin(2 * Math.PI * (200 + 900 * p * p) * t) * p * 0.025);
  }
}
const impact = (t0, gain) => {
  const s = Math.floor(t0 * SR);
  let ph = 0;
  for (let k = 0; k < 2.2 * SR; k++) {
    const tt = k / SR;
    ph += (2 * Math.PI * (32 + 60 * Math.exp(-tt * 9))) / SR;
    const boom = Math.sin(ph) * Math.exp(-tt * 2.2);
    const crash = noise() * Math.exp(-tt * 3.5) * 0.25;
    add(s + k, (boom + crash) * gain, (boom - crash * 0.6 + crash) * gain);
  }
};
impact(1.25, 0.35);
impact(DROP, 0.6);
impact(OUTRO, 0.55);
if (SECONDS >= 60) impact(BREAK[1], 0.5);

// ---- final chord ring-out
for (const m of [...CHORDS[0], 69, 45]) {
  const f = midi(m);
  const s = Math.floor(OUTRO * SR);
  for (let k = 0; s + k < N; k++) {
    const tt = k / SR;
    const v = Math.sin(2 * Math.PI * f * tt) * Math.exp(-tt * 0.9) * 0.06;
    add(s + k, v, v);
  }
}

// ---- normalize + soft clip, write 16-bit WAV
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = 0.9 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.tanh(L[i] * gain * 1.1) * 32000), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.tanh(R[i] * gain * 1.1) * 32000), 46 + i * 4);
}
writeFileSync(OUT, buf);
console.log(`wrote ${OUT} (${SECONDS}s)`);
