// Generates public/blueprint-music.wav for the "Blueprint" composition: pencil scratches,
// drafting ticks, a building 120 BPM groove with a metallic clank for every floor, and an
// uplifting swell when the city lights up — synced to src/blueprint/timeline.json.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSynth } from "./synth.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tl = JSON.parse(fs.readFileSync(path.join(root, "src/blueprint/timeline.json"), "utf8"));

const FPS = tl.fps;
const seconds = tl.durationInFrames / FPS;
const synth = createSynth({ seconds, fps: FPS, bpm: tl.bpm, seed: 53 });
const { SR, N, L, R, at, add, beatFrames, beatsBetween, kick, clap, hat, bass, hit, whoosh, riser, click, ping, scribble } = synth;

// Steel beam landing: inharmonic ring over a thud.
const clank = (frame, gain = 0.5) => {
  const s = at(frame);
  for (let i = 0; i < 1.2 * SR; i++) {
    const t = i / SR;
    let v = 0;
    [523, 1187, 1853, 2711].forEach((f, k) => (v += Math.sin(2 * Math.PI * f * t) * Math.exp(-t * (6 + k * 3)) / (k + 1)));
    add(s + i, v * gain * 0.5, v * gain * 0.45);
  }
  kick(frame, gain * 1.2);
};
// Soft electric-piano chord.
const keys = (frame, freqs, len = 1.6, gain = 0.05) => {
  const s = at(frame);
  for (let i = 0; i < len * SR; i++) {
    const t = i / SR;
    let v = 0;
    for (const f of freqs) v += Math.sin(2 * Math.PI * f * t) * (1 + 0.3 * Math.sin(2 * Math.PI * 5 * t));
    add(s + i, v * Math.exp(-t * 1.6) * gain);
  }
};

const { sketch, question, plan, build, skyline, outro } = tl;
const prog = [
  [261.63, 329.63, 392],
  [220, 261.63, 329.63],
  [174.61, 220, 261.63],
  [196, 246.94, 293.66],
];

// 1. sketch: pencil strokes and a few gentle chords
scribble(sketch.drawFrom, sketch.drawTo, 0.07);
for (let k = 0; k < 3; k++) keys(sketch.from + 10 + k * 45, prog[k], 1.6, 0.04);

// 2. question: the sketch "boils" — nervous ticks, a dissonant chord, then the eraser
beatsBetween(question.from, question.to - 10, (f, b) => click(f + (b % 2) * 4, 0.08));
keys(question.from + 4, [233.08, 246.94, 349.23], 3, 0.04);
whoosh(question.to - 24, 0.8, 0.3, false);
scribble(question.to - 22, question.to, 0.05);

// 3. plan: a clean hit, drafting ticks as the lines are plotted
hit(plan.from, 0.8);
for (let f = plan.from + 4; f < plan.drawTo; f += 3) click(f, 0.07);
keys(plan.from + 4, [261.63, 329.63, 392, 493.88], 2.5, 0.05);
riser(build.from - 30, build.from, 0.2);

// 4. build: groove + a clank for every floor
beatsBetween(build.from, skyline.from, (f, b) => {
  kick(f, 0.7);
  hat(f + beatFrames / 2, 0.09);
  if (b % 2 === 1) clap(f, 0.26);
  bass(f, prog[Math.floor(b / 4) % 4][0] / 2, 0.4, 0.2);
  if (b % 4 === 0) keys(f, prog[Math.floor(b / 4) % 4], 1.8, 0.04);
});
for (let k = 0; k < 5; k++) {
  const start = build.from + k * build.each;
  whoosh(start, build.drop / FPS + 0.15, 0.25, k % 2 === 0);
  clank(start + build.drop, 0.6);
  ping(start + build.drop + 4, [523.25, 587.33, 659.25, 783.99, 880][k], 0.07);
}
riser(skyline.from - 30, skyline.from, 0.25);

// 5. skyline: swell as the city rises, sparkles as the lights switch on, a hit for the sign
hit(skyline.from, 0.8);
const swellFrom = at(skyline.from);
const swellTo = at(outro.from + 20);
for (let i = swellFrom; i < swellTo && i < N; i++) {
  const t = i / SR;
  const p = (i - swellFrom) / (swellTo - swellFrom);
  const env = Math.sin(Math.PI * Math.min(1, p * 1.1)) * 0.9;
  let v = 0;
  for (const f of [130.81, 196, 261.63, 329.63, 392]) v += Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2.003 * t);
  L[i] += v * env * 0.018;
  R[i] += v * env * 0.017;
}
for (let k = 0; k < 14; k++) ping(skyline.lightsOn + k * 4, [1046.5, 1318.5, 1568, 2093][k % 4], 0.05);
beatsBetween(skyline.from + 20, skyline.to, (f, b) => {
  kick(f, 0.6);
  hat(f + beatFrames / 2, 0.08);
  if (b % 2 === 1) clap(f, 0.22);
});
hit(skyline.signAt, 1.1);
ping(skyline.signAt + 2, 1568, 0.1);

// 6. outro: the logo is plotted, final chord
hit(outro.from, 0.8);
for (let f = outro.from + 12; f < outro.from + 44; f += 2) click(f, 0.05);
keys(outro.from + 44, [261.63, 329.63, 392, 523.25], 3.5, 0.06);

synth.write(path.join(root, "public/blueprint-music.wav"));
console.log(`public/blueprint-music.wav written (${seconds}s)`);
