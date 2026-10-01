// Estimate tempo (BPM), beat phase and loudness curve of an audio file.
// Usage: node scripts/analyze-audio.mjs <file> [startSec] [durSec]
import {execFileSync} from 'node:child_process';

const [file, start = '0', dur = '600'] = process.argv.slice(2);
const SR = 11025;
const raw = execFileSync('ffmpeg', ['-v', 'error', '-ss', start, '-t', dur, '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], {maxBuffer: 1 << 30});
const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
const HOP = 256;
const n = Math.floor(x.length / HOP);
const env = new Float32Array(n);
for (let i = 0; i < n; i++) {
  let s = 0;
  for (let k = 0; k < HOP; k++) s += x[i * HOP + k] ** 2;
  env[i] = Math.log(1e-6 + s);
}
const flux = new Float32Array(n);
for (let i = 1; i < n; i++) flux[i] = Math.max(0, env[i] - env[i - 1]);
const fps = SR / HOP;
let best = {bpm: 0, score: -1};
for (let bpm = 70; bpm <= 160; bpm += 0.5) {
  const lag = (60 / bpm) * fps;
  let sc = 0;
  for (let i = 0; i + lag * 4 < n; i++) {
    const l = Math.round(lag);
    sc += flux[i] * (flux[i + l] + 0.5 * flux[i + 2 * l] + 0.25 * flux[i + 4 * l]);
  }
  sc /= n;
  if (sc > best.score) best = {bpm, score: sc};
}
const period = (60 / best.bpm) * fps;
let phase = {off: 0, s: -1};
for (let off = 0; off < period; off += 0.5) {
  let s = 0;
  for (let t = off; t < n; t += period) s += flux[Math.round(t)] || 0;
  if (s > phase.s) phase = {off, s};
}
const perSec = [];
for (let sec = 0; sec * fps < n; sec++) {
  let s = 0;
  let c = 0;
  for (let i = Math.floor(sec * fps); i < Math.min(n, (sec + 1) * fps); i++) {
    s += Math.exp(env[i]);
    c++;
  }
  perSec.push((10 * Math.log10(s / c / HOP + 1e-9)).toFixed(0));
}
console.log(JSON.stringify({file: file.split('/').pop(), bpm: best.bpm, firstBeat: +(phase.off / fps + Number(start)).toFixed(3), loudnessPerSec: perSec.join(' ')}));
