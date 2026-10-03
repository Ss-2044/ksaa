// Soundtracks for the "we're live" launch reel and the marketing tips series (scripts/studio.mjs).
//   launch          – tense "coming soon" hum, then a festive house drop at the slam
//   tip-mistakes    – dark trap (808 glides, hat rolls, error buzz on every ✕)
//   tip-brand       – chill deep-house (e-piano 7ths, chimes on each point)
//   tip-questions   – bright pop (plucked arps, claps, question "tick-tock")
//   node scripts/make-marketing-music.mjs [name]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStudio } from "./studio.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const launch = JSON.parse(fs.readFileSync(path.join(root, "src/marketing/launch.json"), "utf8"));
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const chord = (root, kind = "min") =>
  ({ min: [0, 3, 7], maj: [0, 4, 7], maj7: [0, 4, 7, 11], min7: [0, 3, 7, 10], sus: [0, 5, 7] })[kind].map((i) => hz(root + i));

// tips share one timeline (see src/marketing/tips.ts)
const TIP = { fps: 30, len: 750, title: 90, points: 160, each: 140, cta: 580 };
const tipStudio = (bpm, seed) => createStudio({ seconds: TIP.len / TIP.fps, fps: TIP.fps, bpm, seed });
const tipCues = (s) => {
  s.whoosh(TIP.title - 6, 0.5, 0.25, true);
  for (let k = 0; k < 3; k++) s.whoosh(TIP.points + k * TIP.each - 6, 0.5, 0.22, k % 2 === 0);
  s.whoosh(TIP.cta - 6, 0.6, 0.25, false);
  s.impact(TIP.cta, 0.5);
};

