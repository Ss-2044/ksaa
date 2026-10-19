// Soundtracks for the third idea batch (scripts/studio.mjs):
//   gps     – soft synthwave drive; glitchy "recalculating", typing, two-tone nav prompts, an arrival chime
//   level   – chiptune; jump, coin, power-up, stomp and flag fanfare synced to the platformer
//   weather – TV news theme: brass stabs, timpani, ticking clock; thunder in the storm, birds in the sun
//   node scripts/make-ideas3-music.mjs [name]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStudio } from "./studio.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TL = JSON.parse(fs.readFileSync(path.join(root, "src/ideas3/timelines.json"), "utf8"));
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const chord = (r, k) => (k === "min" ? [0, 3, 7] : [0, 4, 7]).map((i) => hz(r + i));
const make = (T, seed) => createStudio({ seconds: T.duration / 30, fps: 30, bpm: T.bpm, seed });

const tracks = {
  gps: () => {
    const T = TL.gps;
    const s = make(T, 1701);
    // lost: unsteady, detuned
    s.supersaw(0, T.lost[1], [hz(45), hz(46), hz(52)], 0.01, { cutoff: 0.02, attack: 0.5 });
    for (let f = 10; f < T.lost[1]; f += 24) {
      for (let i = 0; i < 5; i++) s.tick(f + i * 1.2, 3000 - i * 300, 0.06); // glitch
      s.sub(f, hz(40), 0.15, 0.12);
    }
    // search: typing + result
    for (let i = 0; i < 9; i++) s.tick(T.search[0] + 8 + i * 2.2, 1800 + (i % 3) * 300, 0.07);
    s.bell(T.search[1] - 6, hz(84), 0.07, { ratio: 2, index: 0.6, dec: 0.5 });
    s.chime(T.route, 0.12);
    // drive: synthwave groove
    const prog = [[57, "min"], [53, "maj"], [60, "maj"], [55, "maj"]];
    s.beatsBetween(T.route, T.duration - 40, (f, b) => {
      const [r, k] = prog[Math.floor(b / 4) % 4];
      s.kick(f, 0.7);
      if (b % 2 === 1) s.snare(f, 0.25, 0.4);
      s.hat(f + s.beat / 2, 0.05);
      const n = chord(r + 12, k);
      [0, 1, 2, 1].forEach((j, q) => s.pluck(f + q * s.beat * 0.25, n[j] * 2, 0.04, { bright: 0.7, decay: 0.988, pan: q % 2 ? 0.3 : -0.3 }));
      s.sub(f, hz(r - 24), 0.3, 0.2);
      if (b % 4 === 0) s.supersaw(f, f + s.beat * 4, chord(r, k), 0.008, { cutoff: 0.035, attack: 0.3 });
    });
    // two-tone nav prompts
    T.steps.forEach((f) => (s.bell(f, hz(88), 0.08, { ratio: 1, index: 0.3, dec: 0.4 }), s.bell(f + 6, hz(84), 0.08, { ratio: 1, index: 0.3, dec: 0.6 })));
    s.chime(T.arrive, 0.14);
    s.strum(T.arrive + 2, chord(60, "maj").concat([hz(72)]), 0.08);
    s.impact(T.end, 0.6);
    return { s, file: "idea-gps-music.wav", mix: { duckDepth: 0.35 } };
  },

  level: () => {
    const T = TL.level;
    const s = make(T, 1711);
    const chip = (f, m, len = 0.1, g = 0.03) => s.supersaw(f, f + len * 30, [hz(m)], g, { cutoff: 0.5, attack: 0.002, release: 0.02 });
    const xToF = (x) => T.run[0] + ((x - 200) / (3300 - 200)) * (T.flag - T.run[0]);
    // title jingle
    [72, 76, 79, 84].forEach((m, i) => chip(4 + i * 6, m, 0.15));
    // overworld loop
    const mel = [76, 76, 0, 76, 0, 72, 76, 0, 79, 0, 0, 0, 67, 0, 0, 0];
    const bass = [48, 0, 55, 0, 52, 0, 55, 0];
    s.beatsBetween(T.run[0], T.flag, (f, b) => {
      [0, 0.5].forEach((o, q) => {
        const m = mel[(b * 2 + q) % 16];
        if (m) chip(f + s.beat * o, m, 0.08, 0.022);
        const bm = bass[(b * 2 + q) % 8];
        if (bm) chip(f + s.beat * o, bm - 12, 0.12, 0.03);
      });
      s.hat(f + s.beat / 2, 0.03);
      if (b % 2 === 0) s.kick(f, 0.3);
    });
    // jumps
    [[1000, 170], [1400, 120], [2205, 190], [2600, 130], [3240, 120]].forEach(([cx, w]) => s.whistle(xToF(cx - w * 0.95), 0.18, 0.04, 400, 1300));
    // coins
    [600, 680, 760, 1750, 1830, 1910, 2700, 2780, 2860, 2940].forEach((x) => (chip(xToF(x), 83, 0.05, 0.03), chip(xToF(x) + 2, 88, 0.12, 0.03)));
    // block + power-up
    const blk = xToF(1400);
    s.taiko(blk, 0.3);
    [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => chip(blk + 4 + i * 2, m, 0.06, 0.03));
    // stomp
    const st = xToF(2610);
    s.k808(st, hz(60), 0.2, 0.3, hz(40));
    // flag fanfare
    [67, 72, 76, 79, 84, 88].forEach((m, i) => chip(T.flag + i * 5, m, 0.15, 0.03));
    chip(T.flag + 34, 91, 0.6, 0.03);
    s.impact(T.end, 0.5);
    [72, 76, 79].forEach((m, i) => chip(T.end + 10 + i * 8, m, 0.3, 0.025));
    return { s, file: "idea-level-music.wav", mix: { duckDepth: 0.2 } };
  },

  weather: () => {
    const T = TL.weather;
    const s = make(T, 1721);
    const brass = (f, notes, len = 0.2, g = 0.018) => s.supersaw(f, f + len * 30, notes, g, { cutoff: 0.16, attack: 0.004, release: 0.08 });
    // bumper
    s.taiko(0, 0.7);
    brass(2, chord(62, "maj").concat([hz(74)]), 0.6, 0.025);
    s.noiseSweep(10, T.intro[1], { gain: 0.2 });
    s.whoosh(T.intro[1] - 4, 0.4, 0.25, true);
    // news bed: ticking 16ths + timpani + stabs
    s.beatsBetween(T.intro[1], T.duration - 40, (f, b) => {
      for (let q = 0; q < 4; q++) s.tick(f + q * s.beat * 0.25, 2600, q === 0 ? 0.06 : 0.03);
      if (b % 4 === 0) s.taiko(f, 0.45);
      const good = f >= T.good;
      const r = good ? [62, 67, 69, 67][Math.floor(b / 4) % 4] : [50, 49, 50, 46][Math.floor(b / 4) % 4];
      if (b % 4 === 0) s.supersaw(f, f + s.beat * 4, chord(r, good ? "maj" : "min"), 0.008, { cutoff: 0.03, attack: 0.2 });
      if (b % 8 === 3) brass(f + s.beat / 2, chord(r + 12, good ? "maj" : "min"), 0.15);
      s.sub(f, hz(r - 24), 0.25, 0.15);
    });
    // storm: rain hiss + thunder in the alert
    s.noiseSweep(T.bad, T.alert, { up: false, gain: 0.05, send: 0.6 });
    for (let f = T.alert; f < T.good; f += 20) (s.boom(f, 0.5), s.noiseSweep(f, f + 14, { up: false, gain: 0.2 }));
    s.impact(T.alert, 0.8);
    // sunny: chime + birds
    s.chime(T.good, 0.14);
    for (let i = 0; i < 6; i++) s.whistle(T.good + 30 + i * 22, 0.12, 0.03, 2400 + (i % 3) * 300, 3200);
    s.impact(T.end, 0.7);
    brass(T.end + 4, chord(62, "maj").concat([hz(74), hz(78)]), 1, 0.025);
    return { s, file: "idea-weather-music.wav", mix: { duckDepth: 0.3 } };
  },
};

const only = process.argv[2];
for (const [name, build] of Object.entries(tracks)) {
  if (only && only !== name) continue;
  const { s, file, mix } = build();
  s.write(path.join(root, "public", file), mix);
  console.log(`public/${file} written`);
}
