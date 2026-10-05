// Soundtracks for the paper-and-ink series (scripts/studio.mjs), one genre each:
//   dot     – Arabic: oud in Maqam Hijaz over a darbuka maqsoum, qanun runs, a free taqsim when the dot is lost
//   plane   – acoustic folk-pop: strummed guitar, whistled melody, wind; a crash, then a steady road beat
//   eraser  – chaos (clashing pops and stabs), a record-stop, rubbing strokes, then a calm clean piano
//   stamp   – stomp-stomp-clap anthem, a heavy thud on every stamp
//   node scripts/make-paper-music.mjs [name]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStudio } from "./studio.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const json = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const chord = (r, k) => (k === "min" ? [0, 3, 7] : [0, 4, 7]).map((i) => hz(r + i));

// ---------- Arabic instruments ----------
const HIJAZ = [62, 63, 66, 67, 69, 70, 72, 74, 75, 78, 79, 81]; // D Hijaz, 1.5 octaves
const arabic = (s) => {
  const oud = (f, m, g = 0.16, tremolo = 0) => {
    s.pluck(f, hz(m), g, { decay: 0.994, bright: 0.32, pan: -0.15, send: 0.3 });
    for (let i = 1; i <= tremolo; i++) s.pluck(f + i * 2.2, hz(m), g * 0.55, { decay: 0.993, bright: 0.3, pan: -0.15, send: 0.3 });
  };
  const qanun = (f, notes, step = 1.6, g = 0.07) => notes.forEach((m, i) => s.pluck(f + i * step, hz(m), g, { decay: 0.99, bright: 0.85, pan: 0.3, send: 0.35 }));
  const doum = (f, g = 0.55) => (s.taiko(f, g), s.sub(f, hz(38), 0.25, g * 0.4));
  const tek = (f, g = 0.12) => (s.tick(f, 3600, g), s.snare(f, g * 0.6, 0.15));
  const ka = (f, g = 0.06) => s.tick(f, 2600, g);
  // maqsoum: D T - T D - T -   (eighth notes)
  const maqsoum = (from, to, g = 1) => {
    const e = s.beat / 2;
    for (let f = from; f < to; f += s.beat * 4) {
      doum(f, 0.55 * g);
      tek(f + e, 0.12 * g);
      ka(f + 2 * e, 0.05 * g);
      tek(f + 3 * e, 0.12 * g);
      doum(f + 4 * e, 0.5 * g);
      ka(f + 5 * e, 0.05 * g);
      tek(f + 6 * e, 0.12 * g);
      ka(f + 7 * e, 0.06 * g);
    }
  };
  return { oud, qanun, doum, tek, ka, maqsoum };
};

