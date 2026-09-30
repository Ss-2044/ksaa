// Generates public/journey-music.wav for the "Journey" composition:
// a 120 BPM cinematic beat (kick, clap, hats, bass, pad) plus sound design synced to
// src/journey/timeline.json — split-flap clicks, stamp hits, plane whooshes, stop pings, camera shutters.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tl = JSON.parse(fs.readFileSync(path.join(root, "src/journey/timeline.json"), "utf8"));

const SR = 44100;
const FPS = tl.fps;
const seconds = tl.durationInFrames / FPS;
const N = Math.round(seconds * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const at = (frame) => Math.round((frame / FPS) * SR);
const beatFrames = (60 / tl.bpm) * FPS;

let seed = 11;
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

// ---------- pad (Am - F - C - G) under the whole piece ----------
const chords = [
  [110, 164.81, 261.63, 329.63],
  [87.31, 174.61, 220, 261.63],
  [130.81, 196, 261.63, 329.63],
  [98, 146.83, 246.94, 293.66],
];
const chordFrames = beatFrames * 8;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const c = chords[Math.floor((t * FPS) / chordFrames) % 4];
  const master = Math.min(1, t / 1.5) * Math.min(1, (seconds - t) / 3);
  let l = 0;
  let r = 0;
  for (const f of c) {
    l += Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 2.004 * t);
    r += Math.sin(2 * Math.PI * f * 1.003 * t) + 0.25 * Math.sin(2 * Math.PI * f * 1.996 * t);
  }
  const lfo = 0.7 + 0.3 * Math.sin(2 * Math.PI * 0.25 * t);
  L[i] += l * 0.018 * master * lfo;
  R[i] += r * 0.018 * master * lfo;
}
const rootOf = (frame) => chords[Math.floor(frame / chordFrames) % 4][0];

// ---------- arrangement ----------
const { spark, pass, departures, map, partnership, outro } = tl;
const beatsBetween = (from, to, fn) => {
  for (let b = 0; from + b * beatFrames < to; b++) fn(from + b * beatFrames, b);
};

// 1. spark: heartbeat, riser into the bulb lighting up
beatsBetween(spark.from + 15, spark.from + spark.glowAt - 8, (f) => kick(f, 0.45));
riser(spark.from + 10, spark.from + spark.glowAt);
hit(spark.from + spark.glowAt, 0.8);
ping(spark.from + spark.glowAt, 1760, 0.12);

// 2. boarding pass: whoosh in, groove, flap clicks, drop before the stamp
whoosh(pass.from - 6, 0.7, 0.5, false);
hit(pass.from, 0.6);
beatsBetween(pass.from, pass.from + pass.stampAt - 10, (f, b) => {
  kick(f, 0.7);
  hat(f + beatFrames / 2, 0.08);
  if (b % 2 === 1) clap(f, 0.22);
  if (b % 2 === 0) bass(f, rootOf(f) / 2);
});
for (let f = pass.from + pass.flapFrom; f < pass.from + pass.toSettle + 16; f += 2) click(f, 0.1);
riser(pass.from + pass.stampAt - 40, pass.from + pass.stampAt - 2, 0.25);
hit(pass.from + pass.stampAt, 1.1);
beatsBetween(pass.from + pass.stampAt + 15, pass.from + pass.duration, (f, b) => {
  kick(f, 0.8);
  hat(f + beatFrames / 2, 0.1);
  if (b % 2 === 1) clap(f, 0.3);
  bass(f, rootOf(f) / 2, 0.4);
});

// 3. departures board: full beat + flap rows
hit(departures.from, 0.7);
beatsBetween(departures.from, departures.from + departures.duration, (f, b) => {
  kick(f, 0.85);
  hat(f + beatFrames / 2, 0.11);
  hat(f + beatFrames / 4, 0.05);
  if (b % 2 === 1) clap(f, 0.32);
  bass(f, rootOf(f) / 2, 0.4);
});
for (let f = departures.from; f < departures.from + 16; f += 1) click(f, 0.08);
for (let r = 0; r < 5; r++) {
  const settle = departures.from + departures.firstRow + r * departures.rowGap;
  for (let f = settle - 14; f < settle + 20; f += 2) click(f, 0.1);
  ping(settle + 20, 987.8 + r * 110, 0.07);
}

// 4. flight map: take-off whoosh, driving beat, a ping on every stop
whoosh(map.from, 1.2, 0.55, true);
hit(map.from, 0.7);
beatsBetween(map.from, map.from + map.flyTo, (f, b) => {
  kick(f, 0.85);
  hat(f + beatFrames / 2, 0.12, b % 4 === 3);
  hat(f + beatFrames / 4, 0.05);
  hat(f + (3 * beatFrames) / 4, 0.05);
  if (b % 2 === 1) clap(f, 0.34);
  bass(f, rootOf(f) / 2, 0.3);
  bass(f + beatFrames / 2, rootOf(f) / 2, 0.2, 0.18);
});
map.stops.forEach((s, i) => {
  const f = map.from + Math.round(map.flyFrom + s * (map.flyTo - map.flyFrom));
  ping(f, [1318.5, 1480, 1568, 1760, 1976][i], 0.16);
  whoosh(f - 4, 0.35, 0.18, i % 2 === 0);
});
riser(map.from + map.flyTo - 10, map.from + map.duration, 0.2);

// 5. partnership: half-time, signature scratches, stamp, press flashes
hit(partnership.from, 0.9);
beatsBetween(partnership.from, partnership.from + 128, (f, b) => {
  if (b % 2 === 0) kick(f, 0.6);
  hat(f + beatFrames / 2, 0.06);
});
scribble(partnership.from + 66, partnership.from + 96);
scribble(partnership.from + 100, partnership.from + 124);
hit(partnership.from + 128, 1.0);
for (let i = 0; i < 9; i++) shutter(partnership.from + 130 + i * 4, 0.28);
riser(partnership.from + 150, outro.from - 2, 0.28);

// 6. outro: plane flyby + final impact, then the pad rings out
whoosh(outro.from - 6, 0.9, 0.6, true);
hit(outro.from, 1.2);
ping(outro.from + 22, 1760, 0.1);
ping(outro.from + 30, 2637, 0.06);

// ---------- master: normalise, soft clip, write 16-bit WAV ----------
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
fs.writeFileSync(path.join(root, "public/journey-music.wav"), buf);
console.log(`public/journey-music.wav written (${seconds}s)`);
