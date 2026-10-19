// Soundtracks for the «كوميكس» comic series (scripts/studio.mjs):
//   hero – big-band swing: walking bass, swung ride, brass stabs; phone ring, hero fanfare, cartoon hits
//   faq  – 8-bit game: square-ish leads and arps, a "question" blip and a power-up for every answer
//   day  – ska: off-beat guitar skanks, horn stabs, fast drums; a hit for every hour
//   restaurant – bossa nova: nylon guitar, shaker, rimshots; a camera click, a crowd at the end
//   store      – 80s synth-pop: arpeggiated synths, gated snare; a notification ding and a ka-ching
//   launch     – marching drumline: snare cadences, bass drums, brass; a hit on 3-2-1 and a crowd
//   node scripts/make-comic-music.mjs [name]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStudio } from "./studio.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = JSON.parse(fs.readFileSync(path.join(root, "src/comic/comic.json"), "utf8"));
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const chord = (r, k) => (k === "min" ? [0, 3, 7] : k === "7" ? [0, 4, 7, 10] : [0, 4, 7]).map((i) => hz(r + i));
const panels = (c) => c.pages.flatMap((p) => p.panels);

// cartoon SFX hit: slide whistle up + crash
const sfxHit = (s, f) => {
  s.whistle(f - 8, 0.25, 0.035, 500, 1500);
  s.impact(f, 0.5);
  s.noiseSweep(f, f + 12, { up: false, gain: 0.15 });
};

