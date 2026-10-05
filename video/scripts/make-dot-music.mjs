// Soundtrack for "النقطة / The Dot" (scripts/studio.mjs): playful marimba-and-claps montage,
// a wobbly lost section while the dot wanders, a zip and a hit when it finds its target.
//   node scripts/make-dot-music.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStudio } from "./studio.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const T = JSON.parse(fs.readFileSync(path.join(root, "src/dot/timeline.json"), "utf8"));
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const chord = (r, k) => (k === "min" ? [0, 3, 7] : [0, 4, 7]).map((i) => hz(r + i));
const s = createStudio({ seconds: T.durationInFrames / T.fps, fps: T.fps, bpm: T.bpm, seed: 1201 });
const marimba = (f, m, g = 0.09) => s.bell(f, hz(m), g, { ratio: 4, index: 0.8, dec: 0.5, send: 0.2 });

// the first dot
s.tick(T.dot, 1800, 0.2);
marimba(T.dot, 72, 0.12);

// montage: one stamp + marimba note per tile over a light groove
const scale = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86];
for (let i = 0; i < 12; i++) {
  const f = T.grid.from + i * T.grid.each;
  s.kick(f, 0.55);
  marimba(f, scale[i], 0.1);
  marimba(f + T.grid.each / 2, scale[i] - 12, 0.05);
}
s.beatsBetween(T.grid.from, T.collapse.from, (f, b) => {
  s.hat(f + s.beat / 2, 0.06);
  if (b % 2 === 1) s.clap(f, 0.22);
  s.sub(f, hz(36 + [0, 0, 5, 7][Math.floor(b / 4) % 4]), 0.2, 0.18);
});
// collapse into one dot
s.noiseSweep(T.collapse.from, T.collapse.to, { up: true, gain: 0.22 });
s.whoosh(T.collapse.from + 20, 0.9, 0.25, false);
s.tick(T.collapse.to, 1500, 0.25);
marimba(T.collapse.to, 72, 0.14);

// line 1: calm and warm
s.rhodes(T.line1, chord(60, "maj"), 2.2, 0.05);
s.rhodes(T.line1 + 60, chord(57, "min"), 2.2, 0.05);
[72, 76, 79, 76].forEach((m, i) => marimba(T.line1 + 8 + i * 15, m, 0.07));

// wandering: lost, detuned, a clock that won't stop
for (let f = T.wander.from, i = 0; f < T.wander.to; f += 9, i++) {
  s.pluck(f, hz(60 + Math.round(Math.sin(i * 1.7) * 7)) * (1 + (i % 3) * 0.012), 0.06, { bright: 0.4, pan: Math.sin(i) * 0.6 });
  if (i % 2 === 0) s.tick(f, 2400, 0.04);
}
s.supersaw(T.wander.from, T.retract.to, [hz(48), hz(49), hz(55)], 0.008, { cutoff: 0.02, attack: 0.8 });

// retract (zip back), target lands, line draws, dot travels, hit
s.whoosh(T.retract.from, 0.9, 0.3, true);
s.kick(T.shoot.target, 0.7);
s.sub(T.shoot.target, hz(36), 0.4, 0.3);
s.noiseSweep(T.shoot.line, T.shoot.hit, { up: true, gain: 0.3 });
s.snareRoll(T.shoot.travel - 10, T.shoot.hit, 0.25);
s.impact(T.shoot.hit, 1.1);
s.strum(T.shoot.hit, chord(60, "maj").concat([hz(72), hz(76)]), 0.12);
s.chime(T.shoot.hit + 4, 0.12);

// answer + outro: confident groove
const prog = [[60, "maj"], [55, "maj"], [57, "min"], [53, "maj"]];
s.beatsBetween(T.shoot.hit, T.durationInFrames - 40, (f, b) => {
  const [r, k] = prog[Math.floor(b / 4) % 4];
  s.kick(f, 0.7);
  if (b % 2 === 1) s.clap(f, 0.25);
  s.hat(f + s.beat / 2, 0.07);
  s.sub(f + s.beat / 2, hz(r - 24), 0.2, 0.2);
  marimba(f, chord(r + 12, k)[b % 3] ? 72 + ((b * 5) % 12) : 72, 0.05);
  if (b % 4 === 0) s.rhodes(f, chord(r, k), 1.8, 0.05);
});
s.chime(T.outro + 10, 0.12);
s.rhodes(T.durationInFrames - 40, chord(60, "maj").concat([hz(72)]), 1.4, 0.06);

s.write(path.join(root, "public", "dot-music.wav"), { duckDepth: 0.4 });
console.log("public/dot-music.wav written");
