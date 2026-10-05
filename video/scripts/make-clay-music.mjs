// Soundtracks for the «صلصال» clay series (scripts/studio.mjs):
//   recipe – ukulele + glockenspiel + claps; a "plop" per ingredient, shaker while stirring, a pop at the end
//   cart   – future-bass: chopped supersaw chords, taps, a swoosh into the cart, a ka-ching on checkout
//   dash   – chill house: piano chords, plucky arps, count-up ticks, bubble pops for each widget
//   node scripts/make-clay-music.mjs [name]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStudio } from "./studio.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TL = JSON.parse(fs.readFileSync(path.join(root, "src/clay/timelines.json"), "utf8"));
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const chord = (r, k) => (k === "min" ? [0, 3, 7] : [0, 4, 7]).map((i) => hz(r + i));
const make = (T, seed) => createStudio({ seconds: T.duration / 30, fps: 30, bpm: T.bpm, seed });

const tracks = {
  recipe: () => {
    const T = TL.recipe;
    const s = make(T, 1501);
    const uke = (f, r, k, down) => s.strum(f, chord(r + 12, k).concat([hz(r + 24)]), 0.05, down);
    const glock = (f, m, g = 0.06) => s.bell(f, hz(m), g, { ratio: 3.5, index: 0.6, dec: 0.9 });
    const prog = [[60, "maj"], [57, "min"], [53, "maj"], [55, "maj"]];
    s.beatsBetween(0, T.duration - 40, (f, b) => {
      const [r, k] = prog[Math.floor(b / 4) % 4];
      uke(f, r, k, true);
      uke(f + s.beat / 2, r, k, false);
      if (b % 2 === 1) s.clap(f, 0.18);
      s.kick(f, b % 2 ? 0.25 : 0.45);
      s.sub(f, hz(r - 24), 0.2, 0.15);
    });
    const tune = [76, 79, 81, 79, 76, 74, 72, 74];
    for (let i = 0; i < 16; i++) glock(T.drops[0] - 40 + i * s.beat, tune[i % 8], 0.04);
    // a plop per ingredient (pitch drop) + splash
    T.drops.forEach((d, i) => {
      s.whistle(d - 20, 0.2, 0.03, 900 + i * 200, 1400 + i * 200); // appears
      s.k808(d + 24, hz(52 - i * 2), 0.25, 0.4, hz(40 - i * 2));
      s.brush(d + 24, 0.3, 0.12);
      glock(d + 26, 84 + i * 2, 0.07);
    });
    // stirring: shaker
    for (let f = T.stir[0]; f < T.stir[1]; f += s.beat / 4) s.hat(f, 0.05);
    s.noiseSweep(T.stir[1] - 40, T.pop, { gain: 0.25 });
    // pop!
    s.impact(T.pop, 0.8);
    s.clap(T.pop, 0.4);
    s.chime(T.pop + 2, 0.14);
    [72, 76, 79, 84].forEach((m, i) => glock(T.pop + 4 + i * 3, m, 0.07));
    return { s, file: "clay-recipe-music.wav", mix: { duckDepth: 0.35 } };
  },

  cart: () => {
    const T = TL.cart;
    const s = make(T, 1511);
    const prog = [[62, "maj"], [59, "min"], [55, "maj"], [57, "maj"]];
    s.beatsBetween(0, T.duration - 40, (f, b) => {
      const [r, k] = prog[Math.floor(b / 4) % 4];
      const notes = chord(r, k).concat([hz(r + 12), hz(r + 16)]);
      // chopped future-bass chords on the off-beats
      [0.5, 0.75, 1.5].forEach((o) => s.supersaw(f + s.beat * (o - 0.5), f + s.beat * (o - 0.5) + s.beat * 0.2, notes, 0.012, { cutoff: 0.12, attack: 0.005, release: 0.06 }));
      s.kick(f, b % 2 ? 0.5 : 0.85);
      if (b % 2 === 1) s.snare(f, 0.3), s.clap(f, 0.2);
      s.hat(f + s.beat / 2, 0.06);
      s.sub(f, hz(r - 24), 0.3, 0.2);
    });
    // taps
    [T.tapAd, T.tapAdd].forEach((t) => (s.tick(t, 2200, 0.2), s.bell(t, hz(88), 0.06, { ratio: 2, index: 0.6, dec: 0.4 })));
    s.whoosh(T.product - 4, 0.4, 0.2, true);
    // swoosh into the cart + bump
    s.whoosh(T.fly[0], 1.2, 0.3, true);
    s.taiko(T.fly[1], 0.5);
    s.bell(T.fly[1] + 2, hz(91), 0.07, { ratio: 2, index: 0.8, dec: 0.6 });
    // ka-ching on checkout
    s.noiseSweep(T.checkout - 20, T.done, { gain: 0.2 });
    s.impact(T.done, 0.8);
    [4800, 5600, 4200].forEach((fq, i) => s.tick(T.done + i * 1.5, fq, 0.15));
    [84, 88, 91, 96].forEach((m, i) => s.bell(T.done + 4 + i * 2, hz(m), 0.06, { ratio: 3.5, index: 1, dec: 1.2 }));
    s.applause(T.done + 4, 2.5, 0.2);
    return { s, file: "clay-cart-music.wav", mix: { duckDepth: 0.5 } };
  },

  dash: () => {
    const T = TL.dash;
    const s = make(T, 1521);
    const prog = [[57, "min"], [53, "maj"], [60, "maj"], [55, "maj"]];
    s.beatsBetween(0, T.duration - 40, (f, b) => {
      const [r, k] = prog[Math.floor(b / 4) % 4];
      s.kick(f, 0.7);
      s.hat(f + s.beat / 2, 0.07, b % 4 === 3);
      if (b % 2 === 1) s.clap(f, 0.18);
      if (b % 2 === 0) s.rhodes(f + s.beat / 2, chord(r, k).concat([hz(r + 10)]), 0.6, 0.045);
      const n = chord(r + 12, k);
      [0, 1, 2, 1].forEach((j, q) => s.pluck(f + q * s.beat * 0.25, n[j] * 2, 0.04, { bright: 0.8, decay: 0.985, pan: q % 2 ? 0.4 : -0.4 }));
      s.sub(f, hz(r - 24), 0.25, 0.2);
    });
    // a bubble pop per widget, ticks while numbers count
    T.widgets.forEach((w, i) => {
      s.k808(w, hz(70 + i * 2), 0.12, 0.25, hz(82 + i * 2));
      s.bell(w + 2, hz(84 + i * 2), 0.05, { ratio: 2, index: 0.6, dec: 0.5 });
      for (let k = 0; k < 10; k++) s.tick(w + 8 + k * 4, 3200 + k * 100, 0.03);
    });
    s.impact(T.widgets[4] + 10, 0.6);
    s.chime(T.line, 0.12);
    return { s, file: "clay-dash-music.wav", mix: { duckDepth: 0.4 } };
  },
};

const only = process.argv[2];
for (const [name, build] of Object.entries(tracks)) {
  if (only && only !== name) continue;
  const { s, file, mix } = build();
  s.write(path.join(root, "public", file), mix);
  console.log(`public/${file} written`);
}
