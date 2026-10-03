// Soundtracks for marketing series 2 (scripts/studio.mjs).
//   glowup  – muffled & thin for the "before", then nu-disco (funk strums, e-piano) after the wipe
//   chat    – lo-fi chill with message pops, keyboard taps and "typing" ticks
//   myths   – game-show suspense: clock, buzzer stamp, sparkle sting on every flip
//   funnel  – minimal techno: minor and leaky first, then a major lift with a coin ping per buyer
//   node scripts/make-marketing2-music.mjs [name]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStudio } from "./studio.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const S = JSON.parse(fs.readFileSync(path.join(root, "src/marketing/series2.json"), "utf8"));
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const chord = (root, kind = "min") =>
  ({ min: [0, 3, 7], maj: [0, 4, 7], maj7: [0, 4, 7, 11], min7: [0, 3, 7, 10], dom7: [0, 4, 7, 10] })[kind].map((i) => hz(root + i));
const studio = (tl, seed) => createStudio({ seconds: tl.duration / S.fps, fps: S.fps, bpm: tl.bpm, seed });

const tracks = {
  glowup: () => {
    const T = S.glowup;
    const s = studio(T, 503);
    // before: thin, lifeless loop
    s.beatsBetween(T.phone, T.wipe, (f, b) => {
      if (b % 2 === 0) s.kick(f, 0.35, { duck: false });
      s.hat(f + s.beat / 2, 0.03);
      if (b % 4 === 0) s.pluck(f, hz(57), 0.06, { bright: 0.1, decay: 0.99 });
    });
    s.tick(0, 2000, 0.1);
    s.vinyl(0, T.wipe, 0.025);
    // the wipe
    s.noiseSweep(T.wipe - 30, T.wipeEnd - 4, { gain: 0.35 });
    s.snareRoll(T.wipe - 10, T.wipeEnd - 4, 0.3);
    s.impact(T.wipeEnd - 4, 1.1);
    s.chime(T.wipeEnd - 2, 0.14);
    // after: nu-disco Am7 – Dm7 – G7 – Cmaj7
    const prog = [[57, "min7"], [50, "min7"], [55, "dom7"], [48, "maj7"]];
    const bar = s.beat * 4;
    s.beatsBetween(T.wipeEnd - 4, T.punch, (f, b) => {
      const [r, k] = prog[Math.floor(b / 4) % 4];
      s.kick(f, 0.85);
      if (b % 2 === 1) s.clap(f, 0.3);
      s.hat(f + s.beat / 2, 0.1, true);
      s.hat(f + s.beat / 4, 0.04);
      s.strum(f + s.beat / 2, chord(r + 12, k), 0.05, b % 2 === 0);
      s.sub(f, hz(r - 12), 0.18, 0.22);
      s.sub(f + s.beat * 0.75, hz(r), 0.12, 0.16);
    });
    for (let f = T.wipeEnd - 4, i = 0; f < T.punch; f += bar, i++) {
      const [r, k] = prog[i % 4];
      s.rhodes(f, chord(r + 12, k), 1.6, 0.05);
    }
    // likes pouring in: accelerating pops
    for (let i = 0, f = T.likes; f < T.punch - 20; i++, f += Math.max(3, 14 - i * 0.6)) s.tick(f, 2600 + (i % 5) * 300, 0.05);
    T.callouts.forEach((f) => (s.whoosh(f - 4, 0.3, 0.15), s.bell(f, hz(88), 0.07, { ratio: 2, index: 1, dec: 1 })));
    // punch + end
    s.impact(T.punch + 8, 0.9);
    s.braam(T.punch + 8, 55, 2, 0.04);
    s.whoosh(T.end - 6, 0.6, 0.25, false);
    s.beatsBetween(T.end, T.duration - 30, (f, b) => {
      const [r, k] = prog[Math.floor(b / 4) % 4];
      s.kick(f, 0.7);
      if (b % 2 === 1) s.clap(f, 0.25);
      s.hat(f + s.beat / 2, 0.08, true);
      if (b % 4 === 0) s.rhodes(f, chord(r + 12, k), 1.6, 0.05);
    });
    s.chime(T.end + 26, 0.12);
    return { s, file: "glowup-music.wav", mix: { duckDepth: 0.5 } };
  },

  chat: () => {
    const T = S.chat;
    const s = studio(T, 517);
    // lo-fi: Fmaj7 – Em7 – Dm7 – Cmaj7, swung drums, vinyl
    const prog = [[53, "maj7"], [52, "min7"], [50, "min7"], [48, "maj7"]];
    const bar = s.beat * 4;
    s.vinyl(0, T.duration, 0.03);
    for (let f = 0, i = 0; f < T.duration - 20; f += bar, i++) {
      const [r, k] = prog[i % 4];
      s.rhodes(f, chord(r + 12, k), 2.4, 0.055);
      s.sub(f, hz(r - 12), 1.2, 0.15);
    }
    const swing = s.beat * 0.58;
    s.beatsBetween(10, T.duration - 30, (f, b) => {
      if (b % 4 === 0 || b % 4 === 2.5) s.kick(f, 0.6);
      if (b % 4 === 3) s.kick(f + swing, 0.45);
      if (b % 2 === 1) s.snare(f, 0.22, 0.3);
      s.hat(f, 0.05);
      s.hat(f + swing, 0.035);
    });
    // messages
    T.msgs.forEach((m) => {
      if (m.who === "me") {
        for (let i = 0; i < 9; i++) s.tick(m.at - 26 + i * 2.3, 1500 + (i % 3) * 300, 0.04); // keyboard taps
        s.whoosh(m.at - 2, 0.2, 0.1, true); // sent
        s.bell(m.at, hz(81), 0.05, { ratio: 1, index: 0.5, dec: 0.3 });
      } else if (m.who === "neo") {
        s.bell(m.at, hz(88), 0.08, { ratio: 2, index: 0.8, dec: 0.5 }); // incoming pop
        s.bell(m.at + 4, hz(93), 0.05, { ratio: 2, index: 0.8, dec: 0.5 });
      } else {
        s.whoosh(m.at - 10, 0.8, 0.25, false);
        s.impact(m.at, 0.4);
      }
    });
    s.chime(T.heart, 0.1);
    s.whoosh(T.end - 10, 0.6, 0.25, false);
    s.impact(T.end, 0.6);
    s.chime(T.end + 26, 0.12);
    return { s, file: "chat-music.wav", mix: { duckDepth: 0.35 } };
  },

  myths: () => {
    const T = S.myths;
    const s = studio(T, 529);
    // suspense bed: low pulse + pizzicato in minor
    const minor = [45, 48, 52, 50];
    s.supersaw(0, T.end, chord(45, "min"), 0.008, { cutoff: 0.02, attack: 1 });
    s.beatsBetween(0, T.end, (f, b) => {
      s.taiko(f, b % 4 === 0 ? 0.5 : 0.22);
      s.pluck(f + s.beat / 2, hz(minor[Math.floor(b / 2) % 4] + 12), 0.08, { bright: 0.3, decay: 0.985 });
    });
    s.impact(T.title, 0.8);
    s.braam(T.title, 41.2, 2, 0.05);
    for (let k = 0; k < 3; k++) {
      const f = T.from + k * T.each;
      s.whoosh(f, 0.5, 0.25, k % 2 === 0);
      for (let c = f + 8; c < f + T.stamp; c += s.beat / 2) s.tick(c, 3000, 0.07); // clock
      // stamp: buzzer
      s.impact(f + T.stamp, 0.6);
      s.pluck(f + T.stamp, hz(40), 0.3, { bright: 1, decay: 0.993 });
      s.pluck(f + T.stamp, hz(41), 0.3, { bright: 1, decay: 0.993 });
      s.sub(f + T.stamp, hz(28), 0.5, 0.3);
      // flip: sparkle sting in major
      s.whoosh(f + T.flip, 0.5, 0.3, true);
      s.chime(f + T.flip + 16, 0.12);
      s.strum(f + T.flip + 16, chord(57, "maj").concat([hz(69), hz(73)]), 0.08);
      s.supersaw(f + T.flip + 16, f + T.each - 6, chord(57, "maj"), 0.012, { cutoff: 0.05, attack: 0.05 });
      s.whoosh(f + T.each - 12, 0.4, 0.18, false);
    }
    s.impact(T.end, 0.7);
    s.beatsBetween(T.end, T.duration - 30, (f, b) => {
      s.kick(f, 0.6);
      if (b % 2 === 1) s.clap(f, 0.22);
      s.hat(f + s.beat / 2, 0.07);
      if (b % 4 === 0) s.strum(f, chord(57, "maj"), 0.06);
    });
    s.chime(T.end + 26, 0.12);
    return { s, file: "myths-music.wav", mix: { duckDepth: 0.4 } };
  },

  funnel: () => {
    const T = S.funnel;
    const s = studio(T, 541);
    // phase A: minor techno, leaky
    s.supersaw(T.show, T.fix, chord(45, "min"), 0.009, { cutoff: 0.02, attack: 1 });
    s.beatsBetween(T.show, T.fix, (f, b) => {
      s.kick(f, 0.7);
      s.hat(f + s.beat / 2, 0.06);
      if (b % 4 === 2) s.clap(f, 0.18);
      s.sub(f + s.beat / 2, hz(33), 0.2, 0.15);
    });
    // leak "drips": descending blips
    for (let f = T.a + 25; f < T.a + T.aSpawn + 80; f += 7) s.bell(f, hz(76 - ((f / 7) % 6)), 0.025, { ratio: 1.5, index: 2, dec: 0.25 });
    s.bell(T.a + T.aSpawn + 100, hz(84), 0.08, { ratio: 2, index: 1, dec: 1 }); // the lonely buyer
    // fix
    s.noiseSweep(T.fix - 20, T.fix, { gain: 0.3 });
    s.impact(T.fix, 1);
    s.snareRoll(T.fix + 6, T.b, 0.28);
    s.noiseSweep(T.fix + 6, T.b, { gain: 0.25 });
    // phase B: major lift (D – Bm – G – A) with a ping for each buyer landing
    const prog = [[50, "maj"], [47, "min"], [43, "maj"], [45, "maj"]];
    const bar = s.beat * 4;
    s.beatsBetween(T.b, T.compare, (f, b) => {
      const [r] = prog[Math.floor(b / 4) % 4];
      s.kick(f, 0.85);
      if (b % 2 === 1) s.clap(f, 0.28);
      s.hat(f + s.beat / 2, 0.09, true);
      s.sub(f + s.beat / 2, hz(r - 12), 0.2, 0.2);
    });
    for (let f = T.b, i = 0; f < T.compare; f += bar, i++) {
      const [r, k] = prog[i % 4];
      s.supersaw(f, f + bar, chord(r + 12, k), 0.016, { cutoff: 0.07, attack: 0.02 });
    }
    // replicate the funnel's buyers (golden-ratio sequence, stage 3) to time the pings
    const N = 120;
    const p = 0.52 * 0.46 * 0.36;
    for (let i = 0, n = 0; i < N; i++) {
      const r = (i * 0.6180339887 + 0.37) % 1;
      if (r >= p) continue;
      const land = T.b + (T.bSpawn * i) / N + (1390 - 400) / 10;
      s.bell(land, hz(84 + [0, 2, 4, 7, 9][n++ % 5]), 0.05, { ratio: 2, index: 1, dec: 0.6 });
    }
    s.impact(T.compare, 1);
    s.boom(T.compare + 18, 0.5);
    s.applause(T.compare + 18, 2.5, 0.25);
    s.beatsBetween(T.compare, T.duration - 30, (f, b) => {
      const [r, k] = prog[Math.floor(b / 4) % 4];
      s.kick(f, 0.7);
      if (b % 2 === 1) s.clap(f, 0.25);
      s.hat(f + s.beat / 2, 0.08, true);
      if (b % 4 === 0) s.rhodes(f, chord(r + 12, k), 1.6, 0.05);
    });
    s.whoosh(T.end - 6, 0.6, 0.25, false);
    s.chime(T.end + 26, 0.12);
    return { s, file: "funnel-music.wav", mix: { duckDepth: 0.5 } };
  },
};

const only = process.argv[2];
for (const [name, build] of Object.entries(tracks)) {
  if (only && only !== name) continue;
  const { s, file, mix } = build();
  s.write(path.join(root, "public", file), mix);
  console.log(`public/${file} written`);
}