const tracks = {
  launch: () => {
    const s = createStudio({ seconds: launch.durationInFrames / launch.fps, fps: launch.fps, bpm: launch.bpm, seed: 401 });
    const { over, live, services, cta, outro } = launch;
    const end = outro.from + outro.duration;
    // "coming soon": dark filtered pad, flickering neon crackle, a clock that won't stop
    s.supersaw(0, live.from, chord(38, "min"), 0.01, { cutoff: 0.015, attack: 1.5 });
    s.sub(0, hz(26), 5, 0.12);
    s.crackle(0, 3.5, 0.0015, 0.12, 0.2);
    for (let f = 6; f < over.cross; f += s.beat) s.tick(f, 2600, 0.06);
    // strike-through, sign falls, build
    s.whoosh(over.cross, 0.4, 0.35, true);
    s.impact(over.cross + 4, 0.4);
    s.snareRoll(over.cross + 10, live.slam, 0.3);
    s.noiseSweep(over.cross, live.slam, { gain: 0.3 });
    s.whoosh(over.to - 20, 0.7, 0.3, false);
    // the slam: "بدينا!"
    s.impact(live.slam, 1.3);
    s.boom(live.slam, 0.7);
    s.braam(live.slam, 36.7, 3, 0.05);
    s.applause(live.slam, 3, 0.35);
    s.whistle(live.slam + 10, 0.8, 0.05);
    s.whistle(live.slam + 30, 0.7, 0.04, 1200, 2800);
    // festive house groove D – A – Bm – G
    const prog = [[50, "maj"], [45, "maj"], [47, "min"], [43, "maj"]];
    const bar = s.beat * 4;
    const groove = (from, to, full) => {
      s.beatsBetween(from, to, (f, b) => {
        s.kick(f, 0.85);
        if (b % 2 === 1) s.clap(f, 0.3);
        s.hat(f + s.beat / 2, 0.09, b % 4 === 3);
        if (full) s.hat(f + s.beat / 4, 0.04);
        const [r, k] = prog[Math.floor(b / 4) % 4];
        s.sub(f + s.beat / 2, hz(r - 12), 0.22, 0.22);
        if (full) {
          const notes = chord(r + 12, k);
          s.pluck(f, notes[b % 3] * 2, 0.1, { bright: 0.7, pan: b % 2 ? 0.4 : -0.4 });
          s.pluck(f + s.beat / 2, notes[(b + 1) % 3] * 2, 0.07, { bright: 0.6, pan: b % 2 ? -0.3 : 0.3 });
        }
      });
      for (let f = from, i = 0; f < to; f += bar, i++) {
        const [r, k] = prog[i % 4];
        s.supersaw(f, Math.min(to, f + bar), chord(r + 12, k), 0.016, { cutoff: 0.07, attack: 0.02 });
      }
    };
    groove(live.slam + 2, cta.from, true);
    // ping for every service card
    for (let k = 0; k < 5; k++) {
      const f = services.from + k * services.each;
      s.bell(f + 2, hz(74 + [0, 2, 4, 7, 9][k]), 0.08, { ratio: 2, index: 1.5, dec: 1.4 });
      s.whoosh(f - 4, 0.3, 0.12, k % 2 === 0);
    }
    // CTA: breakdown with e-piano, click, then the build into the outro
    s.whoosh(cta.from - 6, 0.6, 0.25, false);
    for (let f = cta.from, i = 0; f < outro.from; f += bar, i++) {
      const [r, k] = prog[i % 4];
      s.rhodes(f, chord(r + 12, k), 1.8, 0.06);
      s.kick(f, 0.5);
    }
    s.tick(cta.click, 4200, 0.25);
    s.bell(cta.click + 2, hz(86), 0.1, { ratio: 2, index: 1, dec: 1.2 });
    s.hatRoll(cta.click + 10, outro.from, 4, 0.06);
    s.noiseSweep(cta.click, outro.from, { gain: 0.25 });
    // outro: back in, full, then ring out
    s.impact(outro.from, 1);
    s.applause(outro.from + 4, 4, 0.3);
    groove(outro.from, end - 50, true);
    s.supersaw(end - 50, end, chord(62, "maj"), 0.02, { cutoff: 0.05, release: 1.2 });
    s.chime(end - 50, 0.12);
    return { s, file: "launch-music.wav", mix: { duckDepth: 0.55 } };
  },

  "tip-mistakes": () => {
    const s = tipStudio(140, 413);
    // dark trap: half-time drums, 808 with glides, triplet hat rolls
    const roots = [40, 40, 43, 38];
    s.supersaw(0, TIP.len - 20, chord(52, "min"), 0.009, { cutoff: 0.02, attack: 1 });
    s.beatsBetween(0, TIP.len - 30, (f, b) => {
      if (b % 8 === 0) s.k808(f, hz(roots[Math.floor(b / 8) % 4] - 12), 1.2, 0.5, b % 16 === 8 ? hz(roots[Math.floor(b / 8) % 4] - 7) : null);
      if (b % 8 === 3) s.k808(f + s.beat / 2, hz(roots[Math.floor(b / 8) % 4] - 12), 0.5, 0.35);
      if (b % 4 === 2) s.snare(f, 0.35);
      if (b % 8 === 7) s.hatRoll(f, f + s.beat, 6, 0.05);
      else s.hat(f, 0.07), s.hat(f + s.beat / 2, 0.05);
      if (b % 2 === 0) s.bell(f, hz([64, 67, 71, 69][(b / 2) % 4] + 12), 0.025, { ratio: 1.5, index: 1, dec: 0.8 });
    });
    tipCues(s);
    s.impact(0, 0.6);
    // error buzz on every ✕
    for (let k = 0; k < 3; k++) {
      const f = TIP.points + k * TIP.each + 14;
      s.sub(f, hz(34), 0.35, 0.35);
      s.pluck(f, hz(46), 0.25, { bright: 0.95, decay: 0.99 });
      s.pluck(f + 6, hz(45), 0.25, { bright: 0.95, decay: 0.99 });
    }
    s.chime(TIP.cta + 26, 0.1);
    return { s, file: "tip-mistakes-music.wav", mix: { duckDepth: 0.4 } };
  },

  "tip-brand": () => {
    const s = tipStudio(118, 427);
    // chill deep-house: Fmaj7 – Em7 – Dm7 – Cmaj7
    const prog = [[53, "maj7"], [52, "min7"], [50, "min7"], [48, "maj7"]];
    const bar = s.beat * 4;
    for (let f = 0, i = 0; f < TIP.len - 20; f += bar, i++) {
      const [r, k] = prog[i % 4];
      s.rhodes(f, chord(r + 12, k), 2.2, 0.06);
      s.rhodes(f + s.beat * 2.5, chord(r + 12, k), 1, 0.035);
      s.supersaw(f, f + bar, chord(r, k), 0.006, { cutoff: 0.02, attack: 0.5 });
    }
    s.beatsBetween(TIP.title, TIP.len - 30, (f, b) => {
      s.kick(f, 0.7);
      if (b % 2 === 1) s.clap(f, 0.18);
      s.hat(f + s.beat / 2, 0.08, b % 2 === 1);
      const [r] = prog[Math.floor(b / 4) % 4];
      s.sub(f + s.beat / 2, hz(r - 12), 0.25, 0.2);
    });
    tipCues(s);
    s.chime(0, 0.12);
    // a clean chime + brush stroke for every point
    for (let k = 0; k < 3; k++) {
      const f = TIP.points + k * TIP.each + 14;
      s.chime(f, 0.12);
      s.brush(f + 20, 0.5, 0.1);
    }
    s.chime(TIP.cta + 26, 0.12);
    return { s, file: "tip-brand-music.wav", mix: { duckDepth: 0.45 } };
  },

  "tip-questions": () => {
    const s = tipStudio(128, 439);
    // bright pop: C – G – Am – F, plucked arps and claps
    const prog = [[48, "maj"], [43, "maj"], [45, "min"], [41, "maj"]];
    s.beatsBetween(0, TIP.len - 30, (f, b) => {
      const [r, k] = prog[Math.floor(b / 4) % 4];
      const notes = chord(r + 24, k);
      s.pluck(f, notes[b % 3], 0.1, { bright: 0.6, pan: -0.3 });
      s.pluck(f + s.beat / 2, notes[(b + 2) % 3] * 2, 0.07, { bright: 0.6, pan: 0.3 });
      if (f < TIP.title) return;
      s.kick(f, 0.75);
      if (b % 2 === 1) s.clap(f, 0.3), s.snare(f, 0.15);
      s.hat(f + s.beat / 2, 0.08);
      s.sub(f, hz(r - 12), 0.3, 0.2);
    });
    for (let f = 0, i = 0; f < TIP.len - 30; f += s.beat * 4, i++) {
      const [r, k] = prog[i % 4];
      s.strum(f, chord(r + 12, k), 0.06);
    }
    // "wait!" stop on the hook, then go
    s.tick(20, 3200, 0.15);
    s.tick(35, 2400, 0.15);
    tipCues(s);
    // question tick-tock + ding for every point
    for (let k = 0; k < 3; k++) {
      const f = TIP.points + k * TIP.each;
      s.tick(f + 2, 3000, 0.12);
      s.tick(f + 10, 2200, 0.12);
      s.bell(f + 16, hz(84 + k * 2), 0.09, { ratio: 2, index: 1.2, dec: 1.2 });
    }
    s.chime(TIP.cta + 26, 0.12);
    return { s, file: "tip-questions-music.wav", mix: { duckDepth: 0.5 } };
  },
};

const only = process.argv[2];
for (const [name, build] of Object.entries(tracks)) {
  if (only && only !== name) continue;
  const { s, file, mix } = build();
  s.write(path.join(root, "public", file), mix);
  console.log(`public/${file} written`);
}