const tracks = {
  hero: () => {
    const c = DATA.hero;
    const s = createStudio({ seconds: c.duration / 30, fps: 30, bpm: c.bpm, seed: 1601 });
    const prog = [[60, "7"], [65, "7"], [60, "7"], [67, "7"]];
    const brass = (f, notes, len = 0.12, g = 0.016) => s.supersaw(f, f + len * 30, notes, g, { cutoff: 0.18, attack: 0.004, release: 0.05 });
    s.beatsBetween(0, c.duration - 40, (f, b) => {
      const [r, k] = prog[Math.floor(b / 4) % 4];
      const walk = [r - 24, r - 20, r - 17, r - 14];
      s.pluck(f, hz(walk[b % 4]), 0.18, { bright: 0.3, decay: 0.991 });
      s.hat(f, 0.05);
      s.hat(f + s.beat * 0.66, 0.04);
      if (b % 2 === 1) s.snare(f, 0.12, 0.2);
      if (b % 4 === 0) s.kick(f, 0.5);
      if (b % 4 === 1) brass(f + s.beat * 0.66, chord(r, k));
      if (b % 8 === 3) brass(f, chord(r + 12, k), 0.3, 0.014);
    });
    // phone ring
    const call = panels(c)[1].at + 14;
    for (let i = 0; i < 4; i++) s.bell(call + i * 4, hz(i % 2 ? 88 : 91), 0.08, { ratio: 1, index: 2, dec: 0.15 });
    // hero fanfare
    const hero = panels(c)[2].at + 14;
    [[67, 0], [72, 6], [76, 12], [79, 18]].forEach(([m, d]) => s.supersaw(hero + d, hero + d + 8, [hz(m), hz(m - 12)], 0.03, { cutoff: 0.2, attack: 0.004, release: 0.08 }));
    s.supersaw(hero + 24, hero + 60, chord(72, "maj"), 0.03, { cutoff: 0.15, attack: 0.01, release: 0.3 });
    s.applause(panels(c)[5].at + 14, 2.5, 0.25);
    panels(c).forEach((p) => p.sfx && sfxHit(s, p.at + 14));
    panels(c).forEach((p) => s.whoosh(p.at - 4, 0.25, 0.12, true));
    s.impact(c.end, 0.8);
    s.supersaw(c.end + 10, c.duration - 10, chord(60, "maj").concat([hz(72)]), 0.02, { cutoff: 0.1, attack: 0.05, release: 1 });
    return { s, file: c.music, mix: { duckDepth: 0.3 } };
  },

  faq: () => {
    const c = DATA.faq;
    const s = createStudio({ seconds: c.duration / 30, fps: 30, bpm: c.bpm, seed: 1611 });
    const chip = (f, m, len = 0.1, g = 0.03) => s.supersaw(f, f + len * 30, [hz(m)], g, { cutoff: 0.5, attack: 0.002, release: 0.02 });
    const prog = [[60, "maj"], [57, "min"], [65, "maj"], [67, "maj"]];
    s.beatsBetween(0, c.duration - 40, (f, b) => {
      const [r, k] = prog[Math.floor(b / 4) % 4];
      const n = chord(r + 12, k).map((x) => Math.round(69 + 12 * Math.log2(x / 440)));
      [0, 1, 2, 1].forEach((j, q) => chip(f + q * s.beat * 0.25, n[j], 0.06, 0.018));
      chip(f, r - 12, 0.18, 0.03);
      s.kick(f, b % 2 ? 0.3 : 0.6);
      if (b % 2 === 1) s.snare(f, 0.18, 0.1);
      s.hat(f + s.beat / 2, 0.05);
    });
    panels(c).forEach((p) => {
      if (p.scene === "ask") [76, 79, 83].forEach((m, i) => chip(p.at + 8 + i * 3, m, 0.08, 0.035)); // question blip
      else {
        [72, 76, 79, 84, 88].forEach((m, i) => chip(p.at + 4 + i * 2.2, m, 0.07, 0.035)); // power-up
        sfxHit(s, p.at + 14);
      }
      s.whoosh(p.at - 4, 0.25, 0.1, true);
    });
    s.impact(c.end, 0.8);
    [72, 76, 79, 84].forEach((m, i) => chip(c.end + 10 + i * 6, m, 0.15, 0.03));
    return { s, file: c.music, mix: { duckDepth: 0.35 } };
  },

  day: () => {
    const c = DATA.day;
    const s = createStudio({ seconds: c.duration / 30, fps: 30, bpm: c.bpm, seed: 1621 });
    const prog = [[62, "maj"], [67, "maj"], [69, "maj"], [67, "maj"]];
    s.beatsBetween(0, c.duration - 40, (f, b) => {
      const [r, k] = prog[Math.floor(b / 2) % 4];
      s.strum(f + s.beat / 2, chord(r, k).concat([hz(r + 12)]), 0.05, true); // off-beat skank
      s.kick(f, b % 2 ? 0.4 : 0.7);
      if (b % 2 === 1) s.snare(f, 0.25, 0.15);
      s.hat(f, 0.05);
      s.hat(f + s.beat / 2, 0.04);
      s.pluck(f, hz(r - 24), 0.16, { bright: 0.35, decay: 0.99 });
      if (b % 8 === 7) s.supersaw(f, f + 6, chord(r + 12, k), 0.02, { cutoff: 0.2, attack: 0.004, release: 0.05 });
    });
    panels(c).forEach((p) => {
      s.whoosh(p.at - 4, 0.25, 0.12, true);
      s.bell(p.at, hz(88), 0.06, { ratio: 2, index: 1, dec: 0.5 }); // clock ding
      if (p.sfx) sfxHit(s, p.at + 14);
    });
    const cam = panels(c)[2].at;
    for (let i = 0; i < 4; i++) s.tick(cam + 14 + i * 24, 4200, 0.2);
    const rocket = panels(c)[3].at;
    s.noiseSweep(rocket, rocket + 60, { gain: 0.3 });
    s.impact(c.end, 0.8);
    return { s, file: c.music, mix: { duckDepth: 0.35 } };
  },
  restaurant: () => {
    const c = DATA.restaurant;
    const s = createStudio({ seconds: c.duration / 30, fps: 30, bpm: c.bpm, seed: 1631 });
    const prog = [[62, "min"], [55, "7"], [60, "maj"], [57, "7"]];
    s.beatsBetween(0, c.duration - 40, (f, b) => {
      const [r, k] = prog[Math.floor(b / 4) % 4];
      const n = chord(r, k);
      // bossa: bass on 1 and 3-and, guitar comping syncopated
      if (b % 2 === 0) s.pluck(f, hz(r - 24), 0.2, { bright: 0.3, decay: 0.992 });
      if (b % 2 === 1) s.pluck(f + s.beat / 2, hz(r - 17), 0.15, { bright: 0.3, decay: 0.992 });
      [0, 0.75, 1.5].forEach((o) => b % 2 === 0 && s.strum(f + s.beat * o, n.map((x) => x * 2), 0.035, true));
      for (let q = 0; q < 4; q++) s.hat(f + q * s.beat * 0.25, q % 2 ? 0.025 : 0.04);
      if (b % 4 === 3) s.tick(f + s.beat / 2, 1800, 0.08); // rimshot
    });
    panels(c).forEach((p) => {
      s.whoosh(p.at - 4, 0.25, 0.1, true);
      if (p.sfx) sfxHit(s, p.at + 14);
    });
    const call = panels(c)[1].at + 14;
    for (let i = 0; i < 4; i++) s.bell(call + i * 4, hz(i % 2 ? 88 : 91), 0.08, { ratio: 1, index: 2, dec: 0.15 });
    s.tick(panels(c)[2].at + 14, 4400, 0.25);
    s.applause(panels(c)[5].at + 10, 3, 0.28);
    s.impact(c.end, 0.7);
    return { s, file: c.music, mix: { duckDepth: 0.25 } };
  },

  store: () => {
    const c = DATA.store;
    const s = createStudio({ seconds: c.duration / 30, fps: 30, bpm: c.bpm, seed: 1641 });
    const prog = [[57, "min"], [53, "maj"], [60, "maj"], [55, "maj"]];
    s.beatsBetween(0, c.duration - 40, (f, b) => {
      const [r, k] = prog[Math.floor(b / 4) % 4];
      const n = chord(r + 12, k);
      [0, 1, 2, 1].forEach((j, q) => s.supersaw(f + q * s.beat * 0.25, f + q * s.beat * 0.25 + 3, [n[j] * 2], 0.012, { cutoff: 0.3, attack: 0.002, release: 0.03 }));
      s.kick(f, 0.75);
      if (b % 2 === 1) s.snare(f, 0.4, 0.5), s.clap(f, 0.2);
      s.hat(f + s.beat / 2, 0.06);
      s.sub(f, hz(r - 24), 0.25, 0.2);
      if (b % 4 === 0) s.supersaw(f, f + s.beat * 4, chord(r, k), 0.008, { cutoff: 0.04, attack: 0.1 });
    });
    panels(c).forEach((p) => {
      s.whoosh(p.at - 4, 0.25, 0.1, true);
      if (p.sfx) sfxHit(s, p.at + 14);
    });
    const ding = panels(c)[3].at + 10;
    s.bell(ding, hz(88), 0.1, { ratio: 2, index: 0.6, dec: 0.6 });
    s.bell(ding + 5, hz(93), 0.1, { ratio: 2, index: 0.6, dec: 0.8 });
    const kach = panels(c)[5].at + 14;
    for (let i = 0; i < 6; i++) [4800, 5600].forEach((fq, j) => s.tick(kach + i * 12 + j * 1.5, fq, 0.12));
    s.impact(c.end, 0.7);
    return { s, file: c.music, mix: { duckDepth: 0.4 } };
  },

  launch: () => {
    const c = DATA.launch;
    const s = createStudio({ seconds: c.duration / 30, fps: 30, bpm: c.bpm, seed: 1651 });
    const brass = (f, notes, len = 0.2, g = 0.02) => s.supersaw(f, f + len * 30, notes, g, { cutoff: 0.18, attack: 0.004, release: 0.08 });
    s.beatsBetween(0, c.duration - 40, (f, b) => {
      // drumline: snare 16ths with accents, bass drums on 1 and 3
      for (let q = 0; q < 4; q++) s.snare(f + q * s.beat * 0.25, q === 0 ? 0.22 : 0.08, 0.1);
      if (b % 2 === 0) s.taiko(f, 0.5);
      if (b % 8 === 7) s.snareRoll(f, f + s.beat, 0.2);
      if (b % 4 === 0) brass(f, chord(55 + [0, 5, 3, 7][Math.floor(b / 4) % 4], "maj"), 0.4, 0.016);
    });
    panels(c).forEach((p) => {
      s.whoosh(p.at - 4, 0.25, 0.1, true);
      if (p.sfx) sfxHit(s, p.at + 14);
    });
    // 3-2-1
    panels(c).filter((p) => /^n\d/.test(p.scene)).forEach((p, i) => (s.impact(p.at + 2, 0.6 + i * 0.2), s.taiko(p.at + 2, 0.9), brass(p.at + 2, [hz(67 + i * 2), hz(74 + i * 2)], 0.25, 0.03)));
    const big = panels(c)[6].at;
    s.impact(big, 1.2);
    brass(big, chord(67, "maj").concat([hz(79)]), 1.2, 0.03);
    s.applause(big + 4, 4, 0.35);
    s.whistle(big + 20, 0.8, 0.05);
    s.impact(c.end, 0.8);
    return { s, file: c.music, mix: { duckDepth: 0.3 } };
  },
};

const only = process.argv[2];
for (const [name, build] of Object.entries(tracks)) {
  if (only && only !== name) continue;
  const { s, file, mix } = build();
  s.write(path.join(root, "public", file), mix);
  console.log(`public/${file} written`);
}
