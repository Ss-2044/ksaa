// Generates public/music.wav: an ambient pad, a whoosh on every iPad swipe,
// a riser into the first voice over and low "hits" on each scene change.
// Cut points are read from src/timeline.json so audio stays in sync with the picture.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tl = JSON.parse(fs.readFileSync(path.join(root, "src/timeline.json"), "utf8"));

const SR = 44100;
const seconds = tl.durationInFrames / tl.fps;
const N = Math.round(seconds * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const f2s = (f) => Math.round((f / tl.fps) * SR);

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

// Pad: Am9 -> Fmaj7 -> Cadd9 -> G, slow swells, detuned for width.
const chords = [
  [110, 164.81, 261.63, 329.63, 493.88],
  [87.31, 174.61, 220, 261.63, 329.63],
  [130.81, 196, 261.63, 293.66, 392],
  [98, 146.83, 246.94, 293.66, 392],
];
const chordLen = seconds / 4;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const c = Math.min(3, Math.floor(t / chordLen));
  const local = (t % chordLen) / chordLen;
  const xfade = Math.min(1, local * 6) * Math.min(1, (1 - local) * 6);
  const master = Math.min(1, t / 2) * Math.min(1, (seconds - t) / 2.5);
  let l = 0;
  let r = 0;
  for (const f of chords[c]) {
    l += Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2.003 * t);
    r += Math.sin(2 * Math.PI * f * 1.004 * t) + 0.3 * Math.sin(2 * Math.PI * f * 1.997 * t);
  }
  const lfo = 0.75 + 0.25 * Math.sin(2 * Math.PI * 0.2 * t);
  L[i] += l * 0.022 * xfade * master * lfo;
  R[i] += r * 0.022 * xfade * master * lfo;
  // soft pulse during the montage
  const pulseFrom = tl.montageFrom / tl.fps;
  const pulseTo = tl.vo1Scene.from / tl.fps;
  if (t > pulseFrom && t < pulseTo) {
    const beat = ((t - pulseFrom) * 2.2) % 1;
    const k = Math.sin(2 * Math.PI * 55 * t) * Math.exp(-beat * 9) * 0.28;
    L[i] += k;
    R[i] += k;
  }
}

const whoosh = (startFrame, len = 0.35, gain = 0.35) => {
  const s = f2s(startFrame);
  let lp = 0;
  for (let i = 0; i < len * SR && s + i < N; i++) {
    const p = i / (len * SR);
    const env = Math.sin(Math.PI * p) ** 2;
    const cutoff = 0.02 + 0.25 * Math.sin(Math.PI * p);
    lp += cutoff * (rnd() - lp);
    const pan = 1 - p; // right -> left, like the swipe
    L[s + i] += lp * env * gain * (0.4 + 0.6 * (1 - pan));
    R[s + i] += lp * env * gain * (0.4 + 0.6 * pan);
  }
};

const hit = (startFrame, gain = 0.8) => {
  const s = f2s(startFrame);
  let lp = 0;
  for (let i = 0; i < 2.2 * SR && s + i < N; i++) {
    const t = i / SR;
    const f = 38 + 50 * Math.exp(-t * 8);
    const body = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 2.2);
    lp += 0.05 * (rnd() - lp);
    const air = lp * Math.exp(-t * 3) * 0.9;
    L[s + i] += (body + air) * gain;
    R[s + i] += (body + air) * gain;
  }
};

const riser = (fromFrame, toFrame, gain = 0.25) => {
  const s = f2s(fromFrame);
  const e = f2s(toFrame);
  let lp = 0;
  for (let i = s; i < e; i++) {
    const p = (i - s) / (e - s);
    lp += (0.01 + p * 0.3) * (rnd() - lp);
    const tone = Math.sin(2 * Math.PI * (200 + 600 * p * p) * (i / SR)) * 0.15;
    L[i] += (lp + tone) * p * p * gain;
    R[i] += (lp + tone) * p * p * gain;
  }
};

let start = tl.montageFrom;
tl.cards.forEach((c, i) => {
  if (i > 0) whoosh(start - 1);
  start += c.duration;
});
whoosh(tl.montageFrom - 6, 0.5, 0.45);
riser(tl.vo1Scene.from - 50, tl.vo1Scene.from);
[tl.vo1Scene.from, tl.face.from, tl.vo2Scene.from, tl.outro.from].forEach((f) => hit(f));

// Normalize and write 16-bit stereo WAV.
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const norm = 0.89 / peak;
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
  buf.writeInt16LE(Math.round(Math.tanh(L[i] * norm) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.tanh(R[i] * norm) * 32767), 46 + i * 4);
}
fs.writeFileSync(path.join(root, "public/music.wav"), buf);
console.log(`public/music.wav written (${seconds}s)`);
