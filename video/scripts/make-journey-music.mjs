// Generates public/journey-music.wav for the "Journey" composition:
// a 120 BPM cinematic beat (kick, clap, hats, bass, pad) plus sound design synced to
// src/journey/timeline.json — split-flap clicks, stamp hits, plane whooshes, stop pings, city-light sparkles.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSynth } from "./synth.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tl = JSON.parse(fs.readFileSync(path.join(root, "src/journey/timeline.json"), "utf8"));

const FPS = tl.fps;
const seconds = tl.durationInFrames / FPS;
const synth = createSynth({ seconds, fps: FPS, bpm: tl.bpm, seed: 11 });
const { SR, N, L, R, beatFrames, beatsBetween, kick, clap, hat, bass, hit, whoosh, riser, click, ping } = synth;

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
const { spark, pass, departures, map, arrival, outro } = tl;

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

// 5. window seat: shade slides up, city lights sparkle on in a wave, logo glows
hit(arrival.from, 0.8);
whoosh(arrival.from + 4, (arrival.shadeUp - 4) / FPS + 0.2, 0.35, false);
beatsBetween(arrival.from + arrival.lightsFrom, arrival.from + arrival.pushFrom, (f, b) => {
  if (b % 2 === 0) kick(f, 0.55);
  hat(f + beatFrames / 2, 0.06);
});
const sparkle = [1318.5, 1568, 1760, 1976, 2349, 2637];
for (let k = 0; k < 16; k++) {
  const f = arrival.from + arrival.lightsFrom + (k / 16) * (arrival.lightsTo - arrival.lightsFrom);
  ping(f, sparkle[k % sparkle.length], 0.05);
}
hit(arrival.from + arrival.logoAt, 0.6);
ping(arrival.from + arrival.logoAt, 1760, 0.12);
riser(arrival.from + arrival.pushFrom - 20, outro.from - 2, 0.3);

// 6. outro: plane flyby + final impact, then the pad rings out
whoosh(outro.from - 6, 0.9, 0.6, true);
hit(outro.from, 1.2);
ping(outro.from + 22, 1760, 0.1);
ping(outro.from + 30, 2637, 0.06);

synth.write(path.join(root, "public/journey-music.wav"));
console.log(`public/journey-music.wav written (${seconds}s)`);
