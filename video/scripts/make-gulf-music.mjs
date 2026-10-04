// Stadium anthem for the Gulf Cup celebration video (scripts/studio.mjs):
// crowd + heartbeat taiko under Al-Owais, stamp hit, then a festive drop with chants, horns and whistles.
//   node scripts/make-gulf-music.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStudio } from "./studio.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const T = JSON.parse(fs.readFileSync(path.join(root, "src/gulf/timeline.json"), "utf8"));
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const chord = (r, k) => (k === "min" ? [0, 3, 7] : [0, 4, 7]).map((i) => hz(r + i));
const s = createStudio({ seconds: T.duration / T.fps, fps: T.fps, bpm: T.bpm, seed: 977 });
const bar = s.beat * 4;

// intro: crowd murmur, heartbeat, rising braam
s.applause(0, 5, 0.12);
s.supersaw(0, T.team, chord(43, "min"), 0.008, { cutoff: 0.02, attack: 1 });
for (let f = 0; f < T.stamp; f += s.beat * 2) {
  s.taiko(f, 0.55);
  s.taiko(f + s.beat * 0.4, 0.3);
}
s.braam(T.line1, 49, 2.5, 0.06);
s.impact(T.line1, 0.6);
// stamp "لا لعب"
s.impact(T.stamp, 1.3);
s.boom(T.stamp, 0.7);
s.applause(T.stamp + 4, 3, 0.35);
// stadium chant claps: 3 claps + rest, building to the cut
for (let f = T.stamp + 20; f < T.team - 10; f += bar) [0, 1, 2].forEach((i) => s.clap(f + i * s.beat * 0.5, 0.35));
s.snareRoll(T.team - 30, T.team, 0.32);
s.noiseSweep(T.team - 40, T.team, { gain: 0.3 });

// anthem: G – D – Em – C, big drums, horns (supersaw), whistles
const prog = [[55, "maj"], [50, "maj"], [52, "min"], [48, "maj"]];
const groove = (from, to, big) => {
  s.beatsBetween(from, to, (f, b) => {
    s.kick(f, 0.9);
    s.taiko(f, b % 2 ? 0.25 : 0.45);
    if (b % 2 === 1) s.clap(f, 0.32), s.snare(f, 0.2);
    s.hat(f + s.beat / 2, 0.09, b % 4 === 3);
    const [r, k] = prog[Math.floor(b / 4) % 4];
    s.sub(f + s.beat / 2, hz(r - 24), 0.22, 0.24);
    if (big) s.pluck(f + s.beat / 2, chord(r + 12, k)[b % 3] * 2, 0.08, { bright: 0.7, pan: b % 2 ? 0.4 : -0.4 });
  });
  for (let f = from, i = 0; f < to; f += bar, i++) {
    const [r, k] = prog[i % 4];
    s.supersaw(f, Math.min(to, f + bar), chord(r, k).concat([hz(r + 12)]), big ? 0.02 : 0.014, { cutoff: 0.07, attack: 0.03 });
  }
};
s.impact(T.team, 1.1);
s.whistle(T.team + 6, 0.8, 0.05);
s.applause(T.team, 5, 0.35);
groove(T.team, T.trophy - 10, false);

// trophy reveal: riser, hit, shine, chant
s.noiseSweep(T.trophy - 30, T.trophy, { gain: 0.3 });
s.impact(T.trophy, 1);
s.braam(T.trophy, 49, 3, 0.05);
s.chime(T.trophy + 40, 0.14);
s.strum(T.trophy + 50, chord(67, "maj").concat([hz(79)]), 0.1);
for (let f = T.trophy + 50; f < T.final - 20; f += bar) [0, 1, 2].forEach((i) => s.clap(f + i * s.beat * 0.5, 0.3));
s.beatsBetween(T.trophy + 50, T.final - 20, (f, b) => s.taiko(f, b % 2 ? 0.3 : 0.6));
s.snareRoll(T.final - 30, T.final, 0.35);
s.noiseSweep(T.final - 40, T.final, { gain: 0.35 });

// final drop
s.impact(T.final, 1.3);
s.boom(T.final, 0.6);
s.applause(T.final, 4, 0.4);
s.whistle(T.final + 10, 0.9, 0.05);
s.whistle(T.final + 40, 0.7, 0.04, 1200, 2800);
groove(T.final, T.duration - 40, true);
s.supersaw(T.duration - 40, T.duration, chord(55, "maj"), 0.02, { cutoff: 0.05, release: 1 });
s.chime(T.duration - 40, 0.12);

s.write(path.join(root, "public", "gulf-music.wav"), { duckDepth: 0.45 });
console.log("public/gulf-music.wav written");