const tracks = {
  dot: () => {
    const T = json("src/dot/timeline.json");
    const s = createStudio({ seconds: T.durationInFrames / T.fps, fps: T.fps, bpm: T.bpm, seed: 1301 });
    const { oud, qanun, doum, tek, maqsoum } = arabic(s);
    // the first dot
    doum(T.dot, 0.5);
    oud(T.dot, 62, 0.2, 3);
    // montage: maqsoum + one oud note up the maqam per tile
    maqsoum(T.grid.from, T.collapse.from);
    for (let i = 0; i < 12; i++) oud(T.grid.from + i * T.grid.each, HIJAZ[i], 0.15);
    s.sub(T.grid.from, hz(38), (T.collapse.from - T.grid.from) / T.fps, 0.08);
    // collapse: a qanun run sliding down into one note
    qanun(T.collapse.from, [...HIJAZ].reverse().concat([62, 63, 62]), 2.4, 0.08);
    doum(T.collapse.to, 0.6);
    oud(T.collapse.to, 62, 0.2, 4);
    // line 1: slow, warm taqsim over a drone
    s.supersaw(T.line1, T.wander.from, [hz(50), hz(57)], 0.006, { cutoff: 0.015, attack: 0.6 });
    [[0, 69, 3], [18, 70, 0], [24, 69, 0], [32, 67, 2], [52, 66, 0], [58, 63, 0], [66, 62, 5]].forEach(([d, m, tr]) => oud(T.line1 + d, m, 0.15, tr));
    // lost: free, wavering taqsim with no beat
    for (let f = T.wander.from, i = 0; f < T.wander.to; f += 7 + (i % 3) * 4, i++) {
      const m = HIJAZ[Math.abs(Math.round(Math.sin(i * 1.3) * 5 + Math.cos(i * 0.7) * 3)) % 9];
      oud(f, m + (i % 5 === 0 ? -12 : 0), 0.11, i % 4 === 0 ? 2 : 0);
    }
    s.supersaw(T.wander.from, T.retract.to, [hz(50), hz(51)], 0.006, { cutoff: 0.02, attack: 1 });
    // retract + aim + hit
    qanun(T.retract.from, HIJAZ.slice(0, 9), 2.2, 0.07);
    doum(T.shoot.target, 0.6);
    for (let f = T.shoot.line, i = 0; f < T.shoot.hit; f += Math.max(1.5, 6 - i * 0.35), i++) tek(f, 0.06 + i * 0.004); // riq roll
    s.noiseSweep(T.shoot.line, T.shoot.hit, { gain: 0.2 });
    s.impact(T.shoot.hit, 1);
    doum(T.shoot.hit, 0.9);
    qanun(T.shoot.hit, [62, 66, 69, 74, 78, 81, 86], 1.2, 0.09);
    // answer + outro: full ensemble, oud phrase on the groove
    maqsoum(T.shoot.hit, T.durationInFrames - 40, 1.1);
    const phrase = [[0, 74], [7.5, 75], [15, 74], [22.5, 72], [30, 70], [37.5, 69], [45, 70], [52.5, 69], [60, 67], [75, 66], [90, 67], [105, 69]];
    for (let rep = 0; rep < 2; rep++) phrase.forEach(([d, m]) => oud(T.shoot.hit + 15 + rep * 120 + d, m, 0.13));
    s.supersaw(T.shoot.hit, T.durationInFrames - 20, [hz(50), hz(57), hz(62)], 0.008, { cutoff: 0.03, attack: 0.3 });
    doum(T.durationInFrames - 40, 0.8);
    oud(T.durationInFrames - 40, 62, 0.22, 6);
    return { s, file: "dot-music.wav", mix: { duckDepth: 0.35 } };
  },

  plane: () => {
    const T = json("src/paper/timelines.json").plane;
    const s = createStudio({ seconds: T.duration / 30, fps: 30, bpm: T.bpm, seed: 1311 });
    const prog = [[55, "maj"], [60, "maj"], [62, "maj"], [52, "min"]];
    // folding: paper crinkles + gentle picking
    s.crackle(0, 0.3, 0.004, 0.12, 0.1);
    T.folds.forEach((f, i) => (s.crackle(f, 0.6, 0.01, 0.16, 0.1), s.brush(f + 4, 0.4, 0.12), s.pluck(f, hz(67 + i * 2), 0.1, { bright: 0.6 })));
    for (let f = 0, i = 0; f < T.launch; f += s.beat, i++) s.pluck(f, chord(55, "maj")[i % 3] * 2, 0.06, { bright: 0.55, pan: 0.3 });
    // lost flight: whoosh, wind, wobbly whistle, crash
    s.whoosh(T.launch - 4, 0.8, 0.35, true);
    s.noiseSweep(T.launch, T.crash, { up: false, gain: 0.12, send: 0.4 });
    for (let f = T.launch + 10, i = 0; f < T.crash - 10; f += 24, i++) s.whistle(f, 0.6, 0.035, 1100 + (i % 2) * 500, 700 + (i % 3) * 300);
    s.impact(T.crash, 0.6);
    s.crackle(T.crash, 0.8, 0.02, 0.2, 0.1);
    s.taiko(T.crash, 0.4);
    // route: strummed folk-pop with claps and a whistled tune
    s.beatsBetween(T.route, T.duration - 40, (f, b) => {
      const [r, k] = prog[Math.floor(b / 4) % 4];
      s.strum(f, chord(r, k).concat([hz(r + 12)]), 0.06, b % 2 === 0);
      if (b % 2 === 1) s.clap(f, 0.25);
      s.kick(f, b % 2 ? 0.4 : 0.7);
      s.hat(f + s.beat / 2, 0.06);
      s.sub(f, hz(r - 12), 0.25, 0.18);
    });
    const tune = [79, 81, 83, 86, 83, 81, 79, 76];
    tune.forEach((m, i) => s.whistle(T.fly[0] + i * s.beat, 0.4, 0.04, hz(m), hz(m)));
    tune.forEach((m, i) => s.whistle(T.fly[0] + 8 * s.beat + i * s.beat, 0.4, 0.04, hz(m + (i > 5 ? 2 : 0)), hz(m + (i > 5 ? 2 : 0))));
    T.pins.forEach((p) => s.bell(T.fly[0] + p * (T.fly[1] - T.fly[0]), hz(88), 0.08, { ratio: 2, index: 1, dec: 1 }));
    s.impact(T.fly[1], 0.8);
    s.chime(T.fly[1] + 2, 0.12);
    s.strum(T.end, chord(55, "maj").concat([hz(67), hz(71)]), 0.1);
    return { s, file: "plane-music.wav", mix: { duckDepth: 0.35 } };
  },

  eraser: () => {
    const T = json("src/paper/timelines.json").eraser;
    const s = createStudio({ seconds: T.duration / 30, fps: 30, bpm: T.bpm, seed: 1321 });
    // chaos: busy clashing groove and a pop for every piece of clutter
    s.beatsBetween(T.clutter, T.says, (f, b) => {
      s.kick(f, 0.6);
      s.hat(f + s.beat / 3, 0.07);
      s.hat(f + (2 * s.beat) / 3, 0.07);
      if (b % 2) s.snare(f, 0.25);
      s.supersaw(f, f + s.beat / 2, [hz(60), hz(61), hz(66)], 0.012, { cutoff: 0.1, attack: 0.005, release: 0.05 });
    });
    for (let i = 0; i < 14; i++) {
      const f = T.clutter + i * T.every;
      s.tick(f, 1500 + ((i * 731) % 2500), 0.12);
      s.bell(f, hz(70 + ((i * 5) % 17)), 0.06, { ratio: 1.41, index: 3, dec: 0.4 });
    }
    // record stop
    s.noiseSweep(T.says - 6, T.says + 4, { up: false, gain: 0.3 });
    s.sub(T.says - 6, hz(48), 0.4, 0.2);
    // erasing: rubbing strokes, then the clean idea creeps in
    for (let f = T.erase[0]; f < T.erase[1]; f += 9) s.brush(f, 0.25, 0.1);
    s.rhodes(T.erase[0] + 60, chord(60, "maj"), 3, 0.03);
    // clean: soft piano and a light beat
    const prog = [[60, "maj"], [57, "min"], [53, "maj"], [55, "maj"]];
    s.chime(T.clean, 0.12);
    s.beatsBetween(T.clean, T.duration - 30, (f, b) => {
      const [r, k] = prog[Math.floor(b / 4) % 4];
      if (b % 4 === 0) s.rhodes(f, chord(r, k).concat([hz(r + 12)]), 2, 0.055);
      if (b % 2 === 0) s.kick(f, 0.45);
      s.hat(f + s.beat / 2, 0.04);
      s.bell(f, hz([76, 79, 81, 84][b % 4]), 0.03, { ratio: 2, index: 0.6, dec: 0.6 });
    });
    return { s, file: "eraser-music.wav", mix: { duckDepth: 0.3 } };
  },

  stamp: () => {
    const T = json("src/paper/timelines.json").stamp;
    const s = createStudio({ seconds: T.duration / 30, fps: 30, bpm: T.bpm, seed: 1331 });
    // stomp-stomp-clap
    s.beatsBetween(0, T.duration - 40, (f, b) => {
      if (b % 2 === 0) s.taiko(f, 0.5), s.taiko(f + s.beat * 0.5, 0.45);
      else s.clap(f, 0.35);
    });
    const prog = [[45, "min"], [41, "maj"], [43, "maj"], [40, "maj"]];
    for (let f = T.items, i = 0; f < T.duration - 40; f += s.beat * 4, i++) {
      const [r, k] = prog[i % 4];
      s.sub(f, hz(r - 12), (s.beat * 4) / 30, 0.15);
      if (f >= T.all) s.supersaw(f, f + s.beat * 4, chord(r + 12, k), 0.014, { cutoff: 0.06, attack: 0.02 });
    }
    // every stamp: whoosh in, heavy thud, ink splat
    for (let i = 0; i < 5; i++) {
      const f = T.items + i * T.each;
      s.whoosh(f, 0.4, 0.2, true);
      s.impact(f + T.slam, 0.9);
      s.boom(f + T.slam, 0.4);
      s.crackle(f + T.slam, 0.15, 0.03, 0.15, 0.1);
      s.bell(f + T.slam + 2, hz(81 + i * 2), 0.06, { ratio: 2, index: 1, dec: 0.8 });
    }
    s.strum(T.all, chord(57, "min").concat([hz(69)]), 0.08);
    s.snareRoll(T.logo - 28, T.logo, 0.3);
    s.impact(T.logo, 1.3);
    s.boom(T.logo, 0.6);
    s.applause(T.logo + 4, 3, 0.3);
    s.chime(T.logo + 6, 0.12);
    return { s, file: "stamp-music.wav", mix: { duckDepth: 0.3 } };
  },
};

const only = process.argv[2];
for (const [name, build] of Object.entries(tracks)) {
  if (only && only !== name) continue;
  const { s, file, mix } = build();
  s.write(path.join(root, "public", file), mix);
  console.log(`public/${file} written`);
}
